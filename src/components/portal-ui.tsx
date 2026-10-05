import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Small building blocks shared by the portal and staff pages.

export function Panel({ title, id, action, children }: { title: string; id: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-3xl border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <h2 id={id} className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// A friendly empty state: what this is, and one clear next step.
export function EmptyState({ Icon, title, line, href, cta }: { Icon: LucideIcon; title: string; line: string; href?: string; cta?: string }) {
  return (
    <div className="grid justify-items-start gap-2 rounded-2xl border border-dashed border-line px-5 py-6">
      <Icon aria-hidden="true" className="size-8 text-blue" strokeWidth={1.5} />
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="max-w-md text-[15px] leading-snug text-muted">{line}</p>
      {href && cta && <Link href={href} className="btn-primary mt-2">{cta}</Link>}
    </div>
  );
}

const tones: Record<string, string> = {
  approved: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  registered: "bg-success/10 text-success",
  completed: "bg-blue/10 text-blue",
  pending: "bg-warning/10 text-warning",
  declined: "bg-danger/10 text-danger",
  cancelled: "bg-ink/10 text-muted",
  withdrawn: "bg-ink/10 text-muted",
  inactive: "bg-ink/10 text-muted",
};
const labels: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved",
  registered: "Registered",
};
export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] ?? "bg-ink/10 text-muted"}`}>
      {labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Chicago", ...opts });
