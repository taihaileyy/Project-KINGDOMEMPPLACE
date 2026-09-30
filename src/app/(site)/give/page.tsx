import type { Metadata } from "next";
import { HandHeart, MapPin } from "lucide-react";
import { fullAddress, org, weekly } from "@/content/site";
import { displayName, getSession } from "@/lib/auth";
import { stripeConfigured } from "@/lib/stripe";
import { GiveForm } from "./give-form";

export const metadata: Metadata = { title: "Give" };

export default async function GivePage() {
  const session = await getSession();
  return (
    <div className="bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">Give</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Your giving keeps worship, youth mentorship, the Sober Living Program and community programs going on North
            Foster Drive. Give once or every month, with or without a KEP account.
          </p>
          <div className="relative mt-8 overflow-hidden rounded-3xl bg-night p-6 text-white">
            <div aria-hidden="true" className="absolute -right-20 -top-24 size-64 rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.35),transparent_65%)]" />
            <ul className="relative grid gap-5">
              <li className="flex gap-4">
                <HandHeart aria-hidden="true" className="size-7 shrink-0 text-electric" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold">Give in person</p>
                  <p className="mt-0.5 text-sm text-chrome">
                    {weekly.map((w) => `${w.title}, ${w.day}s at ${w.time}`).join(" · ")}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <MapPin aria-hidden="true" className="size-7 shrink-0 text-electric" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold">{fullAddress}</p>
                  <p className="mt-0.5 text-sm text-chrome">
                    Questions about giving? Email{" "}
                    <a href={`mailto:${org.email}`} className="break-all text-white underline">{org.email}</a>.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted">
            KEP is a church, not a registered 501(c)(3). Account holders can see their giving history and yearly totals in My Giving.
          </p>
        </aside>
        <div className="rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-8">
          <GiveForm signedInAs={session ? displayName(session.person) : null} enabled={stripeConfigured()} />
        </div>
      </div>
    </div>
  );
}
