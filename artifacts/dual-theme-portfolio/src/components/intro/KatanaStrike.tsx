/**
 * The katana — the actual uploaded asset (public/katana.png), the source of
 * truth for this intro. The PNG is a black silhouette on an opaque white
 * background with a thin border frame, so it is composited for the dark
 * terminal with: clip-path (crops the border frame) + invert() (turns the
 * silhouette luminous silver) + mix-blend-mode: screen on the wrapper
 * (makes the inverted background perfectly transparent over the terminal).
 *
 * A second copy of the same asset carries a moving gradient mask — a narrow
 * band of light that sweeps along the blade during the chamber (the
 * "polished metal catching light" moment), driven by --sheen-x.
 */
export function KatanaStrike() {
  const src = `${import.meta.env.BASE_URL}katana.png`;
  return (
    <div className="intro-katana" data-intro="katana" aria-hidden="true">
      <img className="intro-katana-img" src={src} alt="" draggable={false} />
      <img className="intro-katana-sheen" src={src} alt="" draggable={false} />
    </div>
  );
}
