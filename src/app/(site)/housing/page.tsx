import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { housing, org } from "@/content/site";

export const metadata: Metadata = { title: "Sober Living Program" };

export default function HousingPage() {
  return (
    <>
      <PageIntro
        title="Sober Living Program"
        lead="A stable, sober home with structure, community and support while you rebuild. Many of our residents come to us after a treatment program."
      >
        <a href={org.phoneHref} className="btn-primary">Call about openings</a>
        <Link href="/signup" className="btn-secondary">Create an account</Link>
      </PageIntro>

      <Section>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="card p-8">
            <dt className="text-muted">Move-in deposit</dt>
            <dd className="mt-1 font-display text-6xl font-medium">${housing.deposit}</dd>
            <dd className="mt-3 text-muted">Paid once, on the day you move in.</dd>
          </div>
          <div className="card p-8">
            <dt className="text-muted">Weekly rent</dt>
            <dd className="mt-1 font-display text-6xl font-medium">${housing.weekly}</dd>
            <dd className="mt-3 text-muted">Due every 7 days, starting one week after your deposit. Pay with PayPal or cash.</dd>
          </div>
        </dl>
      </Section>

      <Section dark title="How it works">
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {housing.steps.map((s, i) => (
            <li key={s.title} className="rounded-[var(--radius-card)] border border-white/15 p-6">
              <p className="font-display text-5xl font-semibold text-blue-soft/40">{i + 1}</p>
              <p className="mt-3 font-display text-2xl font-medium">{s.title}</p>
              <p className="mt-2 text-chrome">{s.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What to expect">
        <ul className="grid max-w-3xl gap-4 text-lg leading-relaxed text-muted">
          <li>A sober, drug-free home with clear house rules everyone agrees to.</li>
          <li>Support setting goals, finding work and taking part in KEP programs.</li>
          <li>Regular check-ins with our housing team so you&apos;re never doing it alone.</li>
          <li>Your own KEP account, where you can see your payments, balance and progress.</li>
        </ul>
        <p className="mt-10 max-w-3xl text-muted">
          Questions? Call <a href={org.phoneHref} className="font-semibold text-blue hover:underline">{org.phone}</a> or
          email <a href={`mailto:${org.email}`} className="break-all font-semibold text-blue hover:underline">{org.email}</a>.
          We&apos;ll never ask for medical records.
        </p>
      </Section>
    </>
  );
}
