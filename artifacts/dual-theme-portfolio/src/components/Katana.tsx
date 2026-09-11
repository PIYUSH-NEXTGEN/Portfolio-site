import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Katana asset for the navbar — derived from the uploaded asset
 * (public/katana.png) via scripts/process-katana.mjs, which cuts the border
 * frame and removes the white background.
 *
 *   public/katana-ink.png  — the sword alone (transparent, warm-umber ink),
 *                            used as the nav katana's fallback sprite
 *   public/katana-hang.png — pre-verticalized cut of the same sword (tip
 *                            down, handle up, tight-cropped) so the hanging
 *                            nav katana needs no CSS rotation
 */
const KATANA_INK_SRC = `${import.meta.env.BASE_URL}katana-ink.png`;
const KATANA_HANG_SRC = `${import.meta.env.BASE_URL}katana-hang.png`;

export function NavKatana() {
  const [src, setSrc] = useState(KATANA_HANG_SRC);
  const fallback = src !== KATANA_HANG_SRC;
  return (
    <div className="nav-katana" aria-hidden="true" data-testid="nav-katana">
      <div className="nav-katana-swing">
        <span className="nav-katana-rope" />
        <img
          className={`nav-katana-blade${fallback ? ' nav-katana-blade-fallback' : ''}`}
          src={src}
          alt=""
          draggable={false}
          onError={() => setSrc(KATANA_INK_SRC)}
        />
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

