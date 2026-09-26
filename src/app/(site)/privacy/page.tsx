import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/section";
import { org } from "@/content/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <PageIntro title="Privacy" lead="What we collect, why, and who can see it." />
      <Section>
        <div className="grid max-w-3xl gap-5 text-lg leading-relaxed text-muted">
          <p>
            We only ask for what we need for the thing you&apos;re doing: your name and email for an account, and more
            only when you apply for housing, join a program or book the studio.
          </p>
          <p>
            You can see your own information in your KEP account. Staff see only what their role requires. Giving and
            housing records are never public, and we never ask for medical records.
          </p>
          <p>
            Card and bank details are handled by our payment provider and are never stored by KEP.
          </p>
          <p>
            To ask for a copy of your information, or to have it corrected or deleted, email{" "}
            <a href={`mailto:${org.email}`} className="break-all font-semibold text-blue hover:underline">{org.email}</a>.
          </p>
        </div>
      </Section>
    </>
  );
}
