export function PageIntro({ title, lead, children }: { title: string; lead: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pb-12 sm:pt-24">
      <h1 data-reveal="mask" className="max-w-5xl font-display text-6xl font-medium leading-[0.95] sm:text-8xl">{title}</h1>
      <p data-reveal className="mt-6 max-w-2xl border-t border-ink/15 pt-6 text-lg leading-relaxed text-muted sm:text-xl">{lead}</p>
      {children && <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">{children}</div>}
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        {title && (
          <div className="mb-9 max-w-3xl sm:mb-12">
            <h2 data-reveal="mask" className="font-display text-5xl font-medium leading-[0.98] sm:text-6xl">{title}</h2>
            {lead && <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-chrome" : "text-muted"}`}>{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
