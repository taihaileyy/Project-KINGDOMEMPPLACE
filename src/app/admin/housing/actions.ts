"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, failed } from "@/lib/action-state";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Staff actions for housing. Each checks the role here for a clear redirect, and
// the database function checks it again, so a crafted request can't skip it.
// Each one reports back what happened.

const id = z.string().uuid();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const bad: ActionState = { error: "Check the form and try again." };

export async function decideApplication(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, status: z.enum(["in_review", "approved", "declined"]), note: z.string().max(2000).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Tap Start review, Approve or Decline again." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("decide_housing_application", { p_id: parsed.data.id, p_status: parsed.data.status, p_note: parsed.data.note });
  const f = failed(error, "update that application");
  if (f) return f;
  revalidatePath("/admin/housing");
  const words = { in_review: "Review started.", approved: "Approved. You can now move them in.", declined: "Declined." } as const;
  return { notice: words[parsed.data.status] };
}

export async function moveIn(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, date: day, room: z.string().max(60).default("") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad;
  const supabase = await createClient();
  const { error } = await supabase.rpc("move_in_resident", { p_application: parsed.data.id, p_move_in: parsed.data.date, p_room: parsed.data.room });
  const f = failed(error, "move them in");
  if (f) return f;
  revalidatePath("/admin/housing");
  return { notice: "Moved in." };
}

export async function recordPayment(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff", "finance_admin"]);
  const parsed = z
    .object({ id, amount: z.coerce.number().positive().max(10000), method: z.enum(["paypal", "cash", "money_order", "other"]), date: day.optional().or(z.literal("")), note: z.string().max(300).default("") })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter an amount between $1 and $10,000." };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_housing_payment", { p_residency: d.id, p_amount_cents: Math.round(d.amount * 100), p_method: d.method, p_paid_at: d.date || null, p_note: d.note });
  const f = failed(error, "record that payment");
  if (f) return f;
  revalidatePath(`/admin/housing/residents/${d.id}`);
  return { notice: "Payment recorded." };
}

export async function addCheckin(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, note: z.string().trim().min(1, "Write a note first.").max(2000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_housing_checkin", { p_residency: parsed.data.id, p_note: parsed.data.note, p_visible: form.get("visible") === "on" });
  const f = failed(error, "save that note");
  if (f) return f;
  revalidatePath(`/admin/housing/residents/${parsed.data.id}`);
  return { notice: "Check-in saved." };
}

export async function moveOut(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff"]);
  const parsed = z.object({ id, date: day, reason: z.enum(["graduated", "left", "removed", "other"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad;
  const supabase = await createClient();
  const { error } = await supabase.rpc("move_out_resident", { p_residency: parsed.data.id, p_date: parsed.data.date, p_reason: parsed.data.reason });
  const f = failed(error, "move them out");
  if (f) return f;
  revalidatePath("/admin/housing");
  revalidatePath(`/admin/housing/residents/${parsed.data.id}`);
  return { notice: "Moved out." };
}

export async function setEmployed(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff(["housing_staff"]);
  const rid = id.safeParse(form.get("id"));
  if (!rid.success) return bad;
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_resident_employed", { p_residency: rid.data, p_employed: form.get("employed") === "1" });
  const f = failed(error, "save that");
  if (f) return f;
  revalidatePath(`/admin/housing/residents/${rid.data}`);
  return { notice: "Saved." };
}
