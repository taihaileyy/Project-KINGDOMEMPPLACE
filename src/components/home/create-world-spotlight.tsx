import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { GardenBackdrop } from "@/components/paradise/garden";

// The game: a dark, rayed garden landscape with one big button, ending in a soft
// cream wave that flows into the next section.
export function CreateWorldSpotlight() {
  return (
    <section aria-labelledby="cyw-title" className="relative isolate overflow-hidden bg-[#050a1c] text-white">
      <GardenBackdrop focus="middle" className="-z-10 scale-[1.04]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_30%,rgb(5_10_28/0.2),rgb(5_10_28/0.7))]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-30 [background:repeating-conic-gradient(from_-60deg_at_50%_105%,rgb(236_208_138/0.55)_0deg_2deg,transparent_2deg_9deg)] [mask-image:radial-gradient(70%_90%_at_50%_100%,#000,transparent)]"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-10 text-center sm:pb-32 sm:pt-20">
        <p data-reveal className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ecd08a] sm:text-sm">An interactive Bible journey</p>
        <h2 id="cyw-title" data-reveal="mask" className="mt-3 font-display text-[clamp(2.4rem,11vw,3.6rem)] font-medium uppercase leading-[1.02] tracking-[0.08em] sm:text-7xl">
          Create<br />Your World
        </h2>
        <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="mt-3 font-display text-[1.15rem] italic text-[#f1e3bd] sm:text-2xl">How well do you know the Word?</p>
        <Link data-reveal style={{ "--d": "200ms" } as React.CSSProperties} href="/create-your-world" className="btn-primary group mt-6 !min-h-14 !rounded-[5px] sm:mt-9">
          Enter Paradise <Arrow />
        </Link>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-12 w-full sm:h-20">
        <path d="M0 40 C 260 -8 520 10 760 40 C 1020 72 1240 70 1440 22 L1440 90 L0 90 Z" fill="#f5f0e6" />
        <path d="M0 40 C 260 -8 520 10 760 40 C 1020 72 1240 70 1440 22" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </section>
  );
}
