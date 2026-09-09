import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Minimal, premium katana accent for the ink-and-paper portfolio.
 * Inline SVG (stays sharp, no raster assets) drawn in currentColor so it
 * inherits the editorial ink token. Blade / collar / guard / handle are
 * separate groups so they can be animated individually.
 */
const BLADE_PATH =
  'M168,86 C320,66 470,44 622,14 C630,22 630,32 620,42 C470,74 320,98 172,112 Z';

function KatanaBlade() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `katana-blade-${uid}`;
  const sheenId = `katana-sheen-${uid}`;
  return (
    <svg viewBox="20 0 640 170" role="img" aria-label="Minimal katana illustration" className="katana-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id={clipId}>
          <path d={BLADE_PATH} />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Blade: long diagonal silhouette traced from the uploaded katana */}
      <path d={BLADE_PATH} fill="currentColor" />
      <path d="M176,108 C330,92 470,70 614,40" className="katana-edge" />
      <path d="M184,93 C330,75 460,57 598,31" className="katana-fuller" />
      {/* Habaki collar */}
      <rect x="150" y="82" width="18" height="30" fill="currentColor" />
      <rect x="150" y="82" width="3" height="30" className="katana-collar-line" />
      {/* Tsuba guard + tsuka handle + kashira cap (uploaded silhouette language) */}
      <ellipse cx="138" cy="97" rx="9" ry="24" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M50,86 L126,84 L128,110 L52,112 Z" fill="currentColor" />
      <path d="M66,98 l8,-9 8,9 -8,9 Z M90,98 l8,-9 8,9 -8,9 Z M114,97 l8,-9 8,9 -8,9 Z" className="katana-ito" />
      <rect x="40" y="84" width="10" height="30" rx="2" fill="currentColor" />
      {/* One-time highlight swept along the blade */}
      <g clipPath={`url(#${clipId})`}>
        <g transform="skewX(-16)">
          <rect x="-180" y="-40" width="54" height="270" fill={`url(#${sheenId})`} className="katana-sheen" />
        </g>
      </g>
    </svg>
  );
}

export function HeroKatana() {
  const reduce = useReducedMotion() === true;
  const { scrollY } = useScroll();
  const scrollDrift = useTransform(scrollY, [0, 720], [0, 64]);
  const scrollTilt = useTransform(scrollY, [0, 720], [0, 5]);
  const scrollFade = useTransform(scrollY, [0, 720], [1, 0.2]);
  const [sheenPlayed, setSheenPlayed] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => setSheenPlayed(true), 1050);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  return (
    <div className="katana-frame" aria-hidden="true" data-testid="hero-katana">
      <motion.div
        className="katana-scroll"
        style={reduce ? undefined : { y: scrollDrift, rotate: scrollTilt, opacity: scrollFade }}
      >
        <motion.div
          className={`katana-entrance${sheenPlayed ? ' sheen-play' : ''}`}
          initial={reduce ? { opacity: 1 } : { x: 72, y: -34, rotate: -19, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: -14, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="katana-idle">
            <KatanaBlade />
          </div>
        </motion.div>
      </motion.div>
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
