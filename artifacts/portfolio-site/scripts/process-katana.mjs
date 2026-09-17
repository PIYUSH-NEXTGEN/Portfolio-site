/**
 * Katana asset processing — turns attached_assets/katana.png (flat black
 * line-art on an opaque white background, with a black border frame and
 * baked-in sakura petals/flowers) into clean, transparent, warm-tinted
 * cutouts in scripts/processed/ (working files — none of them are shipped):
 *
 *   scripts/processed/katana-ink.png   — the sword only, tight-cropped, white removed
 *   scripts/processed/sakura-<n>.png   — each detached petal / flower as its own sprite
 *
 * The sprites the site serves are lossless-WebP builds of these cutouts and
 * stay in public/: katana-ink.webp (the nav blade's fallback) and
 * katana-hang.webp (pre-verticalized for the hanging nav katana).
 *
 * Pure Node (no dependencies): decode PNG, erase border frame, label
 * connected components, alpha = 255 - luminance (white vanishes, edges stay
 * soft), re-tint ink to a warm umber for the cream paper, re-encode PNG.
 *
 * Run: node scripts/process-katana.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* Source art lives in attached_assets/ (the supplied reference); the cutouts
   are written to scripts/processed/ so neither lands in the shipped site. */
const SRC = path.resolve(ROOT, '..', '..', 'attached_assets', 'katana.png');
const OUT_DIR = path.join(ROOT, 'scripts', 'processed');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- config ---------- */
const INK_TINT = [78, 58, 50];    // warm umber — matches cream/terracotta palette
const WHITE_CUTOFF = 244;         // luminance >= this is fully transparent
const MIN_COMPONENT_AREA = 40;    // discard specks smaller than this
const PAD = 3;                    // padding (px) around each exported sprite

/* ---------- PNG decode ---------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8, w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`unsupported PNG (bitDepth=${bitDepth}, colorType=${colorType})`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = Buffer.alloc(w * h * 4);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const rowStart = p;
    p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[rowStart + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      px[y * stride + x] = v & 255;
    }
  }
  if (bpp === 3) {
    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      rgba[i * 4] = px[i * 3]; rgba[i * 4 + 1] = px[i * 3 + 1];
      rgba[i * 4 + 2] = px[i * 3 + 2]; rgba[i * 4 + 3] = 255;
    }
    return { w, h, data: rgba };
  }
  return { w, h, data: px };
}

/* ---------- PNG encode (RGBA, filter 0) ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- main ---------- */
const { w, h, data: rgb } = decodePng(fs.readFileSync(SRC));
const lum = new Uint8Array(w * h);
const ink = new Uint8Array(w * h); // 1 = part of the artwork

for (let i = 0; i < w * h; i++) {
  const l = (rgb[i * 4] * 299 + rgb[i * 4 + 1] * 587 + rgb[i * 4 + 2] * 114) / 1000;
  lum[i] = l;
  if (l < 170) ink[i] = 1;
}

// -- erase the border frame: rows/cols hugging each edge that are mostly dark
function stripLength(getDark) {
  let n = 0;
  while (n < 24 && getDark(n)) n++;
  return n;
}
const top = stripLength(y => { let d = 0; for (let x = 0; x < w; x++) if (ink[y * w + x]) d++; return d / w > 0.5; });
const bottom = stripLength(k => { let d = 0; for (let x = 0; x < w; x++) if (ink[(h - 1 - k) * w + x]) d++; return d / w > 0.5; });
const left = stripLength(x => { let d = 0; for (let y = 0; y < h; y++) if (ink[y * w + x]) d++; return d / h > 0.5; });
const right = stripLength(k => { let d = 0; for (let y = 0; y < h; y++) if (ink[y * w + (w - 1 - k)]) d++; return d / h > 0.5; });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (y < top + 2 || y >= h - bottom - 2 || x < left + 2 || x >= w - right - 2) {
      ink[y * w + x] = 0;
    }
  }
}
console.log(`border frames cleared — top:${top} bottom:${bottom} left:${left} right:${right}`);

// -- connected components (4-connectivity, iterative flood fill)
// Labeling runs on a DILATED mask so artwork parts separated by thin white
// gaps (e.g. the stylistic white outline around the tsuba) merge into one
// piece, while far-away petals stay separate. Export still uses the original
// (undilated) mask so anti-aliasing is preserved.
const DILATE = 3;
const dilated = new Uint8Array(w * h);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!ink[y * w + x]) continue;
    for (let dy = -DILATE; dy <= DILATE; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= h) continue;
      for (let dx = -DILATE; dx <= DILATE; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < w) dilated[yy * w + xx] = 1;
      }
    }
  }
}

