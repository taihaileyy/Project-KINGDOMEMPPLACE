import { createBrowserSupabase } from "@/lib/supabase/browser";

// Likes, comments and counts for the Watch reels. All of it goes through the
// database functions, which decide who may do what.

export type Social = { likes: number; comments: number; liked: boolean };
export type ReelComment = { id: string; body: string; created_at: string; author: string; mine: boolean };

export async function loadSocial(ids: string[]): Promise<Record<string, Social>> {
  const out: Record<string, Social> = {};
  if (ids.length === 0) return out;
  const { data } = await createBrowserSupabase().rpc("media_social", { p_ids: ids });
  for (const r of (data ?? []) as { media_id: string; likes: number; comments: number; liked: boolean }[]) {
    out[r.media_id] = { likes: r.likes, comments: r.comments, liked: r.liked };
  }
  return out;
}

export async function isSignedIn(): Promise<boolean> {
  const { data } = await createBrowserSupabase().auth.getSession();
  return Boolean(data.session);
}

export async function toggleLike(id: string): Promise<{ liked: boolean; likes: number } | null> {
  const { data, error } = await createBrowserSupabase().rpc("toggle_media_like", { p_media: id });
  return error || !data ? null : (data as { liked: boolean; likes: number });
}

export async function loadComments(id: string): Promise<ReelComment[]> {
  const { data } = await createBrowserSupabase().rpc("media_comments_for", { p_media: id });
  return (data ?? []) as ReelComment[];
}

export async function postComment(id: string, body: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await createBrowserSupabase().rpc("add_media_comment", { p_media: id, p_body: body });
  if (!error) return { ok: true };
  return { ok: false, message: /too many/i.test(error.message) ? "You're commenting quickly. Please wait a moment." : "Your comment couldn't be posted. Please try again." };
}

export async function removeComment(id: string): Promise<void> {
  await createBrowserSupabase().rpc("delete_media_comment", { p_id: id });
}
