import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Katana + sakura backdrop for the hero — derived from the uploaded asset
 * (public/katana.png) via scripts/process-katana.mjs, which cuts the border
 * frame, removes the white background and splits the artwork into:
 *
 *   public/katana-ink.png  — the sword alone (transparent, warm-umber ink)
 *   public/sakura-<n>.png  — each detached petal / flower as its own sprite
 *
 * Layout guarantee: the backdrop lives INSIDE the right-column wrapper
 * (.katana-hero-photo) in a reserved strip ABOVE the portrait frame — the
 * frame sits below it (margin-top reserves the space), so the sword can never
 * touch or cross the frame's edges by construction. z-index 0 keeps it strictly
 * behind the photo slot (z-index 1). It renders at ~20% opacity with a multiply
 * blend so it reads as a warm watermark on the cream paper, rotated so the
 * asset's natural axis lands at -14deg — tsuka LEFT, kissaki up-RIGHT.
 * Hidden below the lg breakpoint where the single-column layout has no safe
 * empty space around the portrait.
 */
const KATANA_INK_SRC = `${import.meta.env.BASE_URL}katana-ink.png`;

/** Sakura ring — tight orbits around the blade's center point. Original sizes
 *  and opacities, balanced against the ~20% katana watermark. */
const SAKURA = [
  { src: 'sakura-1.png', size: 18, radius: 52, rest: 24,   dur: 30, delay: -6,  dir: 1,  opacity: .6,  wobble: 11, wdelay: -2.1, wrot: 14 },
  { src: 'sakura-2.png', size: 14, radius: 38, rest: 151,  dur: 24, delay: -15, dir: -1, opacity: .52, wobble: 9,  wdelay: -4.6, wrot: -12 },
  { src: 'sakura-3.png', size: 14, radius: 60, rest: 283,  dur: 27, delay: -3,  dir: 1,  opacity: .58, wobble: 12, wdelay: -7.3, wrot: 10 },
  { src: 'sakura-4.png', size: 15, radius: 30, rest: 74,   dur: 21, delay: -9,  dir: -1, opacity: .48, wobble: 8,  wdelay: -1.2, wrot: -16 },
  { src: 'sakura-5.png', size: 15, radius: 48, rest: 337,  dur: 26, delay: -19, dir: 1,  opacity: .55, wobble: 10, wdelay: -5.9, wrot: 12 },
  { src: 'sakura-6.png', size: 13, radius: 34, rest: 102,  dur: 29, delay: -12, dir: -1, opacity: .5,  wobble: 13, wdelay: -8.4, wrot: -10 },
  { src: 'sakura-7.png', size: 14, radius: 56, rest: 205,  dur: 23, delay: -5,  dir: 1,  opacity: .54, wobble: 9,  wdelay: -3.4, wrot: 15 },
  { src: 'sakura-8.png', size: 11, radius: 26, rest: 260,  dur: 18, delay: -22, dir: -1, opacity: .45, wobble: 8,  wdelay: -6.7, wrot: -14 },
];

export function HeroKatana() {
  const reduce = useReducedMotion() === true;
  const { scrollY } = useScroll();
  // Scroll-linked parallax: the backdrop drifts up and fades slightly faster
  // than the page, deepening the layer separation. Transform/opacity only.
  const scrollDrift = useTransform(scrollY, [0, 720], [0, -26]);
  const scrollFade = useTransform(scrollY, [0, 720], [1, 0.3]);

  return (
    <div className="katana-backdrop" aria-hidden="true" data-testid="hero-katana">
      <motion.div
        className="katana-scroll"
        style={reduce ? undefined : { y: scrollDrift, opacity: scrollFade }}
      >
        <motion.div
          className="katana-appear"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          <div className="katana-tilt">
            <img className="katana-ink" src={KATANA_INK_SRC} alt="" draggable={false} />
          </div>
        </motion.div>
      </motion.div>

      {/* Sakura ring: each sprite circles the katana's center point on its
          own ring (orbit + matched counter-rotation keeps it upright; a slow
          wobble on the sprite keeps it alive). CSS transforms only. */}
      <div className="katana-orbits">
        {SAKURA.map(p => (
          <span
            key={p.src}
            className="katana-orbit"
            style={{
              '--orbit-dur': `${p.dur}s`,
              '--orbit-delay': `${p.delay}s`,
              '--orbit-dir': p.dir,
            } as React.CSSProperties}
          >
            <span
              className="katana-orbit-arm"
              style={{
                '--orbit-r': `${p.radius}px`,
                '--orbit-rest': `${p.rest}deg`,
              } as React.CSSProperties}
            >
              <span
                className="katana-orbit-counter"
                style={{
                  '--orbit-dur': `${p.dur}s`,
                  '--orbit-delay': `${p.delay}s`,
                  '--orbit-dir': p.dir,
                } as React.CSSProperties}
              >
                <img
                  className="katana-petal"
                  src={`${import.meta.env.BASE_URL}${p.src}`}
                  alt=""
                  draggable={false}
                  style={{
                    width: p.size,
                    opacity: p.opacity,
                    '--wobble-dur': `${p.wobble}s`,
                    '--wobble-delay': `${p.wdelay}s`,
                    '--wobble-rot': `${p.wrot}deg`,
                  } as React.CSSProperties}
                />
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SlashDivider({ testId = 'slash-divider' }: { testId?: string }) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      className="slash-divider"
      aria-hidden="true"
      data-testid={testId}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 1200 24" preserveAspectRatio="none">
        <line x1="4" y1="12" x2="1120" y2="12" className="slash-line" />
        <path d="M1120,12 L1148,2" className="slash-nick" />
      </svg>
    </motion.div>
  );
}

export function CursorSlash() {
  const layerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  useEffect(() => {
    if (reduce) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia?.('(pointer: fine)').matches) return;
    const layer = layerRef.current;
    if (!layer) return;
    let lastX = -9999;
    let lastY = -9999;
    let lastT = 0;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const spawn = (x: number, y: number) => {
      if (layer.childElementCount > 24) return;
      const slash = document.createElement('span');
      slash.className = 'cursor-slash';
      const length = 20 + Math.random() * 10;
      const tilt = -38 + Math.random() * 12;
      slash.style.left = `${x}px`;
      slash.style.top = `${y}px`;
      slash.style.width = `${length}px`;
      slash.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
      layer.appendChild(slash);
      window.setTimeout(() => slash.remove(), 520);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const now = performance.now();
      const moved = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (moved < 26 && now - lastT < 110) return;
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
      pending = { x: event.clientX, y: event.clientY };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (pending) {
            spawn(pending.x, pending.y);
            pending = null;
          }
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      layer.innerHTML = '';
    };
  }, [reduce]);

  return <div ref={layerRef} className="cursor-slash-layer" aria-hidden="true" />;
}

