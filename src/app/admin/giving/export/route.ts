import { NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// A year of gifts as a spreadsheet file. Finance staff only; the database
// applies the same rule, so anyone else gets nothing.
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !hasRole(session, "finance_admin")) return new NextResponse("Not allowed", { status: 403 });
  const year = Number(new URL(request.url).searchParams.get("year")) || new Date().getFullYear();
  const supabase = await createClient();
  const { data } = await supabase
    .from("gifts")
    .select("given_at, amount_cents, method, kind, status, donor_name, donor_email, note, funds(name)")
    .gte("given_at", `${year}-01-01T00:00:00-06:00`)
    .lt("given_at", `${year + 1}-01-01T00:00:00-06:00`)
    .order("given_at");
  // Quote every cell and neutralise leading = + - @ so a spreadsheet can't run it as a formula.
  const cell = (v: unknown) => {
    const s = String(v ?? "");
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const rows = [["Date", "Amount", "Fund", "Method", "Type", "Status", "Giver", "Email", "Note"]].concat(
    (data ?? []).map((g) => [
      String(g.given_at).slice(0, 10), ((g.amount_cents as number) / 100).toFixed(2), (g.funds as unknown as { name: string } | null)?.name ?? "",
      g.method as string, g.kind as string, g.status as string, (g.donor_name as string) ?? "", (g.donor_email as string) ?? "", (g.note as string) ?? "",
    ]),
  );
  return new NextResponse(rows.map((r) => r.map(cell).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="kep-giving-${year}.csv"`, "Cache-Control": "no-store" },
  });
}
