import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { ChevronDown } from "lucide-react";
import { Explore } from "@/components/home/explore";
import { HeroMotion } from "@/components/hero-motion";
import { WorshipBackdrop } from "@/components/home/worship-backdrop";
import { CreateWorldSpotlight } from "@/components/home/create-world-spotlight";
import { HomeWatch } from "@/components/home/home-watch";
import { EventsCarousel } from "@/components/home/events-carousel";
import { ImpactSection } from "@/components/home/impact-section";
import { images, programs, recentEvents } from "@/content/site";

// Delay for staggered entrances (read by .mask-line and [data-reveal]).
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// The official slogan, one beat at a time. The verb of each beat is set in italics.
const heroLines: { verb: string; rest: string }[] = [
  { verb: "Engage", rest: " the community." },
  { verb: "Equip", rest: " the people." },
  { verb: "Empower", rest: " the nation." },
];

export default function Home() {
  return (
    <>
      {/* Hero: a worship sanctuary at night, the slogan, one action, a scroll cue
          and a soft curve into the cream Discover section. */}
      <section
        aria-labelledby="hero-title"
        className="hero-section relative isolate -mt-[var(--header-h)] flex min-h-[88svh] flex-col overflow-hidden bg-night text-white sm:min-h-[84svh]"
      >
        <WorshipBackdrop />
        <HeroMotion overlay />
        <div className="hero-copy mx-auto mt-auto w-full max-w-7xl px-6 !pt-28 pb-[3.5rem] sm:px-6 sm:!pt-44 sm:pb-28 lg:pb-32">
          <p style={d(60)} className="rise text-[12.5px] font-semibold uppercase tracking-[0.3em] text-[#5c6bff] sm:text-sm">Kingdom Empowerment Place</p>
          <h1
            id="hero-title"
            className="mt-3.5 font-display text-[clamp(1.9rem,9.5vw,3.3rem)] font-medium leading-[1.08] tracking-[-0.005em] sm:mt-6 sm:text-[clamp(3rem,5.4vw,5.4rem)] sm:leading-[1]"
          >
            {heroLines.map((line, i) => (
              <span key={line.verb} className="mask-line whitespace-nowrap">
                <span style={d(120 + i * 260)}>
                  <em className="italic text-[#aab6ff]">{line.verb}</em>
                  {line.rest}
                </span>
              </span>
            ))}
          </h1>
          <p style={d(620)} className="rise mt-5 max-w-md text-[1.15rem] leading-snug text-white/90 sm:mt-8 sm:text-xl">
            Faith. Community. Opportunity.
            <br />
            A place for the whole family.
          </p>
          <div style={d(760)} className="rise mt-6 flex w-[min(14rem,62%)] flex-col items-center sm:mt-10 sm:w-60">
            <Link href="/church#visit" className="btn-primary group w-full !min-h-[3.6rem] !rounded-[5px] text-[1.05rem] active:scale-[0.98]">
              Plan your visit <Arrow />
            </Link>
            <a href="#explore" className="mt-5 flex flex-col items-center gap-0.5 text-[15px] text-white/65 transition-colors hover:text-white sm:mt-7">
              Explore KEP
              <ChevronDown aria-hidden="true" className="size-5 animate-bounce [animation-duration:2.4s]" strokeWidth={1.5} />
            </a>
          </div>
        </div>
        {/* The curve: the cream section rises at both edges, dipping softly in the middle. */}
        <svg aria-hidden="true" viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-10 w-full sm:h-20">
          <path d="M0 34 C 280 96 640 96 980 56 C 1180 34 1320 14 1440 8 L1440 90 L0 90 Z" fill="#f5f0e6" />
          <path d="M0 34 C 280 96 640 96 980 56 C 1180 34 1320 14 1440 8" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </section>

      <Explore />
      <CreateWorldSpotlight />

      {/* Upcoming events: a swipe row, the next card peeking in */}
      <section id="events" aria-labelledby="events-title" className="scroll-mt-4 bg-[#f5f0e6]">
        <div className="mx-auto max-w-7xl px-6 pb-9 pt-2 sm:pb-16 sm:pt-6">
          <p data-reveal className="text-[12.5px] font-semibold uppercase tracking-[0.24em] text-blue sm:text-sm">What&rsquo;s happening at KEP</p>
          <h2 id="events-title" data-reveal="mask" className="mt-3.5 font-display text-[clamp(2.2rem,10.3vw,3rem)] font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            Upcoming events
          </h2>
          <p data-reveal style={d(120)} className="mt-3 max-w-md text-[0.95rem] leading-snug text-muted sm:text-lg">
            Conferences, workshops, church services, community events and program events.
          </p>
          <Link data-reveal href="/events" className="btn-quiet group mt-1 text-ink">
            View all events <Arrow />
          </Link>
          <div className="mt-3 sm:mt-6">
            <EventsCarousel events={recentEvents} />
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section aria-label="Scripture" className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.preaching} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(5_7_13/0.92)_0%,rgb(16_26_61/0.7)_60%,rgb(16_26_61/0.4)_100%)]" />
        <figure className="mx-auto max-w-5xl px-6 py-12 text-center sm:py-24">
          <blockquote data-reveal="mask" className="font-display text-[1.6rem] font-normal italic leading-[1.2] sm:text-[clamp(2rem,4.6vw,4rem)] sm:leading-[1.15]">
            &ldquo;For I know the plans I have for you,&rdquo; declares the Lord, &ldquo;plans to prosper you and not to
            harm you, plans to give you hope and a future.&rdquo;
          </blockquote>
          <figcaption data-reveal style={d(250)} className="mt-5 text-[14px] tracking-[0.04em] text-chrome sm:mt-10 sm:text-[15px]">
            Jeremiah 29:11
          </figcaption>
        </figure>
      </section>

      {/* Our impact: live totals from KEP's records (Admin controls what shows) */}
      <ImpactSection
        tone="light"
        facts={[
          { value: String(programs.length), label: "Community programs", icon: "programs" },
          { value: "Weekly", label: "Bible Study every Wednesday", icon: "church" },
          { value: "1", label: "Media studio open to the community", icon: "studio" },
          { value: "All ages", label: "Youth, adults and families welcome", icon: "ages" },
        ]}
      />

      <HomeWatch />

      {/* Meet our leaders: the full story lives on the About page */}
      <section aria-labelledby="leaders-title" className="bg-[#f5f0e6]">
        <div className="mx-auto grid max-w-7xl items-center gap-5 px-6 py-9 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p data-reveal className="mb-4 text-[12.5px] font-semibold uppercase tracking-[0.24em] text-blue sm:text-sm lg:hidden">Meet our leaders</p>
            <figure data-reveal="image" className="overflow-hidden rounded-xl shadow-[0_26px_60px_-34px_rgb(5_7_13/0.7)]">
              <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 52vw, 100vw" className="aspect-[4/3] w-full object-cover object-[50%_18%] sm:aspect-[16/11]" />
            </figure>
          </div>
          <div>
            <p data-reveal className="mb-4 hidden text-sm font-semibold uppercase tracking-[0.24em] text-blue lg:block">Meet our leaders</p>
            <h2 id="leaders-title" data-reveal="mask" className="font-display text-[clamp(1.9rem,8.4vw,2.6rem)] font-medium leading-[1.05] sm:text-6xl">
              Dr. Lawrence Morgan &amp; Lady Kennetta Morgan
            </h2>
            <p data-reveal style={d(120)} className="mt-3 max-w-lg text-[0.95rem] leading-snug text-muted sm:text-lg">
              Pastors, mentors and neighbors, they founded KEP to bring worship, opportunity and restoration to one place in Baton Rouge.
            </p>
            <Link data-reveal href="/about" className="btn-primary group mt-5 !min-h-12 !rounded-[5px]">
              Meet the Morgans <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.adultMinistry} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_7_13/0.9)_0%,rgb(16_26_61/0.6)_55%,rgb(16_26_61/0.3)_100%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-28">
          <h2 id="closing-title" data-reveal="mask" className="max-w-3xl font-display text-[clamp(2.3rem,10.5vw,3.4rem)] font-medium leading-[1.02] sm:text-[clamp(3rem,7vw,6.5rem)] sm:leading-[0.98]">
            There&rsquo;s a place for you here.
          </h2>
          <p data-reveal style={d(150)} className="mt-4 max-w-lg text-[0.95rem] leading-snug text-white/85 sm:mt-8 sm:text-lg">
            Create a free KEP account to register for events, join programs and stay connected.
          </p>
          <div data-reveal style={d(250)} className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-10">
            <Link href="/signup" className="btn-primary group !min-h-12 !rounded-[5px] !px-4">
              Create an account <Arrow />
            </Link>
            <Link href="/church#visit" className="btn !min-h-12 !rounded-[5px] border border-white/45 !px-4 text-white hover:bg-white/10">
              Plan your visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
