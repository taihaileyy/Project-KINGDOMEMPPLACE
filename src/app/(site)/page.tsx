import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Church, HandHeart, House, Mic, Sparkles, Users, Video } from "lucide-react";
import { HeroVideoBackground } from "@/components/hero-video";
import { housing, images, org, programs, recentEvents, weekly } from "@/content/site";

const paths = [
  { href: "/church", title: "Worship with us", line: "Sundays at 10 AM and Bible study Wednesdays at 6:30 PM.", Icon: Church },
  { href: "/housing", title: "Find housing", line: "Sober living housing with structure, support and a plan.", Icon: House },
  { href: "/programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab.", Icon: Users },
  { href: "/studio", title: "Book the studio", line: "Record, film and create in KEP's media studio.", Icon: Mic },
  { href: "/events", title: "Attend an event", line: "Conferences, workshops and community gatherings.", Icon: CalendarDays },
  { href: "/give", title: "Give", line: "Support the work happening on North Foster Drive.", Icon: HandHeart },
];

const studioUses = [
  { label: "Recording", Icon: Mic },
  { label: "Filming", Icon: Video },
  { label: "Creative projects", Icon: Sparkles },
];

export default function Home() {
  return (
    <>
      {/* Hero: the KEP logo film plays edge to edge behind the words */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-night text-white lg:min-h-[720px]"
      >
        <HeroVideoBackground />
        <div className="mx-auto mt-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-12">
          <div className="max-w-3xl">
            <h1
              id="hero-title"
              className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] sm:text-7xl xl:text-[84px]"
            >
              Empowering youth. Building futures. Changing communities.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Kingdom Empowerment Place is a church and a community home in Baton Rouge, with worship, sober living
              housing, programs for every age, events and a media studio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/church#visit" className="btn-primary">Plan your visit</Link>
              <Link href="/signup" className="btn bg-paper text-ink hover:bg-surface">Create an account</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 bg-black/40 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-7xl sm:grid-cols-3">
            {weekly.map((w) => (
              <div key={w.title} className="border-b border-white/15 px-4 py-5 sm:border-b-0 sm:border-r sm:px-6">
                <dt className="text-sm text-chrome">{w.title}</dt>
                <dd className="mt-1 font-display text-xl font-extrabold tracking-tight">{w.day}s, {w.time}</dd>
              </div>
            ))}
            <div className="px-4 py-5 sm:px-6">
              <dt className="text-sm text-chrome">Find us</dt>
              <dd className="mt-1 font-display text-xl font-extrabold tracking-tight">
                <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {org.address.line1}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Find your place */}
      <section aria-labelledby="paths-title">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="paths-title" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              What brings you to KEP?
            </h2>
            <p className="max-w-sm text-muted">Pick a starting point. One KEP account connects all of it.</p>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map(({ href, title, line, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-blue hover:bg-paper"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue transition-colors group-hover:bg-blue group-hover:text-white">
                    <Icon aria-hidden="true" className="size-6" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-extrabold tracking-tight group-hover:text-blue">{title}</span>
                    <span className="mt-1 block text-[15px] leading-snug text-muted">{line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programs */}
      <section aria-labelledby="programs-title" className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
            <h2 id="programs-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Programs built to empower our community
            </h2>
            <p className="text-lg leading-relaxed text-muted">
              Create one KEP account to explore and register for programs across our community. Some programs have
              eligibility requirements or need approval from our staff. Not sure where to start?{" "}
              <a href={org.phoneHref} className="font-semibold text-blue hover:underline">Call {org.phone}</a>.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="group flex h-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)] transition-colors hover:border-blue sm:flex-col"
                >
                  {/* A thumbnail beside the text on phones, a full-width photo from tablet up. */}
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.width}
                    height={p.image.height}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
                    className="w-28 shrink-0 object-cover sm:aspect-[16/10] sm:w-full"
                  />
                  <div className="min-w-0 p-4 [overflow-wrap:anywhere] sm:p-5">
                    <h3 className="font-display text-xl font-extrabold tracking-tight group-hover:text-blue sm:text-2xl">{p.name}</h3>
                    <p className="mt-1 text-[15px] text-muted sm:mt-1.5 sm:text-base">{p.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/housing"
                className="group flex h-full flex-col justify-between gap-8 rounded-[var(--radius-card)] bg-night p-6 text-white transition-colors hover:bg-ink"
              >
                <House aria-hidden="true" className="size-9 text-chrome" strokeWidth={1.75} />
                <div>
                  <h3 className="font-display text-2xl font-extrabold tracking-tight">Sober living housing</h3>
                  <p className="mt-1.5 text-chrome">
                    Structured, sober housing with support toward work and your goals. Apply and our housing team
                    reviews every application.
                  </p>
                  <span className="mt-4 inline-block font-semibold text-white underline-offset-4 group-hover:underline">
                    Housing information
                  </span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Studio */}
      <section aria-labelledby="studio-title" className="bg-night text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <Image
            {...images.facility}
            alt={images.facility.alt}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="aspect-[4/3] w-full rounded-[var(--radius-card)] object-cover lg:aspect-[5/4]"
          />
          <div>
            <h2 id="studio-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Reserve our studio
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-chrome">
              KEP&apos;s media studio is open to the community for recording, filming and creative projects. Pick a
              time and send a request, and our team will confirm your booking.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {studioUses.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <Icon aria-hidden="true" className="size-5 shrink-0 text-chrome" />
                  <span className="font-semibold">{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="btn-primary">Book the studio</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Housing */}
      <section aria-labelledby="housing-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 id="housing-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Sober living housing
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              A stable, sober place to live while you rebuild, with a community around you, clear expectations and
              support toward work and your goals. Many of our residents come to us after a treatment program.
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-line">
              <div className="bg-blue p-5 text-white">
                <dt className="text-sm text-white/85">Move-in deposit</dt>
                <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight">${housing.deposit}</dd>
              </div>
              <div className="bg-blue-soft p-5">
                <dt className="text-sm text-muted">Every week</dt>
                <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight text-blue">${housing.weekly}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/housing" className="btn-primary">Get housing information</Link>
              <a href={org.phoneHref} className="btn-secondary">Call about openings</a>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] bg-surface p-6 sm:p-8">
            <h3 className="font-display text-2xl font-extrabold tracking-tight">How moving in works</h3>
            <ol className="mt-6 grid gap-5">
              {housing.steps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="grid size-9 place-items-center rounded-full bg-blue font-display text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p className="mt-0.5 text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Events */}
      <section aria-labelledby="events-title" className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 id="events-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Events and gatherings
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Conferences, workshops, church services, community events and program events. Here&apos;s what&apos;s been
                happening lately.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary">View all events</Link>
              <Link href="/gallery" className="btn-secondary">Photo gallery</Link>
            </div>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recentEvents.map((e) => (
              <li key={e.title} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
                <Image
                  src={e.image.src}
                  alt={e.image.alt}
                  width={e.image.width}
                  height={e.image.height}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
                <div className="p-4">
                  <p className="font-bold leading-snug">{e.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{e.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Church */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
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
