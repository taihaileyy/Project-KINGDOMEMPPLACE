import Image from "next/image";
import { images } from "@/content/site";

// The hero's cinematic worship background: a dark sanctuary lit in blue, a
// crowd in silhouette with a worshipper's hands raised, and the faint KEP
// artwork on the screen in the distance. It is drawn here (no photograph is
// needed) so it is sharp at every size. To use a real photograph instead,
// replace <Scene /> below with an <Image> of it; the overlays stay as they are.

// Small seeded generator so the crowd is identical on server and browser.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Person = { x: number; y: number; s: number; arm: 0 | 1 | 2; tone: number };

function crowd(): Person[] {
  const r = rng(7);
  const out: Person[] = [];
  // Rows from far (small, faint, blue-lit) to near (large, black).
  const rows = [
    { y: 214, s: 0.5, n: 17, tone: 0.34 },
    { y: 250, s: 0.7, n: 13, tone: 0.24 },
    { y: 292, s: 0.95, n: 10, tone: 0.15 },
    { y: 346, s: 1.3, n: 7, tone: 0.07 },
  ];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const x = (i + 0.5) * (800 / row.n) + (r() - 0.5) * (800 / row.n) * 0.6;
      out.push({ x, y: row.y + (r() - 0.5) * 8, s: row.s * (0.9 + r() * 0.25), arm: r() > 0.84 ? 1 : r() > 0.93 ? 2 : 0, tone: row.tone });
    }
  }
  return out;
}

function Figure({ p }: { p: Person }) {
  const { x, y, s, arm, tone } = p;
  const fill = `rgb(${Math.round(4 + tone * 30)} ${Math.round(8 + tone * 50)} ${Math.round(24 + tone * 190)})`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`} fill={fill}>
      <circle cx="0" cy="-34" r="11" />
      <path d="M-30 40 C-30 -2 -18 -18 0 -18 C18 -18 30 -2 30 40 Z" />
      {arm >= 1 && <path d="M18 -4 C34 -18 36 -44 32 -72 L42 -74 C48 -44 46 -14 28 6 Z" />}
      {arm === 2 && <path d="M-18 -4 C-34 -18 -36 -44 -32 -72 L-42 -74 C-48 -44 -46 -14 -28 6 Z" />}
    </g>
  );
}

function Scene() {
  const people = crowd();
  return (
    <svg viewBox="0 0 800 440" preserveAspectRatio="xMaxYMax slice" className="absolute bottom-0 right-0 h-[78%] w-auto max-w-none sm:h-full" aria-hidden="true">
      <defs>
        <radialGradient id="wb-spot-l" cx="0" cy="0.42" r="0.55"><stop offset="0" stopColor="#4d7bff" stopOpacity="0.85" /><stop offset="1" stopColor="#1f33b8" stopOpacity="0" /></radialGradient>
        <radialGradient id="wb-spot-r" cx="0.82" cy="0.18" r="0.5"><stop offset="0" stopColor="#3b55ff" stopOpacity="0.6" /><stop offset="1" stopColor="#101a52" stopOpacity="0" /></radialGradient>
        <linearGradient id="wb-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d98ff" stopOpacity="0.55" /><stop offset="1" stopColor="#7d98ff" stopOpacity="0" /></linearGradient>
        <linearGradient id="wb-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1438" stopOpacity="0" /><stop offset="1" stopColor="#020309" stopOpacity="1" /></linearGradient>
        <filter id="wb-blur"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="wb-crowd"><feGaussianBlur stdDeviation="2.6" /></filter>
        <filter id="wb-soft"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <rect width="800" height="440" fill="#050a22" />
      <rect width="800" height="440" fill="url(#wb-spot-l)" />
      <rect width="800" height="440" fill="url(#wb-spot-r)" />
      {/* the stage wall and screen in the distance */}
      <rect x="470" y="70" width="270" height="120" rx="4" fill="#1a2c8a" opacity="0.3" filter="url(#wb-soft)" />
      {/* beams of stage light */}
      <g filter="url(#wb-blur)" opacity="0.8">
        <polygon points="-20,40 60,40 330,330 150,330" fill="url(#wb-beam)" />
        <polygon points="180,0 235,0 520,300 400,300" fill="url(#wb-beam)" opacity="0.55" />
        <polygon points="760,10 820,10 640,300 560,300" fill="url(#wb-beam)" opacity="0.5" />
      </g>
      {/* lights as soft points */}
      <g fill="#a9bcff" filter="url(#wb-soft)">
        {[[18, 120, 3], [60, 64, 2], [120, 150, 2], [300, 40, 2], [410, 92, 2.5], [690, 120, 2.5], [750, 70, 3], [560, 60, 2]].map(([cx, cy, r]) => (
          <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} opacity="0.75" />
        ))}
      </g>
      <rect x="0" y="70" width="800" height="230" fill="#2f4cd6" opacity="0.28" filter="url(#wb-blur)" />
      <g transform="translate(0 -62)" filter="url(#wb-crowd)">{people.map((p, i) => <Figure key={i} p={p} />)}</g>
      {/* the near worshipper on the right, hands raised */}
      <g fill="#02040c" transform="translate(0 -70)" filter="url(#wb-soft)">
        <circle cx="612" cy="214" r="26" />
        <path d="M520 440 C520 330 548 262 612 258 C676 262 704 330 704 440 Z" />
        <path d="M672 300 C712 270 716 196 700 120 L726 112 C748 196 746 290 700 340 Z" />
        <path d="M552 300 C514 272 504 214 516 160 L492 154 C476 214 482 290 530 338 Z" />
      </g>
      <g stroke="#6f8cff" strokeOpacity="0.55" strokeWidth="1.5" fill="none" filter="url(#wb-soft)" transform="translate(0 -70)">
        <path d="M700 120 C716 196 712 270 672 300" />
        <path d="M586 196 C592 176 632 176 638 196" />
      </g>
      <rect y="300" width="800" height="140" fill="url(#wb-floor)" />
    </svg>
  );
}

export function WorshipBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-night">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#04081c_0%,#0a1650_45%,#050a22_100%)] [background-position:center] [background-size:cover]">
        <Scene />
      </div>
      {/* the KEP artwork, faint, in the distance on the right */}
      <Image
        src={images.heroPoster.src}
        width={images.heroPoster.width}
        height={images.heroPoster.height}
        alt=""
        priority
        sizes="(min-width: 1024px) 60vw, 130vw"
        className="absolute right-[-38%] top-[16%] w-[130%] max-w-none opacity-[0.17] mix-blend-screen [mask-image:radial-gradient(closest-side,#000_45%,transparent)] sm:right-[-8%] sm:top-[6%] sm:w-[62%]"
      />
      {/* layered overlays: overall navy, a darker left for the words, a blue glow on the right */}
      <div className="absolute inset-0 bg-[rgb(3_6_18/0.2)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_6_18/0.82)_0%,rgb(3_6_18/0.5)_50%,rgb(3_6_18/0.04)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_85%_30%,rgb(31_51_184/0.38),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgb(3_6_18/0.75)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[rgb(3_6_18/0.6)] to-transparent" />
    </div>
  );
}
