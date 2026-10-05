"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type HousingState = { error?: string };

const generic = "We couldn't save that just now. Please try again or call us.";

export async function applyForHousing(_: HousingState, form: FormData): Promise<HousingState> {
  await requireUser("/portal/housing/apply");
  const parsed = z
    .object({
      desired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
      phone: z.string().trim().max(40).default(""),
      emergency_name: z.string().trim().max(120).default(""),
      emergency_phone: z.string().trim().max(40).default(""),
      employment: z.enum(["employed", "seeking", "unable", "other"]).optional(),
      about: z.string().trim().max(3000).default(""),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Please check your answers and try again." };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_for_housing", {
    p_desired: d.desired || null, p_phone: d.phone, p_emergency_name: d.emergency_name,
    p_emergency_phone: d.emergency_phone, p_employment: d.employment ?? "", p_about: d.about,
  });
  if (error) return { error: error.code === "22023" ? error.message : generic };
  revalidatePath("/portal", "layout");
  redirect("/portal/housing?applied=1");
}

export async function withdrawApplication(form: FormData): Promise<void> {
  await requireUser("/portal/housing");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.rpc("withdraw_housing_application", { p_id: id.data });
  revalidatePath("/portal", "layout");
}

export async function addGoal(form: FormData): Promise<void> {
  await requireUser("/portal/housing");
  const title = z.string().trim().min(1).max(200).safeParse(form.get("title"));
  if (!title.success) return;
  const target = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(form.get("target"));
  const supabase = await createClient();
  await supabase.rpc("add_my_housing_goal", { p_title: title.data, p_target: target.success ? target.data : null });
  revalidatePath("/portal/housing");
}

export async function toggleGoal(form: FormData): Promise<void> {
  await requireUser("/portal/housing");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.rpc("complete_my_housing_goal", { p_id: id.data, p_done: form.get("done") === "1" });
  revalidatePath("/portal/housing");
}
