import Image from "next/image";
import type { Metadata } from "next";
import { FeaturedPlayer } from "@/components/media/featured-player";
import { WatchBrowser } from "@/components/media/watch-browser";
import { images, org } from "@/content/site";
import { COLLECTION, fetchMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Watch & Listen",
  description: "Teaching, conversations and short videos from Kingdom Empowerment Place.",
};

// Always read fresh, so new videos added in Admin appear right away.
export const dynamic = "force-dynamic";

export default async function WatchPage() {
  const all = await fetchMedia();
  const featured = all.find((m) => m.collections.includes(COLLECTION.featured)) ?? all.find((m) => m.collections.includes(COLLECTION.watch)) ?? all[0];
  const shorts = all.filter((m) => m.collections.includes(COLLECTION.shorts));
  const videos = all.filter((m) => m.collections.includes(COLLECTION.watch) && !shorts.includes(m) && m.id !== featured?.id);

  return (
    <div className="bg-night text-white">
      <section aria-labelledby="watch-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_80%_at_80%_20%,#101a3d_0%,#0a1024_55%,#05070d_100%)]" />
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 pb-8 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-electric">Kingdom Empowerment Place</p>
            <h1 id="watch-title" data-reveal="mask" className="mt-3 font-display text-[clamp(2.6rem,9vw,6rem)] font-medium leading-[0.98]">Watch &amp; Listen</h1>
            <p data-reveal className="mt-4 max-w-xl text-[15px] leading-relaxed text-chrome sm:text-lg">
              Teaching, conversations and short videos from Dr. Lawrence Morgan and the KEP family. Tap a video to play it here.
            </p>
          </div>
          <figure data-reveal="image" className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[var(--radius-card)] lg:mx-0 lg:justify-self-end">
            <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 30vw, 90vw" className="size-full object-cover object-top" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20">
        {all.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-white/15 p-8 text-chrome">Videos are on the way. In the meantime, you can follow KEP on social media.</p>
        ) : (
          <>
            {featured && (
              <section aria-labelledby="w-featured" className="mt-2">
                <h2 id="w-featured" className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-electric">Featured</h2>
                <FeaturedPlayer item={featured} />
              </section>
            )}
            <div className="mt-12">
              <WatchBrowser shorts={shorts} videos={videos} />
            </div>
          </>
        )}
        <p className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-6 text-sm text-chrome">
          Follow KEP:
          {org.social.filter((s) => s.href).map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">{s.label} ↗</a>
          ))}
        </p>
      </div>
    </div>
  );
}
