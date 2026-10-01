import { ParadiseArt } from "@/components/paradise/paradise-art";

// The frame every Paradise experience lives in. It owns the size, the shape
// (a tall panel on phones, 16:9 from 640px up), the border and the glow, so
// whatever is placed inside only has to fill it: an <iframe>, an embedded web
// game, or a React component. See ./README.md for how to plug it in.
export function GameStage({ children }: { children?: React.ReactNode }) {
  return (
    <div
      id="paradise-stage"
      className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-[#05070d] shadow-[0_40px_120px_-40px_rgb(31_51_184/0.55)] sm:aspect-video"
    >
      {children ?? <GamePlaceholder />}
    </div>
  );
}

// Shown until a game is connected.
export function GamePlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden text-center">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_40%,#101a3d_0%,#0a1024_55%,#05070d_100%)]" />
      <ParadiseArt className="absolute left-1/2 top-1/2 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 animate-[drift_18s_ease-in-out_infinite_alternate] opacity-55 sm:h-[135%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,rgb(5_7_13/0.78)_0%,rgb(5_7_13/0.35)_100%)]" />
      <div className="relative px-6">
        <p className="mx-auto mb-5 inline-block rounded-full border border-white/25 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-chrome">In development</p>
        <h2 className="font-display text-[2rem] font-medium leading-[1.05] sm:text-5xl lg:text-6xl">Interactive Experience Coming Soon</h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-chrome sm:text-lg">Paradise is currently in development.</p>
      </div>
    </div>
  );
}
