"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; notice?: string };

const optional = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("/portal/profile");
  const parsed = z
    .object({
      first_name: z.string().trim().min(1, "Enter your first name.").max(100),
      last_name: z.string().trim().min(1, "Enter your last name.").max(100),
      preferred_name: optional(100),
      phone: optional(40),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // RLS limits this to the signed-in person's own row and to contact columns.
  const supabase = await createClient();
  const { error } = await supabase.from("people").update(parsed.data).eq("id", session.person.id);
  if (error) return { error: "We couldn't save your changes. Please try again." };

  revalidatePath("/portal", "layout");
  return { notice: "Saved." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  await requireUser("/portal/password");
  const parsed = z
    .object({
      password: z.string().min(10, "Use at least 10 characters.").max(128),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { message: "The two passwords don't match." })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "We couldn't update your password. Try a different one." };
  return { notice: "Your password has been changed." };
}
