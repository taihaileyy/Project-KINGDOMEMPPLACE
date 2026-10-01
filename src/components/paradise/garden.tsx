import "./garden.css";

// Paradise's Garden of Eden, drawn in layers (sky, sun, far and near hills, the
// Tree of Life, foreground fronds, water). Pure vector, so it is crisp on any
// screen and adds no image weight. Each layer carries a --depth value that the
// game's camera uses for parallax. Used by the game scene and the homepage teaser.

const W = 1600;

// A soft ridge line built from a few sine waves, so every hill is different but
// the result is the same on the server and in the browser.
function ridge(base: number, amp: number, seed: number, height = 900) {
  let d = `M0 ${height}`;
  for (let x = 0; x <= W; x += 16) {
    const y = base - (Math.sin(x * 0.0042 + seed) * amp + Math.sin(x * 0.011 + seed * 2.1) * amp * 0.45 + Math.sin(x * 0.0021 + seed * 3.3) * amp * 0.8);
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${height} Z`;
}

// A fan of leaf blades rooted at the bottom-left corner of a 420-unit square.
function FrondCluster() {
  const blade = "M0 0 C40 -34 120 -46 190 -18 C130 -8 70 8 0 0 Z";
  const fronds = [[-84, 1.5], [-62, 1.3], [-40, 1.1], [-20, 0.9], [-4, 0.7], [-100, 0.8]];
  return (
    <svg viewBox="0 0 420 420" className="size-full" fill="#03120c">
      {fronds.map(([rot, sc]) => (
        <g key={rot} transform={`translate(8 420) rotate(${rot}) scale(${sc})`}>
          {[-30, -14, 2, 18, 34].map((a, i) => (
            <path key={a} d={blade} transform={`rotate(${a}) scale(${1 - i * 0.05})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function GardenBackdrop({ className = "", focus = "bottom" }: { className?: string; focus?: "bottom" | "middle" }) {
  // Wide, short frames (the homepage teaser) center the landscape so the tree stays in view.
  const fit = focus === "middle" ? "xMidYMid slice" : "xMidYMax slice";
  return (
    <div aria-hidden="true" className={`pd-garden ${className}`}>
      <div className="pd-sky" />
      <div className="pd-layer pd-sun-wrap" style={{ "--depth": 0.15 } as React.CSSProperties}>
        <div className="pd-sun" />
        <div className="pd-rays" />
      </div>
      <svg className="pd-layer pd-svg" style={{ "--depth": 0.35 } as React.CSSProperties} viewBox={`0 0 ${W} 900`} preserveAspectRatio={fit}>
        <defs>
          <linearGradient id="pd-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f7a5a" />
            <stop offset="1" stopColor="#0f3d2f" />
          </linearGradient>
          <linearGradient id="pd-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d5a43" />
            <stop offset="1" stopColor="#072a20" />
          </linearGradient>
        </defs>
        <path d={ridge(560, 46, 1.2)} fill="url(#pd-far)" opacity="0.75" />
        <path d={ridge(610, 52, 4.1)} fill="url(#pd-mid)" opacity="0.95" />
      </svg>
      {/* The Tree of Life: a dark canopy with a golden rim of light. */}
      <svg className="pd-layer pd-svg" style={{ "--depth": 0.55 } as React.CSSProperties} viewBox={`0 0 ${W} 900`} preserveAspectRatio={fit}>
        <g fill="#04170f">
          <path d="M786 640 C790 560 782 520 792 470 L812 470 C820 520 812 560 816 640 Z" />
          {[[800, 430, 120], [730, 470, 84], [872, 470, 84], [700, 520, 56], [900, 520, 56], [770, 380, 70], [832, 382, 70]].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g fill="none" stroke="#f2d78a" strokeOpacity="0.55" strokeWidth="1.4">
          <circle cx="800" cy="430" r="120" />
          <circle cx="730" cy="470" r="84" strokeOpacity="0.35" />
          <circle cx="872" cy="470" r="84" strokeOpacity="0.35" />
        </g>
        <path d={ridge(690, 34, 7.7)} fill="#041a12" />
      </svg>
      <div className="pd-layer pd-water" style={{ "--depth": 0.8 } as React.CSSProperties} />
      <div className="pd-frond left-0" style={{ "--depth": 1.1 } as React.CSSProperties}>
        <FrondCluster />
      </div>
      <div className="pd-frond right-0 -scale-x-100" style={{ "--depth": 1.1 } as React.CSSProperties}>
        <FrondCluster />
      </div>
    </div>
  );
}
