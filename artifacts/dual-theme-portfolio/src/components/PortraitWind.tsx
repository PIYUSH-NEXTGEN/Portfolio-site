/**
 * "Wind in the hair" portrait — the pixel-art samurai with living hair.
 *
 * public/image.png was sliced by scripts/slice-portrait.mjs into a static
 * base (portrait-base.png, flowing strands erased) plus four transparent
 * strand sprites (hair-strand-<n>.png). Each strand sprite is exported as
 * THREE frames — rest, f1 (gentle lift) and f2 (full sway) — where every pixel
 * moves by WHOLE pixels only (per-column vertical shift for the flowing
 * strands, per-row horizontal shift for the topknot). No resampling, no
 * interpolation, no sub-pixel positions: the pixel grid is never broken.
 *
 * Motion is TRUE frame-stepped animation: the 3 frames swap with instant
 * (stepped) opacity changes — NEVER tweened — at ~200ms per frame. The cycle
 * rest → f1 → f2 → f1 → rest reads as a gentle breeze. Per-strand duration/
 * delay variance desynchronises the layers. Opacity-only (GPU-friendly),
 * paused off-screen, single static frame under prefers-reduced-motion, and
 * image-rendering: pixelated to preserve the pixel-art grid.
 */
import { useEffect, useRef } from 'react';

const BASE = `${import.meta.env.BASE_URL}portrait-base.png`;

/** Geometry is % of the 568x570 canvas (printed by the slicing script).
 *  dur/delay stagger the breeze cascade; each layer cycles rest→f1→f2→f1→rest. */
const STRANDS = [
  { src: 'hair-strand-1', left: 51.06, top: 3.86, width: 16.37, dur: 3.6, delay: -0.2 },
  { src: 'hair-strand-2', left: 61.09, top: 13.33, width: 24.12, dur: 4.4, delay: -1.4 },
  { src: 'hair-strand-3', left: 57.04, top: 25.26, width: 28.17, dur: 5.0, delay: -2.6 },
  { src: 'hair-strand-4', left: 69.19, top: 37.89, width: 19.37, dur: 4.0, delay: -1.0 },
];

export function AnimatedPortrait() {
  const ref = useRef<HTMLSpanElement>(null);

  // Pause the breeze while the portrait is off-screen (scrolled away).
  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => node.setAttribute('data-paused', entry.isIntersecting ? 'false' : 'true'),
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="portrait-wind" data-paused="false">
      <span className="portrait-canvas">
        <img className="portrait-base" src={BASE} alt="Profile photo" draggable={false} />
        {STRANDS.map(s => (
          <span
            key={s.src}
            className="portrait-strand"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.width}%`,
            }}
          >
            {(['rest', 'f1', 'f2'] as const).map(frame => (
              <img
                key={frame}
                className={`portrait-strand-frame frame-${frame}`}
                src={`${import.meta.env.BASE_URL}${s.src}${frame === 'rest' ? '' : '-' + frame}.png`}
                alt=""
                draggable={false}
                style={{
                  '--hair-dur': `${s.dur}s`,
                  '--hair-delay': `${s.delay}s`,
                  animationDuration: `var(--hair-dur, 4s)`,
                  animationDelay: `var(--hair-delay, 0s)`,
                } as React.CSSProperties}
              />
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
