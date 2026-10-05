"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { useSignedIn } from "@/lib/use-signed-in";
import { enrollInProgram, type JoinState } from "@/app/(site)/join-actions";

// "Join this program": a short form for signed-in people, and a clear way in
// for everyone else. Programs that need approval say so before you ask.
export function EnrollPanel({ programId, slug, needsApproval }: { programId: string | null; slug: string; needsApproval: boolean }) {
  const signedIn = useSignedIn();
  const [state, action, pending] = useActionState<JoinState, FormData>(enrollInProgram, {});
  const next = encodeURIComponent(`/programs/${slug}`);

  if (!programId) {
    return <Link href="/signup" className="btn-primary">Create an account to join</Link>;
  }
  if (!signedIn) {
    return (
      <div className="grid max-w-xl gap-3">
        <p className="text-muted">Create a free KEP account to join this program{needsApproval ? "; our staff will review your request" : ""}.</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/signup?next=${next}`} className="btn-primary">Create an account to join</Link>
          <Link href={`/login?next=${next}`} className="btn-secondary">Log in</Link>
        </div>
      </div>
    );
  }
  if (state.notice) return <FormMessage notice={state.notice} />;
  return (
    <form action={action} className="grid max-w-xl gap-3">
      <input type="hidden" name="program" value={programId} />
      <FormMessage error={state.error} />
      <label className="field-label" htmlFor="note">Anything we should know? (optional)</label>
      <textarea id="note" name="note" rows={2} maxLength={1000} className="field-input" />
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? "Sending..." : needsApproval ? "Request to join" : "Join this program"}</button>
      </div>
      {needsApproval && <p className="text-sm text-muted">This program has a short review. You&apos;ll see the status in My KEP.</p>}
    </form>
  );
}
