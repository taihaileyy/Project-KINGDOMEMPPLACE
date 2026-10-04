"use client";

import { useEffect, useRef } from "react";
import { MediaDetails, MediaPlayer } from "@/components/media/media-player";
import type { MediaItem } from "@/lib/media";

// A full-screen viewer. Landscape items open in a centered player; vertical
// (short-form) items open in a feed you swipe up and down, one video per
// screen. Built on <dialog>, so Esc closes it and focus stays inside.
export function MediaViewer({ items, startId, onClose }: { items: MediaItem[]; startId: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const feedRef = useRef<HTMLUListElement>(null);
  const start = items.find((i) => i.id === startId) ?? items[0];
  const vertical = start.orientation === "vertical";

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Jump the feed to the video that was tapped.
  useEffect(() => {
    if (!vertical) return;
    const li = feedRef.current?.querySelector<HTMLElement>(`[data-id="${startId}"]`);
    li?.scrollIntoView({ block: "start" });
  }, [vertical, startId]);

  const step = (dir: 1 | -1) => {
    const feed = feedRef.current;
    if (feed) feed.scrollBy({ top: dir * feed.clientHeight, behavior: "smooth" });
  };

  return (
    <dialog
      ref={ref}
      aria-label={vertical ? "Short videos" : start.title}
      onClose={onClose}
      onKeyDown={(e) => { if (vertical && e.key === "ArrowDown") { e.preventDefault(); step(1); } if (vertical && e.key === "ArrowUp") { e.preventDefault(); step(-1); } }}
      className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-black/95 p-0 text-white backdrop:bg-black"
    >
      <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 grid size-11 place-items-center rounded-full bg-black/60 text-xl ring-1 ring-white/25 hover:bg-black">
        ✕
      </button>

      {vertical ? (
        <>
          <ul ref={feedRef} className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((it) => (
              <li key={it.id} data-id={it.id} className="grid h-dvh snap-start place-items-center px-3 pb-6 pt-16">
                <div className="flex h-full max-h-[calc(100dvh-5.5rem)] w-full max-w-[26rem] flex-col">
                  <div className="min-h-0 flex-1 [&>div]:mx-auto [&>div]:h-full [&>div]:max-h-full">
                    <MediaPlayer item={it} fill />
                  </div>
                  <div className="mt-3 shrink-0">
                    <p className="font-display text-xl leading-tight">{it.title}</p>
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-electric hover:underline">Open original ↗</a>
                    {it.transcript && (
                      <details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold">Transcript</summary><p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line text-white/80">{it.transcript}</p></details>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-y-0 right-3 z-10 hidden flex-col items-center justify-center gap-3 sm:flex">
            <button type="button" onClick={() => step(-1)} aria-label="Previous video" className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/25 hover:bg-white/20">↑</button>
            <button type="button" onClick={() => step(1)} aria-label="Next video" className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/25 hover:bg-white/20">↓</button>
          </div>
        </>
      ) : (
        <div className="grid h-dvh place-items-center overflow-y-auto px-3 py-16">
          <div className="w-full max-w-4xl">
            <MediaPlayer item={start} autoPlay />
            <MediaDetails item={start} />
          </div>
        </div>
      )}
    </dialog>
  );
}
