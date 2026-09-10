import { TerminalBoot } from './TerminalBoot';

/**
 * The screen that gets cut open.
 *
 * Two full-viewport copies of the terminal, clipped into complementary
 * diagonal polygons that run corner-to-corner (top-right → bottom-left),
 * matching the katana's blade angle in the uploaded asset. Before the strike
 * the polygons tile the viewport perfectly → one seamless screen. After the
 * strike the master timeline parts them along the cut's perpendicular.
 *
 * Between the panels sits the cut line (a thin bright core with a soft halo,
 * revealed with a dash animation as the blade travels), plus a short-lived
 * white flash at the moment of impact.
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
      <svg
        className="intro-cut"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          data-intro="cut-halo"
          className="intro-cut-halo"
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
        />
        <line
          data-intro="cut-core"
          className="intro-cut-core"
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="intro-flash" data-intro="flash" />
    </>
  );
}
