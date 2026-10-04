import type { Metadata } from "next";
import { GallerySlideshow } from "@/components/gallery-slideshow";
import { gallery } from "@/content/site";

export const metadata: Metadata = { title: "Gallery", description: "Worship, youth nights, workshops, celebrations and the people of Kingdom Empowerment Place." };

export default function GalleryPage() {
  return (
    <div className="bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-8 sm:px-6 sm:pt-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-electric">Gallery</p>
        <h1 data-reveal="mask" className="mt-2 font-display text-[clamp(2.2rem,7vw,4.5rem)] font-medium leading-[1]">Life at KEP</h1>
      </div>
      <GallerySlideshow images={gallery} />
    </div>
  );
}
