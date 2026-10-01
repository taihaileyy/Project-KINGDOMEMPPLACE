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

// Minimal pagination: a thin bar per slide, the active one longer.
export function RailDots({ count, active, goTo, label, names, tone = "ink" }: { count: number; active: number; goTo: (i: number) => void; label: string; names: string[]; tone?: "ink" | "white" }) {
  return (
    <div className="mt-2 flex items-center" role="group" aria-label={label}>
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
  );
}
