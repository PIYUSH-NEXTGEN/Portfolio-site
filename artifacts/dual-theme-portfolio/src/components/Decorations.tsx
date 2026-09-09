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
        <BranchSpray flip />
      </motion.div>
      <motion.div className="deco-branch-bl" style={reduce ? undefined : { y: driftB }}>
        <BranchSpray flip />
      </motion.div>
    </div>
  );
}

function BambooStalk({ x, h, nodes }: { x: number; h: number; nodes: number[] }) {
  return (
    <g>
      <rect x={x} y={200 - h} width="10" height={h} rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      {nodes.map((ny) => (
        <line key={ny} x1={x - 2} y1={ny} x2={x + 12} y2={ny} stroke="currentColor" strokeWidth="1.6" />
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
      <svg viewBox="0 0 220 220" focusable="false">
        <g fill="none" strokeLinecap="round">
          <BambooStalk x={120} h={150} nodes={[110, 140, 170]} />
          <BambooStalk x={148} h={118} nodes={[128, 156, 182]} />
          <BambooStalk x={94} h={96} nodes={[140, 166]} />
        </g>
        <g fill="currentColor" opacity="0.8">
          <ellipse cx="112" cy="72" rx="20" ry="7" transform="rotate(-24 112 72)" />
          <ellipse cx="150" cy="60" rx="22" ry="7" transform="rotate(14 150 60)" />
          <ellipse cx="132" cy="48" rx="18" ry="6" transform="rotate(-8 132 48)" />
          <ellipse cx="166" cy="92" rx="18" ry="6" transform="rotate(28 166 92)" />
          <ellipse cx="92" cy="96" rx="16" ry="6" transform="rotate(-32 92 96)" />
          <ellipse cx="182" cy="120" rx="15" ry="5.4" transform="rotate(24 182 120)" />
        </g>
        <circle cx="60" cy="168" r="26" fill="currentColor" opacity="0.16" />
      </svg>
    </motion.div>
  );
}
