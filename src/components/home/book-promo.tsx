import Image from "next/image";
import { Arrow } from "@/components/arrow";
import { VideoFeature } from "@/components/home/video-feature";

// Dr. Morgan's book and its trailer as one band: the book beside the film.
// The film shows its own poster with a play button and loads only when pressed.
export function BookPromo() {
  return (
    <div className="grid items-center gap-6 bg-night p-5 text-white sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:p-12">
      <div className="flex gap-4 sm:gap-8">
        <Image
          src="/images/a-good-soldier-book.jpg"
          width={428}
          height={570}
          alt="Book cover: A Good Soldier, Ready 4 War, by Lawrence Morgan"
          sizes="(min-width: 640px) 160px, 96px"
          className="h-auto w-24 shrink-0 self-start sm:w-40"
        />
        <div className="min-w-0 self-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-electric">From Dr. Morgan</p>
          <p className="mt-2 font-display text-[1.5rem] leading-[1.1] sm:text-4xl">A Good Soldier: Ready 4 War</p>
          <p className="mt-1.5 text-[13px] text-chrome sm:text-[15px]">by Lawrence Morgan</p>
          <a href="https://payhip.com/b/hM6T" target="_blank" rel="noopener noreferrer" className="btn-primary group mt-4 min-h-11 px-5 sm:mt-6">
            Get the book <Arrow />
          </a>
        </div>
      </div>
      <VideoFeature id="ea_hIpFOtJM" poster="/images/good-soldier-trailer.webp" title="A Good Soldier Book Trailer, Dr. Lawrence Morgan" />
    </div>
  );
}
