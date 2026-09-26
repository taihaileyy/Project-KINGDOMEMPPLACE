import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";
import { Section } from "@/components/section";
import { housing, images, org, programs, recentEvents, weekly } from "@/content/site";

const paths = [
  { href: "/church", title: "Worship with us", line: "Sundays at 10 AM and Bible study Wednesdays at 6:30 PM." },
  { href: "/housing", title: "Find housing", line: "Sober living housing with structure, support and a plan." },
  { href: "/programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab." },
  { href: "/studio", title: "Book the studio", line: "Record, film and create in KEP's media studio." },
  { href: "/events", title: "Come to an event", line: "Conferences, workshops and community gatherings." },
  { href: "/give", title: "Give", line: "Support the work happening on North Foster Drive." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pt-14 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-7xl xl:text-[84px]">
          Empowering youth. Building futures. Changing communities.
        </h1>
        <div>
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Kingdom Empowerment Place is a church and a community home in Baton Rouge, with worship, sober living
            housing, programs for every age, events and a media studio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/church#visit" className="btn-primary">Plan your visit</Link>
            <Link href="/signup" className="btn-secondary">Create an account</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="overflow-hidden rounded-[28px] bg-night text-white shadow-[var(--shadow-card)]">
          <HeroVideo />
          <dl className="grid border-t border-white/10 sm:grid-cols-3">
            {weekly.map((w) => (
              <div key={w.title} className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r sm:p-6">
                <dt className="text-sm text-chrome">{w.title}</dt>
                <dd className="mt-1 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                  {w.day}s, {w.time}
                </dd>
              </div>
            ))}
            <div className="p-5 sm:p-6">
              <dt className="text-sm text-chrome">Find us</dt>
              <dd className="mt-1 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {org.address.line1}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Find your place */}
      <section aria-labelledby="paths-title" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 id="paths-title" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            What brings you to KEP?
          </h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-paper p-6 transition-colors hover:border-blue"
                >
                  <span className="font-display text-2xl font-extrabold tracking-tight group-hover:text-blue">{p.title}</span>
                  <span className="mt-2 text-muted">{p.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programs */}
      <Section
        title="Programs for every season of life"
        lead="One KEP account lets you join as many programs as you like. Here's what's running now."
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <li key={p.slug} className="card overflow-hidden">
              <Link href={`/programs/${p.slug}`} className="group block h-full">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-2xl font-extrabold tracking-tight group-hover:text-blue">{p.name}</h3>
                  <p className="mt-2 text-muted">{p.summary}</p>
                </div>
              </Link>
            </li>
          ))}
          <li className="flex flex-col justify-end rounded-[var(--radius-card)] bg-blue p-6 text-white">
            <p className="font-display text-2xl font-extrabold tracking-tight">Not sure where to start?</p>
            <p className="mt-2 text-white/85">Call us and we&apos;ll help you find the right fit.</p>
            <a href={org.phoneHref} className="btn mt-5 self-start bg-paper text-blue hover:bg-blue-soft">
              Call {org.phone}
            </a>
          </li>
        </ul>
      </Section>

      {/* Studio */}
      <Section dark>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Image
            {...images.facility}
            alt={images.facility.alt}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full rounded-[var(--radius-card)] object-cover"
          />
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Reserve our studio
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-chrome">
              KEP&apos;s media studio is open to the community for recording, filming and creative projects. Pick a
              time and send a request, and our team will confirm your booking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="btn-primary">Book the studio</Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Housing */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Sober living housing
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              A stable, sober place to live while you rebuild, with a community around you, clear expectations and
              support toward work and your goals. Many of our residents come to us after a treatment program.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/housing" className="btn-primary">Get housing information</Link>
              <a href={org.phoneHref} className="btn-secondary">Call about openings</a>
            </div>
          </div>
          <dl className="card grid grid-cols-2 divide-x divide-line">
            <div className="p-6 sm:p-8">
              <dt className="text-muted">Move-in deposit</dt>
              <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight">${housing.deposit}</dd>
            </div>
            <div className="p-6 sm:p-8">
              <dt className="text-muted">Per week</dt>
              <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight">${housing.weekly}</dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* Church */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.1fr]">
          <Image
            {...images.pastors}
            alt={images.pastors.alt}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-top"
          />
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              A church family that shows up
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Led by {org.pastors}, KEP Church gathers every week to worship, study the Word and serve our
              neighborhood. Come as you are.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {weekly.map((w) => (
                <li key={w.title} className="card p-5">
                  <p className="font-display text-xl font-extrabold tracking-tight">{w.title}</p>
                  <p className="mt-1 text-muted">{w.day}s at {w.time}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/church" className="btn-primary">About the church</Link>
              <Link href="/signup" className="btn-secondary">Register with the church</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <Section title="Recently at KEP" lead="Conferences, marches, concerts and programs. New events are posted on our events page.">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {recentEvents.map((e) => (
            <li key={e.title}>
              <Image
                src={e.image.src}
                alt={e.image.alt}
                width={e.image.width}
                height={e.image.height}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-top"
              />
              <p className="mt-3 font-bold">{e.title}</p>
              <p className="text-sm text-muted">{e.when}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/events" className="btn-secondary">See upcoming events</Link>
          <Link href="/gallery" className="btn-secondary">View the photo gallery</Link>
        </div>
      </Section>

      {/* Closing */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.adultMinistry} alt="" sizes="100vw" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <h2 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            There&apos;s a place for you here.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Create a free KEP account to register for events, join programs and keep up with everything happening at
            Kingdom Empowerment Place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">Create an account</Link>
            <Link href="/give" className="btn bg-paper text-ink hover:bg-surface">Give</Link>
          </div>
        </div>
      </section>
    </>
  );
}
