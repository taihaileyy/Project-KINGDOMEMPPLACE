"use client";

import { useEffect, useRef } from "react";

// The homepage hero background. At rest it is a dark navy/black gradient with
// the KEP artwork faintly embedded on the right (the film's own last frame, so
// the two line up exactly). Once per page load, after the diagonal entrance
// has opened and the hero has sat still for a moment, the film opens at full
// brightness, plays once, and settles back into the whole artwork, which stays. No loop, no controls
// (it moves for under 5 seconds), and reduced-motion visitors see only the
// calm resting hero.

const ENTRANCE_MS = 2300; // the diagonal panels finish opening (see globals.css)
const FADE_OUT_S = 1.3; // seconds before the film's end that it starts to recede

// Module state survives client-side navigation but not a full reload, so the
// film plays again only when the page is intentionally reloaded.
let playedThisLoad = false;

// `overlay` plays the film on top of another hero background and then simply
// fades away, leaving that background exactly as it was (no layout change).
export function HeroMotion({ overlay = false }: { overlay?: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const video = videoRef.current;
    if (!layer || !video) return;

    // On phones and tablets, once the film is over the hero tightens: the words
    // rise over the logo and the hero ends where the words end, so the space at
    // the top is used and nothing is left empty.
    const section = layer.closest<HTMLElement>(".hero-section");
    const small = () => window.matchMedia("(max-width: 1023px)").matches;
    const measure = () => {
      if (!section) return;
      const h1 = section.querySelector<HTMLElement>("h1");
      if (!h1) return;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 60;
      const current = Number(section.dataset.lift || 0);
      // Where the headline sits when the hero is full height, and where we want it: just under the header.
      const natural = h1.getBoundingClientRect().top + window.scrollY + current;
      // The bottom padding that clears the phone tab bar also tightens (112px to 40px).
      const extra = window.innerWidth < 640 ? 72 : 0;
      const lift = Math.max(0, Math.round(natural - (header + 28) + extra));
      section.dataset.lift = String(lift);
      section.style.setProperty("--hero-lift", `${lift}px`);
    };
    const settle = (instant: boolean) => {
      if (overlay || !section || !small()) return;
      measure();
      section.dataset.settled = instant ? "instant" : "true";
    };
    const onResize = () => { if (section?.dataset.settled) measure(); };
    window.addEventListener("resize", onResize);
    const stopResize = () => window.removeEventListener("resize", onResize);

    if (playedThisLoad || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(true); // no film this time: show the finished layout straight away
      return stopResize;
    }
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
        window.setTimeout(() => settle(false), 2500); // hold the hero a moment before the words rise
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
          settle(false); // the words rise as the film recedes
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
      stopResize();
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      video.removeEventListener("ended", onEnded);
      video.pause();
    };
  }, [overlay]);

  if (overlay) {
    return (
      <div ref={layerRef} data-phase="rest" aria-hidden="true" className="hero-stage pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-haze-lit" />
        <div className="hero-art hero-motion">
          <video ref={videoRef} muted playsInline disablePictureInPicture preload="none" tabIndex={-1} />
        </div>
        {/* Keeps the words readable while the film plays, then fades away with it. */}
        <div className="hero-read absolute inset-0 bg-[linear-gradient(90deg,rgb(5_7_13/0.9)_0%,rgb(5_7_13/0.6)_34%,rgb(5_7_13/0.1)_58%,transparent_70%)] max-lg:bg-[linear-gradient(0deg,rgb(5_7_13/0.95)_0%,rgb(5_7_13/0.8)_38%,rgb(5_7_13/0.1)_56%,transparent_68%)]" />
      </div>
    );
  }

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
