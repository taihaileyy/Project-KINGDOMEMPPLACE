import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL } from "@/lib/env";
import { verifyStripeSignature } from "@/lib/stripe";

// Stripe calls this after each payment. It's the only place online gifts are
// recorded, using the service role through two locked-down database functions.
// Stripe retries on any non-2xx, and record_online_gift ignores repeats.

type Meta = { fund?: string; person_id?: string; donor_name?: string };

async function rpc(fn: string, args: Record<string, unknown>) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Legacy service-role keys are JWTs and also go in Authorization; new
  // sb_secret_ keys only go in apikey.
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`${fn} failed: ${res.status} ${await res.text()}`);
}

function recordGift(ref: string, amountCents: number, meta: Meta, email: string | null, name: string | null, recurring: boolean, subscription: string | null) {
  return rpc("record_online_gift", {
    p_stripe_ref: ref,
    p_fund_slug: meta.fund || "other",
    p_amount_cents: amountCents,
    p_kind: recurring ? "recurring" : "one_time",
    p_method: "card",
    p_email: email,
    p_name: meta.donor_name || name,
    p_person_id: meta.person_id || null,
    p_subscription_id: subscription,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) return new NextResponse("Not configured", { status: 503 });

  const body = await request.text();
  if (!(await verifyStripeSignature(body, request.headers.get("stripe-signature"), secret))) {
    return new NextResponse("Bad signature", { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = JSON.parse(body) as { type: string; data: { object: any } };
  const o = event.data.object;

  try {
    switch (event.type) {
      // One-time gifts. Card payments arrive "paid"; bank payments finish later.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        if (o.mode === "payment" && o.payment_status === "paid" && o.payment_intent) {
          await recordGift(o.payment_intent, o.amount_total, o.metadata ?? {}, o.customer_details?.email ?? null, o.customer_details?.name ?? null, false, null);
        }
        break;

      // Monthly gifts: every paid invoice, including the first, is one gift.
      case "invoice.paid": {
        const subscription = o.subscription ?? o.parent?.subscription_details?.subscription ?? null;
        const meta: Meta = o.subscription_details?.metadata ?? o.parent?.subscription_details?.metadata ?? o.lines?.data?.[0]?.metadata ?? {};
        if (subscription && o.amount_paid > 0) {
          await recordGift(o.id, o.amount_paid, meta, o.customer_email ?? null, o.customer_name ?? null, true, subscription);
        }
        break;
      }

      case "charge.refunded":
        if (o.refunded) {
          if (o.payment_intent) await rpc("mark_gift_refunded", { p_stripe_ref: o.payment_intent });
          if (o.invoice) await rpc("mark_gift_refunded", { p_stripe_ref: o.invoice });
        }
        break;
    }
  } catch (e) {
    console.error("Stripe webhook failed:", e);
    return new NextResponse("Error recording gift", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
