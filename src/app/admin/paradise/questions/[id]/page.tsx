import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Notice, ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { QuestionForm, type QuestionDraft } from "@/components/paradise/question-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit question" };

export default async function EditQuestionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [{ data: levels }, { data: q }] = await Promise.all([
    supabase.from("paradise_levels").select("id, level_number, name").order("level_number"),
    supabase.from("paradise_questions").select("*, paradise_answers(answer_text, answer_order, is_correct), paradise_lessons(title, description, video_url, after_video)").eq("id", id).maybeSingle(),
  ]);
  if (!q) notFound();
  const lesson = Array.isArray(q.paradise_lessons) ? q.paradise_lessons[0] : q.paradise_lessons;
  const draft: QuestionDraft = { ...q, answers: q.paradise_answers, lesson: lesson ?? null };
  return (
    <div>
      <ParadiseAdminTabs current="/admin/paradise/questions" />
      <h1 className="mb-4 text-2xl font-extrabold">Edit question</h1>
      <Notice error={sp.error} />
      <QuestionForm draft={draft} levels={levels ?? []} />
    </div>
  );
}
