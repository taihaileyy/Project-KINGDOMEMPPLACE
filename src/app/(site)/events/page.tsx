import Image from "next/image";
import type { Metadata } from "next";
import { CollectionVideos } from "@/components/media/collection-videos";
import { PageIntro, Section } from "@/components/section";
import { ScheduleEvents } from "@/components/schedule-views";
import { recentEvents } from "@/content/site";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <>
      <PageIntro
        title="Events"
        lead="Worship, conferences, workshops, youth activities and community gatherings. Online registration is coming soon."
      />
      <Section title="Every week">
        <ScheduleEvents />
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
      <CollectionVideos prefix="event:" title="Watch from our events" lead="Highlights and recordings from KEP gatherings." />
    </>
  );
}
