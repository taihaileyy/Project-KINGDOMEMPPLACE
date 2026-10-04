"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadComments, postComment, removeComment, type ReelComment } from "@/lib/reels";

const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

// The comments for one video: a sheet that rises from the bottom on phones and
// sits at the side on larger screens. Built on <dialog>, so Esc closes it and
// focus stays inside while it is open.
export function CommentsSheet({ mediaId, title, signedIn, onClose, onCount }: { mediaId: string; title: string; signedIn: boolean; onClose: () => void; onCount: (delta: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<ReelComment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    let live = true;
    loadComments(mediaId).then((c) => { if (live) setItems(c); });
    return () => { live = false; };
  }, [mediaId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    const r = await postComment(mediaId, body);
    if (r.ok) {
      setText("");
      onCount(1);
      setItems(await loadComments(mediaId));
    } else setError(r.message);
    setBusy(false);
  }

  async function del(id: string) {
    await removeComment(id);
    onCount(-1);
    setItems((cur) => (cur ?? []).filter((c) => c.id !== id));
  }

  return (
    <dialog
      ref={ref}
      aria-label={`Comments on ${title}`}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[75dvh] w-full max-w-lg rounded-t-2xl border-0 bg-[#0a1024] p-0 text-white shadow-2xl backdrop:bg-black/60 sm:bottom-auto sm:left-auto sm:right-6 sm:top-20 sm:max-h-[calc(100dvh-7rem)] sm:rounded-2xl"
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-xl">Comments{items ? ` (${items.length})` : ""}</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close comments" className="grid size-10 place-items-center rounded-full hover:bg-white/10">✕</button>
        </header>
        <ul className="min-h-[8rem] flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {items === null && <li className="text-sm text-white/60">Loading…</li>}
          {items?.length === 0 && <li className="text-sm text-white/60">No comments yet. Be the first.</li>}
          {items?.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1f33b8] text-sm font-bold">{c.author.charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-white/60"><span className="font-semibold text-white/90">{c.author}</span> · {ago(c.created_at)}</p>
                <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug">{c.body}</p>
                {c.mine && <button type="button" onClick={() => del(c.id)} className="mt-1 text-xs font-semibold text-white/50 hover:text-white">Delete</button>}
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {signedIn ? (
            <form onSubmit={send} className="flex items-end gap-2">
              <label htmlFor="reel-comment" className="sr-only">Add a comment</label>
              <textarea id="reel-comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={1} placeholder="Add a comment…" className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[15px] placeholder:text-white/40 focus:border-electric focus:outline-none" />
              <button disabled={busy || !text.trim()} className="min-h-11 rounded-xl bg-[#1f33b8] px-4 text-sm font-semibold disabled:opacity-40">Post</button>
            </form>
          ) : (
            <p className="text-center text-sm text-white/80">
              <Link href={`/login?next=${encodeURIComponent(`/watch?v=${mediaId}`)}`} className="font-semibold text-electric underline">Log in</Link> or{" "}
              <Link href="/signup" className="font-semibold text-electric underline">create a free account</Link> to comment.
            </p>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-[#f0b7a6]">{error}</p>}
        </div>
      </div>
    </dialog>
  );
}
