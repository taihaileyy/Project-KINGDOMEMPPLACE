import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { GardenBackdrop } from "@/components/paradise/garden";

// The game, front and center: a tall cinematic card with the sunrise garden,
// one clear line and a big button.
export function CreateWorldSpotlight() {
  return (
    <section aria-labelledby="cyw-title" className="bg-ivory">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 sm:pb-16 sm:pt-4">
        <Link
          href="/create-your-world"
          className="group relative isolate flex min-h-[26rem] items-end overflow-hidden rounded-[var(--radius-card)] bg-[#050a1c] p-6 text-white sm:min-h-[26rem] sm:items-center sm:p-12 lg:min-h-[30rem]"
        >
          <GardenBackdrop focus="middle" className="-z-10 scale-[1.02] transition-transform duration-[1600ms] ease-out group-hover:scale-110" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(5_8_24/0.92)_0%,rgb(5_8_24/0.55)_50%,rgb(5_8_24/0.05)_100%)] sm:bg-[linear-gradient(90deg,rgb(5_8_24/0.9)_0%,rgb(5_8_24/0.5)_52%,transparent_100%)]" />
          <div className="max-w-md">
            <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ecd08a]">Interactive Bible journey</p>
            <h2 id="cyw-title" className="mt-4 font-display text-[clamp(2.6rem,10vw,5.2rem)] font-medium uppercase leading-[1] tracking-[0.1em]">
              Create Your World
            </h2>
            <p className="mt-3 font-display text-xl italic text-[#ecd08a] sm:text-2xl">Test your knowledge. Learn the Word. Continue the journey.</p>
            <span className="btn-primary mt-6 sm:mt-8">
              Play the game <Arrow />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
