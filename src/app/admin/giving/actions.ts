"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type GiftState = { error?: string; notice?: string };

// Finance staff record cash and check gifts. Online gifts arrive on their own
// from the payment provider; the database only lets finance insert these methods.
export async function recordGift(_: GiftState, form: FormData): Promise<GiftState> {
  const session = await requireStaff(["finance_admin"]);
  const parsed = z
    .object({
      fund: z.string().uuid(),
      amount: z.coerce.number().min(1, "Enter an amount of at least $1.").max(100000),
      method: z.enum(["cash", "check", "other"]),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the date."),
      donor_name: z.string().trim().max(200).default(""),
      donor_email: z.string().trim().toLowerCase().max(320).default(""),
      note: z.string().trim().max(500).default(""),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.donor_email && !z.string().email().safeParse(d.donor_email).success) return { error: "Enter a valid email address, or leave it blank." };

  const supabase = await createClient();
  let personId: string | null = null;
  if (d.donor_email) {
    const { data } = await supabase.from("people").select("id").eq("email", d.donor_email).is("merged_into_id", null).limit(1).maybeSingle();
    personId = (data?.id as string | undefined) ?? null;
  }
  const { error } = await supabase.from("gifts").insert({
    fund_id: d.fund, amount_cents: Math.round(d.amount * 100), method: d.method, status: "succeeded",
    given_at: `${d.date}T12:00:00-05:00`, donor_name: d.donor_name || null, donor_email: d.donor_email || null,
    person_id: personId, recorded_by: session.person.id, note: d.note || null,
  });
  if (error) return { error: "We couldn't record that gift. Please check the details and try again." };
  revalidatePath("/admin/giving");
  return { notice: "Gift recorded." };
}
