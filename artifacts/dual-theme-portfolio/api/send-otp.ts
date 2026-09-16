import { randomInt, createHmac } from 'node:crypto';

// Vercel serverless function: POST /api/send-otp
// Stateless OTP issuer — the signed token is the only state, held client-side.
// No database of any kind.
//
// Env (read from process.env, never hardcoded):
// - RESEND_API_KEY, FROM_EMAIL, OTP_SIGNING_SECRET
//
// Rate limiting is an in-memory Map keyed by IP storing request timestamps.
// NOTE: this resets on each cold start / deploy (new serverless instance = empty
// Map). Accepted tradeoff for a low-traffic portfolio form; abuse window is
// bounded by the Resend cost of at most a few extra OTP emails per cold start.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 2 * 1024;

// Module-level: survives warm invocations, resets on cold start (see note above).
const buckets = new Map<string, number[]>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]!.trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).split(',')[0]!.trim();
  }
  return (
    req.socket?.remoteAddress ??
    req.connection?.remoteAddress ??
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const stamps = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (stamps.length >= MAX_REQUESTS) {
    buckets.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  buckets.set(ip, stamps);
  return false;
}

function b64urlEncode(input: string | Buffer): string {
  return Buffer.isBuffer(input)
    ? input.toString('base64url')
    : Buffer.from(input, 'utf8').toString('base64url');
}

function readRawBodyLength(req: any): number | null {
  // Vercel pre-parses JSON bodies into req.body (object). Measure the
  // serialised length in that case; measure raw length for string bodies.
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

  const contentType = String(req.headers?.['content-type'] ?? '').split(';')[0]!.trim().toLowerCase();
  if (contentType !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const bodyLen = readRawBodyLength(req);
  if (bodyLen !== null && bodyLen > MAX_BODY_BYTES) {
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

  const email = typeof parsed.email === 'string' ? parsed.email.trim() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many codes requested. Please try again in a few minutes.' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL;
  const OTP_SIGNING_SECRET = process.env.OTP_SIGNING_SECRET;
  if (!RESEND_API_KEY || !FROM_EMAIL || !OTP_SIGNING_SECRET) {
    console.error('send-otp: missing required environment variables');
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }

  // crypto.randomInt — never Math.random for OTPs.
  const code = String(randomInt(100000, 999999));

  const payload = { email, code, expiresAt: Date.now() + 10 * 60 * 1000 };
  const payloadPart = b64urlEncode(JSON.stringify(payload));
  const signaturePart = createHmac('sha256', OTP_SIGNING_SECRET)
    .update(payloadPart)
    .digest('base64url');
  const token = `${payloadPart}.${signaturePart}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Your verification code',
        text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('send-otp: resend rejected request', r.status, detail.slice(0, 500));
      return res.status(500).json({ error: 'Something went wrong, please try again' });
    }
  } catch (err) {
    console.error('send-otp: failed to send via Resend', err);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }

  // Never include the code itself in the HTTP response.
  return res.status(200).json({ token });
}
