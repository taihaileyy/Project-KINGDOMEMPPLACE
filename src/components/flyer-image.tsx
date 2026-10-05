import Image from "next/image";
import type { Img } from "@/content/site";

// A flyer from the site's own files, or one a staff member uploaded (a full web
// address). Uploaded ones are shown directly; the built-in ones keep the image
// optimiser.
export function FlyerImage({ image, className = "", sizes, priority = false }: { image: Img; className?: string; sizes?: string; priority?: boolean }) {
  if (/^https?:\/\//.test(image.src)) {
    // eslint-disable-next-line @next/next/no-img-element -- uploaded flyers can be any shape
    return <img src={image.src} alt={image.alt} loading={priority ? "eager" : "lazy"} decoding="async" className={className} />;
  }
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} priority={priority} className={className} />;
}
