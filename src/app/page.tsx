import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

// Temporary home page. Phase 1 replaces it with the full public website.
export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Wordmark />
        <nav aria-label="Account" className="flex gap-2">
          <Link href="/login" className="btn-secondary">Log in</Link>
          <Link href="/signup" className="btn-primary">Create account</Link>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-28">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          Kingdom Empowerment Place
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Church, housing, programs, events and a media studio for our community. Our new website is on its way.
        </p>
      </main>
    </div>
  );
}
