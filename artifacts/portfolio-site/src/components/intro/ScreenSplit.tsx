import { TerminalBoot } from './TerminalBoot';

/** Glass shard count — intro.css sizes each of them individually. */
const SHARD_COUNT = 22;

/**
 * The screen that gets cut open.
 *
 * Two full-viewport copies of the terminal, clipped into complementary LEFT
 * and RIGHT halves parted on one near-straight vertical cut down the middle
 * (x = 50%) with only a couple of shallow facets, matching the katana's
 * single straight chop. Before the strike the halves tile the viewport
 * perfectly → one seamless screen. After the strike the anime.js timeline
 * breaks them: they shudder apart sideways, tilt and fall away with gravity
 * while dark glass shards burst from the middle cut, so the portfolio shows
 * through the widening split immediately, then the overlay unmounts.
 *
 * NOTE: there is deliberately NO seam / crack / divider element — no white
 * line, dashed or otherwise, at any point. The split IS the gap itself: the
 * moment the halves part, the portfolio underneath shows through.
 */
export function ScreenSplit() {
  return (
    <>
      <div className="intro-seal" data-intro="seal" aria-hidden="true" />
      <div className="intro-panel intro-panel-a" data-intro="panel-a" aria-hidden="true">
        <TerminalBoot />
      </div>
      <div className="intro-panel intro-panel-b" data-intro="panel-b" aria-hidden="true">
        <TerminalBoot />
      </div>

      <div className="intro-shards" data-intro="shards" aria-hidden="true">
        {Array.from({ length: SHARD_COUNT }, (_, i) => (
          <span key={i} className={`intro-shard intro-shard-${i + 1}`} data-intro="shard" />
        ))}
      </div>
    </>
  );
}
