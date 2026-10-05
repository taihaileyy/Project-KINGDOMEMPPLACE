import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookPromo } from "@/components/home/book-promo";
import { PageIntro, Section } from "@/components/section";
import { fullAddress, images, org } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="A church and a community home"
        lead="Kingdom Empowerment Place brings worship, housing, programs and opportunity together under one roof on North Foster Drive in Baton Rouge."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Image {...images.adultMinistry} alt={images.adultMinistry.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="w-full rounded-[var(--radius-card)]" />
          <div className="grid gap-5 text-lg leading-relaxed text-muted">
            <p>
              KEP started as a church and grew into a place where our whole community can find what it needs: a church
              family, a safe place for young people, a sober home for people rebuilding their lives, and room to create.
            </p>
            <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-ink">{org.tagline}</p>
          </div>
        </div>
      </Section>
      <section id="pastors" className="scroll-mt-20 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-top" />
          <div>
            <h2 className="font-display text-4xl font-medium sm:text-5xl">Our pastors</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {org.pastors} lead Kingdom Empowerment Place. Together they pastor KEP Church and oversee its housing,
              youth and community programs.
            </p>
          </div>
        </div>
      </section>
      <section aria-label="A Good Soldier, by Lawrence Morgan">
        <div className="wrap section-y"><BookPromo /></div>
      </section>
      <Section title="Find us" id="contact">
        <div className="grid gap-4 sm:grid-cols-3">
          <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="card block p-6 hover:border-blue">
            <p className="font-bold">Address</p>
            <p className="mt-1 text-muted">{fullAddress}</p>
          </a>
          <a href={org.phoneHref} className="card block p-6 hover:border-blue">
            <p className="font-bold">Phone</p>
            <p className="mt-1 text-muted">{org.phone}</p>
          </a>
          <a href={`mailto:${org.email}`} className="card block p-6 hover:border-blue">
            <p className="font-bold">Email</p>
            <p className="mt-1 break-all text-muted">{org.email}</p>
          </a>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/church#visit" className="btn-primary">Plan your visit</Link>
          <Link href="/gallery" className="btn-secondary">View the photo gallery</Link>
        </div>
      </Section>
    </>
  );
}
