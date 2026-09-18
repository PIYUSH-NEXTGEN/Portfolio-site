// Requires Node 22+ and Chrome/Edge with --remote-debugging-port=9222.
// node scripts/check-tour.mjs [site URL] [width] [height] [reduce|no-preference]
import assert from 'node:assert/strict';
const [site = 'http://localhost:5173', w = '390', h = '844', motion = 'no-preference'] = process.argv.slice(2);
const target = await fetch('http://localhost:9222/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(), errors = [];
socket.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args);
  if (!pending.has(msg.id)) return;
  const { resolve, reject, timer } = pending.get(msg.id);
  clearTimeout(timer); pending.delete(msg.id);
  if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); reject(new Error(method + ' timed out')); }, 15000);
    pending.set(key, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 640 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion }] });
  await send('Page.navigate', { url: site });
  await sleep(2500);
  await evaluate(`document.fonts.ready`);
  // The cinematic boot intro must hand the page over on its own — a real load
  // (no reduced motion) that never unmounts the overlay would trap every tap.
  let handed = false;
  for (let n = 0; n < 90; n++) {
    if (await evaluate(`!document.querySelector('.intro-overlay')`)) { handed = true; break; }
    await sleep(100);
  }
  assert.ok(handed, 'boot intro never unmounted');
  await evaluate(`window.scrollTo({top: 1000, behavior: 'instant'}); document.querySelector('[data-testid="button-hero-tour"]').click()`);
  const seen = new Set(), failures = new Set();
  let github = false, selection = false, completed = false;
  for (let i = 0; i < 750; i++) {
    const sample = await evaluate(`(() => {
      const cursor = document.querySelector('.tour-cursor');
      const bubble = cursor.querySelector('.tour-caption');
      const rect = cursor.querySelector('svg').getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      const g = document.querySelector('[data-testid="link-nav-github"]').getBoundingClientRect();
      const inside = r => r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
      const on = bubble.classList.contains('tour-caption-on');
      const hovered = document.querySelector('.tour-hover');
      const hr = hovered?.getBoundingClientRect();
      const round = r => r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      return { running: document.body.classList.contains('tour-active'), caption: on ? bubble.textContent : '',
        cursorInside: inside(rect), captionInside: !on || inside(b), selected: !!getSelection()?.toString(),
        cursorRect: round(rect), targetRect: round(hr), scrollY: Math.round(window.scrollY),
        github: on && bubble.textContent.startsWith('Start here') && rect.x >= g.x && rect.x <= g.right && rect.y >= g.y && rect.y <= g.bottom,
        hoverAligned: !hr || (rect.x >= hr.x - 3 && rect.x <= hr.right + 3 && rect.y >= hr.y - 3 && rect.y <= hr.bottom + 3) };
    })()`);
    
    if (sample.caption) seen.add(sample.caption);
    github ||= sample.github;
    selection ||= sample.selected;
    if (sample.running) {
      if (!sample.cursorInside) failures.add('cursor outside viewport');
      if (!sample.captionInside) failures.add('caption outside viewport: ' + sample.caption);
      if (!sample.hoverAligned) failures.add(`cursor missed hovered target: ${sample.caption} cursor=${JSON.stringify(sample.cursorRect)} target=${JSON.stringify(sample.targetRect)} scrollY=${sample.scrollY}`);
    } else { completed = true; break; }
    await sleep(100);
  }
  console.log({ viewport: `${w}x${h}`, motion, github, selection, captions: [...seen], failures: [...failures], errors });
  assert.ok(completed, 'tour timed out');
  assert.ok(github, 'GitHub navbar step missed');
  assert.ok(selection, 'text selection step missed');
  assert.equal(seen.size, 10, 'missing tour captions');
  assert.equal(failures.size, 0);
  assert.equal(errors.length, 0);
  console.log('PASS full tour');
} finally {
  socket.close();
  await fetch(`http://localhost:9222/json/close/${target.id}`);
}
