import { useEffect, useRef, useState } from 'react';
import { createTimeline, cubicBezier, stagger, utils, type AnimationParams } from 'animejs';
import { KatanaStrike } from './KatanaStrike';
import { ScreenSplit } from './ScreenSplit';
import './intro.css';

/**
 * Cinematic page-load intro (~5.4s) — orchestrated by ONE anime.js timeline.
 *
 * Story, from the visitor's POV: the site looks like it is still loading
 * (terminal boot STALLS mid-load — the progress bar sticks at 62%, the spinner
 * keeps running, it never says "READY") — then a katana, held STRAIGHT VERTICAL, chops STRAIGHT DOWN
 * through the middle of the screen —
 * the screen splits into LEFT and RIGHT halves that fall away, and
 * the portfolio underneath stands alone. The overlay unmounts and never
 * reappears.
 *
 * The portfolio renders underneath from the start; this overlay is purely
 * visual and unmounts when the timeline finishes. Everything below hangs off
 * one absolute-time clock (the beat map) so the cut always lands exactly 1.7s
 * after the blade enters frame — no nested delays to keep in sync by hand.
 */

/** Master switch — set to false to boot straight into the site (useful in dev). */
const ENABLE_INTRO = true;

function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (!ENABLE_INTRO) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

/* ── Beat map (ms, from overlay mount) ───────────────────────────────────── */
const T = {
  boot: 100, // 1 · terminal chrome fades down to 40%
  title: 140, //     title types in (with its blinking cursor)
  lines: 280, //     boot rows stagger in
  status: 600, //     LOADING row + percentage counter appear
  progress: 660, //   progress bar climbs to 62% … then holds forever
  waiting: 1650, //   "please wait — fetching remaining modules" + spinner
  stall: 2500, //     the bar starts breathing instead of finishing
  thrust: 3060, // 2 · blade descends from the top, held straight vertical
  hover: 3680, //     weightless float before the chop
  chamber: 3860, //   lifts a touch higher — one clean overhead wind-up
  swing: 4190, // 3 · THE CUT: ONE straight vertical chop, top → bottom through the middle
  cut: 4300, // 4 · the moment the edge crosses the middle (blade mid-chop)
  follow: 4410, //    follow-through: blade already past, exits bottom fast
  fade: 4920, // 5 · overlay lets go of the screen
  end: 5400, //       unmount (whole intro = 5.4s)
} as const;

/** Durations the beats above are built from. */
const PROGRESS_MS = 1300; // bar/counter climb to the stuck 62%
const BREATH_MS = 220; // one "still loading" pulse of the stuck bar
const HOVER_MS = 180; // weightless float before the swing
const SWING_MS = 220; // ONE snappy vertical chop — fast, no lingering
const PANEL_JITTER_MS = 70; // one-frame shudder before the halves fall
const PANEL_FALL_MS = 740;
const GHOST_LAG_MS = 17; // per motion-blur trail step
const SHARD_SEED = 20260915; // seeded randomness → identical burst every load

/** Chamber coils up to the first frame of the chop. */
const CHAMBER_MS = T.swing - T.chamber;
/** Dead hold between "62%" and the first breath — the load that never lands. */
const HOLD_MS = T.stall - (T.progress + PROGRESS_MS);

/** Per-step motion blur: each trail ghost is dimmer and softer than the last. */
const GHOST_STEPS = [
  { opacity: 0.5, blur: 2.4, spread: 4.4 },
  { opacity: 0.34, blur: 4.6, spread: 6.4 },
  { opacity: 0.2, blur: 7.4, spread: 8.8 },
] as const;

/** Luminous silver for the ghosts (the blade SVG paints its own steel). */
const ghostFilter = (blur: number, brightness: number) =>
  `blur(${blur}px) brightness(${brightness})`;

type IntroTimeline = ReturnType<typeof createTimeline>;

type IntroDom = {
  root: HTMLDivElement;
  panelA: HTMLElement;
  panelB: HTMLElement;
  seal: HTMLElement[];
  stage: HTMLElement;
  katana: HTMLElement[];
  blade: HTMLElement[];
  ghosts: HTMLElement[];
  shards: HTMLElement[];
  /** Both copies of the percentage readout (one per split panel). */
  percent: HTMLElement[];
};

/** Scoped lookup — every `data-intro` hook lives inside this overlay. */
const query = (selector: string, scope: ParentNode) =>
  Array.from(scope.querySelectorAll<HTMLElement>(selector));

const required = <E extends Element>(element: E | null, selector: string): E => {
  if (!element) throw new Error(`intro: missing ${selector}`);
  return element;
};

