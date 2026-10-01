import type { Metadata } from "next";
import { GameStage } from "@/components/paradise/game-stage";
import { ParadiseGame } from "@/components/paradise/paradise-game";

export const metadata: Metadata = {
  title: "Paradise",
  description: "Paradise is an interactive Bible experience from Kingdom Empowerment Place: journey through Scripture, test your knowledge and learn as you progress.",
};

export default function ParadisePage() {
  return (
    <>
      <section aria-labelledby="paradise-title" className="relative isolate overflow-hidden bg-night text-white">
        {/* The garden: a quiet glow and the tree of life behind the title. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_50%_0%,#101a3d_0%,#0a1024_50%,#05070d_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[28rem] animate-[drift_20s_ease-in-out_infinite_alternate] bg-[radial-gradient(40%_60%_at_50%_0%,rgb(92_107_255/0.28)_0%,transparent_70%),repeating-conic-gradient(from 270deg_at_50%_-10%,rgb(197_202_211/0.07)_0deg_2deg,transparent_2deg_14deg)] [mask-image:linear-gradient(180deg,#000,transparent)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-night to-transparent" />

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <h1
            id="paradise-title"
            data-reveal="mask"
            className="font-display text-[clamp(2.75rem,11vw,7.5rem)] font-medium uppercase leading-none tracking-[0.14em] sm:tracking-[0.2em]"
          >
            Paradise
          </h1>
          <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="mt-5 text-[12px] font-semibold uppercase tracking-[0.28em] text-electric sm:text-sm">
            An Interactive Bible Experience
          </p>
          <p data-reveal style={{ "--d": "220ms" } as React.CSSProperties} className="mx-auto mt-6 max-w-2xl font-display text-[1.45rem] italic leading-snug text-white/90 sm:mt-8 sm:text-3xl">
            &ldquo;Journey through Scripture. Test your knowledge. Learn as you progress.&rdquo;
          </p>

          <div data-reveal style={{ "--d": "320ms" } as React.CSSProperties} className="mt-10 sm:mt-14">
            <GameStage>
              <ParadiseGame />
            </GameStage>
          </div>

          <p data-reveal className="mx-auto mt-8 max-w-xl text-[13px] leading-relaxed text-chrome sm:text-sm">
            &ldquo;And out of the ground made the Lord God to grow every tree that is pleasant to the sight, and good for food; the tree of life also in the midst of the garden.&rdquo;
            <span className="mt-1 block tracking-[0.04em]">Genesis 2:9</span>
          </p>
        </div>
      </section>
    </>
  );
}
