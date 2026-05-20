import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { message: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json(
      { message: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Webhook signature verification failed."
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits ?? "0");

    if (userId && userId !== "demo" && credits > 0) {
      const admin = createSupabaseAdmin();
      if (admin) {
        const existing = await admin
          .from("credit_transactions")
          .select("id")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (!existing.data) {
          await admin.rpc("add_credits_for_user", {
            target_user_id: userId,
            credit_amount: credits,
            transaction_reason: "stripe_checkout",
            checkout_session_id: session.id
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
