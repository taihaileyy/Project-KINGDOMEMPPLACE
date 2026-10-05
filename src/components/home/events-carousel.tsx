"use client";

import { FlyerImage } from "@/components/flyer-image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Arrow } from "@/components/arrow";
import { RailDots, useSnapRail } from "@/components/home/use-snap-rail";
import { useEffect, useState } from "react";
import { eventDate, eventTime, fetchEvents, isUpcoming } from "@/lib/catalog";
import { images, type PastEvent } from "@/content/site";

// Event cards in a native horizontal swipe with scroll-snap. On phones one card
// leads and the next peeks in from the right (~20%) so it's clear there is more;
// from tablet width two and then three cards show. Pagination dots below.
export function EventsCarousel({ events: initial }: { events: PastEvent[] }) {
  const { ref, active, goTo } = useSnapRail<HTMLUListElement>();
  // Starts with the built-in list, then shows the live list from the database:
  // upcoming events first (soonest first), then recent ones.
  const [events, setEvents] = useState<PastEvent[]>(initial);
  useEffect(() => {
    let live = true;
    fetchEvents().then((rows) => {
      if (!live) return;
      const withImage = rows.filter((e) => e.starts_at);
      if (withImage.length === 0) return;
      const now = new Date();
      const up = withImage.filter((e) => isUpcoming(e, now)).sort((a, b) => a.starts_at!.localeCompare(b.starts_at!));
      const past = withImage.filter((e) => !isUpcoming(e, now));
      setEvents([...up, ...past].map((e) => ({ title: e.title, when: eventDate(e), time: eventTime(e) || undefined, place: e.location ?? undefined, image: e.image ?? images.heroPoster })));
    });
    return () => { live = false; };
  }, []);
  const meta = "flex items-center gap-2 text-[13.5px] text-muted";
  return (
    <div role="region" aria-roledescription="carousel" aria-label="Upcoming events">
      <ul
        ref={ref}
        tabIndex={0}
        aria-label="Events. Use the left and right arrow keys to scroll."
        className="-mx-6 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-pl-6 px-6 pb-1 sm:mx-0 sm:gap-5 sm:scroll-pl-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((e, i) => (
          <li
            key={e.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${events.length}: ${e.title}`}
            className="w-[80%] shrink-0 snap-start last:mr-6 sm:w-[calc((100%-1.25rem)/2)] sm:last:mr-0 lg:w-[calc((100%-2.5rem)/3)]"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink/12 bg-white/70 shadow-[0_18px_40px_-30px_rgb(5_7_13/0.6)]">
              <FlyerImage image={e.image} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 80vw" priority={i === 0} className="h-auto w-full" />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-[1.45rem] leading-tight">{e.title}</h3>
                <p className={`${meta} mt-2`}><CalendarDays aria-hidden="true" className="size-4 text-blue" strokeWidth={1.6} />{e.when}</p>
                {e.time && <p className={`${meta} mt-1`}><Clock aria-hidden="true" className="size-4 text-blue" strokeWidth={1.6} />{e.time}</p>}
                {e.place && <p className={`${meta} mt-1`}><MapPin aria-hidden="true" className="size-4 text-blue" strokeWidth={1.6} />{e.place}</p>}
                <Link href="/events" className="btn-quiet group mt-auto pt-3 !min-h-11 text-ink">View Event <Arrow /></Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="mt-2 lg:hidden">
        <RailDots count={events.length} active={active} goTo={goTo} label="Choose an event" names={events.map((e) => e.title)} />
      </div>
    </div>
  );
}
