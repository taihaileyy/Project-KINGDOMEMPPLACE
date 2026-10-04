import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { HeroMotion } from "@/components/hero-motion";
import { ChipNav } from "@/components/home/chip-nav";
import { CreateWorldSpotlight } from "@/components/home/create-world-spotlight";
import { HomeWatch } from "@/components/home/home-watch";
import { EventsCarousel } from "@/components/home/events-carousel";
import { BookPromo } from "@/components/home/book-promo";
import { ProgramsRail } from "@/components/home/programs-rail";
import { ScheduleFooter, ScheduleHero } from "@/components/schedule-views";
import { houseImages, images, org, programs, recentEvents } from "@/content/site";

// Delay for staggered entrances (read by .mask-line and [data-reveal]).
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// The official slogan, one beat at a time. The verb of each beat is set in italics.
const heroLines: { verb: string; rest: string }[] = [
  { verb: "Engage", rest: " the community," },
  { verb: "Equip", rest: " the people," },
  { verb: "and Empower", rest: " the nation." },
];

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
        <div className="hero-copy mx-auto mt-auto w-full max-w-7xl px-4 pb-28 pt-40 sm:px-6 sm:pb-10 lg:pb-20">
          <h1
            id="hero-title"
            className="max-w-6xl font-display text-[clamp(2.9rem,6.6vw,6.6rem)] font-medium leading-[1] tracking-[-0.01em]"
          >
            {heroLines.map((line, i) => (
              <span key={line.verb} className="mask-line">
                <span style={d(120 + i * 260)}>
                  <em className="italic">{line.verb}</em>
                  {line.rest}
                </span>
              </span>
            ))}
          </h1>
          <p style={d(620)} className="rise mt-8 max-w-lg text-lg leading-relaxed text-white/80">
            Kingdom Empowerment Place: a church and a community home in Baton Rouge, with worship, a sober living
            program, programs for every age, events and a media studio.
          </p>
          <div style={d(760)} className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/church#visit" className="btn-primary group">
              Plan your visit <Arrow />
            </Link>
          </div>

          <dl style={d(900)} className="rise mt-16 grid max-w-3xl gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
            <ScheduleHero />
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

      {/* One app-like flow: shortcuts, the game, watch and listen, then swipeable rows. */}
      <ChipNav />
      <CreateWorldSpotlight />
      <HomeWatch />
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
            <ProgramsRail items={programs.map((p) => ({ href: `/programs/${p.slug}`, name: p.name, summary: p.summary, image: p.image, art: p.art }))} />
          </div>
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
            <div data-reveal style={d(220)} className="mt-6 border-t border-ink/15 pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue">This week at KEP</p>
              <ScheduleFooter className="mt-2 text-[15px] leading-7 text-ink" />
            </div>
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
