"use client";

import { useEffect, useRef } from "react";
import type { PdVideoType } from "@/lib/paradise/types";

// Plays a lesson video from any of the three sources an administrator can use:
// an uploaded file, a YouTube link or another web address. It reports when the
// video has finished (`onEnded`) so the game can unlock Continue; when a source
// can't report that, `onUntracked` lets the game fall back to a timed wait.

export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{6,})/);
      if (m) return m[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

const isDirectFile = (url: string) => /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);

export function VideoPlayer({
  type,
  url,
  title,
  onEnded,
  onUntracked,
}: {
  type: PdVideoType | null;
  url: string;
  title: string;
  onEnded: () => void;
  onUntracked: () => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const endedRef = useRef(onEnded);
  const untrackedRef = useRef(onUntracked);
  endedRef.current = onEnded;
  untrackedRef.current = onUntracked;

  const yt = type === "youtube" || (type !== "upload" && youTubeId(url)) ? youTubeId(url) : null;
  const direct = !yt && (type === "upload" || isDirectFile(url));

  // YouTube reports its state through postMessage once we say we're listening.
  useEffect(() => {
    if (!yt) return;
    let heard = false;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube-nocookie.com" || e.source !== frameRef.current?.contentWindow) return;
      let data: { event?: string; info?: { playerState?: number } | number } | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      heard = true;
      const state = data?.event === "onStateChange" ? data.info : typeof data?.info === "object" ? data.info?.playerState : undefined;
      if (state === 0) endedRef.current();
    };
    window.addEventListener("message", onMessage);
    // If nothing is heard (blocked, offline), fall back to the timed wait.
    const t = window.setTimeout(() => {
      if (!heard) untrackedRef.current();
    }, 8000);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(t);
    };
  }, [yt]);

  useEffect(() => {
    if (!yt && !direct) untrackedRef.current(); // an outside page we can't follow
  }, [yt, direct]);

  const frame = "absolute inset-0 size-full border-0";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black shadow-[0_20px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
      {yt ? (
        <iframe
          ref={frameRef}
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${yt}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={frame}
          onLoad={() => frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "https://www.youtube-nocookie.com")}
        />
      ) : direct ? (
        <video src={url} controls playsInline preload="metadata" className={frame} onEnded={() => endedRef.current()} aria-label={title} />
      ) : (
        <iframe title={title} src={url} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className={frame} />
      )}
    </div>
  );
}
