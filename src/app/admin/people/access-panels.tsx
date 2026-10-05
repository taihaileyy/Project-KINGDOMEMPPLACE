"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { deleteAccount, grantRole, type PersonState } from "./actions";

export function GrantRoleForm({ personId, programs }: { personId: string; programs: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<PersonState, FormData>(grantRole, {});
  return (
    <form action={action} className="grid gap-3 px-2 sm:grid-cols-[1fr_auto] sm:items-end">
      <input type="hidden" name="person" value={personId} />
      <div className="sm:col-span-2"><FormMessage error={state.error} notice={state.notice} /></div>
      <div>
        <label className="field-label" htmlFor="role">Give them access as</label>
        <select id="role" name="role" className="field-input" defaultValue="">
          <option value="" disabled>Choose a role</option>
          <option value="super_admin">Super admin (everything)</option>
          <option value="church_staff">Church staff (people, events, schedule, videos)</option>
          <option value="housing_staff">Housing staff (applications and residents)</option>
          <option value="finance_admin">Finance admin (giving and reports)</option>
          <optgroup label="Program staff">
            <option value="program:all">All programs</option>
            {programs.map((p) => <option key={p.id} value={`program:${p.id}`}>{p.name} only</option>)}
            <option value="program:studio">Studio only</option>
            <option value="program:paradise">Create Your World only</option>
          </optgroup>
        </select>
      </div>
      <button className="btn-primary" disabled={pending}>{pending ? "Adding..." : "Add access"}</button>
    </form>
  );
}

export function DeleteAccountForm({ personId, name }: { personId: string; name: string }) {
  const [state, action, pending] = useActionState<PersonState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="grid gap-3 px-2">
      <input type="hidden" name="person" value={personId} />
      <FormMessage error={state.error} notice={state.notice} />
      <p className="text-[15px] text-muted">
        This closes {name}&apos;s account: they can no longer log in, and their name, email, phone, address and other personal details are erased everywhere.
        Gifts and payment records stay (without their details) so KEP&apos;s books remain correct. This can&apos;t be undone.
      </p>
      <div>
        <label className="field-label" htmlFor="confirm">Type DELETE to confirm</label>
        <input id="confirm" name="confirm" autoComplete="off" className="field-input max-w-xs" />
      </div>
      <div><button className="btn border border-danger/50 bg-danger/5 font-semibold text-danger hover:bg-danger/10" disabled={pending}>{pending ? "Deleting..." : "Delete this account"}</button></div>
    </form>
  );
}
