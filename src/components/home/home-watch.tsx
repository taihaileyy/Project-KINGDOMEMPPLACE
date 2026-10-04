"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/arrow";
import { MediaRail } from "@/components/media/media-rail";
import { MediaPlayer } from "@/components/media/media-player";
import { images } from "@/content/site";
import { COLLECTION, fetchMedia, type MediaItem } from "@/lib/media";

// Watch & Listen on the homepage: Mr. and Mrs. Morgan, the featured video and a
// swipeable row of shorts and videos from the library (Admin > Videos). The
// photo and the link show right away; the videos fill in as they load.
export function HomeWatch() {
  const [items, setItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    let live = true;
    fetchMedia().then((m) => { if (live) setItems(m); });
    return () => { live = false; };
  }, []);

  const featured = items.find((m) => m.collections.includes(COLLECTION.featured)) ?? items[0];
  const rest = items.filter((m) => m.id !== featured?.id && (m.collections.includes(COLLECTION.shorts) || m.collections.includes(COLLECTION.watch)));
  const playable = featured && featured.source !== "facebook";

  return (
    <section aria-labelledby="home-watch-title" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_0%,#101a52_0%,#0a1024_55%,#05070d_100%)]" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <figure data-reveal="image" className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] lg:aspect-[4/5]">
            <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 38vw, 100vw" className="size-full object-cover object-top" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-electric">Watch &amp; Listen</p>
              <h2 id="home-watch-title" className="mt-1 font-display text-[2.2rem] font-medium leading-[1] sm:text-5xl">Hear it from the pulpit</h2>
              <p className="mt-2 text-[15px] leading-snug text-white/80">Teaching and conversations with Dr. Lawrence and Lady Kennetta Morgan.</p>
            </figcaption>
          </figure>
          <div>
            {playable ? (
              <div data-reveal>
                <MediaPlayer item={featured} />
                <p className="mt-3 font-display text-2xl leading-tight">{featured.title}</p>
              </div>
            ) : (
              <p className="text-chrome">New videos are coming soon.</p>
            )}
            <Link href="/watch" className="btn-quiet group mt-5 text-white">
              Watch &amp; Listen <Arrow />
            </Link>
          </div>
        </div>
        {rest.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <MediaRail items={rest} label="More from KEP" tone="white" />
          </div>
        )}
      </div>
    </section>
  );
}
