import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { housing, houseImages, org } from "@/content/site";

export const metadata: Metadata = { title: "Sober Living Program" };

const homePhotos = [houseImages.kitchen, houseImages.bedroom, houseImages.hallway, houseImages.bathroom, houseImages.bedroom2, houseImages.dining];

const pillars = [
  { title: "Mentorship", line: "We support and encourage people to manage their own learning, build their skills, improve their performance and become the person they want to be." },
  { title: "Community", line: "We encourage groups of people who have something in common, such as place, culture or heritage, to come together and look out for one another." },
  { title: "Family", line: "We support people who, though not related, share a sense of common interest, identity and solidarity, and who stand with one another." },
  { title: "Belonging", line: "A close family gives each member a strong sense of belonging. We help every resident feel like an important part of the group." },
];

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

      <section aria-labelledby="home-title" className="bg-night text-white">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16">
          <h2 id="home-title" data-reveal="mask" className="font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl">
            Inside the KEP house
          </h2>
          <p data-reveal className="mt-3 max-w-xl text-[15px] leading-relaxed text-chrome sm:text-lg">
            Clean, simple and ready to be a home: shared kitchen and dining, bedrooms and bathrooms.
          </p>
        </div>
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-12 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden max-sm:scroll-pl-4">
          {homePhotos.map((img, i) => (
            <li key={img.src} data-reveal="image" style={{ "--d": `${i * 70}ms` } as React.CSSProperties} className="w-[62%] shrink-0 snap-start sm:w-auto">
              <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 62vw" className="aspect-[3/4] h-auto w-full object-cover" />
            </li>
          ))}
        </ul>
      </section>

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

      <Section title="What we stand for">
        <ul className="grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <li key={p.title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="border-b border-ink/15 py-6 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <h3 className="font-display text-3xl font-medium text-blue">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.line}</p>
            </li>
          ))}
        </ul>
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

      <section className="bg-night text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-24">
          <p data-reveal="mask" className="font-display text-[2rem] font-medium italic leading-[1.15] sm:text-6xl sm:leading-[1.1]">
            &ldquo;At KEP, we engage, equip and empower.&rdquo;
          </p>
          <p data-reveal style={{ "--d": "150ms" } as React.CSSProperties} className="mt-4 text-[15px] text-chrome">Dr. L. Morgan</p>
          <div data-reveal style={{ "--d": "250ms" } as React.CSSProperties} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a href={org.phoneHref} className="btn-primary">Call about openings</a>
            <Link href="/signup" className="btn-quiet text-white">Create an account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
