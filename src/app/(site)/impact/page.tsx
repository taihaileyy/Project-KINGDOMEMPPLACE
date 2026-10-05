import type { Metadata } from "next";
import Link from "next/link";
import { Award, Briefcase, CalendarDays, GraduationCap, House, KeyRound, Sprout, Ticket, Users, type LucideIcon } from "lucide-react";
import { PageIntro, Section } from "@/components/section";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { org } from "@/content/site";

export const metadata: Metadata = { title: "Our impact", description: "What Kingdom Empowerment Place has done together with our community, from KEP's own records." };
export const dynamic = "force-dynamic";

type Metric = { key: string; label: string; value: number | null };

const icons: Record<string, LucideIcon> = {
  people_served: Users, currently_housed: House, transitioned_from_housing: KeyRound, residents_employed: Briefcase,
  program_participants: GraduationCap, youth_mentored: Sprout, program_completions: Award, events_held: CalendarDays, event_attendance: Ticket,
};

async function load(): Promise<Metric[]> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/public_impact`, {
      method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: "{}", cache: "no-store",
    });
    if (!r.ok) return [];
    const rows = await r.json();
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function ImpactPage() {
  const metrics = await load();
  return (
    <>
      <PageIntro title="Our impact" lead="Real numbers from KEP's own records, shared to show what we're doing together. Totals under 5 are not shown, to protect people's privacy." />
      <Section>
        {metrics.length > 0 ? (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:grid-cols-3">
            {metrics.map((m) => {
              const Icon = icons[m.key] ?? Users;
              return (
                <div key={m.key} className="flex flex-col gap-2 bg-paper p-5 sm:p-8">
                  <Icon aria-hidden="true" className="size-6 text-blue" strokeWidth={1.5} />
                  <dd className="order-2 font-display text-5xl font-medium leading-none sm:text-7xl">{m.value === null ? <span className="text-3xl sm:text-4xl">Fewer than 5</span> : m.value.toLocaleString("en-US")}</dd>
                  <dt className="order-3 text-[15px] leading-snug text-muted sm:text-lg">{m.label}</dt>
                </div>
              );
            })}
          </dl>
        ) : (
          <div className="max-w-2xl">
            <p className="font-display text-3xl">Our numbers are on the way.</p>
            <p className="mt-3 text-lg leading-relaxed text-muted">We&apos;re bringing KEP&apos;s records together so we can share them honestly. Until then: KEP runs a weekly Bible Study, a media studio, a computer lab and five community programs for people of every age.</p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/programs" className="btn-primary">Explore programs</Link>
          <Link href="/give" className="btn-secondary">Support the work</Link>
          <a href={org.phoneHref} className="btn-quiet text-ink">Ask us a question</a>
        </div>
      </Section>
    </>
  );
}
