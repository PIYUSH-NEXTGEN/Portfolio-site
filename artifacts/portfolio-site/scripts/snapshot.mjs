// Visual snapshots and DOM probes for manual layout review.
// Run: node scripts/snapshot.mjs <url> <width> <height> <outFile> [--full]
//   --classes  print every class present in the DOM (dead-CSS audit)
//   --probe    print geometry/visibility of the key layout elements
//   --full     capture the whole document instead of the viewport
// Requires Edge/Chrome running with --headless=new --remote-debugging-port=9222.
// Modes are mutually exclusive; --classes/--probe print data and take no shot.
import { writeFile } from 'node:fs/promises';
const [, , site = 'http://localhost:5173', w = '390', h = '844', out = 'shot.png', ...flags] = process.argv;
const target = await fetch('http://localhost:9222/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id;
  pending.set(key, { resolve, reject });
  socket.send(JSON.stringify({ id: key, method, params }));
});
await send('Page.enable');
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 640 });
await send('Page.navigate', { url: site });
await new Promise(resolve => setTimeout(resolve, 3000));
await send('Runtime.evaluate', { expression: `document.documentElement.style.scrollBehavior='auto'` });
// Freeze the branch/katanana sway so snapshots are comparable run to run.
await send('Runtime.evaluate', { expression: `document.querySelectorAll('.deco-branch,.nav-katana-swing,.cat-sprite').forEach(n => n.style.animationPlayState='paused')` });
if (flags.includes('--classes')) {
  const { result } = await send('Runtime.evaluate', {
    expression: `JSON.stringify([...new Set([...document.querySelectorAll('*')].flatMap(n => [...n.classList]))].sort())`,
    returnByValue: true,
  });
  console.log(result.value);
} else if (flags.includes('--probe')) {
  const probe = await send('Runtime.evaluate', {
    expression: `JSON.stringify((() => {
      const rect = s => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), opacity: getComputedStyle(n).opacity, color: getComputedStyle(n).color, display: getComputedStyle(n).display }; };
      const out = { viewport: { w: innerWidth, h: innerHeight }, docHeight: document.documentElement.scrollHeight };
      for (const s of ['.nav', '.deco-branches', '.deco-branch-tl', '.deco-branch-tr', '.deco-branch-bl', '.deco-branch-br', '.deco-bamboo',
        '.editorial-hero', '.hero-photo-wrap', '.katana-hero-content', '#projects', '#skills', '#experience', '#contact', 'footer']) out[s] = rect(s);
      // Visible width fraction of each branch after clipping to the viewport.
      out.visible = {};
      for (const s of ['.deco-branch-tl', '.deco-branch-tr', '.deco-branch-bl', '.deco-branch-br']) {
        const r = document.querySelector(s)?.getBoundingClientRect();
        out.visible[s] = r ? +((Math.min(r.right, innerWidth) - Math.max(r.x, 0)) / r.width).toFixed(2) : null;
      }
      return out;
    })())`,
    returnByValue: true,
  });
  console.log(probe.result.value);
} else {
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: flags.includes('--full') });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log(`saved ${out}`);
}
await fetch(`http://localhost:9222/json/close/${target.id}`);
socket.close();
