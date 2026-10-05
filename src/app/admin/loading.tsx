// Shown instantly while a page loads, so a tap on a link or menu item always
// gives feedback instead of looking like nothing happened.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid gap-4" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <div className="h-36 animate-pulse rounded-3xl bg-night/90" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-3xl border border-line bg-paper" />)}
      </div>
      <div className="h-48 animate-pulse rounded-3xl border border-line bg-paper" />
    </div>
  );
}
