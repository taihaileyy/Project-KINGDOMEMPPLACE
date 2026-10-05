"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/arrow";
import { MediaPlayer } from "@/components/media/media-player";
import { org } from "@/content/site";
import { COLLECTION, fetchMedia, type MediaItem } from "@/lib/media";

const youtube = org.social.find((s) => s.icon === "youtube")?.href ?? "/watch";

// One featured message from the library (Admin > Videos), with a way to see the
// rest on /watch. Falls back to a branded card until a playable video exists.
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

  return (
    <section aria-labelledby="watch-title" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_0%,#101a52_0%,#0a1024_55%,#05070d_100%)]" />
      <div className="wrap section-y">
        <p data-reveal className="eyebrow text-electric">Watch &amp; listen</p>
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
          <div data-reveal="image">
            {featured ? (
              <MediaPlayer item={featured} />
            ) : (
              <a href={youtube} target="_blank" rel="noopener noreferrer" className="group relative grid aspect-video place-items-center overflow-hidden bg-[radial-gradient(80%_80%_at_50%_25%,#1f33b8_0%,#0a1024_60%,#05070d_100%)] ring-1 ring-white/10">
                <span className="grid size-16 place-items-center rounded-full bg-white/95 text-blue transition-transform group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg>
                </span>
                <span className="sr-only">Watch on YouTube</span>
              </a>
            )}
          </div>
          <div>
            <h2 id="watch-title" data-reveal="mask" className="heading-2">{featured ? featured.title : "Messages from KEP"}</h2>
            <p data-reveal style={{ "--d": "150ms" } as React.CSSProperties} className="mt-4 max-w-md text-[15.5px] leading-relaxed text-white/75 sm:text-lg">
              {featured?.description || "Watch the latest message, or catch up on teaching from Dr. Morgan any time."}
            </p>
            <div data-reveal style={{ "--d": "250ms" } as React.CSSProperties} className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
              {featured ? (
                <Link href={`/watch?v=${featured.id}`} className="btn-primary group">Watch now <Arrow /></Link>
              ) : (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="btn-primary group">Watch now <Arrow /></a>
              )}
              <Link href="/watch" className="btn-quiet group text-white">View all messages <Arrow /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
