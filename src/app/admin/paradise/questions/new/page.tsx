import type { Metadata } from "next";
import Link from "next/link";
import { Notice, ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { QuestionForm } from "@/components/paradise/question-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Add a question" };

export default async function NewQuestionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: levels } = await supabase.from("paradise_levels").select("id, level_number, name").order("level_number");
  return (
    <div>
      <ParadiseAdminTabs current="/admin/paradise/questions" />
      <h1 className="mb-4 text-2xl font-extrabold">Add a question</h1>
      <Notice error={sp.error} />
      {levels?.length ? (
        <QuestionForm draft={{}} levels={levels} />
      ) : (
        <p className="card p-6 text-muted">Add a level first. <Link href="/admin/paradise/levels" className="font-semibold text-blue hover:underline">Go to Levels</Link></p>
      )}
    </div>
  );
}
