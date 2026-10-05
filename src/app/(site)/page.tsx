import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { HeroMotion } from "@/components/hero-motion";
import { CreateWorldSpotlight } from "@/components/home/create-world-spotlight";
import { HomeWatch } from "@/components/home/home-watch";
import { Pillars } from "@/components/home/pillars";
import { Upcoming } from "@/components/home/upcoming";
import { images } from "@/content/site";

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
      {/* Hero: the name, the slogan, one sentence, one main action. */}
      <section
        aria-labelledby="hero-title"
        className="hero-section relative isolate -mt-[var(--header-h)] flex min-h-[100svh] flex-col overflow-hidden bg-night text-white"
      >
        <HeroMotion />
        <div className="hero-copy mx-auto mt-auto w-full max-w-7xl px-4 pb-28 pt-40 sm:px-6 sm:pb-16 lg:pb-24">
          <p style={d(60)} className="rise eyebrow mb-3 text-electric sm:mb-5">Kingdom Empowerment Place</p>
          <h1
            id="hero-title"
            className="max-w-6xl font-display text-[8.1vw] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[clamp(2.9rem,6.6vw,6.6rem)] sm:font-medium sm:leading-[1]"
          >
            {heroLines.map((line, i) => (
              <span key={line.verb} className="mask-line whitespace-nowrap">
                <span style={d(120 + i * 260)}>
                  <em className="italic">{line.verb}</em>
                  {line.rest}
                </span>
              </span>
            ))}
          </h1>
          <p style={d(620)} className="rise mt-3 max-w-lg text-base font-medium leading-snug text-white/85 sm:mt-8 sm:text-lg sm:font-normal">
            A church and community home in Baton Rouge, with programs, sober living and a media studio for the whole family.
          </p>
          <div style={d(760)} className="rise mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 sm:mt-10">
            <Link href="/church#visit" className="btn-primary group">
              Plan your visit <Arrow />
            </Link>
            <Link href="/#pillars" className="btn-quiet group text-white">
              Explore KEP <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <Pillars />
      <Upcoming />
      <CreateWorldSpotlight />
      <Leaders />
      <HomeWatch />

      {/* Closing */}
      <section aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-night text-white">
        <Image {...images.adultMinistry} alt="" sizes="100vw" data-parallax="0.08" className="absolute inset-0 -z-10 h-full w-full scale-[1.15] object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_7_13/0.9)_0%,rgb(16_26_61/0.55)_55%,rgb(16_26_61/0.2)_100%)]" />
        <div className="wrap py-16 sm:py-28">
          <h2 id="closing-title" data-reveal="mask" className="max-w-3xl font-display text-[2.7rem] font-medium leading-[1] sm:text-[clamp(3rem,7vw,6.5rem)] sm:leading-[0.98]">
            There&apos;s a place for you here.
          </h2>
          <p data-reveal style={d(150)} className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/80 sm:mt-8 sm:text-lg">
            Whether you are looking for a church home, a program for your family or a fresh start, we would love to meet you.
          </p>
          <div data-reveal style={d(250)} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-10">
            <Link href="/church#visit" className="btn-primary group">
              Plan your visit <Arrow />
            </Link>
            <Link href="/programs" className="btn-light group">
              Join a program
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

// A short introduction to the pastors; the full story and the book live on /about.
function Leaders() {
  return (
    <section aria-labelledby="leaders-title" className="bg-ivory">
      <div className="wrap section-y grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <figure data-reveal="image" className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[0_30px_70px_-34px_rgb(5_7_13/0.7)]">
          <Image {...images.pastors} alt={images.pastors.alt} sizes="(min-width: 1024px) 52vw, 100vw" className="aspect-[4/3] w-full object-cover object-[50%_20%] sm:aspect-[16/11]" />
        </figure>
        <div>
          <p data-reveal className="eyebrow text-blue">Meet our leaders</p>
          <h2 id="leaders-title" data-reveal="mask" className="heading-2 mt-3">Dr. Lawrence Morgan &amp; Lady Kennetta Morgan</h2>
          <p data-reveal style={d(150)} className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted sm:text-lg">
            Pastors, mentors and neighbors, they founded KEP to bring worship, opportunity and restoration to one
            place in Baton Rouge.
          </p>
          <div data-reveal style={d(250)} className="mt-7">
            <Link href="/about#pastors" className="btn-primary group">
              Meet the Morgans <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
