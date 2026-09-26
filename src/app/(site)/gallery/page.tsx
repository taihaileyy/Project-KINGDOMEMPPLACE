import Image from "next/image";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { gallery } from "@/content/site";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <PageIntro title="Life at KEP" lead="Worship, youth nights, workshops, celebrations and the people who make Kingdom Empowerment Place home." />
      <Section>
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {gallery.map((img) => (
            <li key={img.src} className="mb-4 break-inside-avoid">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full rounded-[var(--radius-card)]"
              />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
