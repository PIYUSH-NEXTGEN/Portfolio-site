import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Katana asset for the navbar — derived from the uploaded asset
 * (attached_assets/katana.png) via scripts/process-katana.mjs, which cuts the
 * border frame and removes the white background. The sprites the site serves
 * are lossless WebP builds of those cutouts (pixel-identical, ~2x smaller than
 * the processed PNGs):
 *
 *   public/katana-ink.webp  — the sword alone (transparent, warm-umber ink),
 *                             416x476, used as the nav katana's fallback sprite
 *   public/katana-hang.webp — pre-verticalized cut of the same sword (tip
 *                             down, handle up, tight-cropped, 138x621) so the
 *                             hanging nav katana needs no CSS rotation
 */
const KATANA_INK_SRC = `${import.meta.env.BASE_URL}katana-ink.webp`;
const KATANA_HANG_SRC = `${import.meta.env.BASE_URL}katana-hang.webp`;

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
          loading="lazy"
          decoding="async"
          onError={() => setSrc(KATANA_INK_SRC)}
        />
      </div>
    </div>
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

