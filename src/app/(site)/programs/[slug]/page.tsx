import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArtsArt } from "@/components/arts-art";
import { CollectionVideos } from "@/components/media/collection-videos";
import { COLLECTION } from "@/lib/media";
import { EnrollPanel } from "@/components/join/enroll-panel";
import { org } from "@/content/site";
import { fetchProgram } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await fetchProgram(slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await fetchProgram(slug);
  if (!p) notFound();

  return (
    <>
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <Link href="/programs" className="text-sm font-semibold text-blue hover:underline">All programs</Link>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.98] sm:text-6xl">{p.name}</h1>
        <div className="mt-6 grid max-w-xl gap-4 text-lg leading-relaxed text-muted">
          {p.body.map((para) => <p key={para}>{para}</p>)}
        </div>
        <h2 className="mt-10 font-display text-2xl font-medium">What&apos;s included</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {p.highlights.map((h) => (
            <li key={h} className="rounded-[var(--radius-control)] border border-line px-4 py-3 font-semibold">{h}</li>
          ))}
        </ul>
        <div className="mt-10 grid justify-items-start gap-4">
          <EnrollPanel programId={p.id} slug={p.slug} needsApproval={p.requires_approval} />
          <a href={org.phoneHref} className="btn-secondary self-start">Ask a question</a>
        </div>
      </div>
      {p.art ? (
        <ArtsArt className="aspect-[4/5] w-full rounded-[var(--radius-card)]" label="Brush strokes, a palette, a paintbrush and a musical note" />
      ) : (
        <Image
          src={p.image.src}
          alt={p.image.alt}
          width={p.image.width}
          height={p.image.height}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover"
        />
      )}
    </div>
    <CollectionVideos collection={COLLECTION.program(p.slug)} title={`Watch: ${p.name}`} />
    </>
  );
}
