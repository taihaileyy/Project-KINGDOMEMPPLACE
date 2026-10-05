import type { Metadata } from "next";
import Link from "next/link";
import { CollectionVideos } from "@/components/media/collection-videos";
import { EventsBoard } from "@/components/home/events-board";
import { PageIntro } from "@/components/section";

export const metadata: Metadata = { title: "Media & Events" };

// One connected space: events, messages, photos and the studio.
const hub = [
  { href: "/events#upcoming", label: "Upcoming events" },
  { href: "/events#past", label: "Past events" },
  { href: "/watch", label: "Watch & Listen" },
  { href: "/gallery", label: "Gallery" },
  { href: "/studio", label: "Media Studio" },
  { href: "/studio/book", label: "Book the Studio" },
];

export default function EventsPage() {
  return (
    <>
      <PageIntro title="Media & Events" lead="Worship, conferences, youth activities and community gatherings, with the messages, photos and studio that go with them.">
        <ul className="flex flex-wrap gap-2">
          {hub.map((h) => (
            <li key={h.href}>
              <Link href={h.href} className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-[14px] font-semibold transition-colors hover:border-blue hover:text-blue">{h.label}</Link>
            </li>
          ))}
        </ul>
      </PageIntro>
      <EventsBoard />
      <CollectionVideos prefix="event:" title="Watch from our events" lead="Highlights and recordings from KEP gatherings." />
    </>
  );
}
