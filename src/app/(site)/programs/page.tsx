import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Arrow } from "@/components/arrow";
import { ArtsArt } from "@/components/arts-art";
import { GardenBackdrop } from "@/components/paradise/garden";
import { PageIntro } from "@/components/section";
import { programs, type Program } from "@/content/site";

export const metadata: Metadata = { title: "Programs" };

const groups: { id: string; title: string; line: string; slugs: string[] }[] = [
  { id: "youth", title: "For Youth", line: "Mentors, creativity and a safe place to grow.", slugs: ["youth-mentorship", "arts"] },
  { id: "build", title: "Build & Create", line: "Turn ideas and talent into real work.", slugs: ["entrepreneurship", "media"] },
  { id: "technology", title: "Technology & Access", line: "Computers, internet and digital skills for everyone.", slugs: ["computer-lab"] },
];

function ProgramCard({ p }: { p: Program }) {
  return (
    <li>
      <Link href={`/programs/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)] transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgb(10_20_224/0.4)]">
        <span className="relative block aspect-[4/3] overflow-hidden bg-night">
          {p.art ? (
            <ArtsArt className="size-full" label="Brush strokes, a palette, a paintbrush and a musical note" />
          ) : (
            <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" className="object-cover object-top transition-transform duration-[1200ms] group-hover:scale-105" />
          )}
        </span>
        <span className="flex flex-1 flex-col p-5">
          <span className="font-display text-[1.7rem] font-medium leading-[1.05] group-hover:text-blue">{p.name}</span>
          <span className="mt-2 text-[15px] leading-snug text-muted">{p.summary}</span>
          <span className="btn-quiet mt-auto pt-4 text-blue">Learn more &amp; enroll <Arrow /></span>
        </span>
      </Link>
    </li>
  );
}

export default function ProgramsPage() {
  return (
    <>
      <PageIntro title="Programs" lead="Mentorship, creativity, business, media and technology. Join one or several; it all lives in one KEP account.">
        <Link href="/signup" className="btn-primary group">Create a free account <Arrow /></Link>
        <Link href="#youth" className="btn-quiet group text-ink">Browse programs <Arrow /></Link>
      </PageIntro>

      {groups.map((g, i) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className={`scroll-mt-20 ${i % 2 ? "border-y border-ink/10 bg-surface" : ""}`}>
          <div className="wrap section-y">
            <p className="eyebrow text-blue">{g.line}</p>
            <h2 id={`${g.id}-title`} data-reveal="mask" className="heading-2 mt-3">{g.title}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.slugs.map((s) => {
                const p = programs.find((x) => x.slug === s);
                return p ? <ProgramCard key={s} p={p} /> : null;
              })}
            </ul>
          </div>
        </section>
      ))}

      <section aria-labelledby="cyw-title" className="relative isolate overflow-hidden bg-[#050a1c] text-white">
        <GardenBackdrop focus="middle" className="-z-10 scale-[1.04]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_8_24/0.9)_0%,rgb(5_8_24/0.5)_100%)]" />
        <div className="wrap section-y">
          <p className="eyebrow text-[#ecd08a]">An interactive Bible journey</p>
          <h2 id="cyw-title" className="mt-3 font-display text-[2.4rem] font-medium uppercase leading-[1] tracking-[0.1em] sm:text-6xl">Create Your World</h2>
          <p className="mt-3 max-w-md font-display text-xl italic text-[#ecd08a]">How well do you know the Word?</p>
          <Link href="/create-your-world" className="btn-primary group mt-7">Enter Paradise <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
