/**
 * Debug overlay for hair segmentation: renders image.png with the dark
 * (hair) mask tinted red and a 50px coordinate grid, so strand layer
 * regions can be picked visually. Writes scripts/portrait-debug.png.
 * Run: node scripts/debug-portrait.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function decodePng(file) {
  const buf = fs.readFileSync(path.join(ROOT, 'public', file));
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

const { w, h, data } = decodePng('image.png');
const out = Buffer.from(data);

// tint dark (hair) pixels red-ish
for (let i = 0; i < w * h; i++) {
  const l = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000;
  if (l < 90) { out[i * 4] = Math.min(255, data[i * 4] + 130); out[i * 4 + 1] = data[i * 4 + 1]; out[i * 4 + 2] = data[i * 4 + 2]; }
}
// 50px grid (blue) + 10px minor ticks on edges
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const onGrid = y % 50 === 0 || x % 50 === 0;
    if (onGrid) { out[i * 4] = 40; out[i * 4 + 1] = 90; out[i * 4 + 2] = 230; }
  }
}

/* PNG encode (RGBA, filter 0) */
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (const v of b) c = CRC_TABLE[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(type, 4, 'ascii'); d.copy(o, 8); o.writeUInt32BE(crc32(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc(h * (1 + w * 4));
for (let y = 0; y < h; y++) { raw[y * (1 + w * 4)] = 0; out.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4); }
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(path.join(ROOT, 'scripts', 'portrait-debug.png'), png);
console.log('wrote scripts/portrait-debug.png');
