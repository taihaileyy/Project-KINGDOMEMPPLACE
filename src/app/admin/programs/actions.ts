"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManagePrograms, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function decideEnrollment(form: FormData): Promise<void> {
  await requireCapability(canManagePrograms, "/admin/programs");
  const parsed = z.object({ id: z.string().uuid(), program: z.string().uuid(), status: z.enum(["approved", "declined", "completed"]), note: z.string().max(1000).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("decide_enrollment", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  revalidatePath(`/admin/programs/${parsed.data.program}`);
  revalidatePath("/admin/programs");
}

// Super admins only; the database rule is the same.
export async function saveProgramSettings(form: FormData): Promise<void> {
  const session = await requireCapability((s) => s.roles.some((r) => r.role === "super_admin"), "/admin/programs");
  void session;
  const parsed = z
    .object({ id: z.string().uuid(), capacity: z.coerce.number().int().min(0).max(1000).default(0) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("programs")
    .update({ capacity: parsed.data.capacity || null, requires_approval: form.get("requires_approval") === "on", is_active: form.get("is_active") === "on" })
    .eq("id", parsed.data.id);
  revalidatePath(`/admin/programs/${parsed.data.id}`);
  revalidatePath("/programs", "layout");
}
