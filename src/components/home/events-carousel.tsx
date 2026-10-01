"use client";

import Image from "next/image";
import { RailDots, useSnapRail } from "@/components/home/use-snap-rail";
import type { Img } from "@/content/site";

type EventItem = { title: string; when: string; image: Img };

// Phone-only events: a native horizontal swipe with scroll-snap. One large
// flyer leads and the next peeks in from the right edge (~13%) so it's clear
// there is more. No autoplay, no arrows. The active event's title and date
// show beneath, with minimal pagination dots that also work as buttons.
export function EventsCarousel({ events }: { events: EventItem[] }) {
  const { ref: scroller, active, goTo } = useSnapRail<HTMLUListElement>();

  const current = events[active];

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Recent events">
      <ul
        ref={scroller}
        className="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((e, i) => (
          <li
            key={e.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${events.length}: ${e.title}`}
            className="w-[80%] shrink-0 snap-start last:mr-4"
          >
            <Image
              src={e.image.src}
              alt={e.image.alt}
              width={e.image.width}
              height={e.image.height}
              sizes="80vw"
              priority={i === 0}
              className="h-auto w-full"
            />
          </li>
        ))}
      </ul>

      <div className="mt-5 min-h-[4.25rem]" aria-live="polite">
        <p className="font-display text-[1.7rem] leading-tight">{current.title}</p>
        <p className="mt-1 text-[14px] text-muted">{current.when}</p>
      </div>

      <RailDots count={events.length} active={active} goTo={goTo} label="Choose an event" names={events.map((e, i) => `event ${i + 1}: ${e.title}`)} />
    </div>
  );
}
