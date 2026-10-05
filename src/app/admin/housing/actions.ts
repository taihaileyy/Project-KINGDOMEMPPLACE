"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Staff actions for housing. Each checks the role here for a clear redirect, and
// the database function checks it again, so a crafted request can't skip it.

const id = z.string().uuid();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function decideApplication(form: FormData): Promise<void> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, status: z.enum(["in_review", "approved", "declined"]), note: z.string().max(2000).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("decide_housing_application", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  revalidatePath("/admin/housing");
}

export async function moveIn(form: FormData): Promise<void> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, date: day, room: z.string().max(60).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("move_in_resident", { p_application: parsed.data.id, p_move_in: parsed.data.date, p_room: parsed.data.room });
  revalidatePath("/admin/housing");
}

export async function recordPayment(form: FormData): Promise<void> {
  await requireStaff(["housing_staff", "finance_admin"]);
  const parsed = z
    .object({ id, amount: z.coerce.number().positive().max(10000), method: z.enum(["paypal", "cash", "money_order", "other"]), date: day.optional().or(z.literal("")), note: z.string().max(300).default("") })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase.rpc("record_housing_payment", { p_residency: d.id, p_amount_cents: Math.round(d.amount * 100), p_method: d.method, p_paid_at: d.date || null, p_note: d.note });
  revalidatePath(`/admin/housing/residents/${d.id}`);
}

export async function addCheckin(form: FormData): Promise<void> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, note: z.string().trim().min(1).max(2000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("add_housing_checkin", { p_residency: parsed.data.id, p_note: parsed.data.note, p_visible: form.get("visible") === "on" });
  revalidatePath(`/admin/housing/residents/${parsed.data.id}`);
}

export async function moveOut(form: FormData): Promise<void> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, date: day, reason: z.enum(["graduated", "left", "removed", "other"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("move_out_resident", { p_residency: parsed.data.id, p_date: parsed.data.date, p_reason: parsed.data.reason });
  revalidatePath("/admin/housing");
  revalidatePath(`/admin/housing/residents/${parsed.data.id}`);
}

export async function setEmployed(form: FormData): Promise<void> {
  await requireStaff(["housing_staff"]);
  const rid = id.safeParse(form.get("id"));
  if (!rid.success) return;
  const supabase = await createClient();
  await supabase.rpc("set_resident_employed", { p_residency: rid.data, p_employed: form.get("employed") === "1" });
  revalidatePath(`/admin/housing/residents/${rid.data}`);
}
