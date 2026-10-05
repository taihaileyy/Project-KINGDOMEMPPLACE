import Image from "next/image";
import { images } from "@/content/site";

// The hero's background: a worship scene (blue stage lights, a congregation in
// silhouette, hands raised) with layered overlays that keep the words readable.
//
// The photograph is /public/images/hero-worship.webp. It is drawn as a CSS
// background (cover, no-repeat) on top of a deep-navy blue-light fallback, so
// the hero looks right before the photo is added and picks it up automatically
// once the file exists. Crop it per screen size with the two position vars.
export function WorshipBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-night">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat [background-image:url(/images/hero-worship.webp),radial-gradient(60%_50%_at_88%_12%,#2a45e0_0%,transparent_70%),radial-gradient(45%_40%_at_0%_30%,#2f55ff_0%,transparent_70%),linear-gradient(180deg,#050a26_0%,#0a1650_55%,#050a22_100%)] [background-position:72%_35%] sm:[background-position:50%_40%]"
      />
      {/* the KEP artwork, faint, in the distance on the right */}
      <Image
        src={images.heroPoster.src}
        width={images.heroPoster.width}
        height={images.heroPoster.height}
        alt=""
        priority
        sizes="(min-width: 1024px) 60vw, 130vw"
        className="absolute right-[-40%] top-[4%] w-[130%] max-w-none opacity-[0.2] mix-blend-screen [mask-image:radial-gradient(closest-side,#000_45%,transparent)] sm:right-[-8%] sm:top-[2%] sm:w-[62%]"
      />
      {/* layered overlays: overall navy, darker on the left behind the words, a blue glow on the right */}
      <div className="absolute inset-0 bg-[rgb(3_6_18/0.22)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_6_18/0.82)_0%,rgb(3_6_18/0.5)_50%,rgb(3_6_18/0.04)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_85%_30%,rgb(31_51_184/0.38),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[rgb(3_6_18/0.7)] to-transparent" />
    </div>
  );
}
