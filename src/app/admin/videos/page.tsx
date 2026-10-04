import type { Metadata } from "next";
import Link from "next/link";
import { DashboardBand } from "@/components/app-shell";
import { Field, Notice } from "@/components/paradise/admin-ui";
import { MediaField } from "@/components/paradise/media-field";
import { deleteMedia, saveMedia } from "@/app/admin/videos/actions";
import { programs, recentEvents } from "@/content/site";
import { requireMediaStaff } from "@/lib/auth";
import { slugify, sourceLabel, type MediaItem } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Videos" };

type Row = MediaItem & { is_active: boolean };

function Fields({ it }: { it?: Row }) {
  const key = it?.id ?? "new";
  const has = (c: string) => it?.collections.includes(c) ?? false;
  const program = it?.collections.find((c) => c.startsWith("program:"))?.slice(8) ?? "";
  const event = it?.collections.find((c) => c.startsWith("event:"))?.slice(6) ?? "";
  return (
    <div className="grid gap-5">
      {it && <input type="hidden" name="id" value={it.id} />}
      <Field label="Title" htmlFor={`title-${key}`}><input id={`title-${key}`} name="title" required maxLength={160} defaultValue={it?.title ?? ""} className="field-input" /></Field>
      <MediaField name="url" kind="video" bucket="site-media" label="Video or audio" defaultValue={it?.url ?? ""} hint="Paste a YouTube, Facebook or other web link, or upload a file (up to 50 MB)." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type"><select name="kind" defaultValue={it?.kind ?? "video"} className="field-input"><option value="video">Video</option><option value="audio">Audio</option></select></Field>
        <Field label="Shape" hint="Auto works for most links. Choose Vertical for phone-style short videos.">
          <select name="orientation" defaultValue="auto" className="field-input"><option value="auto">Auto{it ? ` (now ${it.orientation})` : ""}</option><option value="landscape">Landscape (wide)</option><option value="vertical">Vertical (short-form)</option></select>
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Where should it appear?</legend>
        {[["featured", "Featured (the big player on Watch & Listen)"], ["shorts", "Short-form feed (swipe up and down)"], ["watch", "Watch & Listen page"]].map(([c, label]) => (
          <label key={c} className="flex items-center gap-3 text-sm"><input type="checkbox" name={`c_${c}`} defaultChecked={has(c)} className="size-5 accent-[var(--kep-blue)]" />{label}</label>
        ))}
        <div className="mt-1 grid gap-4 sm:grid-cols-2">
          <Field label="On a program page">
            <select name="program" defaultValue={program} className="field-input"><option value="">None</option>{programs.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
          </Field>
          <Field label="With an event">
            <select name="event" defaultValue={event} className="field-input"><option value="">None</option>{recentEvents.map((e) => <option key={e.title} value={slugify(e.title)}>{e.title}</option>)}</select>
          </Field>
        </div>
      </fieldset>
      <MediaField name="poster_url" kind="image" bucket="site-media" label="Thumbnail (optional)" defaultValue={it?.poster_url ?? ""} hint="YouTube videos use their own thumbnail automatically." />
      <Field label="Description (optional)"><textarea name="description" rows={2} maxLength={1000} defaultValue={it?.description ?? ""} className="field-input" /></Field>
      <Field label="Transcript (optional)" hint="Paste the words spoken in the video. It shows under the player for people who can't listen.">
        <textarea name="transcript" rows={5} maxLength={60000} defaultValue={it?.transcript ?? ""} className="field-input" />
      </Field>
      <MediaField name="captions_url" kind="captions" bucket="site-media" label="Captions file (optional, .vtt)" defaultValue={it?.captions_url ?? ""} hint="For uploaded videos. YouTube videos use their own captions." />
      <div className="flex flex-wrap items-center gap-6">
        <Field label="Order"><input name="sort_order" type="number" min={0} defaultValue={it?.sort_order ?? 100} className="field-input !w-28" /></Field>
        <label className="flex items-center gap-3 self-end pb-2 text-sm font-semibold"><input type="checkbox" name="is_active" defaultChecked={it?.is_active ?? true} className="size-5 accent-[var(--kep-blue)]" /> Show on the website</label>
      </div>
    </div>
  );
}

export default async function VideosAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireMediaStaff();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("media_items").select("*").order("sort_order").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <div className="grid gap-6">
      <DashboardBand title="Videos" lead="Add videos and audio once and they can appear on Watch & Listen, the short-form feed, programs and events. No developer needed.">
        <Link href="/watch" target="_blank" className="btn border border-white/25 text-white hover:bg-white/10">View Watch &amp; Listen ↗</Link>
      </DashboardBand>
      <Notice saved={sp.saved} error={sp.error} />
      <ul className="grid gap-3">
        {rows.map((it) => (
          <li key={it.id} className="card">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 p-4">
                <span className="font-extrabold">{it.title}</span>
                <span className="text-sm text-muted">{sourceLabel[it.source]} · {it.orientation}{it.collections.length ? ` · ${it.collections.join(", ")}` : ""}</span>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${it.is_active ? "bg-success/15 text-success" : "bg-line text-muted"}`}>{it.is_active ? "Shown" : "Hidden"}</span>
                <span className="text-sm font-semibold text-blue">Edit</span>
              </summary>
              <div className="grid gap-4 border-t border-line p-4">
                <form action={saveMedia} className="grid max-w-2xl gap-4"><Fields it={it} /><div><button className="btn-primary">Save</button></div></form>
                <details className="max-w-2xl">
                  <summary className="cursor-pointer text-sm font-semibold text-danger">Delete</summary>
                  <form action={deleteMedia} className="mt-3 rounded-[var(--radius-card)] border border-danger/40 p-4">
                    <p className="text-sm text-muted">Remove &ldquo;{it.title}&rdquo; for good? To hide it instead, untick &ldquo;Show on the website&rdquo;.</p>
                    <input type="hidden" name="id" value={it.id} /><button className="btn mt-3 bg-danger text-sm font-semibold text-white">Yes, delete</button>
                  </form>
                </details>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <section className="card p-5">
        <h2 className="mb-4 text-lg font-extrabold">+ Add a video or audio</h2>
        <form action={saveMedia} className="grid max-w-2xl gap-4"><Fields /><div><button className="btn-primary">Add</button></div></form>
      </section>
    </div>
  );
}
