"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { images, type Img } from "@/content/site";

// The homepage hero: the KEP logo film plays once, then the hero slowly
// crossfades through photos of KEP's church family with a gentle zoom, and
// loops. Because it moves for longer than 5 seconds it has a pause control
// (WCAG 2.2.2), and people who ask for reduced motion get a still photo they
// can step through with the dots.

type Slide = { kind: "video" } | { kind: "photo"; img: Img; position: string };

const slides: Slide[] = [
  { kind: "video" },
  { kind: "photo", img: images.adultMinistry, position: "50% 40%" },
  { kind: "photo", img: images.youthGroup2, position: "50% 35%" },
  { kind: "photo", img: images.celebration2, position: "50% 45%" },
  { kind: "photo", img: images.preaching, position: "60% 35%" },
];
const PHOTO_MS = 6500;

export function HeroShow() {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = useCallback(
    (next: number) => {
      if (next === index) return;
      setPrev(index);
      setIndex(next);
    },
    [index],
  );
  const advance = useCallback(() => go((index + 1) % slides.length), [go, index]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setPlaying(false);
      setIndex(1);
    }
  }, []);

  // Drive the show: the film advances when it ends, photos on a timer.
  useEffect(() => {
    const v = videoRef.current;
    if (!playing) {
      v?.pause();
      return;
    }
    if (slides[index].kind === "video" && v) {
      v.currentTime = 0;
      v.play().catch(() => advance());
      v.onended = advance;
      return () => {
        v.onended = null;
      };
    }
    const t = setTimeout(advance, PHOTO_MS);
    return () => clearTimeout(t);
  }, [index, playing, advance]);

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden bg-night">
        {slides.map((s, i) => {
          const shown = i === index;
          const zoom = !reduced && (shown || i === prev);
          const layer = `absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${shown ? "opacity-100" : "opacity-0"}`;
          return s.kind === "video" ? (
            <div key="video" className={layer}>
              <video
                ref={videoRef}
                className="h-full w-full scale-[1.12] object-cover object-[70%_50%]"
                poster={images.heroPoster.src}
                muted
                playsInline
                preload="auto"
              >
                <source src="/video/kep-community.mp4" type="video/mp4" />
                <source src="/video/kep-community.webm" type="video/webm" />
              </video>
            </div>
          ) : (
            <div key={s.img.src} className={layer}>
              <Image
                src={s.img.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 1}
                style={{ objectPosition: s.position }}
                className={`object-cover ${zoom ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}
              />
            </div>
          );
        })}
      </div>

      {/* Darkens the side the words sit on so they stay readable over any slide. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/30 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/55 lg:to-black/10"
      />

      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-black/45 py-1 pl-2 pr-1 backdrop-blur sm:right-6 sm:top-6">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={s.kind === "video" ? "Show the KEP logo film" : `Show photo ${i}: ${s.img.alt}`}
            aria-current={i === index ? "true" : undefined}
            className="grid h-8 w-4 place-items-center"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/45"}`} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
          className="ml-1 grid size-8 place-items-center rounded-full text-white/85 hover:bg-white/15 hover:text-white"
        >
          {playing ? <Pause aria-hidden="true" className="size-3.5" fill="currentColor" /> : <Play aria-hidden="true" className="size-3.5" fill="currentColor" />}
        </button>
      </div>
    </>
  );
}
