/**
 * Subtle Japanese-inspired environmental decoration.
 * Thin hand-drawn branches frame page edges. Inline SVG in currentColor,
 * pointer-events none, always behind content.
 */

function BranchSpray({ flip = false, sparse = false }: { flip?: boolean; sparse?: boolean }) {
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
        {!sparse && <path d="M52,190 C66,184 76,178 84,168" />}
        <path d="M156,126 C168,122 176,116 182,108" />
      </g>
      <g fill="currentColor" opacity="0.85">
        <ellipse cx="118" cy="124" rx="7" ry="4.4" transform="rotate(-24 118 124)" />
        <ellipse cx="124" cy="130" rx="6" ry="3.8" transform="rotate(18 124 130)" />
        <ellipse cx="172" cy="94" rx="7" ry="4.4" transform="rotate(-20 172 94)" />
        <ellipse cx="178" cy="100" rx="6" ry="3.8" transform="rotate(22 178 100)" />
        <ellipse cx="240" cy="66" rx="7" ry="4.4" transform="rotate(-24 240 66)" />
        <ellipse cx="246" cy="72" rx="6" ry="3.8" transform="rotate(18 246 72)" />
        {!sparse && <ellipse cx="84" cy="164" rx="6.4" ry="4" transform="rotate(-22 84 164)" />}
        {!sparse && <ellipse cx="90" cy="170" rx="5.4" ry="3.4" transform="rotate(20 90 170)" />}
        <ellipse cx="272" cy="48" rx="6.4" ry="4" transform="rotate(-20 272 48)" />
        <circle cx="112" cy="134" r="2.4" />
        <circle cx="184" cy="104" r="2.4" />
        <circle cx="252" cy="76" r="2.4" />
        {!sparse && <circle cx="96" cy="174" r="2.2" />}
      </g>
    </svg>
  );
}

export function DecorativeBranches() {
  return (
    <div className="deco-branches" aria-hidden="true" data-testid="decorative-branches">
      <div className="deco-branch-tl">
        <BranchSpray />
      </div>
      <div className="deco-branch-tr">
        <BranchSpray flip sparse />
      </div>
      <div className="deco-branch-bl">
        <BranchSpray flip />
      </div>
      <div className="deco-branch-br">
        <BranchSpray />
      </div>
    </div>
  );
}

