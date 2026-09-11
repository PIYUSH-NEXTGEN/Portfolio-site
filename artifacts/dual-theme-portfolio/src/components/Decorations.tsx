import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Subtle Japanese-inspired environmental decoration.
 * Thin hand-drawn branches frame page edges; a single bamboo cluster sits
 * in the bottom-right. Inline SVG in currentColor, pointer-events none,
 * always behind content. Motion is transform/opacity only.
 */

function BranchSpray({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={`deco-branch${flip ? ' flip' : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8,212 C60,170 96,150 150,128 C200,108 244,84 306,44" />
        <path d="M70,176 C92,160 104,148 118,128" />
        <path d="M128,140 C150,128 160,116 170,98" />
        <path d="M196,108 C216,96 228,86 238,70" />
        <path d="M52,190 C66,184 76,178 84,168" />
        <path d="M156,126 C168,122 176,116 182,108" />
      </g>
      <g fill="currentColor" opacity="0.85">
        <ellipse cx="118" cy="124" rx="7" ry="4.4" transform="rotate(-24 118 124)" />
        <ellipse cx="124" cy="130" rx="6" ry="3.8" transform="rotate(18 124 130)" />
        <ellipse cx="172" cy="94" rx="7" ry="4.4" transform="rotate(-20 172 94)" />
        <ellipse cx="178" cy="100" rx="6" ry="3.8" transform="rotate(22 178 100)" />
        <ellipse cx="240" cy="66" rx="7" ry="4.4" transform="rotate(-24 240 66)" />
        <ellipse cx="246" cy="72" rx="6" ry="3.8" transform="rotate(18 246 72)" />
        <ellipse cx="84" cy="164" rx="6.4" ry="4" transform="rotate(-22 84 164)" />
        <ellipse cx="90" cy="170" rx="5.4" ry="3.4" transform="rotate(20 90 170)" />
        <ellipse cx="272" cy="48" rx="6.4" ry="4" transform="rotate(-20 272 48)" />
        <circle cx="112" cy="134" r="2.4" />
        <circle cx="184" cy="104" r="2.4" />
        <circle cx="252" cy="76" r="2.4" />
        <circle cx="96" cy="174" r="2.2" />
      </g>
    </svg>
  );
}

export function DecorativeBranches() {
  const reduce = useReducedMotion() === true;
  const { scrollY } = useScroll();
  const driftA = useTransform(scrollY, [0, 1400], [0, 22]);
  const driftB = useTransform(scrollY, [0, 1400], [0, -18]);
  return (
    <div className="deco-branches" aria-hidden="true" data-testid="decorative-branches">
      <motion.div className="deco-branch-tl" style={reduce ? undefined : { y: driftA }}>
        <BranchSpray />
      </motion.div>
      <motion.div className="deco-branch-tr" style={reduce ? undefined : { y: driftB }}>
        <BranchSpray />
      </motion.div>
      <motion.div className="deco-branch-bl" style={reduce ? undefined : { y: driftB }}>
        <BranchSpray flip />
      </motion.div>
    </div>
  );
}

const INK = '#202a36';
const LEAF_BLACK = '#1d2733';
const STALK_FILL = '#f7f1e3';
const VEIN = '#f7f1e3';

/** Long pointed bamboo leaf with center vein, hung from a thin curved stem. */
function BambooLeafStem({ x, y, len, droop, flip = false, wind = 'wind-a' }: { x: number; y: number; len: number; droop: number; flip?: boolean; wind?: string }) {
  const dir = flip ? -1 : 1;
  const bx = x + dir * len * 0.28;
  const by = y + droop * 0.5;
  const tipX = x + dir * len;
  const tipY = y + droop;
  const w = len * 0.13;
  return (
    <g className={`bamboo-leaf ${wind}${flip ? ' leaf-flip' : ''}`}>
      <path
        d={`M${x},${y} Q${x + dir * len * 0.12},${y + droop * 0.18} ${bx},${by}`}
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d={`M${bx},${by} C${bx + dir * len * 0.3},${by - w} ${bx + dir * len * 0.55},${by - w * 0.7} ${tipX},${tipY} C${bx + dir * len * 0.55},${by + w * 0.9} ${bx + dir * len * 0.28},${by + w * 1.1} ${bx},${by} Z`}
        fill={LEAF_BLACK}
      />
      <path
        d={`M${bx},${by} L${tipX},${tipY}`}
        fill="none"
        stroke={VEIN}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  );
}

/** Hollow segmented stalk like the reference: paper fill, ink outline, ring joints, highlight. */
function BambooStalk({ x, top, bottom, w, joints, leaves }: {
  x: number; top: number; bottom: number; w: number; joints: number[];
  leaves: { y: number; len: number; droop: number; flip?: boolean; wind?: string }[];
}) {
  return (
    <g className="bamboo-stalk">
      <g className="bamboo-stem-sway">
        <rect x={x - w / 2} y={top} width={w} height={bottom - top} fill={STALK_FILL} stroke={INK} strokeWidth="3" />
        <line x1={x - w / 2 + 5} y1={top + 6} x2={x - w / 2 + 5} y2={bottom - 6} stroke={INK} strokeWidth="1.4" opacity="0.35" />
        {joints.map((jy) => (
          <g key={jy}>
            <rect x={x - w / 2 - 3} y={jy - 5} width={w + 6} height={10} rx={3} fill={STALK_FILL} stroke={INK} strokeWidth="2.6" />
            <line x1={x - w / 2 - 3} y1={jy + 1} x2={x + w / 2 + 3} y2={jy + 1} stroke={INK} strokeWidth="1.4" opacity="0.6" />
          </g>
        ))}
      </g>
      {leaves.map((leaf, i) => (
        <BambooLeafStem key={`${leaf.y}-${i}`} x={x + (leaf.flip ? -w / 2 : w / 2)} y={leaf.y} len={leaf.len} droop={leaf.droop} flip={leaf.flip} wind={leaf.wind} />
      ))}
    </g>
  );
}

export function BambooDecoration() {
  const reduce = useReducedMotion() === true;
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, [0, 2400], [0, -26]);
  return (
    <motion.div
      className="deco-bamboo"
      aria-hidden="true"
      data-testid="bamboo-decoration"
      style={reduce ? undefined : { y: drift }}
    >
      <svg viewBox="0 0 340 600" focusable="false">
        <BambooStalk
          x={120} top={0} bottom={600} w={34} joints={[90, 200, 310, 420, 520]}
          leaves={[
            { y: 120, len: 110, droop: 64, flip: true, wind: 'wind-a' },
            { y: 240, len: 95, droop: 70, wind: 'wind-c' },
            { y: 380, len: 100, droop: 76, flip: true, wind: 'wind-b' },
          ]}
        />
        <BambooStalk
          x={200} top={0} bottom={600} w={44} joints={[70, 180, 290, 400, 505]}
          leaves={[
            { y: 100, len: 105, droop: 60, wind: 'wind-b' },
            { y: 320, len: 90, droop: 66, flip: true, wind: 'wind-d' },
            { y: 450, len: 85, droop: 80, wind: 'wind-a' },
          ]}
        />
        <BambooStalk
          x={272} top={0} bottom={600} w={30} joints={[110, 215, 320, 425, 525]}
          leaves={[
            { y: 150, len: 90, droop: 62, wind: 'wind-c' },
            { y: 350, len: 95, droop: 88, flip: true, wind: 'wind-d' },
          ]}
        />
        <BambooStalk
          x={62} top={40} bottom={600} w={24} joints={[150, 260, 370, 470, 560]}
          leaves={[
            { y: 190, len: 85, droop: 70, flip: true, wind: 'wind-b' },
            { y: 410, len: 80, droop: 74, wind: 'wind-c' },
          ]}
        />
      </svg>
    </motion.div>
  );
}
