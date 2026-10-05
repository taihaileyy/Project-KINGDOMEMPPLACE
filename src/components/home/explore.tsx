import Image from "next/image";
import Link from "next/link";
import { HandHeart, Images, Mic } from "lucide-react";
import { Arrow } from "@/components/arrow";
import { houseImages, images } from "@/content/site";

// "Explore KEP": where to go from the homepage. One large card for the church,
// two smaller ones for programs and sober living, then three quick links.
const base =
  "group relative isolate flex flex-col justify-end overflow-hidden rounded-xl bg-night text-white shadow-[0_20px_44px_-28px_rgb(5_7_13/0.85)] ring-1 ring-ink/10 transition-[translate,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-26px_rgb(10_20_224/0.45)]";
const photo = "absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]";
const shade = "absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(5_7_13/0.9)_0%,rgb(5_7_13/0.55)_50%,rgb(5_7_13/0.18)_100%)]";
const cta = "mt-2 inline-flex items-center gap-1.5 self-start border-b border-[#5c6bff] pb-0.5 whitespace-nowrap text-[0.7rem] font-medium sm:text-[0.95rem]";

const quick = [
  { href: "/studio/book", label: "Book", full: "Book the studio", Icon: Mic },
  { href: "/gallery", label: "Gallery", full: "Gallery", Icon: Images },
  { href: "/give", label: "Give", full: "Give", Icon: HandHeart },
];

export function Explore() {
  return (
    <section id="explore" aria-labelledby="explore-title" className="relative -mt-px scroll-mt-4 bg-[#f5f0e6]">
      <div className="mx-auto max-w-7xl px-6 pb-9 pt-2 sm:pb-16 sm:pt-6">
        <p data-reveal className="text-[12.5px] font-semibold uppercase tracking-[0.24em] text-blue sm:text-sm">Explore KEP</p>
        <h2 id="explore-title" data-reveal="mask" className="mt-3.5 font-display text-[clamp(2.2rem,10.3vw,3rem)] font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
          What brings you<br className="sm:hidden" /> to KEP?
        </h2>
        <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="mt-2.5 text-[1rem] leading-snug text-muted sm:text-xl">
          Find the part of KEP that&rsquo;s right for you.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-[1.35fr_1fr_1fr] lg:gap-5">
          <Link data-reveal href="/church" className={`${base} col-span-2 h-[15.5rem] p-5 sm:h-[20rem] sm:p-8 lg:col-span-1 lg:h-[26rem]`}>
            <Image {...images.drMorgan} alt="" sizes="(min-width: 1024px) 40vw, 100vw" className={`${photo} object-[50%_8%]`} />
            <span aria-hidden="true" className={shade} />
            <span className="text-[1.05rem] font-medium text-[#6f7cff]">01</span>
            <span className="block font-display text-[2.4rem] font-medium leading-[1.05] sm:text-6xl">Church</span>
            <span className="mt-1 block text-[0.95rem] text-white/90 sm:text-lg">Worship &bull; Bible Study &bull; Community</span>
            <span className={cta}>Explore Church <Arrow /></span>
          </Link>
          <Link data-reveal style={{ "--d": "100ms" } as React.CSSProperties} href="/programs" className={`${base} h-[14.75rem] p-3.5 sm:h-[20rem] sm:p-8 lg:h-[26rem]`}>
            <Image {...images.youthMentor} alt="" sizes="(min-width: 1024px) 30vw, 50vw" className={`${photo} object-top`} />
            <span aria-hidden="true" className={shade} />
            <span className="text-[0.95rem] font-medium text-[#6f7cff]">02</span>
            <span className="block font-display text-[1.55rem] font-medium leading-[1.05] sm:text-5xl">Programs</span>
            <span className="mt-1 block text-[0.74rem] leading-snug text-white/90 sm:text-lg">Youth &bull; Arts &bull; Entrepreneurship</span>
            <span className={cta}>Explore Programs <Arrow /></span>
          </Link>
          <Link data-reveal style={{ "--d": "200ms" } as React.CSSProperties} href="/housing" className={`${base} h-[14.75rem] p-3.5 sm:h-[20rem] sm:p-8 lg:h-[26rem]`}>
            <Image {...houseImages.bedroom} alt="" sizes="(min-width: 1024px) 30vw, 50vw" className={photo} />
            <span aria-hidden="true" className={shade} />
            <span className="text-[0.95rem] font-medium text-[#6f7cff]">03</span>
            <span className="block font-display text-[1.55rem] font-medium leading-[1.05] sm:text-5xl">Sober Living</span>
            <span className="mt-1 block text-[0.74rem] leading-snug text-white/90 sm:text-lg">Structured &bull; Supportive &bull; Restorative</span>
            <span className={cta}>Explore Sober Living <Arrow /></span>
          </Link>
        </div>

        <p data-reveal className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.24em] text-blue sm:mt-10 sm:text-sm">More at KEP</p>
        <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-4">
          {quick.map(({ href, label, full, Icon }) => (
            <li key={href}>
              <Link href={href} aria-label={full} className="flex min-h-[4.25rem] items-center justify-center gap-1.5 rounded-lg border border-ink/12 bg-white/60 px-2 text-[0.92rem] font-medium transition-colors hover:border-blue hover:bg-white sm:min-h-16 sm:gap-2.5 sm:text-lg">
                <Icon aria-hidden="true" className="size-6 shrink-0 text-blue sm:size-7" strokeWidth={1.5} />
                {label}
                <span className="text-blue"><Arrow /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
