import Link from "next/link";
import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Thank you" };

export default async function GiveThanks({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const [{ kind }, session] = await Promise.all([searchParams, getSession()]);
  return (
    <div className="bg-ivory px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-night p-8 text-white sm:p-12">
        <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.35),transparent_65%)]" />
        <HeartHandshake aria-hidden="true" className="relative size-12 text-electric" strokeWidth={1.5} />
        <h1 className="relative mt-5 font-display text-4xl font-medium sm:text-5xl">Thank you for giving.</h1>
        <p className="relative mt-4 text-lg leading-relaxed text-chrome">
          {kind === "monthly"
            ? "Your monthly gift is set up. Stripe will email you a receipt each month."
            : "Your gift went through, and Stripe has emailed you a receipt."}
        </p>
        {session ? (
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href="/portal/giving" className="btn-primary">See My Giving</Link>
            <Link href="/" className="btn border border-white/25 text-white hover:bg-white/10">Back to home</Link>
          </div>
        ) : (
          <>
            <p className="relative mt-6 text-chrome">
              Want to keep track of your giving? Create a free KEP account with the same email you just used, and this
              gift will show up in your giving history.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">Create an account</Link>
              <Link href="/" className="btn border border-white/25 text-white hover:bg-white/10">Back to home</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
