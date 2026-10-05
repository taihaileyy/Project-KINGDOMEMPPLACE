"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, failed } from "@/lib/action-state";
import { canManagePrograms, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function decideEnrollment(_: ActionState, form: FormData): Promise<ActionState> {
  await requireCapability(canManagePrograms, "/admin/programs");
  const parsed = z.object({ id: z.string().uuid(), program: z.string().uuid(), status: z.enum(["approved", "declined", "completed"]), note: z.string().max(1000).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Tap Approve, Decline or Mark completed again." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("decide_enrollment", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  const f = failed(error, "update that request");
  if (f) return f;
  revalidatePath(`/admin/programs/${parsed.data.program}`);
  revalidatePath("/admin/programs");
  return { notice: { approved: "Approved.", declined: "Declined.", completed: "Marked completed." }[parsed.data.status] };
}

// Super admins only; the database rule is the same.
export async function saveProgramSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireCapability((s) => s.roles.some((r) => r.role === "super_admin"), "/admin/programs");
  const parsed = z
    .object({ id: z.string().uuid(), capacity: z.coerce.number().int().min(0).max(1000).default(0) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a number of spots (0 for no limit)." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("programs")
    .update({ capacity: parsed.data.capacity || null, requires_approval: form.get("requires_approval") === "on", is_active: form.get("is_active") === "on" })
    .eq("id", parsed.data.id);
  const f = failed(error, "save the settings");
  if (f) return f;
  revalidatePath(`/admin/programs/${parsed.data.id}`);
  revalidatePath("/programs", "layout");
  return { notice: "Saved." };
}
