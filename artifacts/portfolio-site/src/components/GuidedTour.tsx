import { useEffect, useRef, useState } from 'react';

/* ── Guided tour ───────────────────────────────────────────────────────
   A virtual cursor walks first-time visitors through the site: it glides
   to the navbar icons, project cards, skills, resume and contact button,
   hovering and clicking along the way while the page auto-scrolls beneath
   it. The visitor's real cursor is never touched — this is pure theatre.
   Skippable at any time with Escape or any scroll input. */

interface TourStep {
  selector: string;
  caption: string;
  action: 'hover' | 'click' | 'visit' | 'select';
  hold: number;
  /* When true the caption bubble stays hidden for this step — used while the
     tour is selecting hero text so the bubble never covers the highlight. */
  silent?: boolean;
  /* Optional anchor element the scroll aligns near the top of the viewport
     (below the sticky nav) — used when the target sits deep inside a tall
     section whose heading should stay visible. */
  anchor?: string;
  spot?: { fx: number; fy: number };
}

/* Collect every word-end boundary in an element's text — used to grow a
   selection word by word, the way a human drags a highlight. */
function collectWordBoundaries(el: Element): Array<{ node: Text; offset: number }> {
  const walker = document.createTreeWalker(el, window.NodeFilter.SHOW_TEXT);
  const boundaries: Array<{ node: Text; offset: number }> = [];
  let node = walker.nextNode() as Text | null;
  while (node) {
    const text = node.textContent ?? '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (!/\s/.test(ch) && (i + 1 >= text.length || /\s/.test(next))) {
        boundaries.push({ node, offset: i + 1 });
      }
    }
    node = walker.nextNode() as Text | null;
  }
  return boundaries;
}

const TOUR_STEPS: TourStep[] = [
  /* 1 · Navbar — two icons only */
  { selector: '[data-testid="link-nav-github"]', caption: 'Start here. Every platform I am on lives in this bar.', action: 'hover', hold: 1400 },
  { selector: '[data-testid="link-nav-linkedin"]', caption: 'Pick your platform and connect.', action: 'hover', hold: 1200 },
  /* 2 · Hero — highlight the description the way a human drags a selection,
     one word at a time, cursor riding the end of the highlight */
  { selector: '#hero-description', caption: 'The short version, straight from the page.', action: 'select', hold: 2000, spot: { fx: 0.1, fy: 0.35 }, silent: true },
  /* 3 · Projects — glide in, whole card in frame, cursor parked in the gap
     between the image preview and the description */
  { selector: '[data-testid="card-project-01"]', caption: 'Open the project card to see more details.', action: 'hover', hold: 2800, anchor: '#projects', spot: { fx: 0.5, fy: 0.7 } },
  /* 3 · Tech stack — the cursor parks to the right of the heading, clear of
     the list, so nothing it covers is something you were meant to read */
  { selector: '#skills h2.section-title', caption: 'The tech stack I work with, from languages to the ML layer.', action: 'visit', hold: 2000, spot: { fx: 0.9, fy: 0.5 }, anchor: '#skills' },
  /* 4 · The record — same idea: cursor beside the heading, not on the copy */
  { selector: '#experience h2.section-title', caption: 'The record I am building, roles and wins so far.', action: 'visit', hold: 2000, spot: { fx: 0.9, fy: 0.5 }, anchor: '#experience' },
  /* 5 · Achievements, then the resume */
  { selector: '.achievement-row:nth-of-type(1)', caption: 'A few wins worth pinning up.', action: 'hover', hold: 1600 },
  { selector: '[data-testid="text-resume-status"]', caption: 'The resume will be uploaded soon.', action: 'hover', hold: 2200 },
  /* 6 · Contact — direct email link */
  { selector: '[data-testid="link-contact-address"]', caption: 'You can reach me at this email address.', action: 'hover', hold: 2200 },
  /* 7 · Repository — hover without opening an external page */
  { selector: '[data-testid="link-star-repo"]', caption: 'Like the design? Star the repo on GitHub.', action: 'hover', hold: 2200 },
];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* External trigger so the hero's "Take me through" button can start the tour
   without rendering the floating pill button here anymore. */
