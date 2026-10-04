import type { Metadata } from "next";
import Link from "next/link";
import { DashboardBand } from "@/components/app-shell";
import { Notice } from "@/components/paradise/admin-ui";
import { deleteComment, setCommentStatus } from "@/app/admin/videos/comments/actions";
import { requireMediaStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Video comments" };

type Row = {
  id: string; body: string; status: "visible" | "hidden"; created_at: string;
  media_items: { title: string } | null;
  people: { first_name: string; last_name: string; email: string | null } | null;
};

export default async function CommentsAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireMediaStaff();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_comments")
    .select("id, body, status, created_at, media_items(title), people(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(150);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="grid gap-6">
      <DashboardBand title="Video comments" lead="Comments people leave on Watch videos, newest first. Hide one to remove it from the site without deleting it, or delete it for good.">
        <Link href="/admin/videos" className="btn border border-white/25 text-white hover:bg-white/10">← Videos</Link>
      </DashboardBand>
      <Notice saved={sp.saved} error={sp.error} />
      {rows.length === 0 ? (
        <p className="card p-6 text-muted">No comments yet.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((c) => (
            <li key={c.id} className="card p-4">
              <p className="text-sm text-muted">
                <b className="text-ink">{c.people ? `${c.people.first_name} ${c.people.last_name}` : "Unknown"}</b>
                {c.people?.email ? ` · ${c.people.email}` : ""} · on &ldquo;{c.media_items?.title ?? "a video"}&rdquo; · {new Date(c.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className={`mt-2 whitespace-pre-line break-words ${c.status === "hidden" ? "text-muted line-through" : ""}`}>{c.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.status === "visible" ? "bg-success/15 text-success" : "bg-line text-muted"}`}>{c.status === "visible" ? "Shown" : "Hidden"}</span>
                <form action={setCommentStatus}>
                  <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value={c.status === "visible" ? "hidden" : "visible"} />
                  <button className="btn border border-line bg-paper px-3 text-sm font-semibold hover:bg-surface">{c.status === "visible" ? "Hide" : "Show"}</button>
                </form>
                <details className="relative">
                  <summary className="btn cursor-pointer list-none border border-danger/40 px-3 text-sm font-semibold text-danger hover:bg-danger/10">Delete</summary>
                  <form action={deleteComment} className="absolute left-0 z-10 mt-2 w-56 rounded-[var(--radius-card)] border border-line bg-paper p-3 shadow-lg">
                    <p className="mb-2 text-xs text-muted">Delete this comment for good?</p>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="btn w-full bg-danger text-sm font-semibold text-white">Yes, delete</button>
                  </form>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
