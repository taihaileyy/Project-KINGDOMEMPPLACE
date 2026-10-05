import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { houseImages, housing, images } from "@/content/site";

// The three things KEP is: a church, community programs, and sober living.
// Large, image-led cards so a new visitor understands the organization at a
// glance. Each card is one link to its own area.
const base =
  "group relative isolate flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night p-6 text-white shadow-[0_24px_60px_-30px_rgb(5_7_13/0.8)] ring-1 ring-ink/10 transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_34px_70px_-28px_rgb(10_20_224/0.45)] sm:min-h-[24rem] sm:p-8 lg:min-h-[30rem]";
const photo = "absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]";
const shade = "absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(5_7_13/0.94)_0%,rgb(5_7_13/0.62)_45%,rgb(5_7_13/0.12)_100%)]";

export function Pillars() {
  return (
    <section id="pillars" aria-labelledby="pillars-title" className="scroll-mt-20 bg-ivory">
      <div className="wrap section-y">
        <p data-reveal className="eyebrow text-blue">One place, three ways in</p>
        <h2 id="pillars-title" data-reveal="mask" className="heading-2 mt-3 max-w-3xl">Find your place at KEP</h2>
        <ul className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-6">
          <li data-reveal>
            <Link href="/church" className={base}>
              <Image {...images.preaching} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={`${photo} object-[35%_50%]`} />
              <span aria-hidden="true" className={shade} />
              <span className="eyebrow text-electric">01</span>
              <span className="mt-2 block font-display text-[2.6rem] font-medium leading-[0.95] sm:text-5xl">Church</span>
              <span className="mt-3 block text-[15px] font-medium tracking-[0.04em] text-white/85">Worship &bull; Bible Study &bull; Community</span>
              <span className="btn-quiet mt-4 text-white">Explore Church <Arrow /></span>
            </Link>
          </li>
          <li data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <Link href="/programs" className={base}>
              <Image {...images.youthMentor} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={`${photo} object-top`} />
              <span aria-hidden="true" className={shade} />
              <span className="eyebrow text-electric">02</span>
              <span className="mt-2 block font-display text-[2.6rem] font-medium leading-[0.95] sm:text-5xl">Community Programs</span>
              <span className="mt-3 block text-[15px] font-medium tracking-[0.04em] text-white/85">Youth &bull; Arts &bull; Entrepreneurship &bull; Media &bull; Technology</span>
              <span className="btn-quiet mt-4 text-white">Explore Programs <Arrow /></span>
            </Link>
          </li>
          <li data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
            <Link href="/housing" className={base}>
              <Image {...houseImages.kitchen} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={photo} />
              <span aria-hidden="true" className={shade} />
              <span className="eyebrow text-electric">03</span>
              <span className="mt-2 block font-display text-[2.6rem] font-medium leading-[0.95] sm:text-5xl">Sober Living</span>
              <span className="mt-3 block text-[15px] leading-snug text-white/85">Structured, supportive housing with community and a plan.</span>
              <span className="mt-4 flex flex-wrap gap-2.5">
                <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5 backdrop-blur"><b className="font-display text-2xl font-semibold">${housing.deposit}</b> <span className="text-[13px] text-white/80">Deposit</span></span>
                <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5 backdrop-blur"><b className="font-display text-2xl font-semibold">${housing.weekly}</b> <span className="text-[13px] text-white/80">/ Week</span></span>
              </span>
              <span className="btn-quiet mt-3 text-white">Learn More <Arrow /></span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
