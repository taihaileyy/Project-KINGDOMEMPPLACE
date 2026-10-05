"use client";

// If a page can't load (a dropped connection, a service hiccup), say so and
// offer a one-tap retry instead of leaving a page that does nothing.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="grid justify-items-start gap-3 rounded-3xl border border-line bg-paper p-6">
      <p className="font-display text-2xl font-semibold">That page didn&apos;t load.</p>
      <p className="max-w-md text-[15px] text-muted">This is usually a slow connection. Your information is safe.</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
