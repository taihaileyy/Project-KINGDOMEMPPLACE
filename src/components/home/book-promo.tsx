"use client";

import Image from "next/image";
import { useState } from "react";
import { Arrow } from "@/components/arrow";
import { VideoFeature } from "@/components/home/video-feature";

// Phone-only: Dr. Morgan's book as one compact card. The trailer opens inside
// the card when asked for, so the page stays short.
export function BookPromo() {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div className="bg-night p-5 text-white sm:p-8">
      <div className="flex gap-4 sm:gap-8">
        <Image
          src="/images/a-good-soldier-book.jpg"
          width={428}
          height={570}
          alt="Book cover: A Good Soldier, Ready 4 War, by Lawrence Morgan"
          sizes="128px"
          className="h-auto w-24 shrink-0 self-start sm:w-32"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-electric">From Dr. Morgan</p>
          <p className="mt-2 font-display text-[1.5rem] leading-[1.1] sm:text-4xl">A Good Soldier: Ready 4 War</p>
          <p className="mt-1.5 text-[13px] text-chrome">by Lawrence Morgan</p>
          <a href="https://payhip.com/b/hM6T" target="_blank" rel="noopener noreferrer" className="btn-primary group mt-4 min-h-11 px-5">
            Get the book <Arrow />
          </a>
        </div>
      </div>
      {showTrailer ? (
        <div className="mt-5">
          <VideoFeature id="ea_hIpFOtJM" title="A Good Soldier Book Trailer, Dr. Lawrence Morgan" autoPlay />
        </div>
      ) : (
        <button type="button" onClick={() => setShowTrailer(true)} className="btn-quiet group mt-4 text-white">
          Watch the trailer <Arrow />
        </button>
      )}
    </div>
  );
}
