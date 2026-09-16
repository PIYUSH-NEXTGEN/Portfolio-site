import { createHmac, timingSafeEqual } from 'node:crypto';

// Vercel serverless function: POST /api/verify-and-send
// Verifies the stateless HMAC-signed OTP token issued by /api/send-otp and,
// on success, forwards the visitor's message to the portfolio inbox via Resend.
// No database of any kind — the signed token (held client-side) is the only
// persisted state between the two requests.
//
// Env (read from process.env, never hardcoded):
// - RESEND_API_KEY, FROM_EMAIL, OTP_SIGNING_SECRET, CONTACT_DESTINATION_EMAIL
//
// Rate limiting uses a separate in-memory Map/namespace from send-otp.ts.
// NOTE: same cold-start reset tradeoff as send-otp (see comment there).

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 8;
const MAX_BODY_BYTES = 4 * 1024;

// Separate map/namespace from the send-otp endpoint.
const buckets = new Map<string, number[]>();

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]!.trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).split(',')[0]!.trim();
  }
  return (req.socket?.remoteAddress ?? req.connection?.remoteAddress ?? 'unknown');
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `verify:${ip}`;
  const stamps = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (stamps.length >= MAX_REQUESTS) {
    buckets.set(key, stamps);
    return true;
  }
  stamps.push(now);
  buckets.set(key, stamps);
  return false;
}

function readRawBodyLength(req: any): number | null {
  if (typeof req.body === 'string') return Buffer.byteLength(req.body, 'utf8');
  if (req.body !== undefined && req.body !== null) {
    try {
      return Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    } catch {
      return null;
    }
  }
  return 0;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ct = String(req.headers?.['content-type'] ?? '').split(';')[0]!.trim().toLowerCase();
  if (ct !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  const len = readRawBodyLength(req);
  if (len !== null && len > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  let parsed: any = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const token = typeof parsed.token === 'string' ? parsed.token : '';
  const code = typeof parsed.code === 'string' ? parsed.code.trim() : '';
  const message = typeof parsed.message === 'string' ? parsed.message : '';
  if (!token || !code || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing token, code, or message.' });
  }
  const OTP_SECRET = process.env.OTP_SIGNING_SECRET;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL;
  const DEST = process.env.CONTACT_DESTINATION_EMAIL;
  if (!OTP_SECRET || !RESEND_KEY || !FROM || !DEST) {
    console.error('verify-and-send: missing required environment variables');
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
  const dot = token.lastIndexOf('.');
  if (dot <= 0 || dot === token.length - 1) {
    return res.status(400).json({ error: 'Invalid or tampered token. Please request a new code.' });
  }
  const payloadPart = token.slice(0, dot);
  const signaturePart = token.slice(dot + 1);
  const expected = createHmac('sha256', OTP_SECRET).update(payloadPart).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signaturePart, 'base64url');
  } catch {
    return res.status(400).json({ error: 'Invalid or tampered token. Please request a new code.' });
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return res.status(400).json({ error: 'Invalid or tampered token. Please request a new code.' });
  }
  let payload: { email?: unknown; code?: unknown; expiresAt?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid or tampered token. Please request a new code.' });
  }
  if (typeof payload.email !== 'string' || typeof payload.code !== 'string' || typeof payload.expiresAt !== 'number') {
    return res.status(400).json({ error: 'Invalid or tampered token. Please request a new code.' });
  }
  if (Date.now() > payload.expiresAt) {
    return res.status(400).json({ error: 'Code expired, please request a new one' });
  }
  if (code !== payload.code) {
    return res.status(400).json({ error: 'Incorrect code' });
  }
  const trimmed = message.trim();
  if (trimmed.length < 10 || trimmed.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
  }
  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [DEST],
        reply_to: payload.email,
        subject: 'New portfolio contact',
        text: `From: ${payload.email}\n\n${trimmed}`,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('verify-and-send: resend rejected', r.status, detail.slice(0, 500));
      return res.status(500).json({ error: 'Something went wrong, please try again' });
    }
  } catch (err) {
    console.error('verify-and-send: resend send failed', err);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
  return res.status(200).json({ success: true });
}
