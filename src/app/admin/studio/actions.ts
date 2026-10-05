"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, failed } from "@/lib/action-state";
import { canManageStudio, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function decideStudio(_: ActionState, form: FormData): Promise<ActionState> {
  await requireCapability(canManageStudio, "/admin/studio");
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["approved", "declined", "cancelled"]), note: z.string().max(500).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Tap Approve or Decline again." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("decide_studio_request", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  const f = failed(error, "update that request");
  if (f) return f;
  revalidatePath("/admin/studio");
  return { notice: parsed.data.status === "approved" ? "Approved." : "Updated." };
}

export async function addBlock(_: ActionState, form: FormData): Promise<ActionState> {
  await requireCapability(canManageStudio, "/admin/studio");
  const parsed = z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."), start: z.string().regex(/^\d{2}:\d{2}$/).default("00:00"), end: z.string().regex(/^\d{2}:\d{2}$/).default("23:59"), reason: z.string().max(200).default("") })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_studio_block", { p_date: parsed.data.date, p_start: parsed.data.start, p_end: parsed.data.end, p_reason: parsed.data.reason });
  const f = failed(error, "block that time");
  if (f) return f;
  revalidatePath("/admin/studio");
  return { notice: "Time blocked." };
}

export async function removeBlock(_: ActionState, form: FormData): Promise<ActionState> {
  await requireCapability(canManageStudio, "/admin/studio");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Try again." };
  const supabase = await createClient();
  const { error } = await supabase.from("studio_blocks").delete().eq("id", id.data);
  const f = failed(error, "remove that block");
  if (f) return f;
  revalidatePath("/admin/studio");
  return { notice: "Removed." };
}
