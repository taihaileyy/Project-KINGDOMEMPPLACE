"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type StudioState = { error?: string; fieldErrors?: Record<string, string>; done?: { name: string; date: string; time: string } };

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().default(""),
  service: z.enum(["recording", "filming", "podcast", "photography", "other"], { message: "Choose what you'll be doing." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time."),
  minutes: z.coerce.number().int().min(30).max(480),
  attendees: z.coerce.number().int().min(1, "At least 1 person.").max(50, "For more than 50 people, call us."),
  details: z.string().trim().max(2000).optional().default(""),
});

export async function requestStudioBooking(_: StudioState, form: FormData): Promise<StudioState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_studio_booking", {
    p_name: d.name,
    p_email: d.email,
    p_phone: d.phone,
    p_service: d.service,
    p_date: d.date,
    p_start: d.start,
    p_minutes: d.minutes,
    p_attendees: d.attendees,
    p_details: d.details,
  });
  if (error) {
    // Our own validation messages (errcode 22023) are written for people.
    return { error: error.code === "22023" ? error.message : "We couldn't send your request just now. Please try again or call us." };
  }
  return { done: { name: d.name.split(" ")[0], date: d.date, time: d.start } };
}