let externalStart: (() => void) | null = null;
export function startGuidedTour() { externalStart?.(); }

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

  /* Register the external start trigger (used by the hero button). */
  useEffect(() => {
    externalStart = () => { if (!runningRef.current) void startTour(); };
    return () => { externalStart = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Escape or any scrolling intent ends the tour gracefully. */
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
    /* Whole element in frame: for card sized targets (anything that fits in
       most of a viewport) never let the bottom edge fall below the fold —
       the visitor should see the full card, description included. */
    if (rect.height <= window.innerHeight * 0.85) {
      const docBottom = docTop + rect.height;
      if (docBottom - targetScroll > window.innerHeight - 60) {
        targetScroll = Math.min(maxScroll, Math.max(0, docBottom - (window.innerHeight - 60)));
      }
    }
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
      cursorRef.current?.classList.remove('tour-cursor-click', 'tour-caption-flip', 'tour-caption-lift');
      setCaptionOn(false);
      runningRef.current = false;
      setRunning(false);
      /* However the tour ends — natural finish or Escape — glide the
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
        if (!step.silent) {
          const rect = el.getBoundingClientRect();
          const cursorX = rect.left + rect.width * (step.spot?.fx ?? 0.5);
          const cursorY = rect.top + rect.height * (step.spot?.fy ?? 0.5);
          cursorRef.current?.classList.toggle('tour-caption-flip', cursorX > window.innerWidth - 320);
          /* Near the page bottom the caption would run off screen under the
             cursor — lift it above the cursor instead for that step. */
          cursorRef.current?.classList.toggle('tour-caption-lift', cursorY > window.innerHeight - 150);
          setCaptionOn(true);
        }

        if (step.action === 'hover') {
          /* CSS :hover can't be faked with events — mirror it with a class. */
          el.classList.add('tour-hover');
          await wait(step.hold);
          el.classList.remove('tour-hover');
        } else if (step.action === 'select') {
          /* Mark the description with a continuous drag — the selection edge
             sweeps through every character (starting from the very first
             word) while the cursor rides the edge of the highlight, exactly
             the way a human drags a selection across text. */
          const selection = window.getSelection();
          const boundaries = collectWordBoundaries(el);
          if (selection && boundaries.length > 1) {
            const startNode = boundaries[0].node;
            const startOffset = Math.max(0, (startNode.textContent ?? '').search(/\S/));
            const applySelection = (node: Text, end: number) => {
              const range = document.createRange();
              range.setStart(startNode, startOffset);
              range.setEnd(node, end);
              selection.removeAllRanges();
              selection.addRange(range);
              /* Cursor rides just past the newest highlighted character. */
              const rects = range.getClientRects();
              const last = rects[rects.length - 1];
              if (last) setCursorPos(last.right - 2, last.top + last.height / 2);
            };
            let prev = { node: startNode, offset: startOffset };
            for (let i = 0; i < boundaries.length; i++) {
              if (cancelRef.current) break;
              const boundary = boundaries[i];
              if (boundary.node === prev.node && boundary.offset > prev.offset) {
                /* Sweep through the word's characters frame by frame — no
                   word sized jumps, no dead pauses in between. */
                const pace = 74 + (i % 3) * 8;
                await tween(reducedRef.current ? 0 : pace, (t) => {
                  applySelection(boundary.node, Math.round(prev.offset + (boundary.offset - prev.offset) * t));
                });
              } else {
                /* Crossing the <br> line break — hop to the new line's word. */
                applySelection(boundary.node, boundary.offset);
                await wait(reducedRef.current ? 0 : 74 + (i % 3) * 8);
              }
              prev = boundary;
            }
          } else if (selection) {
            selection.selectAllChildren(el);
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
          /* Re-sync the cursor to the element's post-click position — a state
             change (toggle open/close, expansion) can shift the layout, and we
             want the cursor to stay visually on the target, not drift away. */
          const afterEl = document.querySelector(step.selector);
          if (afterEl && node) {
            const r = afterEl.getBoundingClientRect();
            setCursorPos(r.left + r.width * (step.spot?.fx ?? 0.5), r.top + r.height * (step.spot?.fy ?? 0.5));
          }
          await wait(step.hold);
        }
        setCaptionOn(false);
        await wait(280);
      }
      if (!cancelRef.current) {
        setCaption('That is the tour. Now it is yours to explore.');
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
    </>
  );
}
