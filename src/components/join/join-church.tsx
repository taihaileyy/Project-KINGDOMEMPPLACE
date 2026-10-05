"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { useSignedIn } from "@/lib/use-signed-in";
import { joinChurch, type JoinState } from "@/app/(site)/join-actions";

export function JoinChurch() {
  const signedIn = useSignedIn();
  const [state, action, pending] = useActionState<JoinState, FormData>(() => joinChurch(), {});
  if (state.notice) return <FormMessage notice={state.notice} />;
  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/signup?next=/church" className="btn-primary">Create an account to join</Link>
        <Link href="/login?next=/church" className="btn-quiet text-white">Log in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-3">
      <FormMessage error={state.error} />
      <div><button className="btn-primary" disabled={pending}>{pending ? "Joining..." : "Join the church"}</button></div>
    </form>
  );
}