/**
 * Resolves every hook the timeline animates. Throws on a missing one, which
 * the caller turns into "skip the intro" rather than a broken loading screen.
 */
function readIntroDom(root: HTMLDivElement): IntroDom {
  const panelA = required(root.querySelector<HTMLElement>('[data-intro="panel-a"]'), 'panel-a');
  const panelB = required(root.querySelector<HTMLElement>('[data-intro="panel-b"]'), 'panel-b');
  const katana = query('[data-intro="katana"]', root);
  return {
    root,
    panelA,
    panelB,
    seal: query('[data-intro="seal"]', root),
    stage: required(root.querySelector<HTMLElement>('[data-intro="stage"]'), 'stage'),
    katana,
    blade: query('.intro-katana-blade', root),
    ghosts: query('.intro-katana-ghost', root),
    shards: query('[data-intro="shard"]', root),
    percent: [...query('[data-intro="status-pct"]', panelA), ...query('[data-intro="status-pct"]', panelB)],
  };
}

/**
 * Builds the whole intro on ONE timeline and returns it already playing.
 *
 * Positions are absolute ms (the beat map above), because every beat is timed
 * against the cut: the thrust, the swing and the break all have to land on
 * exact frames. Chained tweens on the same property (thrust → hover → chamber
 * → swing) inherit their `from` value from the previous tween in this
 * timeline, so the blade travels one continuous path with no pops.
 */
