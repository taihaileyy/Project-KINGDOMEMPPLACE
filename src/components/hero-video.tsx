"use client";

import { useEffect, useRef, useState } from "react";
import { images } from "@/content/site";

// Silent looping logo film used as the homepage hero background. It never
// autoplays for people who ask their device for reduced motion, and it always
// has a pause control (WCAG 2.2.2: moving content must be pausable).
export function HeroVideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduce.matches) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 -z-20 h-full w-full scale-[1.12] object-cover object-[70%_50%]"
        poster={images.heroPoster.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/video/kep-community.mp4" type="video/mp4" />
        <source src="/video/kep-community.webm" type="video/webm" />
      </video>
      {/* Darkens the side the words sit on so they stay readable over the film. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/65 to-black/35 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/60 lg:to-black/10"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-4 z-10 inline-flex min-h-11 items-center rounded-full bg-black/55 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-black/80"
      >
        {playing ? "Pause video" : "Play video"}
      </button>
    </>
  );
}
