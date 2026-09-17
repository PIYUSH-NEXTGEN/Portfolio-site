/**
 * Layout preview: composites the processed katana + sakura sprites the way
 * the hero will render them (cream panel, sword rotated 34.6deg -> -14deg
 * net tilt, petals on orbit rings) so the orientation can be eyeballed
 * without a browser. Reads the cutouts from scripts/processed/ and writes
 * scripts/preview.png. Run after process-katana.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function decodePng(file) {
  const buf = fs.readFileSync(path.join(ROOT, 'scripts', 'processed', file));
  let off = 8, w = 0, h = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = Buffer.alloc(w * h * 4);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++]; const rs = p; p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[rs + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      px[y * stride + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = px[i * bpp]; rgba[i * 4 + 1] = px[i * bpp + 1]; rgba[i * 4 + 2] = px[i * bpp + 2];
    rgba[i * 4 + 3] = bpp === 4 ? px[i * 4 + 3] : 255;
  }
  return { w, h, data: rgba };
}

/* canvas */
const W = 760, H = 640;
const canvas = Buffer.alloc(W * H * 4);
const BG = [217, 201, 173]; // photo panel beige #d9c9ad
for (let i = 0; i < W * H; i++) { canvas[i * 4] = BG[0]; canvas[i * 4 + 1] = BG[1]; canvas[i * 4 + 2] = BG[2]; canvas[i * 4 + 3] = 255; }

function blit(img, cx, cy, rotateDeg, scale, opacity) {
  const { w, h, data } = img;
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const hw = (w * scale) / 2, hh = (h * scale) / 2;
  const ex = Math.ceil(Math.abs(cos) * hw + Math.abs(sin) * hh);
  const ey = Math.ceil(Math.abs(sin) * hw + Math.abs(cos) * hh);
  for (let Y = Math.max(0, Math.floor(cy - ey)); Y < Math.min(H, Math.ceil(cy + ey)); Y++) {
    for (let X = Math.max(0, Math.floor(cx - ex)); X < Math.min(W, Math.ceil(cx + ex)); X++) {
      const dx = X - cx, dy = Y - cy;
      const sx = (dx * cos + dy * sin) / scale + w / 2;
      const sy = (-dx * sin + dy * cos) / scale + h / 2;
      const x0 = sx | 0, y0 = sy | 0;
      if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) continue;
      const sa = data[(y0 * w + x0) * 4 + 3] / 255 * opacity;
      if (sa <= 0) continue;
      const o = (Y * W + X) * 4;
      for (let k = 0; k < 3; k++) canvas[o + k] = Math.round(canvas[o + k] * (1 - sa) + data[(y0 * w + x0) * 4 + k] * sa);
      canvas[o + 3] = 255;
    }
  }
}
/* photo stand-in (roughly where the portrait sits) */
const photo = { x0: 300, y0: 120, x1: 640, y1: 560 };
for (let y = photo.y0; y < photo.y1; y++) for (let x = photo.x0; x < photo.x1; x++) {
  const o = (y * W + x) * 4;
  canvas[o] = 40; canvas[o + 1] = 40; canvas[o + 2] = 44;
}

/* sword: same numbers the CSS will use — center of the photo panel,
   rotate(34.6deg) so the -48.6deg asset lands at -14deg (tip up-right) */
const katana = decodePng('katana-ink.png');
const SWORD_W = 560; // css width of .katana-ink
const scale = SWORD_W / katana.w;
blit(katana, 470, 340, 34.6, scale, 0.22);

/* petals on orbit rings around the sword center — sample of orbit positions */
const petals = [
  { f: 'sakura-1.png', r: 250, a: 200, s: 0.75, o: 0.6 },
  { f: 'sakura-2.png', r: 210, a: 20,  s: 0.55, o: 0.55 },
  { f: 'sakura-3.png', r: 260, a: 80,  s: 0.6,  o: 0.6 },
  { f: 'sakura-4.png', r: 180, a: 130, s: 0.6,  o: 0.5 },
  { f: 'sakura-5.png', r: 230, a: 300, s: 0.55, o: 0.55 },
  { f: 'sakura-6.png', r: 270, a: 250, s: 0.5,  o: 0.5 },
  { f: 'sakura-7.png', r: 160, a: 320, s: 0.5,  o: 0.55 },
  { f: 'sakura-8.png', r: 290, a: 150, s: 0.5,  o: 0.5 },
];
for (const p of petals) {
  const img = decodePng(p.f);
  const x = 470 + p.r * Math.cos((p.a * Math.PI) / 180);
  const y = 340 + p.r * 0.62 * Math.sin((p.a * Math.PI) / 180); // squashed = elliptical feel
  blit(img, x, y, 0, p.s, p.o);
}

/* encode preview.png (RGBA, filter 0) */
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (const v of b) c = CRC_TABLE[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const o = Buffer.alloc(12 + data.length); o.writeUInt32BE(data.length, 0); o.write(type, 4, 'ascii'); data.copy(o, 8); o.writeUInt32BE(crc32(o.subarray(4, 8 + data.length)), 8 + data.length); return o; };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) { raw[y * (1 + W * 4)] = 0; canvas.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4); }
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(path.join(ROOT, 'scripts', 'preview.png'), png);
console.log('wrote scripts/preview.png');

