"use client";

import { useState } from "react";

// A YouTube film that loads only when someone presses play, so the homepage
// stays fast and YouTube sets nothing until then (privacy-enhanced domain).
export function VideoFeature({ id, title, poster, autoPlay = false }: { id: string; title: string; poster?: string; autoPlay?: boolean }) {
  const [playing, setPlaying] = useState(autoPlay);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 grid place-items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail */}
          <img
            src={poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          <span className="relative grid size-20 place-items-center rounded-full bg-white/95 text-blue shadow-xl transition-transform duration-300 group-hover:scale-110 sm:size-24">
            <svg viewBox="0 0 24 24" className="ml-1 size-8 sm:size-9" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
