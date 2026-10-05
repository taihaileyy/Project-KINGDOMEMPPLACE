import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { GardenBackdrop } from "@/components/paradise/garden";

// A full-width, mysterious banner for the game. Deliberately unlike the rest of
// the page: gold on deep navy, a glowing garden and a single "enter" button.
export function CreateWorldSpotlight() {
  return (
    <section aria-labelledby="cyw-title" className="relative isolate overflow-hidden bg-[#050a1c] text-white">
      <GardenBackdrop focus="middle" className="-z-10 scale-[1.04]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_50%,rgb(5_8_24/0.35)_0%,rgb(5_8_24/0.85)_100%)]" />
      <div className="wrap section-y flex min-h-[22rem] flex-col items-center justify-center text-center sm:min-h-[26rem]">
        <p data-reveal className="eyebrow text-[#ecd08a]">An interactive Bible journey</p>
        <h2 id="cyw-title" data-reveal="mask" className="mt-4 font-display text-[clamp(2.6rem,10vw,6rem)] font-medium uppercase leading-[1] tracking-[0.1em]">
          Create Your World
        </h2>
        <p data-reveal style={{ "--d": "150ms" } as React.CSSProperties} className="mt-4 font-display text-xl italic text-[#ecd08a] sm:text-3xl">
          How well do you know the Word?
        </p>
        <div data-reveal style={{ "--d": "250ms" } as React.CSSProperties} className="mt-8">
          <Link href="/create-your-world" className="btn-primary group">
            Enter Paradise <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
