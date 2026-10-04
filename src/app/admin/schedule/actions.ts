"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const optional = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  kind: z.enum(["bible_study", "worship", "other"]),
  title: z.string().trim().min(1, "Give it a name.").max(120),
  detail: optional(300),
  frequency: z.enum(["weekly", "varies", "custom"]),
  weekday: z.string().transform((v) => (v === "" ? null : Number(v))).pipe(z.number().int().min(0).max(6).nullable()),
  start_time: z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().regex(/^\d{2}:\d{2}$/, "Use a time like 18:30.").nullable()),
  note: optional(200),
  sort_order: z.coerce.number().int().min(0).max(1000),
  is_active: z.boolean(),
});

function done(key: "saved" | "error", message = "1"): never {
  revalidatePath("/admin/schedule");
  redirect(`/admin/schedule?${key}=${encodeURIComponent(message)}`);
}

export async function saveScheduleItem(formData: FormData) {
  await requireStaff(["church_staff"]);
  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    kind: formData.get("kind"),
    title: formData.get("title") ?? "",
    detail: formData.get("detail") ?? "",
    frequency: formData.get("frequency"),
    weekday: String(formData.get("weekday") ?? ""),
    start_time: String(formData.get("start_time") ?? ""),
    note: formData.get("note") ?? "",
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) done("error", parsed.error.issues[0]?.message ?? "Please check the form.");
  const { id, ...row } = parsed.data;
  if (row.frequency === "weekly" && row.weekday === null) done("error", "Choose a day for a weekly item.");
  const supabase = await createClient();
  const { error } = id ? await supabase.from("schedule_items").update(row).eq("id", id) : await supabase.from("schedule_items").insert(row);
  done(error ? "error" : "saved", error?.message);
}

export async function deleteScheduleItem(formData: FormData) {
  await requireStaff(["church_staff"]);
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_items").delete().eq("id", String(formData.get("id")));
  done(error ? "error" : "saved", error?.message);
}
