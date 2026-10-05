"use client";

import { useState } from "react";
import { Arrow } from "@/components/arrow";
import { VideoFeature } from "@/components/home/video-feature";

// The homepage's video spot: the trailer for Dr. Morgan's book, with a way to
// watch it and a link to buy the book.
const BOOK_URL = "https://payhip.com/b/hM6T";

export function BookFeature() {
  const [play, setPlay] = useState(false);
  return (
    <section aria-labelledby="book-title" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_0%,#101a52_0%,#0a1024_55%,#05070d_100%)]" />
      <div className="mx-auto max-w-7xl px-6 py-9 sm:py-16">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.24em] text-[#5c6bff] sm:text-sm">Watch &amp; Listen</p>
        <div className="mt-4 grid items-center gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <VideoFeature key={play ? "playing" : "idle"} id="ea_hIpFOtJM" poster="/images/good-soldier-trailer.webp" title="A Good Soldier book trailer, Dr. Lawrence Morgan" autoPlay={play} />
          <div>
            <h2 id="book-title" className="font-display text-[1.7rem] leading-tight sm:text-5xl">A Good Soldier: Ready 4 War</h2>
            <p className="mt-2 text-[0.95rem] leading-snug text-white/80 sm:mt-4 sm:text-lg">
              The book from Dr. Lawrence Morgan. Watch the trailer, then get your copy.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-7">
              <button type="button" onClick={() => setPlay(true)} className="btn-primary group !min-h-12 !rounded-[5px]">Watch now <Arrow /></button>
              <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" className="btn-quiet group text-white">Buy the book <Arrow /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
