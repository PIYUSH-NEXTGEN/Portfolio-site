/**
 * The terminal boot screen — rendered identically inside BOTH split panels so
 * that, before the cut, the two clipped halves read as one seamless screen.
 * Animated by the master timeline in IntroSequence via data-intro attributes.
 */

const BOOT_LINES = [
  'boot sequence started',
  'loading core modules',
  'loading interface',
  'loading visual system',
  'loading portfolio',
];

export function TerminalBoot() {
  return (
    <div className="intro-term" aria-hidden="true">
      <div className="intro-term-scan" />
      <div className="intro-term-vignette" />
      <div className="intro-term-inner">
        <div className="intro-term-top" data-intro="fade">
          <span>ALEXMORGAN — PORTFOLIO</span>
          <span>BOOT / V.2026</span>
        </div>
        <div className="intro-term-body">
          <div className="intro-term-title" data-intro="title">
            SYSTEM INITIALIZATION
            <span className="intro-cursor" />
          </div>
          {BOOT_LINES.map((line) => (
            <div key={line} className="intro-term-line" data-intro="line">
              <span className="prompt">&gt;</span>
              {line}
            </div>
          ))}
          <div className="intro-term-status" data-intro="status">
            <span>ENV</span>
            <span className="intro-term-status-bar">
              <span className="intro-term-status-fill" data-intro="status-fill" />
            </span>
            <span>READY</span>
          </div>
          <div className="intro-term-line is-ready" data-intro="ready-1">
            <span className="prompt">&gt;</span>
            STATUS: <span className="ready-word">READY</span>
          </div>
          <div className="intro-term-line is-ready" data-intro="ready-2">
            <span className="prompt">&gt;</span>
            ENTERING EXPERIENCE
            <span className="intro-cursor" />
          </div>
        </div>
        <div className="intro-term-bottom" data-intro="fade">
          <span>© ALEX MORGAN</span>
          <span>ALL SYSTEMS LOCAL</span>
        </div>
      </div>
    </div>
  );
}
