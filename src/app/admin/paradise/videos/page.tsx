import type { Metadata } from "next";
import Link from "next/link";
import { ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create Your World videos" };

type Q = {
  id: string; question_text: string; is_active: boolean;
  paradise_levels: { level_number: number } | null;
  paradise_lessons: { title: string | null; video_type: string | null; video_url: string | null; media_id: string | null }[] | { title: string | null; video_type: string | null; video_url: string | null; media_id: string | null } | null;
};
const typeLabel: Record<string, string> = { upload: "Uploaded file", youtube: "YouTube", external: "Web link" };

export default async function VideosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("paradise_questions").select("id, question_text, is_active, paradise_levels(level_number), paradise_lessons(title, video_type, video_url, media_id)").order("question_order");
  const rows = ((data ?? []) as unknown as Q[])
    .map((q) => ({ ...q, lesson: Array.isArray(q.paradise_lessons) ? q.paradise_lessons[0] : q.paradise_lessons }))
    .sort((a, b) => (a.paradise_levels?.level_number ?? 0) - (b.paradise_levels?.level_number ?? 0));
  const withVideo = rows.filter((r) => r.lesson?.video_url || r.lesson?.media_id);
  const without = rows.filter((r) => !(r.lesson?.video_url || r.lesson?.media_id));

  return (
    <div className="grid gap-6">
      <ParadiseAdminTabs current="/admin/paradise/videos" />
      <p className="max-w-2xl text-muted">Each question&rsquo;s teaching video is added on the question itself: upload a file or paste a YouTube or other video link. This page shows what has and hasn&rsquo;t been attached.</p>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">Questions with a video ({withVideo.length})</h2>
        {withVideo.length === 0 ? <p className="card p-5 text-muted">None yet.</p> : (
          <ul className="grid gap-2">
            {withVideo.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <span className="font-semibold">{r.question_text}</span>
                <span className="text-sm text-muted">Level {r.paradise_levels?.level_number} · {typeLabel[r.lesson?.video_type ?? ""] ?? "Video"}{r.lesson?.media_id ? " · from the video library" : ""}{r.lesson?.title ? ` · ${r.lesson.title}` : ""}</span>
                <span className="ml-auto flex gap-4 text-sm font-semibold">
                  {r.lesson?.video_url && <a href={r.lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">Open video ↗</a>}
                  <Link href={`/admin/paradise/questions/${r.id}`} className="text-blue hover:underline">Change</Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">Questions without a video ({without.length})</h2>
        {without.length === 0 ? <p className="card p-5 text-muted">Every question has one.</p> : (
          <ul className="grid gap-2">
            {without.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <span className="font-semibold">{r.question_text}</span>
                <span className="text-sm text-muted">Level {r.paradise_levels?.level_number}{r.is_active ? "" : " · inactive"}</span>
                <Link href={`/admin/paradise/questions/${r.id}`} className="ml-auto text-sm font-semibold text-blue hover:underline">Add a video</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
