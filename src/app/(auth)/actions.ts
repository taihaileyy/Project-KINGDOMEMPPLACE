"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; notice?: string };

// Only allow redirects back into this site.
function safeNext(value: FormDataEntryValue | null, fallback = "/portal") {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error:
        error.code === "email_not_confirmed"
          ? "Check your inbox and confirm your email first. Then log in."
          : "That email and password don't match an account. Try again or reset your password.",
    };
  }
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({
      first_name: z.string().trim().min(1, "Enter your first name.").max(100),
      last_name: z.string().trim().min(1, "Enter your last name.").max(100),
      email,
      password: z.string().min(10, "Use at least 10 characters for your password.").max(128),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { first_name, last_name, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password,
    options: {
      data: { first_name, last_name },
      emailRedirectTo: `${await siteUrl()}/auth/confirm?next=/portal`,
    },
  });
  // Same message whether or not the email already has an account, so this
  // form can't be used to find out who has one.
  if (error && error.code === "over_email_send_rate_limit") {
    return { error: "We're sending a lot of confirmation emails right now. Please try again in about an hour, or call us at (225) 413-9854 and we'll help you." };
  }
  if (error && error.code !== "user_already_exists") {
    return { error: "We couldn't create your account just now. Please try again in a minute." };
  }
  // When the project doesn't require email confirmation, sign-up signs the
  // person straight in, so there's nothing to wait for.
  if (data?.session) redirect(safeNext(form.get("next")));
  return { notice: `Almost done. We sent a confirmation link to ${parsed.data.email}. Open it to activate your account.` };
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/portal/password`,
  });
  return { notice: "If that email has a KEP account, a reset link is on its way." };
}
