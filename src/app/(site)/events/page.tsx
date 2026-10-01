import Image from "next/image";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { org, recentEvents, weekly } from "@/content/site";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <>
      <PageIntro
        title="Events"
        lead="Worship, conferences, workshops, youth activities and community gatherings. Online registration is coming soon."
      />
      <Section title="Every week">
        <ul className="grid gap-5 md:grid-cols-2">
          {weekly.map((w) => (
            <li key={w.title} className="card flex items-center gap-6 p-6">
              <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-blue text-center text-white">
                <span className="font-display text-lg font-semibold leading-tight">{w.day}</span>
              </div>
              <div>
                <p className="font-display text-2xl font-medium">{w.title}</p>
                <p className="mt-1 text-muted">{w.time} at KEP, {org.address.line1}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Recently at KEP">
        <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {recentEvents.map((e) => (
            <li key={e.title}>
              <Image
                src={e.image.src}
                alt={e.image.alt}
                width={e.image.width}
                height={e.image.height}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="w-full rounded-[var(--radius-card)]"
              />
              <p className="mt-3 font-bold">{e.title}</p>
              <p className="text-sm text-muted">{e.when}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
