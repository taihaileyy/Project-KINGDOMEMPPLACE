"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommentsSheet } from "@/components/reels/comments-sheet";
import { isDirectFile, isFacebookUrl, posterFor, youTubeId, type MediaItem } from "@/lib/media";
import { isSignedIn, loadSocial, toggleLike, type Social } from "@/lib/reels";

const YT_ORIGIN = "https://www.youtube-nocookie.com";

// Watch as a reel: one video per screen, swipe up or down, like, comment and
// share, with sound off until you turn it on (phones don't allow sound to start
// by itself). Only the video on screen plays.
export function ReelsFeed({ items, startId }: { items: MediaItem[]; startId?: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [social, setSocial] = useState<Record<string, Social>>({});
  const [signedIn, setSignedIn] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [toast, setToast] = useState<React.ReactNode>(null);
  const toastTimer = useRef<number | null>(null);
  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const say = useCallback((m: React.ReactNode) => {
    setToast(m);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let live = true;
    loadSocial(ids).then((s) => { if (live) setSocial(s); }).catch(() => {});
    isSignedIn().then((v) => { if (live) setSignedIn(v); }).catch(() => {});
    return () => { live = false; };
  }, [ids]);

  // Open at a shared video.
  useEffect(() => {
    const i = startId ? items.findIndex((m) => m.id === startId) : -1;
    if (i > 0) listRef.current?.children[i]?.scrollIntoView({ block: "start" });
  }, [startId, items]);

  // The slide that is mostly on screen is the one that plays.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setActive(Number((e.target as HTMLElement).dataset.i));
            setPaused(false);
          }
        }
      },
      { root, threshold: [0.6] },
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);

  const post = (func: string) => frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), YT_ORIGIN);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    post(next ? "mute" : "unMute");
    if (videoRef.current) videoRef.current.muted = next;
  };
  const togglePlay = () => {
    const next = !paused;
    setPaused(next);
    post(next ? "pauseVideo" : "playVideo");
    if (videoRef.current) { if (next) videoRef.current.pause(); else void videoRef.current.play(); }
  };

  const like = async (id: string) => {
    if (!signedIn) return say(<><Link href={`/login?next=${encodeURIComponent(`/watch?v=${id}`)}`} className="font-semibold underline">Log in</Link> or <Link href="/signup" className="font-semibold underline">create a free account</Link> to like videos.</>);
    const before = social[id] ?? { likes: 0, comments: 0, liked: false };
    setSocial((s) => ({ ...s, [id]: { ...before, liked: !before.liked, likes: before.likes + (before.liked ? -1 : 1) } }));
    const r = await toggleLike(id);
    if (r) setSocial((s) => ({ ...s, [id]: { ...(s[id] ?? before), liked: r.liked, likes: r.likes } }));
    else { setSocial((s) => ({ ...s, [id]: before })); say("That didn't work. Please try again."); }
  };

  const share = async (m: MediaItem) => {
    const url = `${window.location.origin}/watch?v=${m.id}`;
    try {
      if (navigator.share) { await navigator.share({ title: m.title, text: m.title, url }); return; }
      await navigator.clipboard.writeText(url);
      say("Link copied");
    } catch (e) {
      if ((e as Error).name !== "AbortError") say("Couldn't share. Copy the address from your browser.");
    }
  };

  const step = (dir: 1 | -1) => listRef.current?.scrollBy({ top: dir * listRef.current.clientHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));
  const btn = "grid size-12 place-items-center rounded-full bg-black/45 ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-white";

  if (items.length === 0) {
    return <div className="grid min-h-[60dvh] place-items-center bg-black p-8 text-center text-white"><p>Videos are on the way.</p></div>;
  }

  const current = items[active];

  return (
    <section aria-label="Reels" className="relative bg-black text-white" onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); step(1); } if (e.key === "ArrowUp") { e.preventDefault(); step(-1); } }}>
      <ul
        ref={listRef}
        tabIndex={0}
        aria-label="Videos. Swipe or use the up and down arrow keys to move between videos."
        className="h-[calc(100dvh-var(--header-h))] snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((m, i) => {
          const on = i === active;
          const yt = m.source === "youtube" ? youTubeId(m.embed_url || m.url) : null;
          const fb = m.source === "facebook" || isFacebookUrl(m.url);
          const direct = !yt && !fb && (m.source === "upload" || isDirectFile(m.url));
          const poster = posterFor(m);
          const vertical = m.orientation === "vertical";
          const s = social[m.id] ?? { likes: 0, comments: 0, liked: false };
          return (
            <li key={m.id} data-i={i} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}: ${m.title}`} className="relative h-full snap-start snap-always">
              <div className="relative mx-auto h-full w-full sm:max-w-[26rem]">
                {/* The picture: the poster, or the playing video when it is on screen. */}
                <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(80%_60%_at_50%_30%,#1f33b8_0%,#0a1024_60%,#05070d_100%)]">
                  {poster && (
                    // eslint-disable-next-line @next/next/no-img-element -- a video thumbnail from any source
                    <img src={poster} alt="" loading={i < 2 ? "eager" : "lazy"} className={`absolute inset-0 size-full ${vertical ? "object-cover" : "object-cover opacity-40 blur-2xl"}`} />
                  )}
                  {on && yt && (
                    <iframe
                      ref={(el) => { if (on) frameRef.current = el; }}
                      title={m.title}
                      src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=1`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className={vertical ? "absolute inset-0 size-full border-0" : "absolute inset-x-0 top-1/2 aspect-video w-full -translate-y-1/2 border-0"}
                    />
                  )}
                  {on && direct && (
                    <video
                      ref={(el) => { if (on) videoRef.current = el; }}
                      src={m.url}
                      poster={poster ?? undefined}
                      autoPlay
                      loop
                      muted={muted}
                      playsInline
                      aria-label={m.title}
                      className={`absolute inset-0 size-full ${vertical ? "object-cover" : "object-contain"}`}
                    />
                  )}
                  {fb && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 grid place-items-center">
                      <span className="flex flex-col items-center gap-3 px-8 text-center">
                        <span className="grid size-16 place-items-center rounded-full bg-white/95 text-[#1f33b8]"><svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg></span>
                        <span className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold">Watch on Facebook ↗</span>
                      </span>
                    </a>
                  )}
                  {/* Tap anywhere on a playing video to pause or play. */}
                  {on && (yt || direct) && (
                    <button type="button" onClick={togglePlay} aria-label={paused ? "Play video" : "Pause video"} className="absolute inset-0 z-[1] cursor-pointer">
                      {paused && <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 ring-1 ring-white/30"><svg viewBox="0 0 24 24" className="ml-1 size-9" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" /></svg></span>}
                    </button>
                  )}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Title and description */}
                <div className="absolute inset-x-0 bottom-0 z-[3] pb-5 pl-4 pr-20">
                  <h2 className="font-display text-[1.6rem] leading-[1.05] [text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">{m.title}</h2>
                  {m.description && <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-white/85">{m.description}</p>}
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-semibold text-white/80 underline-offset-4 hover:underline">Open original ↗</a>
                </div>

                {/* Like, comment, share, sound */}
                <div className="absolute bottom-5 right-3 z-[3] flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center">
                    <button type="button" onClick={() => like(m.id)} aria-pressed={s.liked} aria-label={s.liked ? "Unlike" : "Like"} className={btn}>
                      <svg viewBox="0 0 24 24" className={`size-6 ${s.liked ? "text-[#ff4d6d]" : ""}`} fill={s.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.2C1.7 8.1 3.5 5 6.6 5c1.9 0 3.4 1 4.4 2.5C12 6 13.5 5 15.4 5c3.1 0 4.9 3.1 3.8 6.3-1.7 4.6-7.2 9.2-7.2 9.2Z" strokeLinejoin="round" /></svg>
                    </button>
                    <span className="mt-1 text-xs font-semibold tabular-nums">{fmt(s.likes)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button type="button" onClick={() => setCommentsFor(m.id)} aria-label={`Comments (${s.comments})`} className={btn}>
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 5.5h16v10H9.5L5 19.5v-4H4z" strokeLinejoin="round" /></svg>
                    </button>
                    <span className="mt-1 text-xs font-semibold tabular-nums">{fmt(s.comments)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button type="button" onClick={() => share(m)} aria-label="Share" className={btn}>
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 4 3 11l7 2.5L12.5 21 21 4Z M10 13.5 21 4" strokeLinejoin="round" /></svg>
                    </button>
                    <span className="mt-1 text-xs font-semibold">Share</span>
                  </div>
                  {(yt || direct) && (
                    <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Turn sound off"} className={btn}>
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" strokeLinejoin="round" />{muted ? <path d="m16 9.5 4 5m0-5-4 5" strokeLinecap="round" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" strokeLinecap="round" />}</svg>
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: up and down */}
      {items.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden flex-col items-center justify-center gap-3 lg:flex">
          <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label="Previous video" className={`${btn} pointer-events-auto disabled:opacity-30`}>↑</button>
          <button type="button" onClick={() => step(1)} disabled={active === items.length - 1} aria-label="Next video" className={`${btn} pointer-events-auto disabled:opacity-30`}>↓</button>
        </div>
      )}

      {toast && <div role="status" className="absolute inset-x-4 bottom-6 z-20 mx-auto max-w-sm rounded-xl bg-black/85 px-4 py-3 text-center text-sm ring-1 ring-white/20">{toast}</div>}

      {commentsFor && (
        <CommentsSheet
          key={commentsFor}
          mediaId={commentsFor}
          title={items.find((i) => i.id === commentsFor)?.title ?? current.title}
          signedIn={signedIn}
          onClose={() => setCommentsFor(null)}
          onCount={(d) => setSocial((s) => { const cur = s[commentsFor] ?? { likes: 0, comments: 0, liked: false }; return { ...s, [commentsFor]: { ...cur, comments: Math.max(0, cur.comments + d) } }; })}
        />
      )}
    </section>
  );
}
