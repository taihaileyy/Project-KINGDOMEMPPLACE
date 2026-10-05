import Link from "next/link";
import { Arrow } from "@/components/arrow";

// The game, as a full-width navy band with a soft fan of light rays behind it.
export function CreateWorldSpotlight() {
  return (
    <section aria-labelledby="cyw-title" className="relative isolate overflow-hidden bg-[#050a1c] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_50%_100%,#1a2b7a_0%,#0a1240_45%,#050a1c_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-35 [background:repeating-conic-gradient(from_-60deg_at_50%_115%,rgb(120_150_255/0.5)_0deg_2deg,transparent_2deg_9deg)] [mask-image:radial-gradient(70%_90%_at_50%_100%,#000,transparent)]"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-9 text-center sm:py-20">
        <p data-reveal className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ecd08a] sm:text-sm">An interactive Bible journey</p>
        <h2 id="cyw-title" data-reveal="mask" className="mt-3 font-display text-[clamp(2.3rem,10.5vw,3.4rem)] font-medium uppercase leading-[1.02] tracking-[0.08em] sm:text-7xl">
          Create<br />Your World
        </h2>
        <Link data-reveal style={{ "--d": "150ms" } as React.CSSProperties} href="/create-your-world" className="btn-primary group mt-6 !min-h-14 !rounded-[5px] sm:mt-9">
          Enter Paradise <Arrow />
        </Link>
      </div>
    </section>
  );
}
