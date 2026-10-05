"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageStudio, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function decideStudio(form: FormData): Promise<void> {
  await requireCapability(canManageStudio, "/admin/studio");
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["approved", "declined", "cancelled"]), note: z.string().max(500).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("decide_studio_request", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  revalidatePath("/admin/studio");
}

export async function addBlock(form: FormData): Promise<void> {
  await requireCapability(canManageStudio, "/admin/studio");
  const parsed = z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), start: z.string().regex(/^\d{2}:\d{2}$/).default("00:00"), end: z.string().regex(/^\d{2}:\d{2}$/).default("23:59"), reason: z.string().max(200).default("") })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("add_studio_block", { p_date: parsed.data.date, p_start: parsed.data.start, p_end: parsed.data.end, p_reason: parsed.data.reason });
  revalidatePath("/admin/studio");
}

export async function removeBlock(form: FormData): Promise<void> {
  await requireCapability(canManageStudio, "/admin/studio");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("studio_blocks").delete().eq("id", id.data);
  revalidatePath("/admin/studio");
}
