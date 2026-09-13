import { useEffect, useRef, useState } from 'react';
import { MousePointerClick, X } from 'lucide-react';

/* ── Guided tour ───────────────────────────────────────────────────────
   A virtual cursor walks first-time visitors through the site: it glides
   to the navbar icons, project cards, skills, resume and contact button,
   hovering and clicking along the way while the page auto-scrolls beneath
   it. The visitor's real cursor is never touched — this is pure theatre.
   Skippable at any time via the button, Escape, or any scroll input. */

interface TourStep {
  selector: string;
  caption: string;
  action: 'hover' | 'click' | 'visit' | 'type' | 'select';
  hold: number;
  /* Optional anchor element the scroll aligns near the top of the viewport
     (below the sticky nav) — used when the target sits deep inside a tall
     section whose heading should stay visible. */
  anchor?: string;
  spot?: { fx: number; fy: number };
  text?: string;
  clear?: string[];
}

/* React-controlled inputs ignore direct value writes — they must go through
   the native value setter, then a bubbling input event updates React state. */
function setNativeValue(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = field instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

/* Build a Range covering only a slice (from→to, 0..1) of an element's text —
   so the tour can "mark" a few lines of the hero instead of the whole block. */
function buildPartialRange(el: Element, from: number, to: number): Range | null {
  const walker = document.createTreeWalker(el, window.NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let total = 0;
  let node = walker.nextNode() as Text | null;
  while (node) {
    const len = node.textContent?.length ?? 0;
    if (len > 0) { nodes.push(node); total += len; }
    node = walker.nextNode() as Text | null;
  }
  if (nodes.length === 0 || total === 0) return null;
  const startAt = Math.floor(total * from);
  const endAt = Math.max(startAt + 2, Math.ceil(total * to));
  const range = document.createRange();
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;
  let consumed = 0;
  for (const textNode of nodes) {
    const len = textNode.textContent?.length ?? 0;
    if (!startNode && consumed + len > startAt) {
      startNode = textNode;
      startOffset = Math.max(0, startAt - consumed);
    }
    if (startNode && consumed + len >= endAt) {
      endNode = textNode;
      endOffset = Math.max(startOffset + 1, endAt - consumed);
      break;
    }
    consumed += len;
  }
  if (!startNode) return null;
  if (!endNode) { endNode = nodes[nodes.length - 1]; endOffset = endNode.textContent?.length ?? 0; }
  try {
    range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length ?? 0));
    range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length ?? 0));
  } catch {
    return null;
  }
  return range;
}

