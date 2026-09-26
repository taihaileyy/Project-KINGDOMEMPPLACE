import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { fullAddress, org, weekly } from "@/content/site";

export const metadata: Metadata = { title: "Give" };

const kinds = [
  { title: "Tithes", detail: "Returning a tenth as an act of worship." },
  { title: "Offerings", detail: "Gifts beyond the tithe for the work of the church." },
  { title: "Special giving", detail: "Support for a specific need, event or program." },
  { title: "Other giving", detail: "Anything else you'd like to give toward." },
];

export default function GivePage() {
  return (
    <>
      <PageIntro
        title="Give"
        lead="Your giving keeps worship, youth mentorship, sober living housing and community programs going on North Foster Drive."
      />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kinds.map((k) => (
            <li key={k.title} className="card p-6">
              <p className="font-display text-2xl font-extrabold tracking-tight">{k.title}</p>
              <p className="mt-2 text-muted">{k.detail}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section dark title="Ways to give">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-white/15 p-8">
            <p className="font-display text-2xl font-extrabold tracking-tight">In person</p>
            <p className="mt-2 text-chrome">
              Give during {weekly.map((w) => `${w.title} (${w.day}s, ${w.time})`).join(" or ")} at {fullAddress}.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-white/15 p-8">
            <p className="font-display text-2xl font-extrabold tracking-tight">Online</p>
            <p className="mt-2 text-chrome">
              Secure online giving, including recurring gifts and your own giving history, is coming to your KEP account
              soon. Questions? Email <a href={`mailto:${org.email}`} className="break-all text-white underline">{org.email}</a>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
