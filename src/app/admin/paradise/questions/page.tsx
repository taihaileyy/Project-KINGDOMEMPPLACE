import type { Metadata } from "next";
import Link from "next/link";
import { Notice, ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { createClient } from "@/lib/supabase/server";
import { deleteQuestion, moveQuestion, setQuestionActive } from "@/app/admin/paradise/actions";

export const metadata: Metadata = { title: "Paradise questions" };

type Row = {
  id: string; question_text: string; question_order: number; is_active: boolean; level_id: string;
  paradise_levels: { level_number: number; name: string } | null;
  paradise_answers: { answer_text: string; answer_order: number; is_correct: boolean }[];
  paradise_lessons: { video_url: string | null }[] | { video_url: string | null } | null;
};

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ level?: string; saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: levels }, { data }] = await Promise.all([
    supabase.from("paradise_levels").select("id, level_number, name").order("level_number"),
    supabase.from("paradise_questions")
      .select("id, question_text, question_order, is_active, level_id, paradise_levels(level_number, name), paradise_answers(answer_text, answer_order, is_correct), paradise_lessons(video_url)")
      .order("question_order").order("created_at"),
  ]);
  const rows = ((data ?? []) as unknown as Row[])
    .filter((r) => !sp.level || r.level_id === sp.level)
    .sort((a, b) => (a.paradise_levels?.level_number ?? 0) - (b.paradise_levels?.level_number ?? 0) || a.question_order - b.question_order);
  const videoOf = (r: Row) => (Array.isArray(r.paradise_lessons) ? r.paradise_lessons[0]?.video_url : r.paradise_lessons?.video_url);
  const here = `/admin/paradise/questions${sp.level ? `?level=${sp.level}` : ""}`;

  return (
    <div>
      <ParadiseAdminTabs current="/admin/paradise/questions" />
      <Notice saved={sp.saved} error={sp.error} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form className="flex items-center gap-2" action="/admin/paradise/questions">
          <label htmlFor="lvl" className="text-sm font-semibold">Level</label>
          <select id="lvl" name="level" defaultValue={sp.level ?? ""} className="field-input !w-auto">
            <option value="">All levels</option>
            {levels?.map((l) => <option key={l.id} value={l.id}>Level {l.level_number}: {l.name}</option>)}
          </select>
          <button className="btn border border-line bg-paper text-sm font-semibold">Filter</button>
        </form>
        <Link href="/admin/paradise/questions/new" className="btn-primary">+ Add question</Link>
      </div>

      {rows.length === 0 ? (
        <p className="card p-6 text-muted">No questions yet. Add the first one with the button above{levels?.length ? "." : ", after adding a level."}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3">Order</th><th className="p-3">Question</th><th className="p-3">Level</th><th className="p-3">Status</th>
                <th className="p-3">Correct answer</th><th className="p-3">Video</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const right = r.paradise_answers.find((a) => a.is_correct);
                return (
                  <tr key={r.id} className="border-b border-line align-top last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {(["up", "down"] as const).map((dir) => (
                          <form key={dir} action={moveQuestion}>
                            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value={dir} /><input type="hidden" name="level" value={sp.level ?? ""} />
                            <button className="grid size-8 place-items-center rounded border border-line hover:bg-surface disabled:opacity-30" aria-label={`Move ${dir}`} disabled={(dir === "up" && (i === 0 || rows[i - 1].level_id !== r.level_id)) || (dir === "down" && (i === rows.length - 1 || rows[i + 1].level_id !== r.level_id))}>
                              {dir === "up" ? "↑" : "↓"}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-md p-3"><Link href={`/admin/paradise/questions/${r.id}`} className="font-semibold hover:text-blue hover:underline">{r.question_text}</Link></td>
                    <td className="p-3 whitespace-nowrap">Level {r.paradise_levels?.level_number}</td>
                    <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.is_active ? "bg-success/15 text-success" : "bg-line text-muted"}`}>{r.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="max-w-[14rem] p-3">{right ? <span><b>{"ABCD"[right.answer_order - 1]}.</b> {right.answer_text}</span> : <span className="text-danger">None marked</span>}</td>
                    <td className="p-3">{videoOf(r) ? "Yes" : <span className="text-muted">No</span>}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link href={`/admin/paradise/questions/${r.id}`} className="btn border border-line bg-paper px-3 text-sm font-semibold hover:bg-surface">Edit</Link>
                        <form action={setQuestionActive}>
                          <input type="hidden" name="id" value={r.id} /><input type="hidden" name="active" value={String(!r.is_active)} /><input type="hidden" name="return" value={here} />
                          <button className="btn border border-line bg-paper px-3 text-sm font-semibold hover:bg-surface">{r.is_active ? "Deactivate" : "Activate"}</button>
                        </form>
                        <details className="relative">
                          <summary className="btn cursor-pointer list-none border border-danger/40 px-3 text-sm font-semibold text-danger hover:bg-danger/10">Delete</summary>
                          <form action={deleteQuestion} className="absolute right-0 z-10 mt-2 w-56 rounded-[var(--radius-card)] border border-line bg-paper p-3 shadow-lg">
                            <p className="mb-2 text-xs text-muted">Delete this question, its answers and its lesson for good?</p>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="btn w-full bg-danger text-sm font-semibold text-white">Yes, delete</button>
                          </form>
                        </details>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
