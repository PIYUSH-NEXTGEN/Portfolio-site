/**
 * Verifies the layered portrait: composites portrait-base.png + the strand
 * sprites at rest and at max sway (rotation about each layer's transform
 * origin), exactly as the CSS does. Writes scripts/portrait-check-<n>.png.
 * Run: node scripts/preview-portrait.mjs
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

const IW = 568, IH = 570;
const STRANDS = [
  { f: 'hair-strand-1.png', left: 51.41, top: 4.21, width: 15.67, ox: 6, oy: 92, deg: -2.6 },
  { f: 'hair-strand-2.png', left: 61.44, top: 13.68, width: 23.42, ox: 3, oy: 8, deg: -1.6 },
  { f: 'hair-strand-3.png', left: 57.39, top: 25.61, width: 27.46, ox: 3, oy: 31, deg: -1.4 },
  { f: 'hair-strand-4.png', left: 69.54, top: 38.25, width: 18.66, ox: 3, oy: 8, deg: -2.0 },
];

function render(swings) {
  const canvas = decodePng('portrait-base.png');
  for (const s of STRANDS) {
    const img = decodePng(s.f);
    const w = (s.width / 100) * IW;
    const scale = w / img.w;
    const h = img.h * scale;
    const x0 = (s.left / 100) * IW;
    const y0 = (s.top / 100) * IH;
    const ox = x0 + (s.ox / 100) * w;
    const oy = y0 + (s.oy / 100) * h;
    const rad = (s.deg * swings * Math.PI) / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    for (let sy = 0; sy < img.h; sy++) {
      for (let sx = 0; sx < img.w; sx++) {
        const a = img.data[(sy * img.w + sx) * 4 + 3] / 255;
        if (a <= 0) continue;
        // rotate about (ox,oy), sample nearest (pixel-art style)
        const dx = sx * scale - (ox - x0);
        const dy = sy * scale - (oy - y0);
        const X = Math.round(ox + dx * cos - dy * sin);
        const Y = Math.round(oy + dx * sin + dy * cos);
        if (X < 0 || Y < 0 || X >= IW || Y >= IH) continue;
        const o = (Y * IW + X) * 4, so = (sy * img.w + sx) * 4;
        for (let k = 0; k < 3; k++) canvas.data[o + k] = img.data[so + k];
        canvas.data[o + 3] = 255;
      }
    }
  }
  /* encode */
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xffffffff; for (const v of b) c = CRC_TABLE[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(type, 4, 'ascii'); d.copy(o, 8); o.writeUInt32BE(crc32(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(IW, 0); ihdr.writeUInt32BE(IH, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(IH * (1 + IW * 4));
  for (let y = 0; y < IH; y++) { raw[y * (1 + IW * 4)] = 0; canvas.data.copy(raw, y * (1 + IW * 4) + 1, y * IW * 4, (y + 1) * IW * 4); }
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  return png;
}

fs.writeFileSync(path.join(ROOT, 'scripts', 'portrait-check-rest.png'), render(0));
fs.writeFileSync(path.join(ROOT, 'scripts', 'portrait-check-sway.png'), render(1));
console.log('wrote scripts/portrait-check-rest.png and scripts/portrait-check-sway.png');
