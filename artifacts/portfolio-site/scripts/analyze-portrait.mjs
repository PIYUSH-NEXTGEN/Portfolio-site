/**
 * Portrait analysis for the hair wind animation: decodes public/image.png,
 * samples the background colour, and reports where dark (hair) pixels live
 * so the strand layer regions can be tuned. Run: node scripts/analyze-portrait.mjs
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
console.log('size', w, h);

// background = most common border colour
const counts = new Map();
const bump = (r, g, b) => { const k = `${r},${g},${b}`; counts.set(k, (counts.get(k) ?? 0) + 1); };
for (let x = 0; x < w; x++) { bump(data[x * 4], data[x * 4 + 1], data[x * 4 + 2]); bump(data[((h - 1) * w + x) * 4], data[((h - 1) * w + x) * 4 + 1], data[((h - 1) * w + x) * 4 + 2]); }
for (let y = 0; y < h; y++) { bump(data[y * w * 4], data[y * w * 4 + 1], data[y * w * 4 + 2]); bump(data[(y * w + w - 1) * 4], data[(y * w + w - 1) * 4 + 1], data[(y * w + w - 1) * 4 + 2]); }
const bgKey = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
const BG = bgKey.split(',').map(Number);
console.log('bg color', bgKey);

// dark (hair) pixel histograms: rows in 20px bands, cols in 20px bands
const rows = new Array(Math.ceil(h / 20)).fill(0);
const cols = new Array(Math.ceil(w / 20)).fill(0);
let dark = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const l = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    if (l < 90) { dark++; rows[(y / 20) | 0]++; cols[(x / 20) | 0]++; }
  }
}
console.log('dark px total', dark);
console.log('rows:', rows.map((c, i) => (c > 0 ? `${i * 20}:${c}` : null)).filter(Boolean).join('  '));
console.log('cols:', cols.map((c, i) => (c > 0 ? `${i * 20}:${c}` : null)).filter(Boolean).join('  '));

// alpha + colour sanity: is the background opaque or transparent?
const S = (x, y) => { const i = (y * w + x) * 4; return `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`; };
console.log('corners:', S(2, 2), '|', S(w - 3, 2), '|', S(2, h - 3), '|', S(w - 3, h - 3));
console.log('bg samples:', S(284, 30), '|', S(540, 300), '|', S(30, 300), '|', S(500, 60));
const alpha = new Array(16).fill(0);
for (let i = 0; i < w * h; i++) alpha[data[i * 4 + 3] >> 4]++;
console.log('alpha buckets(16):', alpha.join(','));
const cc = new Map();
for (let i = 0; i < w * h; i += 11) { const k = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`; cc.set(k, (cc.get(k) ?? 0) + 1); }
console.log('top colors:', [...cc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `${k} x${n}`).join('  '));

