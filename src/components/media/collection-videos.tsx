"use client";

import { useEffect, useState } from "react";
import { MediaRail } from "@/components/media/media-rail";
import { fetchMedia, type MediaItem } from "@/lib/media";

// Videos from the library (Admin > Videos) that were tagged for a place: one
// program, one event, or any event. Shows nothing at all until a video has been
// added, so pages never display an empty "videos" box.
export function CollectionVideos({ collection, prefix, title, lead }: { collection?: string; prefix?: string; title: string; lead?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    let live = true;
    fetchMedia(collection).then((all) => {
      if (!live) return;
      setItems(all.filter((m) => (collection ? m.collections.includes(collection) : true) && (prefix ? m.collections.some((c) => c.startsWith(prefix)) : true)));
    });
    return () => { live = false; };
  }, [collection, prefix]);

  if (items.length === 0) return null;
  const id = `cv-${(collection ?? prefix ?? "all").replace(/[^a-z0-9]/gi, "-")}`;
  return (
    <section aria-labelledby={id} className="bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 id={id} className="font-display text-[2rem] font-medium leading-tight sm:text-5xl">{title}</h2>
        {lead && <p className="mt-2 max-w-xl text-[15px] text-chrome">{lead}</p>}
        <div className="mt-6"><MediaRail items={items} label={title} tone="white" /></div>
      </div>
    </section>
  );
}
