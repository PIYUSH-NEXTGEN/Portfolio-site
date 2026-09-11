/**
 * The katana — the actual uploaded asset (public/katana.png), the source of
 * truth for this intro. The PNG is a black silhouette on an opaque white
 * background with a thin border frame, so it is composited for the dark
 * terminal with: clip-path (crops the border frame) + invert() (turns the
 * silhouette luminous silver) + mix-blend-mode: screen on the wrapper
 * (makes the inverted background perfectly transparent over the terminal).
 *
 * No trail / arc SVG on purpose — the blade alone does the 180-degree cut
 * with zero lingering orange lines.
 *
 * ORIENTATION FIX: the asset itself points the wrong way for this swing
 * (handle up / edge down), so the <img> is flipped 180° via the INDEPENDENT
 * CSS `rotate` property. GSAP's transforms never touch `rotate` (they use
 * `rotation` → `transform`), so the flip survives the whole timeline:
 * handle ends DOWN, cutting edge faces UP through the entire cut.
 */
export function KatanaStrike() {
  const src = `${import.meta.env.BASE_URL}katana.png`;
  return (
    <div className="intro-katana" data-intro="katana" aria-hidden="true">
      <img className="intro-katana-img" src={src} alt="" draggable={false} />
    </div>
  );
}
