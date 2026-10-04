"use client";

import { useState } from "react";
import { MediaViewer } from "@/components/media/media-viewer";
import { RailDots, useSnapRail } from "@/components/home/use-snap-rail";
import { posterFor, sourceLabel, type MediaItem } from "@/lib/media";

// A poster card: opens the viewer. Vertical items are tall (9:16).
export function MediaCard({ item, onOpen, priority = false }: { item: MediaItem; onOpen: () => void; priority?: boolean }) {
  const poster = posterFor(item);
  const vertical = item.orientation === "vertical";
  const out = item.source === "facebook";
  const Tag = out ? "a" : "button";
  const props = out ? { href: item.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `Watch on Facebook: ${item.title}` } : { type: "button" as const, onClick: onOpen, "aria-label": `Play: ${item.title}` };
  return (
    <Tag {...props} className="group relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-night text-left text-white ring-1 ring-white/10">
      <div className={`relative ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- a video thumbnail from any source
          <img src={poster} alt="" loading={priority ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_25%,#1f33b8_0%,#0a1024_60%,#05070d_100%)]" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25" />
        <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ring-white/20">{vertical ? "Short" : sourceLabel[item.source]}</span>
        <span aria-hidden="true" className={`absolute left-1/2 top-[38%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue transition-transform group-hover:scale-110 ${out ? "hidden" : ""}`}>
          <svg viewBox="0 0 24 24" className="ml-0.5 size-6" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg>
        </span>
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block font-display text-xl leading-tight [text-shadow:0_1px_10px_rgb(0_0_0/0.7)]">{item.title}</span>
          {out ? <span className="mt-1.5 block text-[13px] font-semibold text-white/80">Watch on Facebook ↗</span> : item.description && !vertical && <span className="mt-1 line-clamp-2 block text-[13px] text-white/75">{item.description}</span>}
        </span>
      </div>
    </Tag>
  );
}

// A swipeable row of cards (phone: next card peeks; desktop: arrows) that opens the viewer.
export function MediaRail({ items, label, tone = "ink" }: { items: MediaItem[]; label: string; tone?: "ink" | "white" }) {
  const { ref, active, goTo } = useSnapRail<HTMLUListElement>();
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;
  const vertical = items[0].orientation === "vertical";
  const width = vertical ? "w-[46%] sm:w-[30%] lg:w-[19%]" : "w-[82%] sm:w-[48%] lg:w-[32%]";
  // The viewer plays the tapped item and, for shorts, the rest of the same kind as a feed.
  const queue = items.filter((i) => i.source !== "facebook" && i.orientation === items.find((x) => x.id === open)?.orientation);
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 pb-1 [scrollbar-width:none] sm:gap-4 lg:mx-0 lg:scroll-pl-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => (
          <li key={it.id} className={`${width} shrink-0 snap-start last:mr-4 lg:last:mr-0`} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}: ${it.title}`}>
            <MediaCard item={it} onOpen={() => setOpen(it.id)} />
          </li>
        ))}
      </ul>
      {items.length > 1 && <RailDots arrows count={items.length} active={active} goTo={goTo} label={`Choose a video in ${label}`} names={items.map((i) => i.title)} tone={tone} />}
      {open && <MediaViewer items={queue.length ? queue : items} startId={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
