import { CalendarDays, Church, HandHeart, House, Mic, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { HeroMotion } from "@/components/hero-motion";
import { EventsCarousel } from "@/components/home/events-carousel";
import { ImpactSection } from "@/components/home/impact-section";
import { BookPromo } from "@/components/home/book-promo";
import { ProgramsRail } from "@/components/home/programs-rail";
import { houseImages, images, org, programs, recentEvents, weekly } from "@/content/site";

const quickNav = [
  { href: "/church", label: "Worship", title: "Worship with us", line: "Sundays at 10 AM and Bible study Wednesdays at 6:30 PM.", Icon: Church },
  { href: "/housing", label: "Sober Living", title: "The Sober Living Program", line: "A sober home with structure, support and a plan.", Icon: House },
  { href: "/programs", label: "Programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab.", Icon: Users },
  { href: "/studio/book", label: "Studio", title: "Book the studio", line: "Record, film and create in KEP's media studio.", Icon: Mic },
  { href: "/events", label: "Events", title: "Attend an event", line: "Conferences, workshops and community gatherings.", Icon: CalendarDays },
  { href: "/give", label: "Give", title: "Give", line: "Support the work happening on North Foster Drive.", Icon: HandHeart },
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
        <div className="hero-copy mx-auto mt-auto w-full max-w-7xl px-4 pb-10 pt-40 sm:px-6 lg:pb-20">
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

      {/* One flow on every screen size: a way in, a short welcome, then a featured
          program, pathways, numbers, events, photos, the studio, scripture, the
          church, a book, and a closing invitation, with light and dark sections
          alternating. */}

      {/* Quick navigation: icon tiles on phones, an index with icons from 640px up */}
      <section aria-labelledby="quick-title" className="bg-ivory">
        <div className="mx-auto max-w-7xl px-4 pb-2 pt-12 sm:px-6 sm:pb-6 sm:pt-16">
          <h2 id="quick-title" data-reveal="mask" className="font-display text-[2.1rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            What brings you to KEP?
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:hidden">
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
          <ul className="mt-9 hidden border-t border-ink/15 sm:grid lg:grid-cols-2 lg:gap-x-16">
            {quickNav.map(({ href, title, line, Icon }, i) => (
              <li key={href} data-reveal style={d((i % 2) * 90 + Math.floor(i / 2) * 70)} className="border-b border-ink/15">
                <Link href={href} className="group flex items-center gap-5 py-6">
                  <Icon aria-hidden="true" className="size-9 shrink-0 text-blue" strokeWidth={1.4} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-3xl leading-tight transition-colors duration-300 group-hover:text-blue sm:text-4xl">{title}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{line}</span>
                  </span>
                  <Arrow className="text-blue" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Welcome */}
      <section aria-labelledby="welcome-title" className="bg-ivory">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-12 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
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
          <figure data-reveal="image" style={d(150)} className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3] lg:mb-2 lg:aspect-[4/5]">
            <Image {...images.adultMinistry} alt={images.adultMinistry.alt} sizes="(min-width: 1024px) 35vw, 100vw" className="h-full w-full object-cover" />
          </figure>
        </div>
      </section>

      {/* Sober Living: one featured program. Costs, eligibility and how to apply
          live on /housing. */}
      <section aria-label="Sober Living Program" className="relative isolate overflow-hidden bg-night text-white">
        <div className="sm:hidden">
          <div data-reveal="image" className="relative aspect-[3/4]">
            <Image {...houseImages.kitchen} alt={houseImages.kitchen.alt} sizes="100vw" className="h-full w-full object-cover" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,#05070d_0%,rgb(5_7_13/0.92)_34%,rgb(10_16_36/0.35)_66%,rgb(10_16_36/0.1)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-11">
            <SoberCopy />
          </div>
        </div>
        <div className="mx-auto hidden max-w-7xl items-center gap-12 px-4 py-20 sm:grid sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          <div className="max-w-xl">
            <SoberCopy />
          </div>
          <div className="grid h-[26rem] grid-cols-[1.2fr_1fr] grid-rows-2 gap-2 lg:h-[32rem]">
            {[
              { img: houseImages.kitchen, cls: "row-span-2" },
              { img: houseImages.bedroom2, cls: "" },
              { img: houseImages.dining, cls: "" },
            ].map(({ img, cls }, i) => (
              <figure key={img.src} data-reveal="image" style={d(i * 120)} className={`relative overflow-hidden ${cls}`}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 28vw, 40vw" className="object-cover" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section aria-labelledby="programs-title" className="bg-ivory">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:py-20">
          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 id="programs-title" data-reveal="mask" className={h2}>
              Programs built to empower our community
            </h2>
            <p data-reveal style={d(150)} className="max-w-md text-[15px] leading-relaxed text-muted sm:text-lg lg:justify-self-end">
              One KEP account lets you explore and register. Some programs have requirements or need approval from our staff.
            </p>
          </div>
          <div className="mt-7 sm:mt-10">
            <ProgramsRail items={programs.map((p) => ({ href: `/programs/${p.slug}`, name: p.name, summary: p.summary, image: p.image }))} />
          </div>
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

      {/* Events */}
      <section aria-labelledby="events-title" className="border-t border-ink/10 bg-ivory">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20">
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
          <div className="mt-7 sm:mt-10">
            <EventsCarousel events={recentEvents} />
          </div>
        </div>
      </section>

      {/* Life at KEP: a compact photo collage */}
      <section aria-labelledby="moments-title" className="bg-night text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 sm:gap-8">
            <h2 id="moments-title" data-reveal="mask" className={h2}>
              Life at KEP
            </h2>
            <Link data-reveal href="/gallery" className="btn-quiet group text-white">
              See the gallery <Arrow />
            </Link>
          </div>
          <div className="mt-6 grid h-[21rem] grid-cols-2 grid-rows-2 gap-2 sm:mt-10 sm:h-[30rem] sm:gap-3 lg:h-[36rem] lg:grid-cols-[1.35fr_1fr]">
            {[
              { img: images.youthActivity, cls: "row-span-2" },
              { img: images.computerLab, cls: "" },
              { img: images.celebration, cls: "" },
            ].map(({ img, cls }, i) => (
              <figure key={img.src} data-reveal="image" style={d(i * 120)} className={`relative overflow-hidden ${cls}`}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 45vw, 50vw" className="object-cover" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Studio: one feature */}
      <section aria-labelledby="studio-title" className="bg-ivory text-ink">
        <div className="grid lg:grid-cols-2">
          <figure data-reveal="image" className="relative min-h-[240px] overflow-hidden sm:min-h-[360px] lg:min-h-[520px]">
            <Image {...images.facility} alt={images.facility.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <div className="flex items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-16 lg:py-20">
            <div className="max-w-lg">
              <h2 id="studio-title" data-reveal="mask" className={h2}>
                Reserve our studio
              </h2>
              <p data-reveal style={d(150)} className="mt-4 text-[15px] leading-relaxed text-muted sm:mt-6 sm:text-lg">
                Open to the community. Pick a time and send a request, and our team will confirm your booking.
              </p>
              <p data-reveal style={d(200)} className="mt-5 font-display text-[1.35rem] leading-snug sm:text-2xl">
                Recording · Filming · Creative projects
              </p>
              <div data-reveal style={d(300)} className="mt-7 sm:mt-9">
                <Link href="/studio/book" className="btn-primary group">
                  Book the studio <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture, full bleed */}
      <section aria-label="Scripture" className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.preaching} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(5_7_13/0.92)_0%,rgb(16_26_61/0.7)_60%,rgb(16_26_61/0.4)_100%)]" />
        <figure className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-24">
          <blockquote data-reveal="mask" className="font-display text-[1.7rem] font-normal italic leading-[1.2] sm:text-[clamp(2rem,4.6vw,4rem)] sm:leading-[1.15]">
            &ldquo;For I know the plans I have for you,&rdquo; declares the Lord, &ldquo;plans to prosper you and not to
            harm you, plans to give you hope and a future.&rdquo;
          </blockquote>
          <figcaption data-reveal style={d(250)} className="mt-6 text-[14px] tracking-[0.04em] text-chrome sm:mt-10 sm:text-[15px]">
            Jeremiah 29:11
          </figcaption>
        </figure>
      </section>

      {/* Church: the pastors under a church-window arch */}
      <section aria-labelledby="church-title" className="bg-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          <div data-reveal className="relative mx-auto w-full max-w-[17rem] sm:max-w-sm">
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
            <p data-reveal style={d(150)} className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted sm:mt-6 sm:text-lg">
              Led by {org.pastors}, KEP Church gathers every week to worship, study the Word and serve our
              neighborhood. Come as you are.
            </p>
            <div data-reveal style={d(300)} className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 sm:mt-9 sm:gap-y-4">
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

      {/* Dr. Morgan's book and trailer: one compact card */}
      <section aria-label="A Good Soldier, by Lawrence Morgan" className="bg-ivory">
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16">
          <BookPromo />
        </div>
      </section>

      {/* Closing */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.adultMinistry} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_7_13/0.9)_0%,rgb(16_26_61/0.55)_55%,rgb(16_26_61/0.2)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-28">
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
    </>
  );
}

// The Sober Living copy, shared by the phone (over the photo) and wider layouts.
function SoberCopy() {
  return (
    <>
      <p data-reveal className="mb-4 inline-block rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">Featured program</p>
      <h2 data-reveal="mask" className="font-display text-[2.5rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
        Sober Living Program
      </h2>
      <p data-reveal style={d(150)} className="mt-4 text-[15.5px] leading-relaxed text-white/80 sm:mt-6 sm:text-lg">
        A stable, sober home with structure, community and support toward work and your goals. Many of our
        residents come to us after a treatment program.
      </p>
      <div data-reveal style={d(250)} className="mt-6 sm:mt-8">
        <Link href="/housing" className="btn-primary group">
          Explore Sober Living <Arrow />
        </Link>
      </div>
      <p data-reveal style={d(300)} className="mt-4 text-[13px] text-chrome">
        Costs, eligibility and how to apply are on the program page.
      </p>
    </>
  );
}
