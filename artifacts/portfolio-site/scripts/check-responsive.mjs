// Run with a local Edge/Chrome started using --headless=new --remote-debugging-port=9222.
// node scripts/check-responsive.mjs [site URL]
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const site = process.argv[2] ?? 'http://localhost:5173';
const target = await fetch('http://localhost:9222/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(), errors = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  clearTimeout(request.timer);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id;
    const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 15000);
    pending.set(key, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const [width, height] of [[320,568], [375,667], [390,844], [430,932], [640,800], [768,1024], [844,390], [1024,768], [1440,900]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 640 });
    // Wait for the new document, not an image left over from the previous viewport.
    const loaded = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.removeEventListener('message', onLoad);
        reject(new Error('Page load timed out'));
      }, 15000);
      function onLoad({ data }) {
        if (JSON.parse(data).method !== 'Page.loadEventFired') return;
        clearTimeout(timer);
        socket.removeEventListener('message', onLoad);
        resolve();
      }
      socket.addEventListener('message', onLoad);
    });
    await send('Page.navigate', { url: site });
    await loaded;
    for (let n = 0; n < 60; n++) {
      if (await evaluate(`['.hero-photo-filled img', '.nav-katana-blade'].every(selector => { const image = document.querySelector(selector); return image?.complete && image.naturalWidth > 0; })`)) break;
      await sleep(100);
    }
    await evaluate('document.fonts.ready');
    await sleep(350);
    assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), `${width}: page overflow`);
    for (const selector of ['.nav-community', '.nav-katana-blade', '.hero-photo-filled img', '.nav-socials']) {
      assert.ok(await evaluate(`(() => {
        const n = document.querySelector('${selector}'), r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.x >= 0 && r.right <= innerWidth + 1 && getComputedStyle(n).display !== 'none';
      })()`), `${width}: ${selector} hidden/clipped`);
    }
    assert.ok(await evaluate(`(() => {
      const n = document.querySelector('.hero-photo-filled img'), r = n.getBoundingClientRect();
      return n.naturalWidth > 0 && Math.abs(r.width / r.height - 480 / 482) < .01 && document.querySelector('.nav-katana-blade').naturalWidth > 0;
    })()`), `${width}: images missing/distorted`);
    assert.ok(await evaluate(`document.querySelector('h1').scrollWidth <= document.querySelector('h1').clientWidth + 1`), `${width}: heading clipped`);
    if (width < 1024) {
      // The coral disc behind the hero heading must stay off the portrait frame.
      assert.ok(await evaluate(`(() => {
        const copy = document.querySelector('.hero-copy'), frame = document.querySelector('.hero-photo-filled');
        const style = getComputedStyle(copy, '::after'), c = copy.getBoundingClientRect(), shift = new DOMMatrix(style.transform);
        const w = parseFloat(style.width), h = parseFloat(style.height);
        const left = c.left + parseFloat(style.left) + shift.e;
        const top = c.top + parseFloat(style.top) + shift.f;
        const r = frame.getBoundingClientRect();
        return left + w <= r.left || left >= r.right || top + h <= r.top || top >= r.bottom;
      })()`), `${width}: hero accent disc overlaps the portrait`);
    }
    if (width < 640) assert.ok(await evaluate(`document.querySelector('.hero-photo-filled img').getBoundingClientRect().bottom <= innerHeight`), `${width}: portrait below fold`);
    if (width < 1100) {
      await evaluate(`document.querySelector('.nav-menu-button').click()`);
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('#primary-navigation')).display`), 'flex');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
      assert.equal(await evaluate(`document.querySelector('.nav-menu-button').getAttribute('aria-expanded')`), 'false');
      await evaluate(`document.querySelector('.nav-menu-button').click(); document.querySelector('[href="#skills"]').click()`);
      assert.equal(await evaluate(`document.querySelector('.nav-menu-button').getAttribute('aria-expanded')`), 'false');
    }
    await evaluate(`window.scrollTo({ top: 900, behavior: 'instant' })`);
    assert.equal(await evaluate(`document.querySelector('header').getBoundingClientRect().top`), 0, `${width}: header not sticky`);
    await evaluate(`document.querySelector('.project-card[role="button"]').click()`);
    await sleep(150);
    assert.ok(await evaluate(`(() => { const n = document.querySelector('.project-modal-panel'), r = n.getBoundingClientRect(); return r.x >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight + 1 && n.scrollWidth <= n.clientWidth + 1; })()`), `${width}: modal overflow`);
    await evaluate(`document.querySelector('.project-modal-close').click(); document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo({ top: 0, behavior: 'instant' })`);
    await sleep(600);
    if (width === 390 || width === 1440) {
      // Wait for the modal's focus/scroll restoration before resetting the page.
      await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
      await sleep(150);
      assert.equal(await evaluate('window.scrollY'), 0, 'Screenshot must show the hero');
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(tmpdir(), `portfolio-${width}.png`), Buffer.from(shot.data, 'base64'));
    }
    console.log(`PASS ${width}x${height}: layout, images, menu, sticky header, modal`);
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  socket.close();
  await fetch(`http://localhost:9222/json/close/${target.id}`);
}
