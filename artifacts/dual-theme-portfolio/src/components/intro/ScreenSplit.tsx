import { TerminalBoot } from './TerminalBoot';

/**
 * The screen that gets cut open.
 *
 * Two full-viewport copies of the terminal, clipped into jagged,
 * complementary diagonal polygons that run corner-to-corner
 * (top-right → bottom-left), matching the katana's swing path.
 * Before the strike the polygons tile the viewport perfectly → one
 * seamless screen. After the strike the master timeline breaks them —
 * they tilt and fall away (no crack lines, no rings, no spark streaks) with
 * gravity while dark glass shards burst from the cut; the overlay background
 * turns transparent as the halves part so the portfolio shows through
 * instantly — no black gap — then the overlay unmounts.
 */
export function ScreenSplit() {
  return (
    <>
      <div className="intro-panel intro-panel-a" data-intro="panel-a" aria-hidden="true">
        <TerminalBoot />
      </div>
      <div className="intro-panel intro-panel-b" data-intro="panel-b" aria-hidden="true">
        <TerminalBoot />
      </div>
      
      <div className="intro-shards" data-intro="shards" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} className={`intro-shard intro-shard-${i + 1}`} />
        ))}
      </div>
    </>
  );
}
