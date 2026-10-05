"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/arrow";
import { MediaPlayer } from "@/components/media/media-player";
import { COLLECTION, fetchMedia, type MediaItem } from "@/lib/media";

// One featured message from the library (Admin > Videos): a large thumbnail,
// its title and two actions. Everything else lives on the Watch page. Renders
// nothing until a playable featured video exists.
export function HomeWatch() {
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  useEffect(() => {
    let live = true;
    fetchMedia().then((items) => {
      if (!live) return;
      const playable = items.filter((m) => m.source !== "facebook" && m.orientation !== "vertical");
      setFeatured(playable.find((m) => m.collections.includes(COLLECTION.featured)) ?? playable[0] ?? null);
    });
    return () => { live = false; };
  }, []);

  if (!featured) return null;
  return (
    <section aria-labelledby="watch-title" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_0%,#101a52_0%,#0a1024_55%,#05070d_100%)]" />
      <div className="mx-auto max-w-7xl px-6 py-9 sm:py-16">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.24em] text-[#5c6bff] sm:text-sm">Watch &amp; Listen</p>
        <div className="mt-4 grid items-center gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <MediaPlayer item={featured} />
          <div>
            <h2 id="watch-title" className="font-display text-[1.7rem] leading-tight sm:text-5xl">{featured.title}</h2>
            <p className="mt-2 text-[0.95rem] leading-snug text-white/80 sm:mt-4 sm:text-lg">
              {featured.description || "A conversation from Kingdom Empowerment Place."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-7">
              <Link href={`/watch?v=${featured.id}`} className="btn-primary group !min-h-12 !rounded-[5px]">Watch now <Arrow /></Link>
              <Link href="/watch" className="btn-quiet group text-white">View all messages <Arrow /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
