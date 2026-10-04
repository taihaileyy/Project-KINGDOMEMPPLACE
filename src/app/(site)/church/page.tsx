import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { ScheduleCards } from "@/components/schedule-views";
import { fullAddress, images, org } from "@/content/site";

export const metadata: Metadata = { title: "Church" };

export default function ChurchPage() {
  return (
    <>
      <PageIntro
        title="KEP Church"
        lead={`Worship, the Word and a church family that shows up for each other. Led by ${org.pastors}.`}
      >
        <Link href="#visit" className="btn-primary">Plan your visit</Link>
        <Link href="/signup" className="btn-secondary">Register with the church</Link>
      </PageIntro>

      <Section>
        <ScheduleCards />
      </Section>

      <Section dark title="Watch and listen" lead="Catch up on preaching and teaching from KEP, and follow along between Sundays.">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <Image {...images.preaching} alt={images.preaching.alt} sizes="(min-width: 1024px) 55vw, 100vw" className="w-full rounded-[var(--radius-card)]" />
          <div className="flex flex-wrap gap-3">
            {org.social.filter((s) => s.href).map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="btn bg-paper text-ink hover:bg-surface">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </Section>

      <Section id="visit" title="Plan your visit">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid gap-4 text-lg leading-relaxed text-muted">
            <p>
              Come as you are. You&apos;ll be greeted at the door, and someone will be glad to help you find a seat and
              answer questions.
            </p>
            <p>
              Want us to know you&apos;re coming, or have a question first? Call{" "}
              <a href={org.phoneHref} className="font-semibold text-blue hover:underline">{org.phone}</a> or email{" "}
              <a href={`mailto:${org.email}`} className="break-all font-semibold text-blue hover:underline">{org.email}</a>.
            </p>
          </div>
          <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="card block p-8 hover:border-blue">
            <p className="font-bold">Kingdom Empowerment Place Church</p>
            <p className="mt-1 text-muted">{fullAddress}</p>
            <p className="mt-4 font-semibold text-blue">Get directions</p>
          </a>
        </div>
      </Section>
    </>
  );
}
