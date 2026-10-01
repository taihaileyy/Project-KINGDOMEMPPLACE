// Decorative Garden of Eden artwork drawn in SVG: a tree of life glowing in
// KEP's navy and royal blue, with a river at its roots. Pure vector, so it is
// crisp at any size and adds no image weight.
export function ParadiseArt({ className = "" }: { className?: string }) {
  const leaves = [
    [200, 118, 74], [142, 150, 58], [258, 150, 58], [112, 196, 44], [288, 196, 44],
    [168, 92, 40], [234, 92, 40], [200, 168, 60], [150, 214, 38], [250, 214, 38],
  ];
  const motes = [[60, 90], [340, 70], [90, 250], [320, 240], [48, 170], [352, 160], [130, 40], [270, 34], [200, 24], [30, 300], [370, 290]];
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={className} fill="none">
      <defs>
        <radialGradient id="pa-glow" cx="50%" cy="42%" r="55%">
          <stop offset="0" stopColor="#5c6bff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#1f33b8" stopOpacity="0.25" />
          <stop offset="1" stopColor="#05070d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pa-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c5cad3" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#5c6bff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#1f33b8" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="pa-trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c5cad3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#101a3d" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="pa-river" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5c6bff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#c5cad3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5c6bff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="170" r="190" fill="url(#pa-glow)" />
      {/* rays */}
      <g stroke="#c5cad3" strokeOpacity="0.12" strokeWidth="1">
        {[-60, -42, -24, -8, 8, 24, 42, 60].map((a) => (
          <line key={a} x1="200" y1="150" x2={200 + Math.sin((a * Math.PI) / 180) * 260} y2={150 - Math.cos((a * Math.PI) / 180) * 260} />
        ))}
      </g>
      {/* branches and trunk */}
      <g stroke="url(#pa-trunk)" strokeLinecap="round">
        <path d="M200 340 C198 290 204 250 200 200" strokeWidth="14" />
        <path d="M200 250 C170 232 150 214 132 196" strokeWidth="6" />
        <path d="M200 250 C230 232 250 214 268 196" strokeWidth="6" />
        <path d="M200 215 C184 190 170 170 160 150" strokeWidth="5" />
        <path d="M200 215 C216 190 230 170 240 150" strokeWidth="5" />
      </g>
      {/* canopy */}
      <g fill="url(#pa-leaf)">
        {leaves.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fillOpacity="0.5" stroke="#c5cad3" strokeOpacity="0.45" strokeWidth="1" />
        ))}
      </g>
      {/* light motes */}
      <g fill="#c5cad3">
        {motes.map(([x, y], i) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.2} fillOpacity={0.35 + (i % 4) * 0.12} />
        ))}
      </g>
      {/* river */}
      <g stroke="url(#pa-river)" strokeLinecap="round">
        <path d="M30 350 C110 332 160 370 200 352 C250 332 300 372 372 346" strokeWidth="3" />
        <path d="M70 368 C130 356 170 384 210 370 C260 356 310 386 350 366" strokeWidth="2" strokeOpacity="0.6" />
      </g>
    </svg>
  );
}
