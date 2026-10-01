"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Shared by the phone swipe rails (events, programs): tracks which slide is
// at the left snap position and scrolls to one on request.
export function useSnapRail<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
      setActive(items.length - 1); // the last slide can't snap to the start
      return;
    }
    const target = el.scrollLeft + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, i) => {
      const dist = Math.abs(it.offsetLeft - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = ref.current;
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
    const el = ref.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: item.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
  }

  return { ref, active, goTo };
}

// Minimal pagination: a thin bar per slide, the active one longer. On wide
// screens `arrows` adds previous/next buttons for mouse users.
export function RailDots({ count, active, goTo, label, names, tone = "ink", arrows = false }: { count: number; active: number; goTo: (i: number) => void; label: string; names: string[]; tone?: "ink" | "white"; arrows?: boolean }) {
  const btn = "hidden size-11 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink lg:grid";
  return (
    <div className="mt-2 flex items-center justify-between" role="group" aria-label={label}>
      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Show ${names[i]}`} aria-current={i === active ? "true" : undefined} className="grid h-9 w-7 place-items-center">
            <span
              className={`block h-[3px] rounded-full transition-all duration-300 ${
                i === active ? (tone === "ink" ? "w-6 bg-ink" : "w-6 bg-white") : tone === "ink" ? "w-2.5 bg-ink/25" : "w-2.5 bg-white/30"
              }`}
            />
          </button>
        ))}
      </div>
      {arrows && (
        <div className="flex gap-2">
          <button type="button" className={btn} disabled={active <= 0} onClick={() => goTo(Math.max(0, active - 1))} aria-label="Previous">
            <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M0 6h22M17 1l5 5-5 5" /></svg>
          </button>
          <button type="button" className={btn} disabled={active >= count - 1} onClick={() => goTo(Math.min(count - 1, active + 1))} aria-label="Next">
            <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M0 6h22M17 1l5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
