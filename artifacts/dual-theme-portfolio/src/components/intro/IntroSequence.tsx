import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { KatanaStrike } from './KatanaStrike';
import { ScreenSplit } from './ScreenSplit';
import './intro.css';

/**
 * Cinematic page-load intro.
 *
 * Flow: terminal boot → katana enters (the actual uploaded katana asset) →
 * katana strikes → the terminal screen is cut along the blade path → the two
 * screen panels physically separate → the real portfolio underneath is revealed.
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
    const failSafe = window.setTimeout(finish, 9000);

    let ctx: ReturnType<typeof gsap.context> | null = null;
    try {
      ctx = gsap.context(() => {
        const unlock = () => {
          if (rootRef.current) rootRef.current.style.pointerEvents = 'none';
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
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15, ease: 'power3.out' },
          0.3,
        )
        .to('[data-intro="status"]', { autoAlpha: 1, y: 0, duration: 0.35 }, 0.55)
        .fromTo(
          '[data-intro="status-fill"]',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power1.inOut' },
          0.6,
        )
        .to('[data-intro="ready-1"]', { autoAlpha: 1, y: 0, duration: 0.3 }, 1.38)
        .to('[data-intro="ready-2"]', { autoAlpha: 1, y: 0, duration: 0.3 }, 1.5);

      // ── 2 · KATANA ENTERS along its own axis (heavy, precise) ────────
      tl.fromTo(
        '[data-intro="katana"]',
        { x: '36vmax', y: '-32vmax', autoAlpha: 0, rotation: -2 },
        { x: '0vmax', y: '0vmax', autoAlpha: 1, rotation: 0, duration: 0.44, ease: 'power3.out' },
        1.5,
      )
        // draw back before the strike — the chamber
        .to('[data-intro="katana"]', { x: '3vmax', y: '-2.6vmax', duration: 0.15, ease: 'power2.inOut' }, 1.98)
        // metallic light sweeps along the blade during the chamber
        .fromTo(
          '[data-intro="katana"] .intro-katana-sheen',
          { autoAlpha: 0, '--sheen-x': '140%' },
          { autoAlpha: 0.85, '--sheen-x': '-40%', duration: 0.5, ease: 'power1.inOut' },
          1.96,
        )
        .to('[data-intro="katana"] .intro-katana-sheen', { autoAlpha: 0, duration: 0.18 }, 2.5);

      // ── 3 · THE STRIKE ───────────────────────────────────────────────
      tl.to(
        '[data-intro="katana"]',
        { x: '-62vmax', y: '56vmax', rotation: 5, duration: 0.28, ease: 'power4.in' },
        2.16,
      )
        // the cut reveals corner-to-corner with the blade, top-right → bottom-left
        .to('[data-intro="cut-core"]', { strokeDashoffset: 0, duration: 0.24, ease: 'power2.in' }, 2.18)
        .fromTo('[data-intro="cut-halo"]', { opacity: 0 }, { opacity: 0.5, duration: 0.07 }, 2.2)
        .to('[data-intro="cut-halo"]', { opacity: 0, duration: 0.3 }, 2.3)
        // restrained white flash as the glass parts
        .fromTo('[data-intro="flash"]', { opacity: 0 }, { opacity: 0.15, duration: 0.05 }, 2.2)
        .to('[data-intro="flash"]', { opacity: 0, duration: 0.22 }, 2.26)
        // tiny camera shake, then stillness
        .fromTo('[data-intro="stage"]', { x: 0, y: 0 }, { x: 5, y: -3, duration: 0.05, ease: 'power1.in' }, 2.18)
        .to('[data-intro="stage"]', { x: -4, y: 3, duration: 0.06 }, 2.23)
        .to('[data-intro="stage"]', { x: 0, y: 0, duration: 0.09 }, 2.29)
        .to('[data-intro="katana"]', { autoAlpha: 0, duration: 0.2 }, 2.55);

      // ── 4 · SCREEN SPLITS ─ panels part along the cut's perpendicular
      tl.to(
        '[data-intro="panel-a"]',
        { x: '-30vmax', y: '-30vmax', rotation: -1.4, duration: 0.6, ease: 'power3.inOut' },
        2.48,
      )
        .to(
          '[data-intro="panel-b"]',
          { x: '30vmax', y: '30vmax', rotation: 1.4, duration: 0.6, ease: 'power3.inOut' },
          2.48,
        )
        // ── 5 · shards dissolve — the portfolio stands alone
        .to('[data-intro="panel-a"]', { autoAlpha: 0, duration: 0.32, ease: 'power1.out' }, 2.95)
        .to('[data-intro="panel-b"]', { autoAlpha: 0, duration: 0.32, ease: 'power1.out' }, 2.95)
        .to('[data-intro="cut-core"]', { autoAlpha: 0, duration: 0.25 }, 2.95)
        .call(unlock, undefined, 3.1);
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
