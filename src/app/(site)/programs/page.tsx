import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { programs } from "@/content/site";

export const metadata: Metadata = { title: "Programs" };

export default function ProgramsPage() {
  return (
    <>
      <PageIntro
        title="Programs"
        lead="Mentorship, creativity, business, media and technology. Join one or several; it all lives in one KEP account."
      />
      <Section>
        <ul className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <li key={p.slug} className="card overflow-hidden">
              <Link href={`/programs/${p.slug}`} className="group grid h-full sm:grid-cols-[1fr_1.2fr]">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(min-width: 768px) 25vw, 100vw"
                  className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto"
                />
                <div className="p-6">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight group-hover:text-blue">{p.name}</h2>
                  <p className="mt-2 text-muted">{p.summary}</p>
                  <p className="mt-4 font-semibold text-blue">Learn more</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
