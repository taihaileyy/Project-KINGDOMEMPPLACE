// Fire for a wrong answer: the screen goes dark and flames rise from the bottom
// edge with a warm glow and drifting embers. Drawn in vector so it is crisp on
// any screen. The flames sway slowly (no flashing), and with reduced motion they
// hold still.

const W = 1600;
const H = 600;

type Tongue = { x: number; w: number; h: number; dur: number; delay: number; drift: number };

function tongues(count: number, hMin: number, hMax: number, seed: number): Tongue[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (n: number) => Math.abs(Math.sin(seed * 12.9898 + i * 78.233 + n * 37.719));
    return {
      x: ((i + 0.5) / count) * W + (r(1) - 0.5) * 60,
      w: 70 + r(2) * 70,
      h: hMin + r(3) * (hMax - hMin),
      dur: 1.3 + r(4) * 1.4,
      delay: -r(5) * 2,
      drift: (r(6) - 0.5) * 50,
    };
  });
}

const path = (t: Tongue) =>
  `M${t.x - t.w} ${H} C${t.x - t.w * 0.95} ${H - t.h * 0.35} ${t.x - t.w * 0.35} ${H - t.h * 0.55} ${t.x + t.drift} ${H - t.h} ` +
  `C${t.x + t.w * 0.3} ${H - t.h * 0.5} ${t.x + t.w * 0.95} ${H - t.h * 0.3} ${t.x + t.w} ${H} Z`;

const LAYERS = [
  { id: "back", fill: "url(#pd-fire-back)", items: tongues(9, 360, 540, 1.1), opacity: 0.9 },
  { id: "mid", fill: "url(#pd-fire-mid)", items: tongues(11, 250, 410, 2.3), opacity: 0.95 },
  { id: "front", fill: "url(#pd-fire-front)", items: tongues(13, 140, 260, 3.7), opacity: 1 },
];

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 29 + 7) % 100}%`,
  s: `${2 + ((i * 3) % 4)}px`,
  t: `${3.5 + ((i * 5) % 6)}s`,
  d: `-${(i * 7) % 9}s`,
  x: `${((i * 31) % 90) - 45}px`,
}));

export function FireLayer({ on }: { on: boolean }) {
  return (
    <div className="pd-fire" data-on={on} aria-hidden="true">
      <div className="pd-fire-glow" />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pd-fire-svg">
        <defs>
          {[
            ["back", "#7d1209", "#c4210f"],
            ["mid", "#d9480f", "#ff8a1f"],
            ["front", "#ff9d1c", "#ffe27a"],
          ].map(([id, top, bottom]) => (
            <linearGradient key={id} id={`pd-fire-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={top} stopOpacity="0" />
              <stop offset="0.35" stopColor={top} stopOpacity="0.85" />
              <stop offset="1" stopColor={bottom} />
            </linearGradient>
          ))}
        </defs>
        {LAYERS.map((layer) => (
          <g key={layer.id} fill={layer.fill} opacity={layer.opacity}>
            {layer.items.map((t, i) => (
              <path key={i} d={path(t)} className="pd-flame" style={{ "--dur": `${t.dur}s`, "--delay": `${t.delay}s` } as React.CSSProperties} />
            ))}
          </g>
        ))}
      </svg>
      <div className="pd-embers">
        {EMBERS.map((e, i) => (
          <span key={i} className="pd-ember" style={{ left: e.left, "--s": e.s, "--t": e.t, "--d": e.d, "--x": e.x } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
