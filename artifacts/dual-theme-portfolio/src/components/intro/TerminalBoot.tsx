/**
 * Terminal boot screen - deliberately STALLED MID-LOAD.
 * The bundle never finishes verifying, the progress bar sticks at 62% and a
 * spinner keeps spinning, so the visitor believes the site is still loading
 * when the katana thrusts in from the foreground and cuts the screen in two.
 */

const BOOT_ROWS: Array<{ text: string; meta?: string; ok?: boolean }> = [
  { text: 'mount /dev/core0', meta: 'OK 0.04s', ok: true },
  { text: 'load kernel modules [gpu, audio, net]', meta: 'OK', ok: true },
  { text: 'verify portfolio bundle v2026.09', meta: '148/214 files' },
  { text: 'compile visual system', meta: '62%' },
  { text: 'hydrate interface components', meta: 'waiting' },
];

export function TerminalBoot() {
  return (
    <div className="intro-term" aria-hidden="true">
      <div className="intro-term-scan" />
      <div className="intro-term-vignette" />
      <div className="intro-term-inner">
        <div className="intro-term-top" data-intro="fade">
          <span className="intro-term-brand">
            <span className="intro-dot intro-dot-r" />
            <span className="intro-dot intro-dot-y" />
            <span className="intro-dot intro-dot-g" />
            <span className="intro-term-brand-name">ALEXMORGAN — PORTFOLIO</span>
          </span>
          <span>BOOT / V.2026</span>
        </div>
        <div className="intro-term-body">
          <div className="intro-term-title" data-intro="title">
            SYSTEM INITIALIZATION
            <span className="intro-cursor" />
          </div>
          <div className="intro-term-sub" data-intro="line">
            secure shell · tty01 · utf-8 · 60fps
          </div>
          <div className="intro-term-rule" data-intro="line" aria-hidden="true" />
          {BOOT_ROWS.map((row) => (
            <div key={row.text} className="intro-term-line" data-intro="line">
              <span className="prompt">&gt;</span>
              <span className="line-text">{row.text}</span>
              {row.meta ? (
                <span className={row.ok ? 'line-ok' : 'line-meta'}> [{row.meta}]</span>
              ) : null}
            </div>
          ))}
          <div className="intro-term-status" data-intro="status">
            <span>LOADING</span>
            <span className="intro-term-status-bar">
              <span className="intro-term-status-fill" data-intro="status-fill" />
            </span>
            <span className="intro-term-status-pct" data-intro="status-pct">62%</span>
          </div>
          <div className="intro-waiting" data-intro="waiting">
            <span className="intro-spinner" />
            <span>please wait — fetching remaining modules</span>
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
