"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/content/site";

type EventItem = { title: string; when: string; image: Img };

// Phone-only events: a native horizontal swipe with scroll-snap. One large
// flyer leads and the next peeks in from the right edge (~13%) so it's clear
// there is more. No autoplay, no arrows. The active event's title and date
// show beneath, with minimal pagination dots that also work as buttons.
export function EventsCarousel({ events }: { events: EventItem[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
      setActive(items.length - 1); // the last flyer can't snap to the start
      return;
    }
    // The flyer whose left edge is nearest the snap position is the active one.
    const target = el.scrollLeft + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - target);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [update]);

  function goTo(i: number) {
    const el = scroller.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: item.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
  }

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

      <div className="mt-2 flex items-center" role="group" aria-label="Choose an event">
        {events.map((e, i) => (
          <button
            key={e.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show event ${i + 1}: ${e.title}`}
            aria-current={i === active ? "true" : undefined}
            className="grid h-9 w-7 place-items-center"
          >
            <span
              className={`block h-[3px] rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-ink" : "w-2.5 bg-ink/25"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
