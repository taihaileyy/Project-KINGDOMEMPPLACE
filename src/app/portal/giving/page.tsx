import Link from "next/link";
import type { Metadata } from "next";
import { HandHeart } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { requireAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Giving" };

type Gift = {
  id: string;
  amount_cents: number;
  kind: "one_time" | "recurring";
  status: "succeeded" | "refunded";
  method: string;
  given_at: string;
  funds: { name: string } | null;
};

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default async function MyGiving() {
  await requireAccess("giving", "/portal/giving");
  const supabase = await createClient();
  // RLS returns only this person's gifts.
  const { data } = await supabase
    .from("gifts")
    .select("id, amount_cents, kind, status, method, given_at, funds(name)")
    .order("given_at", { ascending: false })
    .limit(500);
  const gifts = (data ?? []) as unknown as Gift[];

  const year = new Date().getFullYear();
  const counted = gifts.filter((g) => g.status === "succeeded");
  const thisYear = counted.filter((g) => new Date(g.given_at).getFullYear() === year).reduce((s, g) => s + g.amount_cents, 0);
  const lastYear = counted.filter((g) => new Date(g.given_at).getFullYear() === year - 1).reduce((s, g) => s + g.amount_cents, 0);

  return (
    <div className="grid gap-6">
      <DashboardBand title="My Giving" lead="Every gift you've made to KEP, online or recorded by our finance team.">
        <Link href="/give" className="btn-primary">Give</Link>
      </DashboardBand>

      <dl className="grid gap-4 sm:grid-cols-2">
        {[
          { label: `Given in ${year}`, value: thisYear },
          { label: `Given in ${year - 1}`, value: lastYear },
        ].map((t) => (
          <div key={t.label} className="rounded-3xl border border-line bg-paper p-6">
            <dt className="text-sm text-muted">{t.label}</dt>
            <dd className="mt-1 font-display text-4xl font-extrabold tracking-tight text-blue sm:text-5xl">{money(t.value)}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="history-title" className="rounded-3xl border border-line bg-paper p-4 sm:p-6">
        <h2 id="history-title" className="px-2 font-display text-2xl font-extrabold tracking-tight">Giving history</h2>
        {gifts.length === 0 ? (
          <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl bg-surface p-6 sm:flex-row sm:items-center">
            <HandHeart aria-hidden="true" className="size-10 shrink-0 text-blue" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="font-semibold">No giving history yet.</p>
              <p className="mt-0.5 text-muted">
                Gifts you make while logged in, or as a guest with this account&apos;s email, show up here.
              </p>
            </div>
            <Link href="/give" className="btn-primary">Give</Link>
          </div>
        ) : (
          <ul className="mt-3 grid">
            {gifts.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line px-2 py-4">
                <div>
                  <p className="font-semibold">{g.funds?.name ?? "Gift"}</p>
                  <p className="text-sm text-muted">
                    {new Date(g.given_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {g.kind === "recurring" ? " · Monthly" : ""}
                    {g.method === "cash" || g.method === "check" ? ` · ${g.method === "cash" ? "Cash" : "Check"}` : ""}
                  </p>
                </div>
                <p className={`font-display text-xl font-extrabold tracking-tight ${g.status === "refunded" ? "text-muted line-through" : ""}`}>
                  {money(g.amount_cents)}
                  {g.status === "refunded" && <span className="ml-2 text-sm font-semibold no-underline">Refunded</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
