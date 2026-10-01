"use client";

import { useEffect, useRef } from "react";

// The homepage hero background. At rest it is a dark navy/black gradient with
// the KEP artwork faintly embedded on the right (the film's own last frame, so
// the two line up exactly). Once per page load, after the diagonal entrance
// has opened and the hero has sat still for a moment, the film opens at full
// brightness, plays once, and settles back into the whole artwork, which stays. No loop, no controls
// (it moves for under 5 seconds), and reduced-motion visitors see only the
// calm resting hero.

const ENTRANCE_MS = 1420; // the diagonal panels finish opening (see globals.css)
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
    layer.dataset.phase = "wait"; // the still steps aside; the film opens bright

    let cancelled = false;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Attach the sources only now, so reduced-motion visitors never download it.
    const pick = video.canPlayType('video/webm; codecs="vp9"') ? "/video/kep-community.webm" : "/video/kep-community.mp4";
    video.src = pick;
    video.preload = "auto";
    video.load();

    const intro = document.documentElement.classList.contains("intro-play");
    const startAt = intro ? ENTRANCE_MS : 0;
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
        layer.dataset.phase = "rest"; // autoplay refused: the calm hero stays
        return;
      }
      // The film is at full brightness from the first frame.
      layer.dataset.phase = "in";
      const watch = () => {
        if (cancelled) return;
        if (video.duration && video.currentTime >= video.duration - FADE_OUT_S) {
          // Settling: the film fades back into the faint artwork, which is
          // its own final frame, so the hand-off is invisible.
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
    <div ref={layerRef} data-phase="rest" aria-hidden="true" className="hero-bg hero-stage absolute inset-0 -z-20 overflow-hidden">
      {/* The resting hero: near-black to navy, with a faint light on the right. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_78%_45%,#101a3d_0%,#0a1024_45%,#05070d_100%)]" />

      {/* Deep-blue haze around the artwork; it brightens just before the film. */}
      <div className="hero-haze" />
      <div className="hero-haze-lit" />

      {/* The KEP artwork, faintly embedded in the atmosphere. Always present. */}
      <div className="hero-art hero-still">
        {/* eslint-disable-next-line @next/next/no-img-element -- must match the film's box exactly */}
        <img src="/images/hero-kep-still.webp" alt="" width={1280} height={720} decoding="async" />
      </div>

      {/* The film, in the same box and mask, so it grows out of the artwork. */}
      <div className="hero-art hero-motion">
        <video ref={videoRef} muted playsInline disablePictureInPicture preload="none" tabIndex={-1} />
      </div>

      {/* Keeps the words readable whatever the film is doing. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(5_7_13/0.94)_0%,rgb(5_7_13/0.7)_30%,rgb(5_7_13/0.15)_50%,transparent_66%)] max-lg:bg-[linear-gradient(0deg,rgb(5_7_13/0.96)_0%,rgb(5_7_13/0.85)_36%,rgb(5_7_13/0.12)_54%,transparent_66%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}
