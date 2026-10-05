"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Arrow } from "@/components/arrow";
import { EventCard } from "@/components/home/event-card";
import { RailDots, useSnapRail } from "@/components/home/use-snap-rail";
import { useSchedule } from "@/components/schedule-provider";
import { events } from "@/content/site";
import { upcomingItems } from "@/lib/events";

// UPCOMING AT KEP: only events that have not happened yet, plus the next Bible
// Study. A swipeable row on every screen size: about 1.2 cards on a phone, 2 on
// a tablet and 3 on a desktop. Past events live in the Events archive.
export function Upcoming() {
  const schedule = useSchedule();
  const items = useMemo(() => upcomingItems(events, schedule), [schedule]);
  const { ref, active, goTo } = useSnapRail<HTMLUListElement>();

  return (
    <section id="upcoming" aria-labelledby="upcoming-title" className="scroll-mt-20 border-y border-ink/10 bg-surface">
      <div className="wrap section-y">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div>
            <p data-reveal className="eyebrow text-blue">What&rsquo;s happening</p>
            <h2 id="upcoming-title" data-reveal="mask" className="heading-2 mt-3">Upcoming at KEP</h2>
          </div>
          <Link data-reveal href="/events" className="btn-quiet group text-ink">All events <Arrow /></Link>
        </div>
        <div className="mt-7 sm:mt-10" role="region" aria-roledescription="carousel" aria-label="Upcoming events">
          <ul
            ref={ref}
            tabIndex={0}
            aria-label="Upcoming events. Use the left and right arrow keys to scroll."
            className="-mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:gap-5 sm:scroll-pl-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {items.length === 0 && (
              <li className="w-full shrink-0">
                <div className="rounded-[var(--radius-card)] border border-line bg-paper p-8 shadow-[var(--shadow-card)]">
                  <p className="font-display text-3xl">Bible Study every Wednesday, 6:30 PM</p>
                  <p className="mt-2 text-muted">New events are posted here as soon as they are scheduled.</p>
                  <Link href="/church#bible-study" className="btn-quiet group mt-3 text-blue">Plan your visit <Arrow /></Link>
                </div>
              </li>
            )}
            {items.map((it, i) => (
              <li key={it.key} className="w-[82%] shrink-0 snap-start last:mr-4 sm:w-[calc((100%-1.25rem)/2)] sm:last:mr-0 lg:w-[calc((100%-2.5rem)/3)]">
                <EventCard item={it} priority={i === 0} />
              </li>
            ))}
          </ul>
          {items.length > 1 && <RailDots arrows count={items.length} active={active} goTo={goTo} label="Choose an event" names={items.map((i) => i.title)} />}
        </div>
      </div>
    </section>
  );
}
