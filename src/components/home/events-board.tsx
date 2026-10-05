"use client";

import Image from "next/image";
import { useMemo } from "react";
import { EventCard } from "@/components/home/event-card";
import { useSchedule } from "@/components/schedule-provider";
import { events } from "@/content/site";
import { pastEvents, upcomingItems } from "@/lib/events";

// The Events page body: UPCOMING first, then PAST as an archive. The split is
// computed in the browser from today's date, so nothing goes stale.
export function EventsBoard() {
  const schedule = useSchedule();
  const upcoming = useMemo(() => upcomingItems(events, schedule), [schedule]);
  const past = useMemo(() => pastEvents(events), []);
  return (
    <>
      <section id="upcoming" aria-labelledby="up-title" className="scroll-mt-20">
        <div className="wrap section-y">
          <p className="eyebrow text-blue">Mark your calendar</p>
          <h2 id="up-title" className="heading-2 mt-3">Upcoming events</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((it) => (
              <li key={it.key}><EventCard item={it} /></li>
            ))}
          </ul>
        </div>
      </section>
      {past.length > 0 && (
        <section id="past" aria-labelledby="past-title" className="scroll-mt-20 border-t border-ink/10 bg-surface">
          <div className="wrap section-y">
            <p className="eyebrow text-blue">The archive</p>
            <h2 id="past-title" className="heading-2 mt-3">Past events</h2>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {past.map((e) => (
                <li key={e.slug} id={e.slug} className="scroll-mt-24">
                  <Image src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-[3/4] w-full rounded-[var(--radius-card)] object-cover object-top grayscale-[35%]" />
                  <p className="mt-3 font-display text-xl leading-tight">{e.title}</p>
                  <p className="text-sm text-muted">{e.when}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
