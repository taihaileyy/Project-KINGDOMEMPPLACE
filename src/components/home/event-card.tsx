import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { shortParts, type UpcomingItem } from "@/lib/events";

// One upcoming event or recurring gathering. Flyers show their artwork; items
// without one (Bible Study, worship) get a branded date panel.
export function EventCard({ item, priority = false }: { item: UpcomingItem; priority?: boolean }) {
  const parts = item.date ? shortParts(item.date) : null;
  const when = parts ? `${parts.weekday.slice(0, 3)}, ${parts.month} ${parts.day}${item.time ? ` · ${item.time}` : ""}` : item.dateLabel ?? "";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)] transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgb(10_20_224/0.4)]">
      <Link href={item.href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-night">
        {item.image ? (
          <Image src={item.image.src} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 82vw" priority={priority} className="object-cover object-top transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(80%_90%_at_30%_20%,#1f33b8_0%,#0a1024_60%,#05070d_100%)] text-white">
            {parts ? (
              <span className="text-center">
                <span className="eyebrow block text-electric">{parts.month}</span>
                <span className="block font-display text-7xl font-medium leading-none">{parts.day}</span>
                <span className="mt-1 block text-[13px] tracking-[0.18em] text-white/75 uppercase">{parts.weekday}</span>
              </span>
            ) : (
              <span className="px-6 text-center font-display text-3xl leading-tight">{item.dateLabel}</span>
            )}
          </span>
        )}
        {item.recurring && <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white ring-1 ring-white/25">Every week</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-blue">{when}</p>
        <h3 className="mt-2 font-display text-[1.7rem] font-medium leading-[1.05]">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-muted">{item.blurb}</p>
        <Link href={item.href} className="btn-quiet group/link mt-auto pt-4 text-blue">View Event <Arrow /></Link>
      </div>
    </article>
  );
}
