import type { Metadata } from "next";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { images, org } from "@/content/site";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book the Studio" };

export default async function StudioBookPage() {
  const session = await getSession();
  const p = session?.person;
  const defaults = {
    name: p ? [p.first_name, p.last_name].filter(Boolean).join(" ") : "",
    email: p?.email ?? "",
    phone: p?.phone ?? "",
  };

  return (
    <div className="bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">Book the studio</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Tell us when you&apos;d like to come in and what you&apos;re working on. We&apos;ll confirm your time or suggest
            another one.
          </p>
          <div className="relative mt-8 hidden lg:block">
            <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(10_20_224/0.18),transparent)]" />
            <Image {...images.facility} alt={images.facility.alt} sizes="30vw" className="w-full rounded-[var(--radius-card)] object-cover" />
          </div>
          <p className="mt-6 text-sm text-muted">
            Questions? Call <a href={org.phoneHref} className="font-semibold text-blue hover:underline">{org.phone}</a>.
          </p>
        </aside>
        <div className="rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-8">
          <BookingForm defaults={defaults} />
        </div>
      </div>
    </div>
  );
}
