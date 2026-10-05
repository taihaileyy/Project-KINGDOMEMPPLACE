"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canManageEvents, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chicagoToISO } from "@/lib/time";

export type EventFormState = { error?: string; notice?: string };

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  blurb: z.string().trim().max(400).default(""),
  details: z.string().trim().max(4000).default(""),
  starts: z.string().min(1, "Choose a start date and time."),
  ends: z.string().default(""),
  location: z.string().trim().max(200).default(""),
  image_path: z.string().trim().max(300).default("").refine((v) => v === "" || /^\/images\/[\w.-]+$/.test(v) || /^https:\/\/[\w.-]+\.supabase\.co\/storage\/v1\/object\/public\/event-flyers\/[\w.-]+$/.test(v), "That picture address isn't allowed. Upload the picture again."),
  capacity: z.coerce.number().int().min(0).max(100000).default(0),
});

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "event";

export async function saveEvent(_: EventFormState, form: FormData): Promise<EventFormState> {
  await requireCapability(canManageEvents, "/admin/events");
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const starts = chicagoToISO(d.starts);
  const ends = d.ends ? chicagoToISO(d.ends) : null;
  if (!starts) return { error: "Choose a valid start date and time." };
  if (ends && ends < starts) return { error: "The end must be after the start." };

  const row = {
    title: d.title, blurb: d.blurb, details: d.details || null, starts_at: starts, ends_at: ends,
    location: d.location || null, image_path: d.image_path || null,
    requires_registration: form.get("requires_registration") === "on",
    capacity: d.capacity || null, is_published: form.get("is_published") === "on",
  };
  const supabase = await createClient();
  if (d.id) {
    const { error } = await supabase.from("events").update(row).eq("id", d.id);
    if (error) return { error: "We couldn't save that. Please try again." };
    revalidatePath("/events");
    revalidatePath(`/admin/events/${d.id}`);
    return { notice: "Saved." };
  }
  const slug = `${slugify(d.title)}-${starts.slice(0, 10)}`;
  const { data, error } = await supabase.from("events").insert({ ...row, slug }).select("id").single();
  if (error || !data) return { error: error?.code === "23505" ? "An event with that name and date already exists." : "We couldn't save that. Please try again." };
  revalidatePath("/events");
  redirect(`/admin/events/${data.id}`);
}

export async function checkIn(form: FormData): Promise<void> {
  await requireCapability(canManageEvents, "/admin/events");
  const parsed = z.object({ id: z.string().uuid(), event: z.string().uuid(), in: z.enum(["1", "0"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("check_in_registration", { p_id: parsed.data.id, p_in: parsed.data.in === "1" });
  revalidatePath(`/admin/events/${parsed.data.event}`);
}
