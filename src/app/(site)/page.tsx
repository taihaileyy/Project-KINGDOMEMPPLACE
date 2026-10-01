import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, Church, Clapperboard, HandHeart, House, MapPin, Mic, Sparkles, Users } from "lucide-react";
import { HeroShow } from "@/components/hero-show";
import { ImpactSection } from "@/components/home/impact-section";
import { housing, images, org, programs, recentEvents, weekly } from "@/content/site";

const paths = [
  { href: "/church", title: "Worship with us", line: "Sundays at 10 AM and Bible study Wednesdays at 6:30 PM.", Icon: Church },
  { href: "/housing", title: "Sober Living Program", line: "A sober home with structure, support and a plan.", Icon: House },
  { href: "/programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab.", Icon: Users },
  { href: "/studio/book", title: "Book the studio", line: "Record, film and create in KEP's media studio.", Icon: Mic },
  { href: "/events", title: "Attend an event", line: "Conferences, workshops and community gatherings.", Icon: CalendarDays },
  { href: "/give", title: "Give", line: "Support the work happening on North Foster Drive.", Icon: HandHeart },
];

const studioUses = [
  { title: "Recording", line: "Capture your voice, your music or your message.", Icon: Mic },
  { title: "Filming", line: "Shoot video for a project, a ministry or a business.", Icon: Clapperboard },
  { title: "Creative projects", line: "Bring an idea to life in a space built for it.", Icon: Sparkles },
];

const weeklyIcons = [Church, BookOpen];

// Delay for staggered entrances (read by the .rise and [data-reveal] styles).
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const moments = [
  { img: images.youthActivity, title: "Youth in motion", line: "Young people learning, playing and growing together." },
  { img: images.computerLab, title: "The computer lab", line: "Homework help, job searches and new skills." },
  { img: images.workshop, title: "Workshops", line: "Adults learning together and building something new." },
  { img: images.celebration, title: "Celebrations", line: "Dressing up and celebrating what God is doing." },
];

// Light sections slide up over the dark section before them with rounded top
// corners, the same panel shape as the menu drawer. The dark section adds the
// same amount of bottom padding so nothing it shows is covered.
const sheet = "relative z-10 -mt-7 rounded-t-[28px]";

