import { CalendarDays, Church, HandHeart, House, Mic, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { HeroMotion } from "@/components/hero-motion";
import { EventsCarousel } from "@/components/home/events-carousel";
import { ImpactSection } from "@/components/home/impact-section";
import { BookPromo } from "@/components/home/book-promo";
import { ProgramsRail } from "@/components/home/programs-rail";
import { VideoFeature } from "@/components/home/video-feature";
import { ProgramsShowcase } from "@/components/home/programs-showcase";
import { housing, images, org, programs, recentEvents, weekly } from "@/content/site";

const paths = [
  { href: "/church", title: "Worship with us", line: "Sundays at 10 AM and Bible study Wednesdays at 6:30 PM." },
  { href: "/housing", title: "The Sober Living Program", line: "A sober home with structure, support and a plan." },
  { href: "/programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab." },
  { href: "/studio/book", title: "Book the studio", line: "Record, film and create in KEP's media studio." },
  { href: "/events", title: "Attend an event", line: "Conferences, workshops and community gatherings." },
  { href: "/give", title: "Give", line: "Support the work happening on North Foster Drive." },
];

const quickNav = [
  { href: "/church", label: "Worship", Icon: Church },
  { href: "/housing", label: "Sober Living", Icon: House },
  { href: "/programs", label: "Programs", Icon: Users },
  { href: "/studio/book", label: "Studio", Icon: Mic },
  { href: "/events", label: "Events", Icon: CalendarDays },
  { href: "/give", label: "Give", Icon: HandHeart },
];

const studioUses = [
  { title: "Recording", line: "Capture your voice, your music or your message." },
  { title: "Filming", line: "Shoot video for a project, a ministry or a business." },
  { title: "Creative projects", line: "Bring an idea to life in a space built for it." },
];

// Delay for staggered entrances (read by .mask-line and [data-reveal]).
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const heroLines = ["Empowering youth.", "Building futures.", "Changing communities."];

const h2 = "font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl";

export default function Home() {
  return (
    <>
      {/* Hero: full-bleed, under the transparent header. */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate -mt-[var(--header-h)] flex min-h-[100svh] flex-col overflow-hidden bg-night text-white"
      >
        <HeroMotion />
        <div className="hero-copy mx-auto mt-auto w-full max-w-7xl px-4 pb-14 pt-40 sm:px-6 lg:pb-20">
          <h1
            id="hero-title"
            className="max-w-6xl font-display text-[clamp(2.9rem,6.6vw,6.6rem)] font-medium leading-[1] tracking-[-0.01em]"
          >
            {heroLines.map((line, i) => (
              <span key={line} className="mask-line">
                <span style={d(120 + i * 140)}>{line}</span>
              </span>
            ))}
          </h1>
          <p style={d(620)} className="rise mt-8 max-w-lg text-lg leading-relaxed text-white/80">
            Kingdom Empowerment Place is a church and a community home in Baton Rouge, with worship, a sober living
            program, programs for every age, events and a media studio.
          </p>
          <div style={d(760)} className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/church#visit" className="btn-primary group">
              Plan your visit <Arrow />
            </Link>
            <Link href="/signup" className="btn-quiet group text-white max-sm:hidden">
              Create an account <Arrow />
            </Link>
          </div>

          <dl style={d(900)} className="rise mt-16 grid max-w-3xl gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
            {weekly.map((w) => (
              <div key={w.title}>
                <dt className="text-[13px] text-chrome">{w.title}</dt>
                <dd className="mt-1 text-[15px] font-semibold">{w.day}s, {w.time}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[13px] text-chrome">Find us</dt>
              <dd className="mt-1 text-[15px] font-semibold">
                <a href={org.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  {org.address.line1}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Everything below the hero. On phones the sections flow in a story order
          (quick nav, church intro, Sober Living, programs, impact, events, photos,
          studio, quote, church, book, closing) with light and dark sections
          alternating; from 640px up this is plain source order. */}
      <div className="flex flex-col sm:block">
      {/* Phones: a compact 2x3 way in. The full list below is for larger screens. */}
      <section aria-labelledby="quick-title" className="order-1 bg-ivory sm:hidden">
        <div className="px-4 pb-2 pt-12">
          <h2 id="quick-title" data-reveal="mask" className="font-display text-[2.1rem] font-medium leading-[1]">
            What brings you to KEP?
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-2.5">
            {quickNav.map(({ href, label, Icon }, i) => (
              <li key={href} data-reveal style={d(i * 60)}>
                <Link
                  href={href}
                  className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-ink/15 bg-white/55 px-3 py-4 text-[15px] font-medium transition-colors active:bg-white"
                >
                  <Icon aria-hidden="true" className="size-7 text-blue" strokeWidth={1.5} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Opening statement */}
      <section aria-labelledby="welcome-title" className="order-2 bg-ivory sm:order-none">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-12 sm:gap-12 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
          <div>
            <h2 id="welcome-title" className="sr-only">Welcome to Kingdom Empowerment Place</h2>
            <p data-reveal="mask" className="font-display text-[1.7rem] font-medium leading-[1.2] sm:text-[clamp(2rem,4.2vw,3.6rem)] sm:leading-[1.12]">
              A church that worships together, and a home on North Foster Drive where young people, families and
              neighbors in recovery find structure, skills and a place to belong.
            </p>
            <p data-reveal style={d(200)} className="mt-5 text-[14px] text-muted sm:mt-8 sm:text-[15px]">
              Led by {org.pastors}
            </p>
          </div>
          <figure data-reveal="image" style={d(150)} className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/5] lg:mb-2">
            <Image {...images.adultMinistry} alt={images.adultMinistry.alt} sizes="(min-width: 1024px) 35vw, 100vw" className="h-full w-full object-cover" />
          </figure>
        </div>
      </section>

      {/* Find your place: an index, not cards */}
      <section aria-labelledby="paths-title" className="hidden bg-ivory sm:block">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-2 sm:px-6 sm:pb-32 sm:pt-0">
          <h2 id="paths-title" data-reveal="mask" className={h2}>
            What brings you to KEP?
          </h2>
          <ul className="mt-6 grid border-t border-ink/15 sm:mt-14 lg:grid-cols-2 lg:gap-x-16">
            {paths.map(({ href, title, line }, i) => (
              <li key={href} data-reveal style={d((i % 2) * 90 + Math.floor(i / 2) * 70)} className="border-b border-ink/15">
                <Link href={href} className="group flex items-center justify-between gap-6 py-[1.125rem] sm:py-7">
                  <span>
                    <span className="block font-display text-[1.6rem] leading-tight transition-colors duration-300 group-hover:text-blue sm:text-4xl">
                      {title}
                    </span>
                    <span className="mt-1 block text-[14px] leading-snug text-muted sm:mt-1.5 sm:text-[15px] sm:leading-relaxed">{line}</span>
                  </span>
                  <Arrow className="text-blue" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ImpactSection
        className="order-5 sm:order-none"
        facts={[
          { value: String(programs.length), label: "Community programs", icon: "programs" },
          { value: String(weekly.length), label: "Church gatherings every week", icon: "church" },
          { value: "1", label: "Media studio open to the community", icon: "studio" },
          { value: "All ages", label: "Youth, adults and families welcome", icon: "ages" },
        ]}
      />

      {/* Programs */}
      <section aria-labelledby="programs-title" className="order-4 bg-ivory sm:order-none">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-32">
          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 id="programs-title" data-reveal="mask" className={h2}>
              Programs built to empower our community
            </h2>
            <p data-reveal style={d(150)} className="max-w-md text-[15px] leading-relaxed text-muted sm:text-lg lg:justify-self-end">
              <span className="sm:hidden">Swipe to explore. One KEP account lets you register; some programs need staff approval.</span>
              <span className="max-sm:hidden">
                Create one KEP account to explore and register for programs across our community. Some programs have
                eligibility requirements or need approval from our staff.
              </span>
            </p>
          </div>
          <div className="mt-7 sm:hidden">
            <ProgramsRail items={programs.map((p) => ({ href: `/programs/${p.slug}`, name: p.name, summary: p.summary, image: p.image }))} />
          </div>
          <div className="mt-16 max-sm:hidden">
            <ProgramsShowcase
              items={[
                ...programs.map((p) => ({ href: `/programs/${p.slug}`, name: p.name, summary: p.summary, image: p.image })),
                {
                  href: "/housing",
                  name: "Sober Living Program",
                  summary: "Structured, sober living with support toward work and your goals. Our team reviews every application.",
                  image: images.youthGroup2,
                  mobileHidden: true, // featured in its own preview right after
                },
              ]}
            />
          </div>
          <p data-reveal className="mt-6 text-[14px] text-muted max-sm:hidden sm:mt-10 sm:text-[15px]">
            Not sure where to start?{" "}
            <a href={org.phoneHref} className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Call {org.phone}
            </a>
          </p>
        </div>
      </section>

      {/* Scripture, full bleed */}
      <section aria-label="Scripture" className="relative isolate order-9 overflow-hidden bg-night text-white sm:order-none">
        <Image {...images.preaching} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(5_7_13/0.92)_0%,rgb(16_26_61/0.7)_60%,rgb(16_26_61/0.4)_100%)]" />
        <figure className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-40">
          <blockquote data-reveal="mask" className="font-display text-[1.7rem] font-normal italic leading-[1.2] sm:text-[clamp(2rem,4.6vw,4rem)] sm:leading-[1.15]">
            &ldquo;For I know the plans I have for you,&rdquo; declares the Lord, &ldquo;plans to prosper you and not to
            harm you, plans to give you hope and a future.&rdquo;
          </blockquote>
          <figcaption data-reveal style={d(250)} className="mt-6 text-[14px] tracking-[0.04em] text-chrome sm:mt-10 sm:text-[15px]">
            Jeremiah 29:11
          </figcaption>
        </figure>
      </section>

      {/* Studio: image bleeds to the edge */}
      <section aria-labelledby="studio-title" className="order-8 bg-ivory text-ink sm:order-none sm:bg-night sm:text-white">
        <div className="grid lg:grid-cols-2">
          <figure data-reveal="image" className="relative min-h-[240px] overflow-hidden sm:min-h-[420px] lg:min-h-[720px]">
            <Image {...images.facility} alt={images.facility.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <div className="flex items-center px-4 py-12 sm:px-6 sm:py-20 lg:px-16 lg:py-28">
            <div className="max-w-lg">
              <h2 id="studio-title" data-reveal="mask" className="font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
                Reserve our studio
              </h2>
              <p data-reveal style={d(150)} className="mt-4 text-[15px] leading-relaxed text-muted sm:mt-8 sm:text-lg sm:text-chrome">
                <span className="sm:hidden">Open to the community. Pick a time and our team will confirm your booking.</span>
                <span className="max-sm:hidden">
                  KEP&apos;s media studio is open to the community for recording, filming and creative projects. Pick a
                  time and send a request, and our team will confirm your booking.
                </span>
              </p>
              <p data-reveal style={d(200)} className="mt-5 font-display text-[1.35rem] leading-snug sm:hidden">
                Recording · Filming · Creative projects
              </p>
              <ul className="mt-7 border-t border-white/15 max-sm:hidden sm:mt-10">
                {studioUses.map(({ title, line }, i) => (
                  <li key={title} data-reveal style={d(200 + i * 90)} className="border-b border-white/15 py-4 sm:py-5">
                    <p className="font-display text-[1.4rem] sm:text-2xl">{title}</p>
                    <p className="mt-1 text-[15px] text-white/65">{line}</p>
                  </li>
                ))}
              </ul>
              <div data-reveal style={d(450)} className="mt-7 sm:mt-10">
                <Link href="/studio/book" className="btn-primary group">
                  Book the studio <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sober Living: an image-led preview on phones. Prices, eligibility and how to
          apply live on the dedicated page (/housing). */}
      <section aria-labelledby="sober-title" className="relative isolate order-3 overflow-hidden bg-night text-white sm:hidden">
        <div data-reveal="image" className="relative aspect-[3/4]">
          <Image {...images.workshop} alt={images.workshop.alt} sizes="100vw" className="h-full w-full object-cover object-top" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,#05070d_0%,rgb(5_7_13/0.92)_34%,rgb(10_16_36/0.35)_66%,rgb(10_16_36/0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-11">
          <p data-reveal className="mb-4 inline-block rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">Featured program</p>
          <h2 id="sober-title" data-reveal="mask" className="font-display text-[2.5rem] font-medium leading-[1]">
            Sober Living Program
          </h2>
          <p data-reveal style={d(150)} className="mt-4 text-[15.5px] leading-relaxed text-white/80">
            A stable, sober home with structure, community and support toward work and your goals. Many of our
            residents come to us after a treatment program.
          </p>
          <div data-reveal style={d(250)} className="mt-6">
            <Link href="/housing" className="btn-primary group">
              Explore Sober Living <Arrow />
            </Link>
          </div>
          <p data-reveal style={d(300)} className="mt-4 text-[13px] text-chrome">
            Costs, eligibility and how to apply are on the program page.
          </p>
        </div>
      </section>

      {/* Sober Living Program */}
      <section aria-labelledby="housing-title" className="hidden bg-ivory sm:block">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24">
          <div>
            <h2 id="housing-title" data-reveal="mask" className={h2}>
              Sober Living Program
            </h2>
            <p data-reveal style={d(150)} className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
              A stable, sober place to live while you rebuild, with a community around you, clear expectations and
              support toward work and your goals. Many of our residents come to us after a treatment program.
            </p>
            <dl data-reveal style={d(250)} className="mt-12 grid max-w-md grid-cols-2 border-t border-ink/15">
              <div className="pr-6 pt-6">
                <dt className="text-[14px] text-muted">Move-in deposit</dt>
                <dd className="mt-2 font-display text-7xl leading-none">${housing.deposit}</dd>
              </div>
              <div className="border-l border-ink/15 pl-6 pt-6">
                <dt className="text-[14px] text-muted">Every week</dt>
                <dd className="mt-2 font-display text-7xl leading-none">${housing.weekly}</dd>
              </div>
            </dl>
            <div data-reveal style={d(350)} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/housing" className="btn-primary group">
                About the program <Arrow />
              </Link>
              <a href={org.phoneHref} className="btn-quiet group text-ink">
                Call about openings <Arrow />
              </a>
            </div>
          </div>
          <div className="lg:pt-6">
            <h3 data-reveal className="font-sans text-[15px] font-semibold">How moving in works</h3>
            <ol className="mt-6 border-t border-ink/15">
              {housing.steps.map((step, i) => (
                <li key={step.title} data-reveal style={d(i * 100)} className="grid grid-cols-[3.5rem_1fr] border-b border-ink/15 py-7">
                  <span className="font-display text-3xl leading-none text-blue">{i + 1}</span>
                  <div>
                    <p className="font-display text-2xl leading-tight">{step.title}</p>
                    <p className="mt-2 leading-relaxed text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Events */}
      <section aria-labelledby="events-title" className="order-6 border-t border-ink/10 bg-ivory sm:order-none">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 sm:gap-8">
            <div className="max-w-2xl">
              <h2 id="events-title" data-reveal="mask" className={h2}>
                Events and gatherings
              </h2>
              <p data-reveal style={d(150)} className="mt-3 text-[15px] leading-relaxed text-muted sm:mt-6 sm:text-lg">
                Conferences, workshops, church services, community events and program events.
              </p>
            </div>
            <Link data-reveal href="/events" className="btn-quiet group text-ink">
              View all events <Arrow />
            </Link>
          </div>
          <div className="mt-7 sm:hidden">
            <EventsCarousel events={recentEvents} />
          </div>
          <ul className="mt-14 hidden grid-cols-2 gap-x-5 gap-y-10 sm:grid lg:grid-cols-4">
            {recentEvents.map((e, i) => (
              <li key={e.title} className={i % 2 === 1 ? "lg:mt-16" : ""}>
                <figure data-reveal="image" style={d(i * 120)} className="overflow-hidden">
                  <Image
                    src={e.image.src}
                    alt={e.image.alt}
                    width={e.image.width}
                    height={e.image.height}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="aspect-[4/5] w-full object-cover object-top"
                  />
                </figure>
                <p className="mt-4 font-display text-2xl leading-tight">{e.title}</p>
                <p className="mt-1 text-[14px] text-muted">{e.when}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Life at KEP: an asymmetric photo story */}
      <section aria-labelledby="moments-title" className="order-7 bg-night text-white sm:order-none">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 sm:gap-8">
            <h2 id="moments-title" data-reveal="mask" className="font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
              Life at KEP
            </h2>
            <Link data-reveal href="/gallery" className="btn-quiet group text-white">
              See the gallery <Arrow />
            </Link>
          </div>
          <div className="mt-6 grid h-[21rem] grid-cols-2 grid-rows-2 gap-2 sm:hidden">
            {[
              { img: images.youthActivity, cls: "row-span-2" },
              { img: images.computerLab, cls: "" },
              { img: images.celebration, cls: "" },
            ].map(({ img, cls }, i) => (
              <figure key={img.src} data-reveal="image" style={d(i * 120)} className={`relative overflow-hidden ${cls}`}>
                <Image src={img.src} alt={img.alt} fill sizes="50vw" className="object-cover" />
              </figure>
            ))}
          </div>
          <div className="mt-14 hidden grid-cols-1 gap-5 sm:grid lg:grid-cols-12 lg:grid-rows-[auto_auto]">
            <figure className="col-span-2 sm:col-span-1 lg:col-span-7 lg:row-span-2">
              <div data-reveal="image" className="overflow-hidden">
                <Image {...images.youthActivity} alt={images.youthActivity.alt} sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[5/6]" />
              </div>
              <figcaption className="mt-3 flex flex-col gap-0.5 text-[13px] text-muted sm:mt-4 sm:flex-row sm:justify-between sm:gap-4 sm:text-[14px] sm:text-chrome">
                <span className="font-display text-xl leading-tight text-ink sm:text-2xl sm:text-white">Youth in motion</span>
                <span className="sm:self-end">Learning, playing and growing together</span>
              </figcaption>
            </figure>
            {[
              { img: images.computerLab, title: "The computer lab", line: "Homework help and job searches" },
              { img: images.celebration, title: "Celebrations", line: "Marking what God is doing" },
            ].map((m, i) => (
              <figure key={m.title} className={`lg:col-span-5 ${i === 1 ? "max-sm:mt-8" : ""}`}>
                <div data-reveal="image" style={d(150 + i * 150)} className="overflow-hidden">
                  <Image {...m.img} alt={m.img.alt} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[3/4] w-full object-cover sm:aspect-[16/10]" />
                </div>
                <figcaption className="mt-3 flex flex-col gap-0.5 text-[13px] text-muted sm:mt-4 sm:flex-row sm:justify-between sm:gap-4 sm:text-[14px] sm:text-chrome">
                  <span className="font-display text-xl leading-tight text-ink sm:text-2xl sm:text-white">{m.title}</span>
                  <span className="sm:self-end">{m.line}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Watch: a film from Dr. Morgan, played only on request */}
      <section aria-labelledby="watch-title" className="border-y border-white/10 bg-blueblack text-white max-sm:hidden">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-28">
          <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.18em] text-electric">Watch</p>
          <h2 id="watch-title" data-reveal="mask" className="mt-3 font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            A Good Soldier
          </h2>
          <p data-reveal style={d(120)} className="mt-4 max-w-xl text-[15px] leading-relaxed text-chrome sm:text-lg">
            The book trailer from Dr. Lawrence Morgan.
          </p>
          <div data-reveal="image" className="mt-8 sm:mt-12">
            <VideoFeature id="ea_hIpFOtJM" title="A Good Soldier Book Trailer, Dr. Lawrence Morgan" />
          </div>
          <a
            data-reveal
            href="https://youtu.be/ea_hIpFOtJM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quiet group mt-6 text-white"
          >
            Watch on YouTube <Arrow />
          </a>

          {/* The book itself */}
          <div className="mt-12 grid items-center gap-8 border-t border-white/15 pt-10 sm:mt-20 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-14 sm:pt-16">
            <div data-reveal="image" className="mx-auto w-full max-w-[13rem] overflow-hidden bg-black sm:mx-0 sm:max-w-none">
              <Image
                src="/images/a-good-soldier-book.jpg"
                width={428}
                height={570}
                alt="Book cover: A Good Soldier, Ready 4 War, by Lawrence Morgan, a soldier saluting at sunset"
                sizes="(min-width: 640px) 240px, 208px"
                className="h-auto w-full"
              />
            </div>
            <div className="text-center sm:text-left">
              <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.18em] text-electric">The book</p>
              <h3 data-reveal style={d(100)} className="mt-3 font-display text-[2rem] font-medium leading-[1.05] sm:text-5xl">
                A Good Soldier: Ready 4 War
              </h3>
              <p data-reveal style={d(180)} className="mt-3 text-[15px] text-chrome sm:text-lg">by Lawrence Morgan</p>
              <a
                data-reveal
                style={d(260)}
                href="https://payhip.com/b/hM6T"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group mt-7"
              >
                Get the book <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Church: the pastors under a church-window arch */}
      <section aria-labelledby="church-title" className="order-10 bg-ivory sm:order-none">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:gap-16 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-24">
          <div data-reveal className="relative mx-auto w-full max-w-[17rem] sm:max-w-md">
            <div aria-hidden="true" className="absolute -inset-4 rounded-t-full border border-ink/15 sm:-inset-6" />
            <div className="relative overflow-hidden rounded-t-full">
              <Image
                {...images.pastors}
                alt={images.pastors.alt}
                sizes="(min-width: 1024px) 30vw, 90vw"
                data-parallax="0.05"
                className="aspect-[4/5] w-full scale-110 object-cover object-top"
              />
            </div>
          </div>
          <div>
            <h2 id="church-title" data-reveal="mask" className={h2}>
              A church family that shows up
            </h2>
            <p data-reveal style={d(150)} className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted sm:mt-8 sm:text-lg">
              Led by {org.pastors}, KEP Church gathers every week to worship, study the Word and serve our
              neighborhood. Come as you are.
            </p>
            <dl className="mt-7 border-t border-ink/15 max-sm:hidden sm:mt-12">
              {weekly.map((w, i) => (
                <div key={w.title} data-reveal style={d(200 + i * 100)} className="flex items-baseline justify-between gap-6 border-b border-ink/15 py-4 sm:py-6">
                  <dt className="font-display text-2xl sm:text-3xl">{w.title}</dt>
                  <dd className="text-[15px] text-muted">{w.day}s at {w.time}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal style={d(400)} className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 sm:mt-12 sm:gap-y-4">
              <Link href="/church" className="btn-primary group">
                About the church <Arrow />
              </Link>
              <Link href="/signup" className="btn-quiet group text-ink">
                Register with the church <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phones: Dr. Morgan's book and trailer as one compact card (full section above on larger screens) */}
      <section aria-label="A Good Soldier, by Lawrence Morgan" className="order-11 bg-ivory sm:hidden">
        <div className="px-4 pb-14">
          <BookPromo />
        </div>
      </section>

      {/* Closing */}
      <section className="relative isolate order-12 overflow-hidden bg-night text-white sm:order-none">
        <Image {...images.adultMinistry} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_7_13/0.9)_0%,rgb(16_26_61/0.55)_55%,rgb(16_26_61/0.2)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-44">
          <h2 data-reveal="mask" className="max-w-3xl font-display text-[2.7rem] font-medium leading-[1] sm:text-[clamp(3rem,7vw,6.5rem)] sm:leading-[0.98]">
            There&apos;s a place for you here.
          </h2>
          <p data-reveal style={d(150)} className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/80 sm:mt-8 sm:text-lg">
            Create a free KEP account to register for events, join programs and keep up with everything happening at
            Kingdom Empowerment Place.
          </p>
          <div data-reveal style={d(250)} className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 sm:mt-10 sm:gap-y-4">
            <Link href="/signup" className="btn-primary group">
              Create an account <Arrow />
            </Link>
            <Link href="/give" className="btn-quiet group text-white">
              Give <Arrow />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
