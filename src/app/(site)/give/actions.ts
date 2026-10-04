"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { funds } from "@/content/site";
import { getSession } from "@/lib/auth";
import { siteUrl } from "@/lib/site-url";
import { createCheckoutSession, stripeConfigured } from "@/lib/stripe";

export type GiveState = { error?: string };

const schema = z.object({
  amount: z.coerce.number().min(1, "The smallest gift online is $1.").max(100000, "For gifts over $100,000, please call us."),
  fund: z.enum(funds.map((f) => f.slug) as [string, ...string[]]),
  frequency: z.enum(["once", "monthly"]),
  name: z.string().trim().max(200).optional().default(""),
});

// Sends the giver to Stripe Checkout. Signed-in givers are linked to their
// profile; guests are linked by email, and those gifts move into their
// account if they later sign up and verify the same address.
export async function startGift(_: GiveState, form: FormData): Promise<GiveState> {
  if (!stripeConfigured()) {
    return { error: "Online giving isn't switched on yet. You can give in person at a service or Bible Study, or call us." };
  }
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { amount, fund, frequency, name } = parsed.data;

  const session = await getSession();
  const fundName = funds.find((f) => f.slug === fund)?.name ?? "Gift";
  const base = await siteUrl();
  const monthly = frequency === "monthly";
  const donorName = session ? [session.person.first_name, session.person.last_name].filter(Boolean).join(" ") : name;
  const meta = { fund, person_id: session?.person.id ?? "", donor_name: donorName };
  const metaPrefix = monthly ? "subscription_data[metadata]" : "payment_intent_data[metadata]";

  const { url, error } = await createCheckoutSession({
    mode: monthly ? "subscription" : "payment",
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": Math.round(amount * 100),
    "line_items[0][price_data][product_data][name]": `${fundName} · Kingdom Empowerment Place`,
    "line_items[0][price_data][recurring][interval]": monthly ? "month" : undefined,
    submit_type: monthly ? undefined : "donate",
    customer_email: session?.person.email ?? undefined,
    success_url: `${base}/give/thanks?kind=${monthly ? "monthly" : "once"}`,
    cancel_url: `${base}/give`,
    "metadata[fund]": meta.fund,
    "metadata[person_id]": meta.person_id,
    "metadata[donor_name]": meta.donor_name,
    [`${metaPrefix}[fund]`]: meta.fund,
    [`${metaPrefix}[person_id]`]: meta.person_id,
    [`${metaPrefix}[donor_name]`]: meta.donor_name,
  });
  if (!url) {
    console.error("Stripe checkout failed:", error);
    return { error: "We couldn't open secure checkout just now. Please try again in a minute." };
  }
  redirect(url);
}
