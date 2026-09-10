/**
 * Hair segmentation for the "wind in the hair" portrait animation.
 *
 * Slices public/image.png (568x570 pixel-art samurai) into:
 *   public/portrait-base.png   — full portrait with the movable strand
 *                                pixels erased (filled with the bg colour)
 *   public/hair-strand-<n>.png — each flowing-hair group as its own
 *                                transparent sprite (cropped to bbox)
 *
 * How strands are identified: for every row, dark runs (luminance < 90) are
 * measured across the FULL row. Long runs (>= threshold) are the head/hair
 * mass or the kimono — they stay static. Short runs inside a layer's region
 * are the loose strands — they become the moving layer (plus a 2px
 * anti-aliasing fringe, but never pixels belonging to a long run, so the
 * kimono/head silhouette can never be eaten).
 *
 * Prints CSS-ready geometry (left/top/width % + transform-origin) for the
 * component. Run: node scripts/slice-portrait.mjs
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

/* ---------- config ---------- */
const BG = [171, 160, 159]; // sampled flat studio background
const IW = 568, IH = 570;
// name, [x0, y0, x1, y1] region, run threshold, wind style:
//   axis 'col' = vertical per-column shift (strands flowing to the right),
//   axis 'row' = horizontal per-row shift (topknot spikes, root at bottom)
const LAYERS = [
  { name: 'strand-1', box: [296, 22, 402, 94],  threshold: 70, axis: 'row', maxS: 2, seed: 1.7 },
  { name: 'strand-2', box: [318, 82, 516, 166], threshold: 48, axis: 'col', maxS: 2, seed: 3.1 },
  { name: 'strand-3', box: [330, 150, 536, 242], threshold: 48, axis: 'col', maxS: 2, seed: 4.9 },
  { name: 'strand-4', box: [392, 222, 544, 326], threshold: 48, axis: 'col', maxS: 3, seed: 6.3 },
];
const { w, h, data } = decodePng('image.png');
console.log('source', w, 'x', h);
const lum = new Float32Array(w * h);
for (let i = 0; i < w * h; i++) lum[i] = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000;

/* per row: pixels belonging to runs >= threshold are head-mass/kimono (static) */
function computeStatic(threshold) {
  const staticPx = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (lum[y * w + x] >= 90) { x++; continue; }
      let x2 = x;
      while (x2 < w && lum[y * w + x2] < 90) x2++;
      if (x2 - x >= threshold) for (let i = x; i < x2; i++) staticPx[y * w + i] = 1;
      x = x2;
    }
  }
  return staticPx;
}

/* ---------- slice each layer ---------- */
const base = Buffer.from(data); // moving pixels get erased from this
const results = [];

