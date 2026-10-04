"use client";

import { useEffect, useState } from "react";
import { MediaPlayer } from "@/components/media/media-player";
import { COLLECTION, fetchMedia, type MediaItem } from "@/lib/media";

// The homepage shows just the featured video from the library (Admin > Videos).
// Everything else lives on the Watch page. Renders nothing until a playable
// featured video exists.
export function HomeWatch() {
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  useEffect(() => {
    let live = true;
    fetchMedia().then((items) => {
      if (!live) return;
      const playable = items.filter((m) => m.source !== "facebook");
      setFeatured(playable.find((m) => m.collections.includes(COLLECTION.featured)) ?? playable[0] ?? null);
    });
    return () => { live = false; };
  }, []);

  if (!featured) return null;
  return (
    <section aria-label="Featured video" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_0%,#101a52_0%,#0a1024_55%,#05070d_100%)]" />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <MediaPlayer item={featured} />
        <p className="mt-3 font-display text-2xl leading-tight">{featured.title}</p>
      </div>
    </section>
  );
}
