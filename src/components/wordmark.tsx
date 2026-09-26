import Link from "next/link";

// Text wordmark until the KEP logo file is added to /public.
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight">
      <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-night text-sm text-white">
        KEP
      </span>
      <span className="hidden sm:inline">Kingdom Empowerment Place</span>
    </Link>
  );
}
