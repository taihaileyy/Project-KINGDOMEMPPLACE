"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMediaStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function done(key: "saved" | "error", message = "1"): never {
  revalidatePath("/admin/videos/comments");
  revalidatePath("/watch");
  redirect(`/admin/videos/comments?${key}=${encodeURIComponent(message)}`);
}

export async function setCommentStatus(formData: FormData) {
  await requireMediaStaff();
  const status = formData.get("status") === "hidden" ? "hidden" : "visible";
  const supabase = await createClient();
  const { error } = await supabase.from("media_comments").update({ status }).eq("id", String(formData.get("id")));
  done(error ? "error" : "saved", error?.message);
}

export async function deleteComment(formData: FormData) {
  await requireMediaStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("media_comments").delete().eq("id", String(formData.get("id")));
  done(error ? "error" : "saved", error?.message);
}
