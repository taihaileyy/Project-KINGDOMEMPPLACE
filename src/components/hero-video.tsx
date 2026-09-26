"use client";

import { useEffect, useRef, useState } from "react";
import { images } from "@/content/site";

// Silent looping logo film for the homepage. It never autoplays for people who
// ask their device for reduced motion, and it always has a pause control
// (WCAG 2.2.2: moving content must be pausable).
export function HeroVideo() {
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
    <div className="relative">
      <video
        ref={ref}
        className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        poster={images.heroPoster.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={images.heroPoster.alt}
      >
        <source src="/video/kep-community.mp4" type="video/mp4" />
        <source src="/video/kep-community.webm" type="video/webm" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 right-3 inline-flex min-h-11 items-center rounded-full bg-night/70 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-night"
      >
        {playing ? "Pause video" : "Play video"}
      </button>
    </div>
  );
}
