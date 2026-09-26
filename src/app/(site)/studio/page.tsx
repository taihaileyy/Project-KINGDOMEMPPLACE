import Image from "next/image";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { images, org } from "@/content/site";

export const metadata: Metadata = { title: "Book the Studio" };

const requestHref = `mailto:${org.email}?subject=${encodeURIComponent("Studio booking request")}&body=${encodeURIComponent(
  "Name:\nPhone:\nPreferred date:\nStart time:\nHow long (hours):\nWhat you'd like to do in the studio:\nAnything you'll need:\n",
)}`;

export default function StudioPage() {
  return (
    <>
      <PageIntro
        title="Reserve our studio"
        lead="KEP's media studio is open to the community for recording, filming, podcasts and creative projects. Every booking is confirmed by our team."
      >
        <a href={requestHref} className="btn-primary">Request a booking</a>
        <a href={org.phoneHref} className="btn-secondary">Call {org.phone}</a>
      </PageIntro>
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Image {...images.facility} alt={images.facility.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="w-full rounded-[var(--radius-card)]" />
          <div className="grid gap-5 text-lg leading-relaxed text-muted">
            <p>
              Tell us when you&apos;d like to come in, how long you need and what you&apos;re working on. We&apos;ll
              confirm your time or suggest another one.
            </p>
            <p>Online booking with live availability is on its way.</p>
          </div>
        </div>
      </Section>
      <Section dark title="Studio contests">
        <p className="max-w-2xl text-lg leading-relaxed text-chrome">
          KEP hosts contests in the studio with prizes for the winners. Follow KEP to hear about the next one.
        </p>
      </Section>
    </>
  );
}
