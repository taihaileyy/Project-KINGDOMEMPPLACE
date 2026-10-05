import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Arrow } from "@/components/arrow";
import { HomeWatch } from "@/components/home/home-watch";
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
        <Link href="#visit" className="btn-primary group">Plan your visit <Arrow /></Link>
        <Link href="/signup" className="btn-quiet group text-ink">Join the church <Arrow /></Link>
      </PageIntro>

      {/* Service and Bible Study times come from Admin > Schedule. */}
      <Section id="bible-study" title="Worship &amp; Bible Study">
        <ScheduleCards />
      </Section>

      <section id="visit" aria-labelledby="visit-title" className="scroll-mt-20 border-y border-ink/10 bg-surface">
        <div className="wrap section-y grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-blue">New here?</p>
            <h2 id="visit-title" data-reveal="mask" className="heading-2 mt-3">Plan your visit</h2>
            <div className="mt-5 grid gap-4 text-[16px] leading-relaxed text-muted sm:text-lg">
              <p>Come as you are. You&apos;ll be greeted at the door, and someone will be glad to help you find a seat and answer questions.</p>
              <p>
                Want us to know you&apos;re coming? Call{" "}
                <a href={org.phoneHref} className="font-semibold text-blue hover:underline">{org.phone}</a> or email{" "}
                <a href={`mailto:${org.email}`} className="break-all font-semibold text-blue hover:underline">{org.email}</a>.
              </p>
            </div>
          </div>
          <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="card block p-8 hover:border-blue">
            <p className="font-bold">Kingdom Empowerment Place Church</p>
            <p className="mt-1 text-muted">{fullAddress}</p>
            <p className="mt-4 font-semibold text-blue">Get directions &rarr;</p>
          </a>
        </div>
      </section>

      <section id="pastors" aria-labelledby="pastors-title" className="scroll-mt-20">
        <div className="wrap section-y grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 52vw, 100vw" className="aspect-[4/3] w-full rounded-[var(--radius-card)] object-cover object-[50%_20%]" />
          <div>
            <p className="eyebrow text-blue">Our pastors</p>
            <h2 id="pastors-title" className="heading-2 mt-3">Dr. Lawrence Morgan &amp; Lady Kennetta Morgan</h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted sm:text-lg">Together they pastor KEP Church and oversee its housing, youth and community programs.</p>
            <Link href="/about#pastors" className="btn-quiet group mt-4 text-blue">Read their story <Arrow /></Link>
          </div>
        </div>
      </section>

      <HomeWatch />

      <section aria-labelledby="join-title" className="bg-night text-white">
        <div className="wrap section-y">
          <p className="eyebrow text-electric">Get connected</p>
          <h2 id="join-title" className="heading-2 mt-3 max-w-2xl">Join the church</h2>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-white/80 sm:text-lg">Create a free KEP account to register with the church, sign up for programs and stay in the loop.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/signup" className="btn-primary group">Register with the church <Arrow /></Link>
            <Link href="/give" className="btn-quiet group text-white">Give <Arrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
