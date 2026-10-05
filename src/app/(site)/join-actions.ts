"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Sign-up actions for the public pages: join the church, join a program,
// register for an event. Each calls a database function that does the real
// checks (signed in, open, not full, not a duplicate); the messages with code
// 22023 are written for people and shown as they are.

export type JoinState = { error?: string; notice?: string };

const generic = "We couldn't do that just now. Please try again or call us.";
const friendly = (e: { code?: string; message: string }) =>
  e.code === "22023" ? e.message : e.code === "28000" ? "Please log in first." : generic;

export async function joinChurch(): Promise<JoinState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_church");
  if (error) return { error: friendly(error) };
  revalidatePath("/portal", "layout");
  return { notice: "Welcome to the KEP church family! You can see your membership in My KEP." };
}

export async function enrollInProgram(_: JoinState, form: FormData): Promise<JoinState> {
  const id = z.string().uuid().safeParse(form.get("program"));
  if (!id.success) return { error: generic };
  const note = String(form.get("note") ?? "").slice(0, 1000);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enroll_in_program", { p_program: id.data, p_note: note });
  if (error) return { error: friendly(error) };
  revalidatePath("/portal", "layout");
  return {
    notice: data === "approved"
      ? "You're in! Find this program in My KEP."
      : "Request sent. Our team will review it and be in touch.",
  };
}

export async function registerForEvent(_: JoinState, form: FormData): Promise<JoinState> {
  const parsed = z
    .object({
      event: z.string().uuid(),
      name: z.string().trim().min(1, "Enter your name.").max(120),
      email: z.string().trim().toLowerCase().email("Enter a valid email address."),
      phone: z.string().trim().max(40).optional().default(""),
      guests: z.coerce.number().int().min(0).max(10).default(0),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_for_event", {
    p_event: d.event, p_name: d.name, p_email: d.email, p_phone: d.phone, p_guests: d.guests,
  });
  if (error) return { error: friendly(error) };
  revalidatePath("/portal", "layout");
  return { notice: `You're registered, ${d.name.split(" ")[0]}. We'll see you there!` };
}
