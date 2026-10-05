import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { houseImages, housing, images } from "@/content/site";

// "Discover KEP": a short introduction, then the three ways in. Each card is
// one link to its own area, the same size and treatment as the others.
const card =
  "group relative isolate flex h-[19.5rem] flex-col justify-end overflow-hidden rounded-xl bg-night p-6 text-white shadow-[0_24px_50px_-30px_rgb(5_7_13/0.85)] ring-1 ring-ink/10 transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_34px_70px_-28px_rgb(10_20_224/0.45)] sm:h-[26rem] sm:p-8 lg:h-[30rem]";
const photo = "absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]";
const shade = "absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(5_7_13/0.94)_0%,rgb(5_7_13/0.68)_55%,rgb(5_7_13/0.2)_100%)]";
const num = "text-[1.15rem] font-medium text-electric";
const name = "mt-1 block font-display text-[2.7rem] font-medium leading-[1] sm:text-5xl";
const line = "mt-2 block text-[1.02rem] leading-snug text-white/90";

export function Discover() {
  return (
    <section id="discover" aria-labelledby="discover-title" className="relative -mt-px scroll-mt-4 bg-[#f5f0e6]">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-3 sm:px-6 sm:pb-16 sm:pt-6">
        <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.22em] text-blue">Discover KEP</p>
        <h2 id="discover-title" data-reveal="mask" className="mt-5 font-display whitespace-nowrap text-[clamp(2.2rem,9.8vw,3.1rem)] font-medium leading-[1] sm:text-6xl lg:text-7xl">
          More than a church.
        </h2>
        <p data-reveal style={{ "--d": "120ms", whiteSpace: "nowrap" } as React.CSSProperties} className="mt-3.5 text-[length:min(4vw,1.25rem)] leading-snug text-muted sm:text-xl">
          Worship. Community. Opportunity. Restoration.
        </p>
        <ul className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-6">
          <li data-reveal>
            <Link href="/church" className={card}>
              <Image {...images.preaching} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={`${photo} object-[42%_50%]`} />
              <span aria-hidden="true" className={shade} />
              <span className={num}>01</span>
              <span className={name}>Church</span>
              <span className={line}>Worship &bull; Bible Study &bull; Community</span>
              <span className="btn-quiet mt-3 self-start text-white">Explore Church <Arrow /></span>
            </Link>
          </li>
          <li data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <Link href="/programs" className={card}>
              <Image {...images.youthMentor} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={`${photo} object-top`} />
              <span aria-hidden="true" className={shade} />
              <span className={num}>02</span>
              <span className={name}>Community Programs</span>
              <span className={line}>Youth &bull; Arts &bull; Entrepreneurship &bull; Media &bull; Technology</span>
              <span className="btn-quiet mt-3 self-start text-white">Explore Programs <Arrow /></span>
            </Link>
          </li>
          <li data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
            <Link href="/housing" className={card}>
              <Image {...houseImages.kitchen} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className={photo} />
              <span aria-hidden="true" className={shade} />
              <span className={num}>03</span>
              <span className={name}>Sober Living</span>
              <span className={line}>Structured, supportive housing &bull; ${housing.deposit} deposit &bull; ${housing.weekly} / week</span>
              <span className="btn-quiet mt-3 self-start text-white">Learn More <Arrow /></span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