const label = new Int32Array(w * h).fill(-1);
const components = [];
const stack = new Int32Array(w * h);
for (let start = 0; start < w * h; start++) {
  if (!dilated[start] || label[start] !== -1) continue;
  const id = components.length;
  let sp = 0;
  stack[sp++] = start;
  label[start] = id;
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w, y = (i / w) | 0;
    if (x > 0 && dilated[i - 1] && label[i - 1] === -1) { label[i - 1] = id; stack[sp++] = i - 1; }
    if (x < w - 1 && dilated[i + 1] && label[i + 1] === -1) { label[i + 1] = id; stack[sp++] = i + 1; }
    if (y > 0 && dilated[i - w] && label[i - w] === -1) { label[i - w] = id; stack[sp++] = i - w; }
    if (y < h - 1 && dilated[i + w] && label[i + w] === -1) { label[i + w] = id; stack[sp++] = i + w; }
  }
  components.push({ id, area: 0, minx: w, maxx: 0, miny: h, maxy: 0, touchesEdge: false });
}

// fold the ORIGINAL ink pixels into their (dilated) component: real geometry
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!ink[i]) continue;
    const c = components[label[i]];
    c.area++;
    if (x < c.minx) c.minx = x; if (x > c.maxx) c.maxx = x;
    if (y < c.miny) c.miny = y; if (y > c.maxy) c.maxy = y;
    if (x < 4 || y < 4 || x >= w - 4 || y >= h - 4) c.touchesEdge = true;
  }
}

components.sort((a, b) => b.area - a.area);
const keep = components.filter(c => c.area >= MIN_COMPONENT_AREA && !c.touchesEdge);
const dropped = components.length - keep.length;
const sword = keep[0];
const sakura = keep.slice(1);
console.log(`components: ${components.length} total, ${dropped} dropped (border remnants / specks), keeping ${keep.length} (1 sword + ${sakura.length} sakura)`);
sakura.forEach((c, i) => console.log(`  sakura ${i + 1}: area=${c.area} bbox=${c.maxx - c.minx + 1}x${c.maxy - c.miny + 1}`));

/* sword axis angle — kissaki (top-right extreme) vs tsuka end (bottom-left extreme) */
{
  let tip = [sword.maxx, sword.miny], grip = [sword.minx, sword.maxy];
  let bestTip = -1e9, bestGrip = 1e9;
  for (let y = sword.miny; y <= sword.maxy; y++) {
    for (let x = sword.minx; x <= sword.maxx; x++) {
      if (label[y * w + x] !== sword.id) continue;
      const s = x - y; // up-right-ness
      if (s > bestTip) { bestTip = s; tip = [x, y]; }
      if (s < bestGrip) { bestGrip = s; grip = [x, y]; }
    }
  }
  const angle = (Math.atan2(tip[1] - grip[1], tip[0] - grip[0]) * 180) / Math.PI;
  console.log(`sword axis: grip(${grip}) -> tip(${tip}) angle=${angle.toFixed(1)}deg`);
  console.log(`CSS rotate to straighten horizontally: ${(-angle).toFixed(1)}deg`);
  console.log(`CSS rotate for a -14deg final tilt (tip up-right): ${(-angle - 14).toFixed(1)}deg`);
}

/* ---------- export sprites ---------- */
function exportComponent(comp, file) {
  const cw = comp.maxx - comp.minx + 1 + PAD * 2;
  const ch = comp.maxy - comp.miny + 1 + PAD * 2;
  const out = Buffer.alloc(cw * ch * 4); // transparent black
  for (let y = comp.miny; y <= comp.maxy; y++) {
    for (let x = comp.minx; x <= comp.maxx; x++) {
      if (label[y * w + x] !== comp.id) continue;
      let a = 255 - lum[y * w + x];       // white -> 0, black -> 255, edges soft
      if (lum[y * w + x] >= WHITE_CUTOFF) a = 0;
      if (a <= 0) continue;
      const o = ((y - comp.miny + PAD) * cw + (x - comp.minx + PAD)) * 4;
      out[o] = INK_TINT[0]; out[o + 1] = INK_TINT[1]; out[o + 2] = INK_TINT[2];
      out[o + 3] = a;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, file), encodePng(cw, ch, out));
  return { w: cw, h: ch };
}

const swordSize = exportComponent(sword, 'katana-ink.png');
console.log(`wrote scripts/processed/katana-ink.png (${swordSize.w}x${swordSize.h})`);
sakura.forEach((c, i) => {
  const size = exportComponent(c, `sakura-${i + 1}.png`);
  console.log(`wrote scripts/processed/sakura-${i + 1}.png (${size.w}x${size.h})`);
});
