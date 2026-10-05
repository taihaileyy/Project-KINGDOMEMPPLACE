import type { Metadata } from "next";
import Link from "next/link";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayChicago } from "@/lib/time";
import { GiftForm } from "./gift-form";

export const metadata: Metadata = { title: "Giving" };

type Gift = { id: string; amount_cents: number; method: string; status: string; kind: string; given_at: string; donor_name: string | null; donor_email: string | null; funds: { name: string } | null; people: { first_name: string; last_name: string } | null };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default async function AdminGiving({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  await requireStaff(["finance_admin"]);
  const { year: y } = await searchParams;
  const thisYear = Number(todayChicago().slice(0, 4));
  const year = Number(y) >= 2020 && Number(y) <= thisYear ? Number(y) : thisYear;
  const supabase = await createClient();
  const [{ data: gifts }, { data: funds }] = await Promise.all([
    supabase.from("gifts").select("id, amount_cents, method, status, kind, given_at, donor_name, donor_email, funds(name), people!gifts_person_id_fkey(first_name, last_name)").gte("given_at", `${year}-01-01T00:00:00-06:00`).lt("given_at", `${year + 1}-01-01T00:00:00-06:00`).order("given_at", { ascending: false }).limit(5000),
    supabase.from("funds").select("id, name").eq("active", true).order("sort_order"),
  ]);
  const all = (gifts ?? []) as unknown as Gift[];
  const ok = all.filter((g) => g.status === "succeeded");
  const total = ok.reduce((s, g) => s + g.amount_cents, 0);
  const month = (g: Gift) => Number(new Date(g.given_at).toLocaleDateString("en-US", { timeZone: "America/Chicago", month: "numeric" })) - 1;
  const byMonth = Array.from({ length: 12 }, (_, i) => ok.filter((g) => month(g) === i).reduce((s, g) => s + g.amount_cents, 0));
  const maxMonth = Math.max(...byMonth, 1);
  const byFund = new Map<string, number>();
  for (const g of ok) byFund.set(g.funds?.name ?? "Other", (byFund.get(g.funds?.name ?? "Other") ?? 0) + g.amount_cents);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="grid gap-6">
      <DashboardBand title="Giving" lead="Finance reports. Card and bank details never reach KEP; we keep only the amounts and Stripe's reference numbers.">
        <Link href={`/admin/giving/export?year=${year}`} className="btn-primary">Download {year} (CSV)</Link>
      </DashboardBand>

      <section aria-label="Totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: `Given in ${year}`, v: money(total) },
          { l: "Gifts", v: String(ok.length) },
          { l: "Average gift", v: ok.length ? money(Math.round(total / ok.length)) : "-" },
          { l: "Refunded", v: String(all.length - ok.length) },
        ].map((c) => (
          <div key={c.l} className="rounded-3xl border border-line bg-paper p-5"><p className="font-display text-3xl font-medium">{c.v}</p><p className="text-sm text-muted">{c.l}</p></div>
        ))}
      </section>

      <Panel id="months" title="By month" action={<span className="flex gap-3 text-sm font-semibold">{thisYear > 2020 && <Link href={`/admin/giving?year=${year - 1}`} className="text-blue hover:underline">{year - 1}</Link>}{year < thisYear && <Link href={`/admin/giving?year=${year + 1}`} className="text-blue hover:underline">{year + 1}</Link>}</span>}>
        <ul className="grid h-40 grid-cols-12 items-end gap-1.5 px-2" aria-label="Giving by month">
          {byMonth.map((v, i) => (
            <li key={i} className="flex h-full flex-col justify-end text-center text-[11px] text-muted" title={`${monthNames[i]}: ${money(v)}`}>
              <span className="block rounded-t bg-blue" style={{ height: `${(v / maxMonth) * 100}%`, minHeight: v ? 3 : 0 }} />
              {monthNames[i]}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel id="funds" title="By fund">
        <ul>{[...byFund.entries()].sort((a, b) => b[1] - a[1]).map(([name, v]) => (
          <li key={name} className="flex justify-between border-t border-line px-2 py-2.5 first:border-t-0"><span>{name}</span><span className="font-semibold">{money(v)}</span></li>
        ))}{byFund.size === 0 && <li className="px-2 text-[15px] text-muted">No gifts recorded for {year}.</li>}</ul>
      </Panel>

      <Panel id="record" title="Record a cash or check gift"><GiftForm funds={(funds ?? []).map((f) => ({ id: f.id as string, name: f.name as string }))} today={todayChicago()} /></Panel>

      <Panel id="recent" title="Recent gifts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead className="text-sm text-muted"><tr><th className="px-2 py-2 font-medium">Date</th><th className="px-2 py-2 font-medium">Giver</th><th className="px-2 py-2 font-medium">Fund</th><th className="px-2 py-2 font-medium">Method</th><th className="px-2 py-2 text-right font-medium">Amount</th></tr></thead>
            <tbody>{all.slice(0, 50).map((g) => (
              <tr key={g.id} className="border-t border-line">
                <td className="px-2 py-2.5">{fmtDate(g.given_at)}</td>
                <td className="px-2 py-2.5">{g.people ? `${g.people.first_name} ${g.people.last_name}` : g.donor_name || g.donor_email || "Anonymous"}</td>
                <td className="px-2 py-2.5">{g.funds?.name}</td>
                <td className="px-2 py-2.5">{g.method}{g.kind === "recurring" ? " · recurring" : ""} {g.status !== "succeeded" && <StatusPill status="cancelled" />}</td>
                <td className="px-2 py-2.5 text-right font-semibold">{money(g.amount_cents)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
