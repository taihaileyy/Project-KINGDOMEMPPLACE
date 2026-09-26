"use client";

import { useEffect, useRef } from "react";
import { images } from "@/content/site";

// Silent logo film used as the homepage hero background. It plays for 5
// seconds and then stops on the logo, so it never needs a pause control
// (WCAG 2.2.2 allows motion that stops by itself within 5 seconds). People
// who ask their device for reduced motion only see the still poster.
const PLAY_MS = 5000;

export function HeroVideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    v.play()
      .then(() => {
        timer = setTimeout(() => v.pause(), PLAY_MS);
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

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
    </>
  );
}
