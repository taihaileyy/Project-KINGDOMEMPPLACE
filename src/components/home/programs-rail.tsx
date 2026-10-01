"use client";

import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { RailDots, useSnapRail } from "@/components/home/use-snap-rail";
import type { Img } from "@/content/site";

type Item = { href: string; name: string; summary: string; image: Img };

// Phone-only programs: swipe through photo cards, with the next card peeking
// in from the right (~15%) to show there is more. Details live on each
// program's page.
export function ProgramsRail({ items }: { items: Item[] }) {
  const { ref, active, goTo } = useSnapRail<HTMLUListElement>();

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Programs">
      <ul
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 pb-1 sm:gap-4 lg:mx-0 lg:scroll-pl-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li key={it.href} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}: ${it.name}`} className="w-[80%] shrink-0 snap-start last:mr-4 sm:w-[44%] lg:w-[31.5%] xl:w-[23.5%]">
            <Link href={it.href} className="group relative block aspect-[4/5] overflow-hidden bg-night">
              <Image src={it.image.src} alt={it.image.alt} fill sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 44vw, 80vw" className="object-cover transition-transform duration-700 group-active:scale-[1.03]" />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(5_7_13/0.92)_0%,rgb(5_7_13/0.55)_38%,transparent_70%)]" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                <span>
                  <span className="block font-display text-[1.75rem] leading-[1.05]">{it.name}</span>
                  <span className="mt-2 line-clamp-3 block text-[14px] leading-snug text-white/80">{it.summary}</span>
                </span>
                <Arrow className="shrink-0" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <RailDots arrows count={items.length} active={active} goTo={goTo} label="Choose a program" names={items.map((it) => it.name)} />
      <Link href="/programs" className="btn-quiet group mt-3 text-ink">
        View all programs <Arrow />
      </Link>
    </div>
  );
}
