export function PageIntro({ title, lead, children }: { title: string; lead: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-20">
      <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{lead}</p>
      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function Section({
  title,
  lead,
  dark = false,
  children,
  id,
}: {
  title?: string;
  lead?: string;
  dark?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={dark ? "bg-night text-white" : undefined}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {title && (
          <div className="mb-10 max-w-3xl">
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
            {lead && <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-chrome" : "text-muted"}`}>{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
