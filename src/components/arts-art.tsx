// Arts Program artwork: a bold, painterly composition of brush strokes, a
// palette, a paintbrush and a musical note in KEP's navy, royal blue and gold,
// with splashes of warm color. It says "creativity" without any photograph,
// and looks nothing like the Media program (cameras, studio, film).
// Pure vector, so it is crisp at any size.
export function ArtsArt({ className = "", label = "" }: { className?: string; label?: string }) {
  const splatter = [[70, 90, 9, "#ecd08a"], [330, 60, 6, "#ff7a59"], [350, 300, 8, "#5c6bff"], [40, 330, 5, "#ecd08a"], [300, 120, 4, "#ffffff"], [120, 40, 5, "#5c6bff"], [210, 360, 6, "#ff7a59"], [380, 190, 4, "#ecd08a"]] as const;
  return (
    <svg role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <linearGradient id="ar-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#101a52" />
          <stop offset="0.55" stopColor="#1f33b8" />
          <stop offset="1" stopColor="#0a1024" />
        </linearGradient>
        <linearGradient id="ar-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6dd9c" />
          <stop offset="1" stopColor="#c89b3c" />
        </linearGradient>
        <linearGradient id="ar-coral" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9a76" />
          <stop offset="1" stopColor="#e8452c" />
        </linearGradient>
        <filter id="ar-rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="7" /></filter>
      </defs>
      <rect width="400" height="500" fill="url(#ar-bg)" />
      <circle cx="300" cy="120" r="170" fill="#5c6bff" opacity="0.18" />
      {/* broad brush strokes */}
      <g filter="url(#ar-rough)" strokeLinecap="round" fill="none">
        <path d="M-20 360 C80 290 160 420 260 340 S400 300 430 330" stroke="url(#ar-gold)" strokeWidth="46" opacity="0.95" />
        <path d="M-30 250 C60 190 150 290 240 210 S380 170 430 210" stroke="url(#ar-coral)" strokeWidth="34" opacity="0.92" />
        <path d="M-20 440 C90 400 170 480 270 430 S390 410 430 440" stroke="#5c6bff" strokeWidth="30" opacity="0.9" />
        <path d="M20 150 C110 100 170 170 260 120" stroke="#ffffff" strokeWidth="14" opacity="0.55" />
      </g>
      {/* paint palette */}
      <g transform="translate(70 70) rotate(-14)">
        <path d="M0 40 C0 -6 70 -22 128 4 C176 26 176 78 128 90 C104 96 108 70 82 72 C58 74 62 102 34 94 C10 88 0 66 0 40 Z" fill="#f5f1e8" />
        <circle cx="44" cy="30" r="11" fill="#e8452c" /><circle cx="78" cy="22" r="11" fill="#ecd08a" /><circle cx="112" cy="34" r="11" fill="#1f33b8" /><circle cx="128" cy="62" r="9" fill="#5c6bff" />
        <ellipse cx="62" cy="62" rx="9" ry="7" fill="#0a1024" />
      </g>
      {/* paintbrush */}
      <g transform="translate(250 235) rotate(28)">
        <rect x="-7" y="0" width="14" height="150" rx="7" fill="url(#ar-gold)" />
        <rect x="-8" y="-14" width="16" height="22" rx="3" fill="#c5cad3" />
        <path d="M-9 -14 C-9 -50 -2 -66 0 -78 C2 -66 9 -50 9 -14 Z" fill="#f5f1e8" />
        <path d="M-9 -14 C-9 -30 -4 -42 0 -50 C4 -42 9 -30 9 -14 Z" fill="#e8452c" />
      </g>
      {/* a musical note, so music and performance belong here too */}
      <g fill="#f5f1e8" transform="translate(300 330) rotate(-8)">
        <ellipse cx="0" cy="40" rx="17" ry="12" transform="rotate(-20 0 40)" />
        <ellipse cx="46" cy="30" rx="17" ry="12" transform="rotate(-20 46 30)" />
        <path d="M13 38 V-34 L59 -46 V28" fill="none" stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" />
        <path d="M13 -34 L59 -46 V-30 L13 -18 Z" />
      </g>
      {splatter.map(([x, y, r, c]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c} opacity="0.9" />)}
    </svg>
  );
}