function buildIntroTimeline(dom: IntroDom, onDone: () => void): IntroTimeline {
  const { root, panelA, panelB, seal, stage, katana, blade, ghosts, shards, percent } = dom;

  // The overlay always fills the viewport, so vmax → px happens once, up front:
  // every tween below then runs in plain pixels (no unit maths while animating).
  const vmax = Math.max(window.innerWidth, window.innerHeight);
  const v = (n: number) => (n / 100) * vmax;

  // Seeded so the shard burst is identical on every load (no clumping, no
  // unlucky layouts) while still reading as chaos.
  const rnd = utils.createSeededRandom(SHARD_SEED);

  const tl = createTimeline({ defaults: { ease: 'outQuad' }, onComplete: onDone });

  /** Adds the SAME animation to both clipped halves of the terminal, so the two
   *  copies stay frame-locked and read as ONE screen until the cut. */
  const addBoth = (selector: string, params: AnimationParams, position: number) => {
    tl.add(query(selector, panelA), params, position);
    tl.add(query(selector, panelB), params, position);
  };

  // ── 1 · TERMINAL BOOT — deliberately STALLS MID-LOAD ────────────────────
  // The bar climbs to 62%, then only breathes: it never reaches 100%, which is
  // what makes the katana arriving feel like the real end of the wait.
  addBoth('[data-intro="fade"]', { opacity: 0.42, duration: 600 }, T.boot);
  addBoth(
    '[data-intro="title"]',
    { opacity: { from: 0, to: 1 }, y: { from: 6, to: 0 }, duration: 420, ease: 'outCubic' },
    T.title,
  );
  addBoth(
    '[data-intro="line"]',
    { opacity: { from: 0, to: 1 }, y: { from: 8, to: 0 }, duration: 300, delay: stagger(120), ease: 'outCubic' },
    T.lines,
  );
  addBoth('[data-intro="status"]', { opacity: { from: 0, to: 1 }, y: { from: 8, to: 0 }, duration: 300 }, T.status);
  addBoth('[data-intro="status-pct"]', { opacity: { from: 0, to: 1 }, y: { from: 8, to: 0 }, duration: 300 }, T.status);
  addBoth('[data-intro="waiting"]', { opacity: { from: 0, to: 1 }, y: { from: 8, to: 0 }, duration: 300 }, T.waiting);
  addBoth(
    '[data-intro="status-fill"]',
    {
      // 660 → 1960 climb · hold · then four shallow breaths that end at 3380,
      // i.e. the bar is still "alive" while the blade is already in frame.
      scaleX: [
        { from: 0, to: 0.62, duration: PROGRESS_MS, ease: 'inOutQuad' },
        { to: 0.62, duration: HOLD_MS, ease: 'linear' },
        { to: 0.582, duration: BREATH_MS, ease: 'inOutSine' },
        { to: 0.62, duration: BREATH_MS, ease: 'inOutSine' },
        { to: 0.582, duration: BREATH_MS, ease: 'inOutSine' },
        { to: 0.62, duration: BREATH_MS, ease: 'inOutSine' },
      ],
    },
    T.progress,
  );

  // The percentage readout is a plain JS object animated by anime.js and painted
  // from onUpdate — both panel copies stay identical without a React re-render.
  const counter = { value: 0 };
  tl.add(
    counter,
    {
      value: 62,
      duration: PROGRESS_MS,
      ease: 'inOutQuad',
      onUpdate: () => {
        const text = `${Math.round(counter.value)}%`;
        for (const el of percent) el.textContent = text;
      },
    },
    T.progress,
  );

  // ── 2 · KATANA DESCENDS FROM ABOVE, HELD STRAIGHT VERTICAL ───────────────
  // Slides in from the top edge, snapping into focus just above screen centre,
  // blade held STRAIGHT VERTICAL — tip DOWN, like a katana held in hand.
  // No diagonal, no horizontal. The custom bezier is an
  // iOS-style arrival: fast, then a soft settle, not a dead stop.
  // (Artwork rest pose is handle DOWN-LEFT / tip UP-RIGHT on a -45° group, so
  // wrapper rotate 135° → total 90° clockwise → blade VERTICAL, tip DOWN.)
  tl.add(
    katana,
    {
      scale: { from: 2.2, to: 1.35 },
      y: { from: -v(55), to: -v(8) },
      rotate: { from: 90, to: 135 },
      opacity: { from: 0, to: 1 },
      filter: { from: 'blur(14px)', to: 'blur(0px)' },
      duration: 620,
      ease: cubicBezier(0.16, 0.9, 0.22, 1),
    },
    T.thrust,
  );
  // weightless hover before the chop — blade stays perfectly vertical
  tl.add(katana, { y: -v(8), rotate: 135, duration: HOVER_MS, ease: 'inOutSine' }, T.hover);
  // chamber — lifts a touch higher: one clean overhead wind-up, still straight.
  tl.add(katana, { y: -v(14), rotate: 136, duration: CHAMBER_MS, ease: 'outQuad' }, T.chamber);

  // ── 3 · ONE STRAIGHT VERTICAL CHOP, top → bottom ──────────────────────────────
  // A SINGLE keyframe: the blade starts raised overhead and drives STRAIGHT
  // DOWN through the centre in one snappy 220ms cut (inQuad = accelerating).
  // x never moves and rotate barely changes (3° of wrist follow-through) —
  // the blade stays dead vertical the whole way, exactly like a real held
  // straight cut. It enters above the screen and exits past the BOTTOM edge
  // inside this same tween — no lingering mid-screen phase.
  tl.add(
    katana,
    {
      keyframes: [{ y: v(58), rotate: 139, duration: SWING_MS, ease: 'inQuad' }],
    },
    T.swing,
  );

  // Motion-blur ghosts are deliberately NOT animated: blurred copies of the
  // silver blade read as bright white streak-lines smeared across the
  // terminal while it cracks. The single blade + screen shake does all the
  // work, so the cut stays clean. (Ghosts stay parked at CSS opacity 0.)

  // ── 4 · IMPACT FRAME — blade crosses the middle ─────────────────────────
  // One soft brightness pop timed to the crossing (blade is mid-swing, never
  // parked on the glass): kinetic feedback with no squash, no lingering.
  tl.add(
    katana,
    {
      filter: [
        { from: 'blur(0px) brightness(1)', to: 'blur(0px) brightness(1.5)', duration: 60, ease: 'outQuad' },
        { to: 'blur(0px) brightness(1)', duration: 200, ease: 'inQuad' },
      ],
    },
    T.cut,
  );

  // ── 5 · THE BREAK — shatter, gravity ───────────────────────────────────
  // NOTE: no seam / crack / slash-flash tween by design — NO white line may
  // ever paint on the loading terminal, during the cut or otherwise. The
  // split halves ARE the visual: they part and the portfolio shows through.
  // `blade` is kept in IntroDom only so readIntroDom stays stable; it is
  // intentionally left un-animated (no squash — the blade never parks on
  // the glass, it chops straight through).
  void blade;
  // Ghost trail markup is kept for the DOM contract but intentionally never
  // animated (see the note above the chop) — parked at CSS opacity 0.
  void ghosts;

  // The seal dies ON the cut frame (fast, 120ms): before the cut it hides the
  // 1px anti-aliased clip hairline; the moment the halves part it is gone, so
  // the portfolio shows through the widening middle immediately — never black.
  // Seal goes FIRST so no frame ever shows the site through a closed screen,
  // then the halves/shards animate on top of the live site.
  tl.add(seal, { opacity: [{ from: 1, to: 0, duration: 120, ease: 'outQuad' }] }, T.cut);

  tl.add(
    stage,
    {
      ease: 'linear',
      x: [
        { to: -v(0.95), duration: 40 },
        { to: v(0.62), duration: 45 },
        { to: -v(0.42), duration: 50 },
        { to: v(0.24), duration: 55 },
        { to: 0, duration: 110, ease: 'outQuad' },
      ],
      y: [
        { to: v(0.72), duration: 40 },
        { to: -v(0.5), duration: 45 },
        { to: v(0.32), duration: 50 },
        { to: -v(0.18), duration: 55 },
        { to: 0, duration: 110, ease: 'outQuad' },
      ],
    },
    T.cut,
  );

  // Shards: burst SIDEWAYS out of the middle crack (left shards fly left,
  // right shards fly right), then gravity takes over. The burst order is
  // shuffled from a seeded RNG, so it reads as shattered glass rather
  // than a wave — and the same burst happens on every load.
  const burstOrder = utils.shuffle(
    shards.map((_, i) => i),
    rnd,
  );
  shards.forEach((shard, i) => {
    const side = i % 2 === 0 ? -1 : 1; // alternate left / right of the crack
    const dx = side * v(6 + rnd(0, 18));
    const dy = v(6 + rnd(0, 26));
    tl.add(
      shard,
      {
        x: [
          { from: 0, to: dx * 0.5, duration: 180, ease: 'outQuad' },
          { to: dx * 1.55, duration: 640, ease: 'inQuad' },
        ],
        y: [
          { from: 0, to: dy * 0.35, duration: 180, ease: 'outQuad' },
          { to: dy * 1.7, duration: 640, ease: 'inQuad' },
        ],
        rotate: [{ from: 0, to: rnd(-460, 460), duration: 820, ease: 'linear' }],
        opacity: [{ from: 1, to: 0, duration: 820, ease: 'inQuad' }],
      },
      T.cut + burstOrder[i] * 9,
    );
  });

  // The two halves shudder for a single frame, then split APART sideways from
  // the middle (LEFT half → left, RIGHT half → right) and fall tail-first.
  // They STAY fully opaque while falling (no opacity fade): the portfolio
  // shows THROUGH the widening middle split — never a black beat between the
  // break and the site. Only the final whole-overlay fade at T.fade clears
  // the falling halves once the site is already visible through the gap.
  tl.add(
    panelA,
    {
      x: [
        { from: 0, to: v(0.9), duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: -v(46), duration: PANEL_FALL_MS, ease: 'inQuart' },
      ],
      y: [
        { from: 0, to: v(0.4), duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: v(58), duration: PANEL_FALL_MS, ease: 'inQuart' },
      ],
      rotate: [
        { from: 0, to: 0.38, duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: -10, duration: PANEL_FALL_MS, ease: 'inQuart' },
      ],
    },
    T.cut,
  );
  tl.add(
    panelB,
    {
      x: [
        { from: 0, to: -v(0.9), duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: v(46), duration: PANEL_FALL_MS + 40, ease: 'inQuart' },
      ],
      y: [
        { from: 0, to: v(0.4), duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: v(64), duration: PANEL_FALL_MS + 40, ease: 'inQuart' },
      ],
      rotate: [
        { from: 0, to: -0.38, duration: PANEL_JITTER_MS, ease: 'outQuad' },
        { to: 10, duration: PANEL_FALL_MS + 40, ease: 'inQuart' },
      ],
    },
    T.cut,
  );

  // The swing tween above already carries the blade past the bottom edge, so
  // by T.follow it is gone — just fade the wrapper out in place (no second
  // drive, which used to read as "drilling").
  tl.add(katana, { opacity: 0, duration: 160, ease: 'inQuad' }, T.follow);

  // ── 6 · REVEAL — the overlay lets go of the screen and unmounts ─────────
  tl.add(root, { opacity: [{ from: 1, to: 0, duration: 440, ease: 'inQuad' }] }, T.fade);
  tl.call(onDone, T.end);

  return tl;
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

    // The page MUST never stay scroll-locked: restore no matter how this effect
    // ends (timeline completed, component unmounted, a tween threw, or the tab
    // was throttled and the timeline stalled).
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
      rootRef.current?.style.setProperty('pointer-events', 'none');
      restore();
      setActive(false); // unmounts the overlay; the effect cleanup reverts the timeline
    };

    // Safety net: force-unlock even if the anime.js timeline never completes.
    const failSafe = window.setTimeout(finish, 7000);

    let tl: IntroTimeline | null = null;
    const root = rootRef.current;
    try {
      // A missing hook or an invalid tween must never leave the page scroll-locked.
      tl = root ? buildIntroTimeline(readIntroDom(root), finish) : null;
    } catch {
      finish();
    }

    return () => {
      window.clearTimeout(failSafe);
      tl?.revert();
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
