import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * A tiny ink cat (the uploaded attached_assets/cat.png, processed into
 * public/cat.png) that lives IN THE BACKGROUND of the page — same layer
 * family as the branch decorations (z-index 0, multiply blend, low
 * opacity).
 *
 * Behaviour, per request:
 * - It SCROLLS WITH the website: absolutely positioned inside the document
 *   (not viewport-fixed), roaming only the band between the sticky navbar
 *   and the footer.
 * - It avoids the hero profile picture entirely (overlapping targets are
 *   re-rolled, padded).
 * - It never faces the viewer flat-on: a per-pose rotateY lean keeps it
 *   side-on, and direction changes play a proper SPRITE FLIP — squash-flip
 *   over with a little hop instead of snapping to the opposite side.
 * - Walking reads as LEG movement: the sprite is two clipped copies of the
 *   same art — the top 78% stays rigid while the bottom "legs" strip skews
 *   left/right in a stepping cycle.
 */

type Pose = 'walk' | 'sit' | 'groom' | 'play' | 'sniff';
type Dir = 1 | -1;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const CAT_SRC = `${import.meta.env.BASE_URL}cat.png`;

interface Bounds { minX: number; maxX: number; minY: number; maxY: number }
interface PhotoRect { left: number; right: number; top: number; bottom: number }

/** Document-space roaming band: between the navbar and the footer. */
function getBounds(): Bounds {
  const doc = document.documentElement;
  const scrollY = window.scrollY;
  const header = doc.querySelector('header');
  const footer = doc.querySelector('footer');
  const headerH = header ? header.getBoundingClientRect().height : 68;
  const footerTop = footer ? footer.getBoundingClientRect().top + scrollY : doc.scrollHeight;
  return {
    minX: 10,
    maxX: Math.max(90, window.innerWidth - 96),
    minY: headerH + 30,
    maxY: Math.max(headerH + 90, footerTop - 74),
  };
}

/** The hero profile picture (padded), in document coordinates. */
function getPhotoRect(): PhotoRect | null {
  const el = document.querySelector('.hero-photo-slot');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 42;
  return {
    left: r.left - pad,
    right: r.right + pad,
    top: r.top + window.scrollY - pad,
    bottom: r.bottom + window.scrollY + pad,
  };
}
export function WanderingCat() {
  const reduce = useReducedMotion() === true;
  const [pose, setPose] = useState<Pose>('sit');
  const [pos, setPos] = useState({ x: 70, y: 320, dur: 0 });
  const [face, setFace] = useState<Dir>(1);
  const [flip, setFlip] = useState<Dir | null>(null); // direction the flip is heading
  const posRef = useRef({ x: 70, y: 320, dur: 0 });
  const faceRef = useRef<Dir>(1);
  const flipTimer = useRef(0);

  useEffect(() => {
    if (reduce) {
      setPose('sit');
      return;
    }
    let cancelled = false;
    let timer = 0;
    const speed = 74; // px per second while walking

    /** Sprite-flip to the new heading (skipped if one is already playing). */
    const doFlip = (dir: Dir) => {
      if (faceRef.current === dir) return;
      faceRef.current = dir;
      setFace(dir); // static value updated now; the flip animation overrides it visually
      setFlip(dir);
      window.clearTimeout(flipTimer.current);
      flipTimer.current = window.setTimeout(() => setFlip(null), 430);
    };

    /** A random target near the cat, inside the band, never on the photo. */
    const pickTarget = () => {
      const b = getBounds();
      const photo = getPhotoRect();
      const from = posRef.current;
      for (let i = 0; i < 14; i++) {
        const x = Math.min(b.maxX, Math.max(b.minX, from.x + rand(-520, 520)));
        const y = Math.min(b.maxY, Math.max(b.minY, from.y + rand(-470, 470)));
        const onPhoto = photo && x > photo.left && x < photo.right && y > photo.top && y < photo.bottom;
        if (!onPhoto) return { x, y };
      }
      // fallback: hop to the far side of the photo horizontally
      const photoMid = photo ? (photo.left + photo.right) / 2 : 0;
      const away = photo && from.x < photoMid ? photo.right + 60 : (photo ? photo.left - 60 : b.minX);
      return {
        x: Math.min(b.maxX, Math.max(b.minX, away)),
        y: Math.min(b.maxY, Math.max(b.minY, from.y + rand(-200, 200))),
      };
    };

    const step = () => {
      if (cancelled) return;
      const roll = Math.random();
      if (roll < 0.42) {
        // WANDER — walk to a random spot in the navbar→footer band
        setPose('walk');
        const target = pickTarget();
        const from = posRef.current;
        const dist = Math.hypot(target.x - from.x, target.y - from.y);
        const dur = Math.max(0.9, Math.min(5.5, dist / speed));
        doFlip(target.x >= from.x ? 1 : -1);
        posRef.current = { x: target.x, y: target.y, dur };
        setPos({ x: target.x, y: target.y, dur });
        timer = window.setTimeout(step, dur * 1000 + rand(150, 900));
      } else if (roll < 0.63) {
        setPose('sit');
        timer = window.setTimeout(step, rand(2600, 5400));
      } else if (roll < 0.77) {
        setPose('groom'); // licking its legs / fur
        timer = window.setTimeout(step, rand(2400, 4200));
      } else if (roll < 0.89) {
        setPose('play'); // pounce hops
        timer = window.setTimeout(step, rand(1600, 3000));
      } else {
        setPose('sniff');
        timer = window.setTimeout(step, rand(1400, 2600));
      }
    };

    timer = window.setTimeout(step, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(flipTimer.current);
    };
  }, [reduce]);

  const flipClass = flip === null ? '' : flip === 1 ? ' flip-r' : ' flip-l';
  return (
    <div className="wandering-cat" aria-hidden="true" data-testid="wandering-cat">
      <div
        className={`cat-sprite pose-${pose} face-${face === 1 ? 'r' : 'l'}${flipClass}`}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: pose === 'walk' && pos.dur > 0 ? `transform ${pos.dur}s linear` : 'transform .45s ease',
        }}
      >
        <span className="cat-half cat-top"><img className="cat-img" src={CAT_SRC} alt="" draggable={false} /></span>
        <span className="cat-half cat-legs"><img className="cat-img" src={CAT_SRC} alt="" draggable={false} /></span>
      </div>
    </div>
  );
}
