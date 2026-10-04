"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireMediaStaff } from "@/lib/auth";
import { detectMedia } from "@/lib/media-server";
import { createClient } from "@/lib/supabase/server";

const optional = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));
const httpUrl = z.string().trim().max(1000).refine((v) => /^https?:\/\//i.test(v), "Addresses must start with https://");

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  title: z.string().trim().min(1, "Give the video a title.").max(160),
  url: httpUrl,
  kind: z.enum(["video", "audio"]),
  orientation: z.enum(["auto", "landscape", "vertical"]),
  poster_url: optional(1000).refine((v) => v === null || /^https?:\/\/|^\//.test(v), "The poster must be an https:// address."),
  description: optional(1000),
  transcript: optional(60000),
  captions_url: optional(1000),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_active: z.boolean(),
});

function done(key: "saved" | "error", message = "1"): never {
  revalidatePath("/admin/videos");
  revalidatePath("/watch");
  redirect(`/admin/videos?${key}=${encodeURIComponent(message)}`);
}

export async function saveMedia(formData: FormData) {
  await requireMediaStaff();
  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    title: formData.get("title") ?? "",
    url: formData.get("url") ?? "",
    kind: formData.get("kind") ?? "video",
    orientation: formData.get("orientation") ?? "auto",
    poster_url: formData.get("poster_url") ?? "",
    description: formData.get("description") ?? "",
    transcript: formData.get("transcript") ?? "",
    captions_url: formData.get("captions_url") ?? "",
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) done("error", parsed.error.issues[0]?.message ?? "Please check the form.");
  const v = parsed.data;

  const detected = await detectMedia(v.url);
  const collections = ["featured", "shorts", "watch"].filter((c) => formData.get(`c_${c}`) === "on");
  const program = String(formData.get("program") ?? "");
  const event = String(formData.get("event") ?? "");
  if (/^[a-z0-9-]+$/.test(program)) collections.push(`program:${program}`);
  if (/^[a-z0-9-]+$/.test(event)) collections.push(`event:${event}`);

  const row = {
    title: v.title,
    url: v.url,
    kind: v.kind,
    source: detected.source,
    embed_url: detected.embed_url,
    orientation: v.orientation === "auto" ? detected.orientation ?? (collections.includes("shorts") ? "vertical" : "landscape") : v.orientation,
    poster_url: v.poster_url ?? detected.poster,
    description: v.description,
    transcript: v.transcript,
    captions_url: v.captions_url,
    collections,
    sort_order: v.sort_order,
    is_active: v.is_active,
  };
  const supabase = await createClient();
  const { error } = v.id ? await supabase.from("media_items").update(row).eq("id", v.id) : await supabase.from("media_items").insert(row);
  done(error ? "error" : "saved", error?.message);
}

export async function deleteMedia(formData: FormData) {
  await requireMediaStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("media_items").delete().eq("id", String(formData.get("id")));
  done(error ? "error" : "saved", error?.message);
}
