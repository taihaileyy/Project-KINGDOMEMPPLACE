"use client";

import { useState } from "react";
import { MediaRail } from "@/components/media/media-rail";
import type { MediaItem } from "@/lib/media";

// Watch & Listen's library: filter chips, then swipeable rails.
export function WatchBrowser({ shorts, videos }: { shorts: MediaItem[]; videos: MediaItem[] }) {
  const [tab, setTab] = useState<"all" | "shorts" | "videos">("all");
  const chips: { id: typeof tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: shorts.length + videos.length },
    { id: "shorts", label: "Shorts", count: shorts.length },
    { id: "videos", label: "Videos", count: videos.length },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Filter" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {chips.filter((c) => c.id === "all" || c.count > 0).map((c) => (
          <button key={c.id} role="tab" aria-selected={tab === c.id} onClick={() => setTab(c.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${tab === c.id ? "border-white bg-white text-ink" : "border-white/25 text-white/80 hover:border-white/60"}`}>
            {c.label} <span className="opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      {(tab === "all" || tab === "shorts") && shorts.length > 0 && (
        <section className="mt-8" aria-labelledby="w-shorts">
          <h2 id="w-shorts" className="mb-4 font-display text-3xl font-medium">Shorts</h2>
          <MediaRail items={shorts} label="Short videos" tone="white" />
        </section>
      )}
      {(tab === "all" || tab === "videos") && videos.length > 0 && (
        <section className="mt-10" aria-labelledby="w-videos">
          <h2 id="w-videos" className="mb-4 font-display text-3xl font-medium">Videos</h2>
          <MediaRail items={videos} label="Videos" tone="white" />
        </section>
      )}
    </div>
  );
}
