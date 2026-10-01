"use client";

import { useEffect, useRef } from "react";

// The homepage hero background. It rests as a dark navy/black gradient. Once
// per page load, after the diagonal entrance has opened and the hero has sat
// still for a moment, the KEP motion film materializes out of that gradient on
// the right (a soft radial mask that widens), plays through once, and recedes
// back into it before its last frame. No loop, no controls (it moves for under
// 5 seconds), and nothing at all for people who ask for reduced motion.

const ENTRANCE_MS = 1420; // the diagonal panels finish opening (see globals.css)
const REST_MS = 400; // the finished hero holds still before the motion begins
const FADE_OUT_S = 1.3; // seconds before the film's end that it starts to recede

// Module state survives client-side navigation but not a full reload, so the
// film plays again only when the page is intentionally reloaded.
let playedThisLoad = false;

export function HeroMotion() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const video = videoRef.current;
    if (!layer || !video || playedThisLoad) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    playedThisLoad = true;

    let cancelled = false;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Attach the sources only now, so reduced-motion visitors never download it.
    const pick = video.canPlayType('video/webm; codecs="vp9"') ? "/video/kep-community.webm" : "/video/kep-community.mp4";
    video.src = pick;
    video.preload = "auto";
    video.load();

    const intro = document.documentElement.classList.contains("intro-play");
    const startAt = intro ? ENTRANCE_MS + REST_MS : 500;
    const ready = new Promise<void>((resolve) => {
      if (video.readyState >= 3) resolve();
      else video.addEventListener("canplaythrough", () => resolve(), { once: true });
    });
    const rest = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, Math.max(0, startAt - performance.now()));
    });

    Promise.all([ready, rest]).then(async () => {
      if (cancelled) return;
      try {
        await video.play();
      } catch {
        return; // autoplay refused: the calm hero simply stays
      }
      // The first frame is decoded while the layer is still invisible, then
      // the light widens out of the gradient.
      layer.dataset.phase = "in";
      const watch = () => {
        if (cancelled) return;
        if (video.duration && video.currentTime >= video.duration - FADE_OUT_S) {
          layer.dataset.phase = "out";
          return;
        }
        frame = requestAnimationFrame(watch);
      };
      frame = requestAnimationFrame(watch);
    });

    // Once it has receded, stop decoding and free the film.
    const onEnded = () => {
      setTimeout(() => {
        video.removeAttribute("src");
        video.load();
      }, 2000);
    };
    video.addEventListener("ended", onEnded, { once: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      video.removeEventListener("ended", onEnded);
      video.pause();
    };
  }, []);

  return (
    <div aria-hidden="true" className="hero-bg absolute inset-0 -z-20 overflow-hidden">
      {/* The resting hero: near-black to navy, with a faint light on the right. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_78%_45%,#101a3d_0%,#0a1024_45%,#05070d_100%)]" />

      {/* The film, masked so it has no edges and blends into the gradient. */}
      <div ref={layerRef} data-phase="rest" className="hero-motion">
        <video ref={videoRef} muted playsInline disablePictureInPicture preload="none" tabIndex={-1} />
      </div>

      {/* Keeps the words readable whatever the film is doing. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(5_7_13/0.92)_0%,rgb(5_7_13/0.7)_30%,rgb(10_16_36/0.15)_60%,transparent_100%)] max-lg:bg-[linear-gradient(0deg,rgb(5_7_13/0.96)_0%,rgb(5_7_13/0.84)_40%,rgb(5_7_13/0.55)_75%,rgb(5_7_13/0.4)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}