function encodePng(cw2, ch2, rgba) {
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xffffffff; for (const v of b) c = CRC_TABLE[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(type, 4, 'ascii'); d.copy(o, 8); o.writeUInt32BE(crc32(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(cw2, 0); ihdr.writeUInt32BE(ch2, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(ch2 * (1 + cw2 * 4));
  for (let y = 0; y < ch2; y++) { raw[y * (1 + cw2 * 4)] = 0; rgba.copy(raw, y * (1 + cw2 * 4) + 1, y * cw2 * 4, (y + 1) * cw2 * 4); }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

for (const layer of LAYERS) {
  const [bx0, by0, bx1, by1] = layer.box;
  const staticPx = computeStatic(layer.threshold);
  const moving = new Uint8Array(w * h);
  for (let y = by0; y <= by1; y++) {
    for (let x = bx0; x <= bx1; x++) {
      const i = y * w + x;
      if (lum[i] < 90 && !staticPx[i]) moving[i] = 1;
    }
  }
  // grow 2px to capture the anti-aliased fringe — never onto static pixels
  for (let pass = 0; pass < 2; pass++) {
    const add = [];
    for (let y = Math.max(1, by0 - 2); y <= Math.min(h - 2, by1 + 2); y++) {
      for (let x = Math.max(1, bx0 - 2); x <= Math.min(w - 2, bx1 + 2); x++) {
        const i = y * w + x;
        if (moving[i] || staticPx[i]) continue;
        let near = false;
        for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (moving[(y + dy) * w + (x + dx)]) { near = true; break; }
        }
        if (near && lum[i] < 175) add.push(i);
      }
    }
    for (const i of add) moving[i] = 1;
  }

  let minx = w, maxx = 0, miny = h, maxy = 0, count = 0, rootYsum = 0, rootYn = 0;
  for (let y = by0 - 2; y <= by1 + 2; y++) {
    for (let x = bx0 - 2; x <= bx1 + 2; x++) {
      if (!moving[y * w + x]) continue;
      count++;
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
      if (x < minx + 10) { rootYsum += y; rootYn++; } // root end (left edge)
    }
  }
  if (count === 0) { console.log(`!! ${layer.name}: no pixels found — check the box`); continue; }
  /* 4px pad leaves headroom for the 3px max wind shift */
  const pad = 4;
  const cx0 = Math.max(0, minx - pad), cy0 = Math.max(0, miny - pad);
  const cw = Math.min(w - 1, maxx + pad) - cx0 + 1;
  const ch = Math.min(h - 1, maxy + pad) - cy0 + 1;

  const sprite = Buffer.alloc(cw * ch * 4);
  for (let y = cy0; y < cy0 + ch; y++) {
    for (let x = cx0; x < cx0 + cw; x++) {
      const i = y * w + x;
      if (!moving[i]) continue;
      const o = ((y - cy0) * cw + (x - cx0)) * 4;
      sprite[o] = data[i * 4]; sprite[o + 1] = data[i * 4 + 1]; sprite[o + 2] = data[i * 4 + 2];
      sprite[o + 3] = 255;
      base[i * 4] = BG[0]; base[i * 4 + 1] = BG[1]; base[i * 4 + 2] = BG[2]; base[i * 4 + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(ROOT, 'public', `hair-${layer.name}.png`), encodePng(cw, ch, sprite));

  /* ---- wind frames: TRUE pixel-art frame stepping ----------------------
   * Each frame is a new sprite where every pixel has moved by WHOLE pixels
   * only (per-column vertical shift, or per-row horizontal shift for the
   * topknot). No resampling, no interpolation, no sub-pixel positions —
   * the pixel grid is never broken, so it can never smear.
   * Shift grows from 0 at the root (first 12% of the sprite) to maxS at
   * the tip, with a mild per-column wave so strands don't shear rigidly. */
  const rootFrac = 0.12;
  const cy1r = cy0 + ch - 1; // bottom row of the sprite bbox (topknot root)
  const ease = p => Math.pow(Math.min(1, Math.max(0, (p - rootFrac) / (1 - rootFrac))), 1.25);
  const wave = (coord, ph) => 0.8 + 0.2 * Math.sin(coord * 0.09 + layer.seed + ph);
  const frames = [
    { tag: '-f1', shiftAt: (pos, coord) => -Math.round(layer.maxS * 0.55 * ease(pos) * wave(coord, 0)) },
    { tag: '-f2', shiftAt: (pos, coord) => -Math.round(layer.maxS * ease(pos) * wave(coord, 0.6)) },
  ];
  for (const frame of frames) {
    const fsprite = Buffer.alloc(cw * ch * 4);
    if (layer.axis === 'col') {
      for (let x = 0; x < cw; x++) {
        const s = frame.shiftAt((x - (bx0 - cx0)) / cw, x); // whole-pixel shift
        for (let y = 0; y < ch; y++) {
          const sy = y - s;
          if (sy < 0 || sy >= ch) continue;
          if (!moving[(sy + cy0) * w + (x + cx0)]) continue;
          const o = (y * cw + x) * 4, so = (sy * cw + x) * 4;
          fsprite[o] = sprite[so]; fsprite[o + 1] = sprite[so + 1]; fsprite[o + 2] = sprite[so + 2]; fsprite[o + 3] = 255;
        }
      }
    } else {
      for (let y = 0; y < ch; y++) {
        const s = frame.shiftAt((cy1r - (y + cy0)) / ch, y); // root at bottom
        for (let x = 0; x < cw; x++) {
          const sx = x - s;
          if (sx < 0 || sx >= cw) continue;
          if (!moving[(y + cy0) * w + (sx + cx0)]) continue;
          const o = (y * cw + x) * 4, so = (y * cw + sx) * 4;
          fsprite[o] = sprite[so]; fsprite[o + 1] = sprite[so + 1]; fsprite[o + 2] = sprite[so + 2]; fsprite[o + 3] = 255;
        }
      }
    }
    fs.writeFileSync(path.join(ROOT, 'public', `hair-${layer.name}${frame.tag}.png`), encodePng(cw, ch, fsprite));
  }

  const originYpct = rootYn ? ((rootYsum / rootYn) - cy0) / ch * 100 : 90;
  results.push({ name: `hair-${layer.name}.png`, cx0, cy0, cw, ch, count, originY: originYpct });
  console.log(`hair-${layer.name}.png: bbox=(${cx0},${cy0}) ${cw}x${ch} px=${count} originY=${originYpct.toFixed(1)}% (+f1/f2 frames)`);
}

/* base PNG */
fs.writeFileSync(path.join(ROOT, 'public', 'portrait-base.png'), encodePng(w, h, base));
console.log('wrote public/portrait-base.png');

console.log('\n/* CSS-ready geometry (% of the 568x570 canvas) */');
for (const r of results) {
  const left = +(r.cx0 / IW * 100).toFixed(2);
  const top = +(r.cy0 / IH * 100).toFixed(2);
  const width = +(r.cw / IW * 100).toFixed(2);
  console.log(`{ src: '${r.name}', left: ${left}, top: ${top}, width: ${width}, originY: ${r.originY.toFixed(1)} },`);
}

