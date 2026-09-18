/**
 * The katana — a flat 2D anime-style illustration drawn as inline SVG
 * (no photo asset, no PNG frame to crop, no invert() hack).
 *
 * Drawn horizontally in local coords inside a group rotated -45°, so the
 * artwork on its own rests handle DOWN-LEFT / tip UP-RIGHT. The anime.js
 * timeline adds a further -45° on the wrapper during the intro, cancelling
 * to -90° total → blade VERTICAL, tip UP at the centre of the swing.
 *
 * Colours: polished SILVER blade (bright steel gradient + hamon + white
 * edge gleam), BLACK handle with RED ito wrap, black tsuba with a red
 * rim, red-trimmed habaki/kashira and a dark-red sageo cord.
 *
 * MOTION-BLUR GHOSTS: the same SVG is stacked three more times underneath.
 * The first two follow the swing a few frames behind the blade, dimmer and
 * softer (see GHOST_STEPS / GHOST_LAG_MS in IntroSequence), so the fast cut
 * reads as real camera motion blur instead of a hard, cheap jump. They are
 * `opacity: 0` until the swing starts and are back to 0 the instant it ends.
 * Only the real blade carries the `data-intro="edge"` gleam hook — the
 * ghosts' gleams stay parked at 0.
 */
const GHOST_STEPS = [1, 2, 3] as const;

function KatanaArtwork({ idSuffix, gleam }: { idSuffix: string; gleam: boolean }) {
  return (
    <svg viewBox="0 0 640 640" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`kb-steel-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#dfe6ef" />
          <stop offset="0.65" stopColor="#aeb8c8" />
          <stop offset="1" stopColor="#798391" />
        </linearGradient>
        <linearGradient id={`kb-wrap-${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a0b0e" />
          <stop offset="1" stopColor="#1a1d24" />
        </linearGradient>
      </defs>
      <g transform="rotate(-45 320 320)">
        {/* sageo cord — dark red */}
        <path
          d="M 178 344 C 168 368, 150 380, 132 384"
          fill="none"
          stroke="#8f1d22"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* blade body — polished silver, tapered to a clipped point */}
        <polygon
          points="204,311 496,311 530,320 496,329 204,329"
          fill={`url(#kb-steel-${idSuffix})`}
          stroke="#f4f7fb"
          strokeWidth="1.4"
        />
        {/* shinogi ridge line */}
        <line x1="206" y1="320" x2="500" y2="320" stroke="#8b95a8" strokeWidth="1" opacity="0.8" />
        {/* hamon — wavy temper line near the edge */}
        <path
          d="M 214 325 C 260 321, 290 326, 330 322 S 420 321, 486 317"
          fill="none"
          stroke="#fbfdff"
          strokeWidth="1.6"
          opacity="0.9"
        />
        {/* edge gleam — swept by the anime.js timeline during the cut */}
        {gleam ? (
          <line
            x1="206"
            y1="312.5"
            x2="502"
            y2="312.5"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            data-intro="edge"
            className="intro-katana-edge"
          />
        ) : (
          <line x1="206" y1="312.5" x2="502" y2="312.5" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0" />
        )}
        {/* habaki collar — silver with red trim */}
        <rect x="192" y="308" width="13" height="24" rx="1.5" fill="#e3e8f0" stroke="#b3202c" strokeWidth="1.2" />
        {/* tsuba guard — black iron with red rim */}
        <ellipse cx="179" cy="320" rx="10" ry="27" fill="#101216" stroke="#c22330" strokeWidth="2.2" />
        <ellipse cx="179" cy="320" rx="4" ry="12" fill="none" stroke="#5c1218" strokeWidth="1.4" />
        {/* tsuka handle — BLACK */}
        <rect x="96" y="309" width="74" height="22" rx="5" fill={`url(#kb-wrap-${idSuffix})`} stroke="#000000" strokeWidth="1.5" />
        {/* ito wrap — RED diamonds over the black handle */}
        <g stroke="#d21f2b" strokeWidth="2.4" opacity="1">
          <line x1="104" y1="309" x2="118" y2="331" />
          <line x1="120" y1="309" x2="134" y2="331" />
          <line x1="136" y1="309" x2="150" y2="331" />
          <line x1="152" y1="309" x2="166" y2="331" />
          <line x1="162" y1="309" x2="150" y2="331" />
          <line x1="146" y1="309" x2="134" y2="331" />
          <line x1="130" y1="309" x2="118" y2="331" />
          <line x1="114" y1="309" x2="104" y2="331" />
        </g>
        {/* kashira cap + end knob — black with red trim */}
        <rect x="86" y="308" width="11" height="24" rx="3" fill="#14161b" stroke="#c22330" strokeWidth="1.2" />
        <circle cx="83" cy="320" r="3.4" fill="#d21f2b" stroke="#5c1218" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function KatanaStrike() {
  return (
    <div className="intro-katana" data-intro="katana" aria-hidden="true">
      {GHOST_STEPS.map((step) => (
        <div
          key={step}
          className={`intro-katana-img intro-katana-ghost intro-katana-ghost-${step}`}
          data-intro="ghost"
          aria-hidden="true"
        >
          <KatanaArtwork idSuffix={`g${step}`} gleam={false} />
        </div>
      ))}
      <div className="intro-katana-img intro-katana-blade" data-intro="blade" aria-hidden="true">
        <KatanaArtwork idSuffix="live" gleam />
      </div>
    </div>
  );
}

