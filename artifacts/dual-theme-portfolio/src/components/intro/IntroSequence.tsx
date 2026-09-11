import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { KatanaStrike } from './KatanaStrike';
import { ScreenSplit } from './ScreenSplit';
import './intro.css';

/**
 * Cinematic page-load intro (7s total).
 *
 * Story, from the visitor's POV: the site looks like it is still loading
 * (terminal boot STALLS mid-load — progress bar stuck ~62%, spinner running,
 * never "READY") — then a katana thrusts in FROM THE VIEWER's side (huge +
 * blurred, snapping into focus), swings 180 degrees THROUGH the screen, the
 * screen breaks into 2 halves that fall away, and the portfolio underneath
 * stands alone. The overlay unmounts and never reappears.
 *
 * Orchestrated by ONE master GSAP timeline. The portfolio renders underneath
 * from the start; this overlay is purely visual and unmounts when finished.
 */

/** Master switch — set to false to boot straight into the site (useful in dev). */
const ENABLE_INTRO = true;

function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (!ENABLE_INTRO) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

export function IntroSequence() {
  const [active, setActive] = useState(shouldPlayIntro);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hand-off from the static pre-hydration cover in index.html (identical look → seamless).
    document.getElementById('static-boot-cover')?.remove();

    const doc = document.documentElement;
    const prevOverflow = doc.style.overflow;
    doc.style.overflow = 'hidden';

    // The page MUST never stay scroll-locked: restore no matter how this
    // effect ends (timeline completed, component unmounted, a tween threw,
    // or the tab was throttled and the timeline stalled).
    const restore = () => {
      if (prevOverflow) doc.style.overflow = prevOverflow;
      else doc.style.removeProperty('overflow');
    };

    if (!active) {
      restore();
      return restore;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      restore();
      setActive(false); // unmounts the overlay; effect cleanup reverts the context
    };

    // Safety net: force-unlock even if the GSAP timeline never completes.
    const failSafe = window.setTimeout(finish, 8000);

    let ctx: ReturnType<typeof gsap.context> | null = null;
    try {
      ctx = gsap.context(() => {
        const finishOverlay = () => {
          if (rootRef.current) rootRef.current.style.pointerEvents = 'none';
          finish();
        };

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish });

      // ── 1 · TERMINAL BOOT ──────────────────────────────────────────
      tl.to('[data-intro="fade"]', { opacity: 0.4, duration: 0.6 }, 0.1)
        .fromTo(
          '[data-intro="title"]',
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          0.12,
        )
        .to(
          '[data-intro="line"]',
          { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.16, ease: 'power3.out' },
          0.3,
        )
        .to('[data-intro="status"]', { autoAlpha: 1, y: 0, duration: 0.35 }, 0.55)
        .fromTo(
          '[data-intro="status-fill"]',
          { scaleX: 0 },
          { scaleX: 0.62, duration: 2.4, ease: 'power1.inOut' },
          0.6,
        )
        .to('[data-intro="waiting"]', { autoAlpha: 1, y: 0, duration: 0.3 }, 1.5)
        .to('[data-intro="status-pct"]', { autoAlpha: 1, y: 0, duration: 0.3 }, 0.6)
        .to('[data-intro="status-fill"]', { scaleX: 0.6, duration: 0.25, yoyo: true, repeat: 5 }, 3.1);

      // ── 2 · KATANA THRUSTS IN FROM THE USER SIDE — huge + blurred (close to
      // the camera), snaps into focus at screen centre, blade raised for the swing
      tl.fromTo(
        '[data-intro="katana"]',
        { scale: 3.4, x: '0vmax', y: '38vmax', autoAlpha: 0, rotation: 140, filter: 'blur(10px)' },
        { scale: 1.35, x: '0vmax', y: '0vmax', autoAlpha: 1, rotation: 118, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' },
        3.9,
      )
        // hover: the blade floats, weightless, before the draw
        .to('[data-intro="katana"]', { y: '1.2vmax', rotation: 122, duration: 0.17, ease: 'sine.inOut' }, 4.45)
        // chamber — hauls back up, coiling the 180° swing
        .to('[data-intro="katana"]', { x: '6vmax', y: '-5vmax', rotation: 140, duration: 0.32, ease: 'power3.in' }, 4.62);

      // ── 3 · THE 180° SWING — the blade alone sweeps rotation 140 → -40
      // travelling top-right → bottom-left; blade + shake + shards only ──
      tl.to(
        '[data-intro="katana"]',
        {
          keyframes: [
            { x: '-10vmax', y: '10vmax', rotation: 80, duration: 0.1, ease: 'power4.in' },
            { x: '-26vmax', y: '26vmax', rotation: 20, duration: 0.12, ease: 'power3.in' },
            { x: '-44vmax', y: '44vmax', rotation: -40, duration: 0.14, ease: 'power2.in' },
          ],
        },
        4.94,
      )
        .fromTo(
          '[data-intro="katana"] .intro-katana-img',
          { scaleX: 1, scaleY: 1 },
          { scaleX: 1.06, scaleY: 0.94, duration: 0.1, ease: 'power2.in' },
          5.0,
        )
        .to('[data-intro="katana"] .intro-katana-img', { scaleX: 1, scaleY: 1, duration: 0.24 }, 5.1)
        .fromTo(
          '[data-intro="shards"] .intro-shard',
          { opacity: 1, x: 0, y: 0, rotation: 0 },
          {
            opacity: 0,
            duration: 0.85,
            ease: 'power2.in',
            stagger: { each: 0.01, from: 'random' },
            x: () => `${gsap.utils.random(-30, 30)}vmax`,
            y: () => `${gsap.utils.random(-8, 55)}vmax`,
            rotation: () => gsap.utils.random(-720, 720),
          },
          5.1,
        )
        // (no spark burst — zero orange streaks by design)
        .fromTo('[data-intro="stage"]', { x: 0, y: 0 }, { x: 9, y: -6, duration: 0.05 }, 5.06)
        .to('[data-intro="stage"]', { x: -6, y: 4, duration: 0.07 }, 5.11)
        .to('[data-intro="stage"]', { x: 0, y: 0, duration: 0.1 }, 5.18)
        // follow-through: the blade keeps travelling off-screen bottom-left
        .to('[data-intro="katana"]', { x: '-70vmax', y: '70vmax', rotation: -52, duration: 0.24 }, 5.3)
        .to('[data-intro="katana"]', { autoAlpha: 0, duration: 0.18 }, 5.48);

      // ── 4 · SCREEN BREAKS APART — the two halves shudder, tilt, then fall
      // away with gravity, tumbling off-screen while fading ─────────────────
      tl.to('[data-intro="panel-a"]', { x: '1vmax', y: '1vmax', rotation: -0.4, duration: 0.08 }, 5.08)
        .to('[data-intro="panel-b"]', { x: '-1vmax', y: '-1vmax', rotation: 0.4, duration: 0.08 }, 5.08)
        // halves leave fully opaque; the root background is hard-cut to
        // transparent at the same instant so the site shows through directly
        .set(rootRef.current, { backgroundColor: 'rgba(6,7,9,0)' }, 5.24)
        .to(
          '[data-intro="panel-a"]',
          { x: '-22vmax', y: '58vmax', rotation: -14, autoAlpha: 0, duration: 0.7, ease: 'power2.in' },
          5.24,
        )
        .to(
          '[data-intro="panel-b"]',
          { x: '24vmax', y: '64vmax', rotation: 12, autoAlpha: 0, duration: 0.75, ease: 'power2.in' },
          5.26,
        )
        // ── 5 · reveal — kill the overlay's dark backdrop the instant the
        // halves part, so the site shows THROUGH the split (never a black
        // beat); then fade the whole root fast and unmount
        .to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 5.5)
        .call(finishOverlay, undefined, 6.1);
      }, rootRef);
    } catch {
      // A thrown tween/setup error must never leave the page scroll-locked.
      finish();
      return () => window.clearTimeout(failSafe);
    }

    return () => {
      window.clearTimeout(failSafe);
      ctx?.revert();
      restore();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="intro-overlay" role="presentation" aria-hidden="true">
      <div className="intro-stage" data-intro="stage">
        <ScreenSplit />
        <KatanaStrike />
      </div>
    </div>
  );
}
