/**
 * Terminal boot screen — a real-looking shell, deliberately STALLED MID-LOAD.
 * The chunk fetch sticks at 62% with a spinner still running, so the visitor
 * believes the site is still loading when the katana thrusts in and cuts it.
 *
 * Layout mimics a real zsh session: session banner, one command per line with
 * its output on the NEXT line (indented, dimmed), then a live status row. The
 * percentage readout starts at 0 and is painted by the anime.js timeline (one
 * animated counter drives every copy), so the number actually climbs on the
 * way to the stall instead of appearing finished.
 */

type BootRow = { cmd: string; out: string; tone?: 'ok' | 'dim' | 'warn' };

const BOOT_ROWS: BootRow[] = [
  { cmd: 'whoami', out: 'piyush-baraskar', tone: 'ok' },
  { cmd: 'uname -sm', out: 'Linux x86_64', tone: 'dim' },
  { cmd: 'cat stack.txt', out: 'python · go · pytorch · postgres · typescript', tone: 'dim' },
  { cmd: 'ls ~/portfolio', out: 'kintsugi/  akari/  sora/  mono/', tone: 'ok' },
  { cmd: './boot --portfolio', out: 'routes 4/4 · assets 148/214', tone: 'ok' },
  { cmd: 'build interface --prod', out: 'compiling … 62%', tone: 'warn' },
  { cmd: 'hydrate components', out: 'waiting on chunk 149', tone: 'dim' },
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
            <span className="intro-term-brand-name">piyush_baraskar — portfolio</span>
          </span>
          <span className="intro-term-top-right">piyush@ink — zsh</span>
        </div>
        <div className="intro-term-body">
          <div className="intro-term-session" data-intro="line">
            Last login: Tue Sep  9 09:41:22 on ttys001 · pid 412 · tty01 · utf-8
          </div>
          <div className="intro-term-title" data-intro="title">
            <span className="term-user">piyush@ink</span>
            <span className="term-sep">:</span>
            <span className="term-path">~/portfolio</span>
            <span className="term-dollar">$</span>
            <span className="term-cmd">boot --portfolio</span>
            <span className="intro-cursor" />
          </div>
          {BOOT_ROWS.map((row) => (
            <div key={row.cmd} className="intro-term-cmd-block">
              <div className="intro-term-line" data-intro="line">
                <span className="prompt">
                  <span className="term-user">piyush@ink</span>
                  <span className="term-sep">:</span>
                  <span className="term-path">~</span>
                  <span className="term-dollar">$</span>
                </span>
                <span className="line-cmd">{row.cmd}</span>
              </div>
              <div className={`intro-term-out line-${row.tone ?? 'dim'}`} data-intro="line">
                <span className="out-glyph" aria-hidden="true">
                  {row.tone === 'ok' ? '✓' : row.tone === 'warn' ? '!' : '·'}
                </span>
                <span>{row.out}</span>
              </div>
            </div>
          ))}
          <div className="intro-term-status" data-intro="status">
            <span className="term-status-label">fetching chunks</span>
            <span className="intro-term-status-bar">
              <span className="intro-term-status-fill" data-intro="status-fill" />
            </span>
            <span className="intro-term-status-pct" data-intro="status-pct">0%</span>
          </div>
          <div className="intro-waiting" data-intro="waiting">
            <span className="intro-spinner" />
            <span>chunk 149/214 — please wait</span>
          </div>
        </div>
        <div className="intro-term-bottom" data-intro="fade">
          <span>© PIYUSH BARASKAR</span>
          <span>localhost · zsh · 80×24 · main*</span>
        </div>
      </div>
    </div>
  );
}

