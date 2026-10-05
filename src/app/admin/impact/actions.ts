"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Which numbers appear on the public /impact page and the homepage. Super admins only.
export async function saveImpact(form: FormData): Promise<void> {
  await requireStaff(["super_admin"]);
  const keys = z.array(z.string().regex(/^[a-z_]+$/)).safeParse(form.getAll("key"));
  if (!keys.success) return;
  const on = new Set(form.getAll("public").map(String));
  const supabase = await createClient();
  for (const key of keys.data) {
    const label = String(form.get(`label_${key}`) ?? "").trim().slice(0, 80);
    await supabase.from("impact_metrics").update({ is_public: on.has(key), ...(label ? { label } : {}) }).eq("key", key);
  }
  revalidatePath("/admin/impact");
  revalidatePath("/impact");
}