const TOUR_STEPS: TourStep[] = [
  /* 1 · Navbar — two icons only */
  { selector: '[data-testid="link-nav-github"]', caption: 'Start here — every platform I’m on lives in this bar.', action: 'hover', hold: 1400 },
  { selector: '[data-testid="link-nav-linkedin"]', caption: 'GitHub, LinkedIn — pick yours and say hi.', action: 'hover', hold: 1200 },
  /* 2 · Hero — highlight a few lines of the intro */
  { selector: '#top .editorial-hero-copy', caption: 'The short version: ML & backend, built end to end.', action: 'select', hold: 2400, spot: { fx: 0.1, fy: 0.2 } },
  /* 3 · Projects — expand a card, scroll through it, close it */
  { selector: '[data-testid="card-project-01"]', caption: 'Selected work — click a card to open its story.', action: 'click', hold: 1500, anchor: '#projects' },
  { selector: '[data-testid="card-project-01"]', caption: 'Details, highlights and live links — all inside.', action: 'visit', hold: 1700, spot: { fx: 0.5, fy: 0.85 } },
  { selector: '[data-testid="card-project-01"]', caption: 'Click again and it folds away.', action: 'click', hold: 1000 },
  /* 4 · Tech stack — a slow look, ~4s */
  { selector: '#skills .skills-grid', caption: 'The tech stack — languages, libraries, ML, databases, deployment.', action: 'visit', hold: 3600, spot: { fx: 0.2, fy: 0.3 } },
  /* 5 · Section four — experience & achievements */
  { selector: '#experience h3.display', caption: 'Section four — the roles and the record so far.', action: 'visit', hold: 1500 },
  { selector: '.achievement-card', caption: 'A few wins worth pinning up.', action: 'hover', hold: 1500 },
  /* 6 · Resume — glide down, beat, unroll, read, fold */
  { selector: '[data-testid="img-resume"]', caption: 'The resume sits right here, folded.', action: 'visit', hold: 1000 },
  { selector: '[data-testid="button-resume-toggle"]', caption: 'One click unrolls the full page…', action: 'click', hold: 2600 },
  { selector: '[data-testid="button-resume-toggle"]', caption: '…and folds back when you’re done.', action: 'click', hold: 900 },
  /* 7 · Contact — fast typing demo, then hover send */
  { selector: '[data-testid="input-contact-email"]', caption: 'Drop your email in — watch how fast it goes.', action: 'type', text: 'piyush.demo@gmail.com', hold: 800 },
  { selector: '[data-testid="input-contact-message"]', caption: 'A few honest words do the rest.', action: 'type', text: 'I loved the portfolio design!', hold: 900 },
  { selector: '[data-testid="button-contact-send"]', caption: 'Then one click sends it on its way.', action: 'hover', hold: 1400, clear: ['[data-testid="input-contact-email"]', '[data-testid="input-contact-message"]'] },
  /* 8 · Journey — straight there, then home to the top */
  { selector: '[data-testid="button-view-journey"]', caption: 'And for the long version — the Journey page.', action: 'hover', hold: 1500 },
];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function GuidedTour() {
  const [running, setRunning] = useState(false);
  const [caption, setCaption] = useState('');
  const [captionOn, setCaptionOn] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(true);
  const runningRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const reducedRef = useRef(false);
  /* True when the tour was interrupted by the visitor scrolling themselves —
     in that case the page should stay exactly where they left it. */
  const skipScrollRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => { cancelRef.current = true; };
  }, []);

  /* Escape (or any scrolling intent) ends the tour gracefully. */
  useEffect(() => {
    if (!running) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { cancelRef.current = true; return; }
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelRef.current = true;
    };
    const onUserScroll = () => { skipScrollRef.current = true; cancelRef.current = true; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
    };
  }, [running]);

  const setCursorPos = (x: number, y: number) => {
    posRef.current = { x, y };
    const node = cursorRef.current;
    if (node) node.style.transform = `translate(${x}px, ${y}px)`;
  };

  /* rAF tween that honours cancellation and reduced motion. */
  const tween = (ms: number, onFrame: (t: number) => void) => new Promise<void>((resolve) => {
    const duration = reducedRef.current ? 0 : ms;
    if (duration <= 0 || cancelRef.current) { onFrame(1); resolve(); return; }
    const start = performance.now();
    const frame = (now: number) => {
      if (cancelRef.current) { resolve(); return; }
      const t = Math.min(1, (now - start) / duration);
      onFrame(easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });

  const wait = (ms: number) => tween(ms, () => {});

  /* Auto-scroll: distance-proportional duration — ~0.55ms per pixel,
     clamped so short hops don't feel rushed and long ones don't crawl. */
  const scrollToY = async (targetY: number) => {
    const startY = window.scrollY;
    const dist = Math.abs(targetY - startY);
    if (dist < 4) return;
    await tween(Math.min(2600, Math.max(750, dist * 0.55)), (t) => window.scrollTo(0, startY + (targetY - startY) * t));
  };

  /* The tour always ends at the top of the page. Unlike the tweens above,
     this one ignores the cancel flag so it still glides home when the tour
     was skipped — it only stands down if the visitor scrolled themselves. */
  const returnToTop = () => new Promise<void>((resolve) => {
    const startY = window.scrollY;
    if (startY < 4 || skipScrollRef.current) { resolve(); return; }
    if (reducedRef.current) { window.scrollTo(0, 0); resolve(); return; }
    const start = performance.now();
    const duration = Math.min(2400, Math.max(700, startY * 0.45));
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY * (1 - easeInOutCubic(t)));
      if (t < 1) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });

  /* Glide: the cursor moves AND the page scrolls in the same tween — the
     cursor's vertical position is recomputed from the element's document
     position on every frame, so it rides along while the screen slides.
     An optional anchor aligns that element near the top of the viewport
     (below the sticky nav) so tall sections still show their heading. */
  const glideTo = async (el: Element, fx: number, fy: number, anchorSelector?: string) => {
    const rect = el.getBoundingClientRect();
    const startScroll = window.scrollY;
    const docTop = rect.top + startScroll;
    const cursorDocY = docTop + rect.height * fy;
    const targetX = rect.left + rect.width * fx;

    let targetScroll = Math.max(0, cursorDocY - window.innerHeight * 0.45);
    if (anchorSelector) {
      const anchor = document.querySelector(anchorSelector);
      if (anchor) {
        targetScroll = Math.max(0, anchor.getBoundingClientRect().top + startScroll - 96);
      }
    }
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.min(targetScroll, maxScroll);
    /* Never let the cursor land below the fold — if it would, follow it down. */
    if (cursorDocY - targetScroll > window.innerHeight - 90) {
      targetScroll = Math.min(maxScroll, Math.max(0, cursorDocY - (window.innerHeight - 90)));
    }

    const { x: sx, y: sy } = posRef.current;
    const scrollDist = Math.abs(targetScroll - startScroll);
    const cursorDist = Math.hypot(targetX - sx, cursorDocY - targetScroll - sy);
    const duration = Math.min(2600, Math.max(750, Math.max(scrollDist, cursorDist) * 0.55));
    await tween(duration, (t) => {
      const scroll = startScroll + (targetScroll - startScroll) * t;
      window.scrollTo(0, scroll);
      /* Element's live viewport position at this scroll offset. */
      const ey = cursorDocY - scroll;
      setCursorPos(sx + (targetX - sx) * t, sy + (ey - sy) * t);
    });
  };

  const startTour = () => {
    if (runningRef.current) return;
    cancelRef.current = false;
    skipScrollRef.current = false;
    runningRef.current = true;
    setRunning(true);
    document.body.classList.add('tour-active');
    setCursorPos(64, window.innerHeight - 120);
    void runSteps();
  };

  const runSteps = async () => {
    const finish = () => {
      document.body.classList.remove('tour-active');
      cursorRef.current?.classList.remove('tour-cursor-click', 'tour-caption-flip');
      setCaptionOn(false);
      runningRef.current = false;
      setRunning(false);
      /* However the tour ends — natural finish, Skip or Escape — glide the
         visitor back to the top (unless they scrolled there themselves). */
      void returnToTop();
    };
    try {
      await wait(450);
      for (const step of TOUR_STEPS) {
        if (cancelRef.current) return;
        const el = document.querySelector(step.selector);
        if (!el) continue;

        /* One glide moves the cursor and scrolls the page together. */
        setCaption(step.caption);
        await glideTo(el, step.spot?.fx ?? 0.5, step.spot?.fy ?? 0.5, step.anchor);
        if (cancelRef.current) return;
        {
          const rect = el.getBoundingClientRect();
          const cursorX = rect.left + rect.width * (step.spot?.fx ?? 0.5);
          cursorRef.current?.classList.toggle('tour-caption-flip', cursorX > window.innerWidth - 320);
        }
        setCaptionOn(true);

        if (step.action === 'hover') {
          /* CSS :hover can't be faked with events — mirror it with a class. */
          el.classList.add('tour-hover');
          await wait(step.hold);
          el.classList.remove('tour-hover');
        } else if (step.action === 'type') {
          /* Click into the field, then type character by character — fast. */
          const field = el as HTMLInputElement | HTMLTextAreaElement;
          const node = cursorRef.current;
          node?.classList.add('tour-cursor-click');
          field.focus();
          await wait(340);
          node?.classList.remove('tour-cursor-click');
          let typed = '';
          for (const ch of step.text ?? '') {
            if (cancelRef.current) return;
            typed += ch;
            setNativeValue(field, typed);
            await wait(reducedRef.current ? 0 : 26);
          }
          await wait(step.hold);
          field.blur();
        } else if (step.action === 'select') {
          /* Mark a slice of the element's text — like a reader highlighting
             a few lines — then drag the cursor down across the selection. */
          const selection = window.getSelection();
          const range = buildPartialRange(el, 0.16, 0.72);
          const { x: cx, y: cy } = posRef.current;
          if (selection && range) {
            selection.removeAllRanges();
            selection.addRange(range);
            const rect = el.getBoundingClientRect();
            const endY = Math.max(cy + 24, rect.top + rect.height * 0.8);
            await tween(700, (t) => setCursorPos(cx, cy + (endY - cy) * t));
          }
          await wait(step.hold);
          selection?.removeAllRanges();
        } else if (step.action === 'visit') {
          /* Just a pause so the visitor can read this part of the page. */
          await wait(step.hold);
        } else {
          const node = cursorRef.current;
          node?.classList.add('tour-cursor-click');
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          await wait(380);
          node?.classList.remove('tour-cursor-click');
          await wait(step.hold);
        }
        if (step.clear) {
          /* Wipe any demo text the tour typed so the form is left clean. */
          (document.activeElement as HTMLElement | null)?.blur?.();
          for (const selector of step.clear) {
            const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
            if (field) setNativeValue(field, '');
          }
        }
        setCaptionOn(false);
        await wait(280);
      }
      if (!cancelRef.current) {
        setCaption('That’s the tour — now it’s yours to explore.');
        cursorRef.current?.classList.remove('tour-caption-flip');
        setCaptionOn(true);
        await scrollToY(0);
        await wait(1400);
      }
    } finally {
      finish();
    }
  };

  return (
    <>
      <div ref={cursorRef} className={`tour-cursor ${running ? 'tour-cursor-on' : ''}`} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M5 2.6 L17.6 13 L11.4 13.7 L14.3 20 L11.7 21.1 L8.9 14.7 L5 18 Z" fill="#c84d3d" stroke="#202a36" strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <div className={`tour-caption ${captionOn ? 'tour-caption-on' : ''}`} role="status">{caption}</div>
      </div>
      <button
        type="button"
        onClick={running ? () => { cancelRef.current = true; } : startTour}
        className={`guided-tour-button ${running ? 'guided-tour-running' : ''}`}
        data-testid="button-guided-tour"
        aria-label={running ? 'Skip the guided tour' : 'Take a guided tour of the site'}
      >
        {running ? <X size={14} /> : <MousePointerClick size={15} />}
        <span>{running ? 'Skip tour' : 'Take me through'}</span>
      </button>
    </>
  );
}