export default function Home() {
  return (
    <>
      {/* Hero: the KEP logo film plays edge to edge behind the words */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-night pb-7 text-white lg:min-h-[720px]"
      >
        <HeroShow />
        <div className="mx-auto mt-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-12">
          <div className="max-w-3xl">
            <h1
              id="hero-title"
              style={d(100)}
              className="rise font-display text-5xl font-extrabold leading-[0.98] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] sm:text-7xl xl:text-[84px]"
            >
              Empowering youth. Building futures. Changing communities.
            </h1>
            <p style={d(280)} className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Kingdom Empowerment Place is a church and a community home in Baton Rouge, with worship, a sober living
              program, programs for every age, events and a media studio.
            </p>
            <div style={d(440)} className="rise mt-8 flex flex-wrap gap-3">
              <Link href="/church#visit" className="btn-primary">Plan your visit</Link>
              <Link href="/signup" className="btn bg-paper text-ink hover:bg-surface">Create an account</Link>
            </div>
          </div>
          <div aria-hidden="true" style={d(900)} className="rise mt-10 hidden items-center gap-3 text-xs font-semibold text-white/60 lg:flex">
            <span className="block h-8 w-px animate-[nudge_1.8s_ease-in-out_infinite] bg-white/70" />
            Scroll
          </div>
        </div>
        <div className="border-t border-white/15 bg-black/40 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-7xl sm:grid-cols-3">
            {weekly.map((w, i) => {
              const Icon = weeklyIcons[i] ?? Church;
              return (
                <div key={w.title} className="flex items-center gap-4 border-b border-white/15 px-4 py-5 sm:border-b-0 sm:border-r sm:px-6">
                  <Icon aria-hidden="true" className="size-6 shrink-0 text-electric" strokeWidth={1.75} />
                  <div>
                    <dt className="text-sm text-chrome">{w.title}</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold tracking-tight">{w.day}s, {w.time}</dd>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
              <MapPin aria-hidden="true" className="size-6 shrink-0 text-electric" strokeWidth={1.75} />
              <div>
                <dt className="text-sm text-chrome">Find us</dt>
                <dd className="mt-0.5 font-display text-xl font-extrabold tracking-tight">
                  <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {org.address.line1}
                  </a>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* Find your place: the menu drawer's rows, on white */}
      <section aria-labelledby="paths-title" className={`${sheet} bg-paper`}>
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="paths-title" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              What brings you to KEP?
            </h2>
            <p className="max-w-sm text-muted">Pick a starting point. One KEP account connects all of it.</p>
          </div>
          <ul className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {paths.map(({ href, title, line, Icon }, i) => (
              <li key={href} data-reveal style={d(i * 70)} className="border-b border-line">
                <Link
                  href={href}
                  className="group relative flex h-full items-start gap-4 py-5 pl-4 pr-2 transition-colors before:absolute before:inset-y-5 before:left-0 before:w-[3px] before:rounded-full before:bg-blue before:opacity-0 before:transition-opacity hover:bg-surface hover:before:opacity-100 focus-visible:before:opacity-100"
                >
                  <Icon aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-ink/70 transition-colors group-hover:text-blue" strokeWidth={1.5} />
                  <span>
                    <span className="block font-display text-xl font-extrabold tracking-tight">{title}</span>
                    <span className="mt-1 block text-[15px] leading-snug text-muted">{line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ImpactSection
        facts={[
          { value: String(programs.length), label: "Community programs", icon: "programs" },
          { value: String(weekly.length), label: "Church gatherings every week", icon: "church" },
          { value: "1", label: "Media studio open to the community", icon: "studio" },
          { value: "All ages", label: "Youth, adults and families welcome", icon: "ages" },
        ]}
      />

      {/* Programs */}
      <section aria-labelledby="programs-title" className={`${sheet} bg-surface`}>
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14">
          <div data-reveal className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
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
            {programs.map((p, i) => (
              <li key={p.slug} data-reveal style={d(i * 80)}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="group relative flex h-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)] transition-colors before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-blue before:opacity-0 before:transition-opacity hover:border-blue hover:before:opacity-100 sm:flex-col"
                >
                  {/* A thumbnail beside the text on phones, a full-width photo from tablet up. */}
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.width}
                    height={p.image.height}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
                    className="w-28 shrink-0 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:aspect-[16/10] sm:w-full"
                  />
                  <div className="min-w-0 p-4 [overflow-wrap:anywhere] sm:p-5">
                    <h3 className="font-display text-xl font-extrabold tracking-tight group-hover:text-blue sm:text-2xl">{p.name}</h3>
                    <p className="mt-1 text-[15px] text-muted sm:mt-1.5 sm:text-base">{p.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
            <li data-reveal style={d(programs.length * 80)}>
              <Link
                href="/housing"
                className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[var(--radius-card)] bg-night p-6 text-white"
              >
                <div aria-hidden="true" className="absolute -bottom-24 -right-24 size-64 rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.3),transparent_65%)]" />
                <House aria-hidden="true" className="size-9 text-electric" strokeWidth={1.5} />
                <div className="relative">
                  <h3 className="font-display text-2xl font-extrabold tracking-tight">Sober Living Program</h3>
                  <p className="mt-1.5 text-chrome">
                    Structured, sober living with support toward work and your goals. Apply and our team reviews
                    every application.
                  </p>
                  <span className="mt-4 inline-block font-semibold text-electric underline-offset-4 group-hover:underline">
                    About the program
                  </span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Studio */}
      <section aria-labelledby="studio-title" className="relative isolate overflow-hidden bg-night text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div data-reveal className="relative">
            <div aria-hidden="true" className="absolute -inset-10 -z-10 animate-[drift_14s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(closest-side,rgb(92_107_255/0.35),transparent)]" />
            <Image
              {...images.facility}
              alt={images.facility.alt}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[4/3] w-full rounded-[var(--radius-card)] object-cover ring-1 ring-white/15 lg:aspect-[5/4]"
            />
          </div>
          <div data-reveal style={d(150)}>
            <h2 id="studio-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Reserve our studio
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-chrome">
              KEP&apos;s media studio is open to the community for recording, filming and creative projects. Pick a
              time and send a request, and our team will confirm your booking.
            </p>
            <ul className="mt-6 grid border-t border-white/10">
              {studioUses.map(({ title, line, Icon }) => (
                <li key={title} className="flex items-center gap-4 border-b border-white/10 py-4">
                  <Icon aria-hidden="true" className="size-7 shrink-0 text-electric" strokeWidth={1.5} />
                  <div>
                    <p className="text-lg font-semibold leading-tight">{title}</p>
                    <p className="mt-0.5 text-[15px] text-white/70">{line}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio/book" className="btn-primary">Book the studio</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Housing */}
      <section aria-labelledby="housing-title" className={`${sheet} bg-paper`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-2 lg:gap-14">
          <div data-reveal>
            <h2 id="housing-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Sober Living Program
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              A stable, sober place to live while you rebuild, with a community around you, clear expectations and
              support toward work and your goals. Many of our residents come to us after a treatment program.
            </p>
            <dl className="relative mt-8 grid max-w-md grid-cols-2 overflow-hidden rounded-[var(--radius-card)] bg-night text-white">
              <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.35),transparent_65%)]" />
              <div className="relative border-r border-white/10 p-5 sm:p-6">
                <dt className="text-sm text-electric">Move-in deposit</dt>
                <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight">${housing.deposit}</dd>
              </div>
              <div className="relative p-5 sm:p-6">
                <dt className="text-sm text-electric">Every week</dt>
                <dd className="mt-1 font-display text-5xl font-extrabold tracking-tight">${housing.weekly}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/housing" className="btn-primary">About the program</Link>
              <a href={org.phoneHref} className="btn-secondary">Call about openings</a>
            </div>
          </div>
          <div data-reveal style={d(150)} className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <h3 className="font-display text-2xl font-extrabold tracking-tight">How moving in works</h3>
            <ol className="mt-6 grid">
              {housing.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="relative grid grid-cols-[auto_1fr] gap-4 pb-6 last:pb-0 [&:not(:last-child)]:before:absolute [&:not(:last-child)]:before:bottom-0 [&:not(:last-child)]:before:left-[17px] [&:not(:last-child)]:before:top-10 [&:not(:last-child)]:before:w-px [&:not(:last-child)]:before:bg-blue/30"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-blue font-display text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
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
          <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
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
            {recentEvents.map((e, i) => (
              <li key={e.title} data-reveal style={d(i * 90)} className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
                <Image
                  src={e.image.src}
                  alt={e.image.alt}
                  width={e.image.width}
                  height={e.image.height}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="aspect-[4/5] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="relative bg-paper p-4">
                  <p className="font-bold leading-snug">{e.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{e.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Life at KEP */}
      <section aria-labelledby="moments-title" className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 id="moments-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Life at KEP
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">Real moments from the people who make this place home.</p>
            </div>
            <Link href="/gallery" className="btn-secondary">See the gallery</Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {moments.map((m, i) => (
              <li key={m.title} data-reveal style={d(i * 90)} className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)]">
                <div className="overflow-hidden">
                  <Image
                    {...m.img}
                    alt={m.img.alt}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <span aria-hidden="true" className="block h-0.5 w-8 bg-blue" />
                  <p className="mt-3 font-display text-lg font-extrabold leading-tight tracking-tight sm:text-xl">{m.title}</p>
                  <p className="mt-1 text-sm leading-snug text-muted sm:text-[15px]">{m.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Church: the pastors under a church-window arch */}
      <section aria-labelledby="church-title" className="bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 -z-0 rounded-t-full rounded-b-[34px] border border-blue/15 sm:-inset-6 sm:rounded-b-[36px]" />
            <Image
              {...images.pastors}
              alt={images.pastors.alt}
              sizes="(min-width: 1024px) 30vw, 90vw"
              className="relative aspect-[4/5] w-full rounded-t-full rounded-b-[28px] object-cover object-top shadow-[0_24px_60px_rgb(11_13_18/0.18)]"
            />
            <div className="absolute -bottom-5 right-3 rounded-2xl bg-night px-5 py-4 text-white shadow-xl sm:-right-8">
              <p className="font-display text-3xl font-extrabold leading-none tracking-tight">10 AM</p>
              <p className="mt-1 text-sm text-electric">Sunday worship</p>
            </div>
          </div>
          <div data-reveal style={d(150)}>
            <h2 id="church-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              A church family that shows up
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Led by {org.pastors}, KEP Church gathers every week to worship, study the Word and serve our
              neighborhood. Come as you are.
            </p>
            <ul className="mt-6 grid border-t border-line">
              {weekly.map((w, i) => {
                const Icon = weeklyIcons[i] ?? Church;
                return (
                  <li key={w.title} className="flex items-center gap-4 border-b border-line py-4">
                    <Icon aria-hidden="true" className="size-7 shrink-0 text-blue" strokeWidth={1.5} />
                    <div>
                      <p className="font-display text-xl font-extrabold tracking-tight">{w.title}</p>
                      <p className="mt-0.5 text-muted">{w.day}s at {w.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/church" className="btn-primary">About the church</Link>
              <Link href="/signup" className="btn-secondary">Register with the church</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative isolate overflow-hidden border-b border-electric/60 bg-night text-white">
        <Image {...images.adultMinistry} alt="" sizes="100vw" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <h2 data-reveal className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
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
