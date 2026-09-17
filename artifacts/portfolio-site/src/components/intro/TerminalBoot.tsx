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
  { cmd: 'whoami', out: 'piyush-baraskar · ml & backend engineer · cs 2029', tone: 'ok' },
  { cmd: 'cat /etc/purpose', out: 'shipping measurable systems, model to endpoint', tone: 'dim' },
  { cmd: 'pytest -q', out: '48 passed · 0 failed · coverage 91%', tone: 'ok' },
  { cmd: 'psql portfolio -c "\\dt"', out: 'projects · skills · experience · 3 relations up', tone: 'dim' },
  { cmd: 'git status -sb', out: '## main…origin/main · working tree clean', tone: 'dim' },
  { cmd: 'pip install -r requirements.txt', out: 'resolved 31 packages · fastapi · sqlalchemy · torch', tone: 'ok' },
  { cmd: './boot --portfolio --env=prod', out: 'routes 4/4 · fonts 3/3 · katana sharpened', tone: 'ok' },
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
            <span className="intro-term-brand-name">piyush_baraskar · portfolio</span>
          </span>
          <span className="intro-term-top-right">piyush@ink · zsh 5.9</span>
        </div>
        <div className="intro-term-body">
          <div className="intro-term-session" data-intro="line">
            ✦ piyush@ink · x86_64 · utf-8 · tz asia/kolkata
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
            <span className="term-status-label">assembling experience</span>
            <span className="intro-term-status-bar">
              <span className="intro-term-status-fill" data-intro="status-fill" />
            </span>
            <span className="intro-term-status-pct" data-intro="status-pct">0%</span>
          </div>
          <div className="intro-waiting" data-intro="waiting">
            <span className="intro-spinner" />
            <span>chunk 149/214 · fonts still in flight · hold on</span>
          </div>
        </div>
        <div className="intro-term-bottom" data-intro="fade">
          <span>© PIYUSH BARASKAR · bhopal, in</span>
          <span>zsh 5.9 · 80×24 · utf-8 · main*</span>
        </div>
      </div>
    </div>
  );
}

