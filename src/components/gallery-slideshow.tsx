"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/content/site";

// An immersive slideshow: one photograph at a time, filling the screen. Swipe
// on a phone, use the arrows or the left and right keys, jump with the dots or
// the thumbnail strip, and turn autoplay on if you like (off by default, and it
// never starts for people who prefer reduced motion).
export function GallerySlideshow({ images }: { images: Img[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = images.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = scroller.current;
    if (!el) return;
    const k = (i + n) % n;
    el.scrollTo({ left: k * el.clientWidth, behavior: smooth && !reduced ? "smooth" : "auto" });
  }, [n, reduced]);

  // Which slide is showing, from the scroll position.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  // Keep the active thumbnail in view.
  useEffect(() => {
    const t = thumbs.current?.children[active] as HTMLElement | undefined;
    t?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  // Optional autoplay: every 5 seconds, paused while the tab is hidden.
  useEffect(() => {
    if (!auto || reduced) return;
    const id = window.setInterval(() => { if (!document.hidden) goTo(active + 1); }, 5000);
    return () => window.clearInterval(id);
  }, [auto, reduced, active, goTo]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
    if (e.key === "Home") { e.preventDefault(); goTo(0); }
    if (e.key === "End") { e.preventDefault(); goTo(n - 1); }
  };

  const arrow = "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-xl text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-black/70 sm:grid";

  return (
    <div className="bg-night text-white" role="region" aria-roledescription="carousel" aria-label="Photo gallery" onKeyDown={onKey}>
      <div className="relative">
        <ul
          ref={scroller}
          tabIndex={0}
          aria-label="Photos. Use the left and right arrow keys to move."
          className="flex h-[calc(100dvh-var(--header-h)-18rem)] min-h-[22rem] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] max-sm:h-[calc(100dvh-28rem)] max-sm:min-h-[15rem] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <li key={img.src} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} className="relative w-full shrink-0 snap-center">
              <Image src={img.src} alt={img.alt} fill sizes="100vw" priority={i === 0} className="object-contain" />
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous photo" className={`${arrow} left-4`}>←</button>
        <button type="button" onClick={() => goTo(active + 1)} aria-label="Next photo" className={`${arrow} right-4`}>→</button>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-6 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <p className="min-h-[2.75rem] flex-1 text-[15px] leading-snug text-white/85" aria-live="polite">{images[active]?.alt}</p>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm tabular-nums text-white/70">{active + 1} / {n}</span>
            {!reduced && (
              <button type="button" onClick={() => setAuto((a) => !a)} aria-pressed={auto} className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold hover:border-white">
                {auto ? "Pause" : "Autoplay"}
              </button>
            )}
          </div>
        </div>
        <ul ref={thumbs} className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Choose a photo">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`relative block h-14 w-20 overflow-hidden rounded ring-2 transition-opacity sm:h-16 sm:w-24 ${i === active ? "opacity-100 ring-white" : "opacity-55 ring-transparent hover:opacity-90"}`}
              >
                <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
