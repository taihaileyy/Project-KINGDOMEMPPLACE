"use client";

import { useState } from "react";
import { facebookPluginUrl, isDirectFile, isFacebookUrl, posterFor, sourceLabel, youTubeId, type MediaItem } from "@/lib/media";

// Plays one library item, whatever its source. Nothing loads from YouTube or
// Facebook until the viewer presses play, so pages stay fast and private.
// Landscape items are 16:9; vertical (short-form) items are 9:16.
export function MediaPlayer({ item, autoPlay = false, fill = false }: { item: MediaItem; autoPlay?: boolean; fill?: boolean }) {
  const [playing, setPlaying] = useState(autoPlay);
  const poster = posterFor(item);
  const vertical = item.orientation === "vertical";
  const yt = item.source === "youtube" ? youTubeId(item.embed_url || item.url) : null;
  const fb = item.source === "facebook" || isFacebookUrl(item.url);
  const direct = item.kind === "audio" || item.source === "upload" || isDirectFile(item.url);
  const frame = "absolute inset-0 size-full border-0";

  const box = fill
    ? "relative size-full overflow-hidden bg-black"
    : `relative overflow-hidden bg-black shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 ${vertical ? "mx-auto aspect-[9/16] max-h-[78dvh]" : "aspect-video w-full"}`;

  if (item.kind === "audio" && playing) {
    return (
      <div className="rounded-md bg-night p-4 text-white">
        <p className="mb-2 text-sm font-semibold">{item.title}</p>
        <audio controls autoPlay src={item.url} className="w-full">
          {item.captions_url && <track kind="captions" src={item.captions_url} default />}
        </audio>
      </div>
    );
  }

  return (
    <div className={box}>
      {playing ? (
        yt ? (
          <iframe
            title={item.title}
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=1`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className={frame}
          />
        ) : fb ? (
          <iframe
            title={item.title}
            src={facebookPluginUrl(item)}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className={frame}
          />
        ) : direct ? (
          <video src={item.url} poster={poster ?? undefined} controls autoPlay playsInline className={`${frame} object-contain`} aria-label={item.title}>
            {item.captions_url && <track kind="captions" src={item.captions_url} default />}
          </video>
        ) : (
          <iframe title={item.title} src={item.embed_url || item.url} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className={frame} />
        )
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play: ${item.title}`} className="group absolute inset-0 grid place-items-center text-white">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- a video thumbnail from any source
            <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_30%,#1f33b8_0%,#0a1024_60%,#05070d_100%)]" />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <span className="relative grid size-16 place-items-center rounded-full bg-white/95 text-blue shadow-xl transition-transform group-hover:scale-110 sm:size-20">
            <svg viewBox="0 0 24 24" className="ml-1 size-7 sm:size-8" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg>
          </span>
          {!poster && !fill && <span className="absolute bottom-3 left-3 right-3 text-left text-sm font-semibold leading-tight [text-shadow:0_1px_8px_rgb(0_0_0/0.8)]">{item.title}<span className="mt-0.5 block text-xs font-normal text-white/70">{sourceLabel[item.source]}</span></span>}
        </button>
      )}
    </div>
  );
}

// Under a player: where the video lives, and the transcript when there is one.
export function MediaDetails({ item }: { item: MediaItem }) {
  return (
    <div className="mt-4 text-white">
      <h3 className="font-display text-2xl font-medium leading-tight">{item.title}</h3>
      {item.description && <p className="mt-1.5 text-[15px] leading-relaxed text-white/75">{item.description}</p>}
      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-electric hover:underline">
          Open on {sourceLabel[item.source] === "Video" ? "its site" : sourceLabel[item.source]} ↗
        </a>
      </p>
      {item.transcript && (
        <details className="mt-4 rounded-md border border-white/15 p-3">
          <summary className="cursor-pointer text-sm font-semibold">Transcript</summary>
          <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-white/80">{item.transcript}</p>
        </details>
      )}
    </div>
  );
}
