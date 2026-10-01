import Link from "next/link";

const tabs = [
  { href: "/admin/paradise", label: "Dashboard" },
  { href: "/admin/paradise/questions", label: "Questions" },
  { href: "/admin/paradise/levels", label: "Levels" },
  { href: "/admin/paradise/videos", label: "Videos" },
  { href: "/admin/paradise/settings", label: "Game Settings" },
];

export function ParadiseAdminTabs({ current }: { current: string }) {
  return (
    <nav aria-label="Create Your World sections" className="mb-6 flex flex-wrap items-center gap-1 border-b border-line">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={current === t.href ? "page" : undefined}
          className="-mb-px border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-muted hover:text-ink aria-[current=page]:border-blue aria-[current=page]:text-ink"
        >
          {t.label}
        </Link>
      ))}
      <Link href="/create-your-world" target="_blank" className="ml-auto px-3 py-3 text-sm font-semibold text-blue hover:underline">
        Preview the game ↗
      </Link>
    </nav>
  );
}

// "Saved." / error banner driven by ?saved= and ?error= in the address.
export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p role="alert" className="mb-4 rounded-[var(--radius-control)] border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</p>;
  if (saved) return <p role="status" className="mb-4 rounded-[var(--radius-control)] border border-success/40 bg-success/10 px-4 py-3 text-sm font-semibold text-success">Saved.</p>;
  return null;
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
