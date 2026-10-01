import type { Metadata } from "next";
import { deleteLevel, saveLevel } from "@/app/admin/paradise/actions";
import { Field, Notice, ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { MediaField } from "@/components/paradise/media-field";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Paradise levels" };

type Level = {
  id: string; level_number: number; name: string; description: string | null; is_active: boolean;
  background_image_url: string | null; background_video_url: string | null; ambient_audio_url: string | null;
  paradise_questions: { count: number }[];
};

function LevelFields({ l, nextNumber }: { l?: Level; nextNumber?: number }) {
  return (
    <div className="grid gap-4">
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="Level number"><input name="level_number" type="number" min={1} max={999} required defaultValue={l?.level_number ?? nextNumber} className="field-input" /></Field>
        <Field label="Level name"><input name="name" required maxLength={120} defaultValue={l?.name ?? ""} className="field-input" /></Field>
      </div>
      <Field label="Description (optional)"><textarea name="description" maxLength={600} rows={2} defaultValue={l?.description ?? ""} className="field-input" /></Field>
      <MediaField name="background_image_url" kind="image" label="Background image (optional)" defaultValue={l?.background_image_url ?? ""} hint="Shown behind the questions. Leave empty to use the Paradise garden." />
      <MediaField name="background_video_url" kind="video" label="Background video (optional)" defaultValue={l?.background_video_url ?? ""} hint="Plays silently on a loop behind the questions." />
      <MediaField name="ambient_audio_url" kind="audio" label="Ambient audio (optional)" defaultValue={l?.ambient_audio_url ?? ""} hint="Soft background sound; players can turn it off." />
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" name="is_active" defaultChecked={l?.is_active ?? true} className="size-5 accent-[var(--kep-blue)]" /> Active (included in the game)
      </label>
    </div>
  );
}

export default async function LevelsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("paradise_levels").select("*, paradise_questions(count)").order("level_number");
  const levels = (data ?? []) as unknown as Level[];
  const next = (levels.at(-1)?.level_number ?? 0) + 1;

  return (
    <div className="grid gap-6">
      <ParadiseAdminTabs current="/admin/paradise/levels" />
      <Notice saved={sp.saved} error={sp.error} />

      <ul className="grid gap-3">
        {levels.map((l) => (
          <li key={l.id} className="card">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-full bg-night text-sm font-bold text-white">{l.level_number}</span>
                <span className="font-extrabold">{l.name}</span>
                <span className="text-sm text-muted">{l.paradise_questions[0]?.count ?? 0} question(s)</span>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${l.is_active ? "bg-success/15 text-success" : "bg-line text-muted"}`}>{l.is_active ? "Active" : "Inactive"}</span>
                <span className="text-sm font-semibold text-blue">Edit</span>
              </summary>
              <div className="grid gap-4 border-t border-line p-4">
                <form action={saveLevel} className="grid max-w-2xl gap-4">
                  <LevelFields l={l} />
                  <div><button className="btn-primary">Save level</button></div>
                </form>
                <details className="max-w-2xl">
                  <summary className="cursor-pointer text-sm font-semibold text-danger">Delete this level</summary>
                  <form action={deleteLevel} className="mt-3 rounded-[var(--radius-card)] border border-danger/40 p-4">
                    <p className="text-sm text-muted">This also deletes its {l.paradise_questions[0]?.count ?? 0} question(s), answers and lessons. It can&rsquo;t be undone. To hide a level instead, untick Active above.</p>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="btn mt-3 bg-danger text-sm font-semibold text-white">Yes, delete level {l.level_number}</button>
                  </form>
                </details>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section className="card p-5">
        <h2 className="mb-4 text-lg font-extrabold">+ Add a level</h2>
        <form action={saveLevel} className="grid max-w-2xl gap-4">
          <LevelFields nextNumber={next} />
          <div><button className="btn-primary">Add level</button></div>
        </form>
      </section>
    </div>
  );
}
