import Link from "next/link";
import { saveQuestion } from "@/app/admin/paradise/actions";
import { Field } from "@/components/paradise/admin-ui";
import { MediaField } from "@/components/paradise/media-field";

export type QuestionDraft = {
  id?: string; level_id?: string; question_text?: string; scripture_reference?: string | null; explanation?: string | null;
  question_order?: number; is_active?: boolean; answers?: { answer_text: string; answer_order: number; is_correct: boolean }[];
  lesson?: { title: string | null; description: string | null; video_url: string | null } | null;
};

// The one editor for creating and editing a question, its answers and its lesson.
export function QuestionForm({ draft, levels }: { draft: QuestionDraft; levels: { id: string; level_number: number; name: string }[] }) {
  const ans = (n: number) => draft.answers?.find((a) => a.answer_order === n);
  const correct = draft.answers?.find((a) => a.is_correct)?.answer_order ?? 1;
  return (
    <form action={saveQuestion} className="grid max-w-3xl gap-6">
      {draft.id && <input type="hidden" name="id" value={draft.id} />}

      <section className="card grid gap-4 p-5">
        <h2 className="text-lg font-extrabold">The question</h2>
        <Field label="Level" htmlFor="level_id">
          <select id="level_id" name="level_id" required defaultValue={draft.level_id ?? levels[0]?.id} className="field-input">
            {levels.map((l) => <option key={l.id} value={l.id}>Level {l.level_number}: {l.name}</option>)}
          </select>
        </Field>
        <Field label="Question" htmlFor="question_text">
          <textarea id="question_text" name="question_text" required maxLength={600} rows={3} defaultValue={draft.question_text} className="field-input" />
        </Field>
        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold">Answers <span className="font-normal text-muted">(2 to 4; pick the correct one)</span></legend>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <input type="radio" name="correct" value={n} defaultChecked={correct === n} aria-label={`Answer ${"ABCD"[n - 1]} is correct`} className="size-5 accent-[var(--kep-blue)]" />
              <span className="w-5 font-bold">{"ABCD"[n - 1]}</span>
              <input name={`a${n}`} defaultValue={ans(n)?.answer_text ?? ""} maxLength={300} required={n <= 2} placeholder={n <= 2 ? "Required" : "Optional"} aria-label={`Answer ${"ABCD"[n - 1]}`} className="field-input" />
            </div>
          ))}
        </fieldset>
        <Field label="Scripture reference" hint="Shown after a correct answer and on the lesson.">
          <input name="scripture_reference" defaultValue={draft.scripture_reference ?? ""} maxLength={200} className="field-input" />
        </Field>
        <Field label="Explanation (optional)" hint="A sentence or two shown after a correct answer.">
          <textarea name="explanation" defaultValue={draft.explanation ?? ""} maxLength={1500} rows={2} className="field-input" />
        </Field>
      </section>

      <section className="card grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-extrabold">Teaching lesson</h2>
          <p className="text-sm text-muted">Shown when a player misses this question. All of it is optional; with no video, the player just sees the lesson text.</p>
        </div>
        <MediaField name="video_url" kind="video" label="Teaching video" defaultValue={draft.lesson?.video_url ?? ""} hint="Paste a YouTube link or any video address, or upload a file (up to 50 MB)." />
        <Field label="Lesson title"><input name="lesson_title" defaultValue={draft.lesson?.title ?? ""} maxLength={200} className="field-input" /></Field>
        <Field label="Lesson description"><textarea name="lesson_description" defaultValue={draft.lesson?.description ?? ""} maxLength={1500} rows={3} className="field-input" /></Field>
        <p className="text-sm text-muted">After the video, the player always tries this same question again. They can only continue once they answer it correctly.</p>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Question order" hint={draft.id ? "Position within the level. You can also use the arrows on the Questions list." : "Leave blank to add it at the end of the level."}>
          <input name="question_order" type="number" min={0} defaultValue={draft.question_order ?? ""} className="field-input" />
        </Field>
        <label className="flex items-center gap-3 self-end pb-2 text-sm font-semibold">
          <input type="checkbox" name="is_active" defaultChecked={draft.is_active ?? true} className="size-5 accent-[var(--kep-blue)]" />
          Active (players can see it)
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary">Save question</button>
        <Link href="/admin/paradise/questions" className="btn border border-line bg-paper font-semibold hover:bg-surface">Cancel</Link>
      </div>
    </form>
  );
}
