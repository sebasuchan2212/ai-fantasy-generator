import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/schemas";
import { getAppUrl, getPlan, getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "プランが正しくありません。" },
      { status: 400 }
    );
  }

  const plan = getPlan(parsed.data.planId);
  if (!plan) {
    return NextResponse.json(
      { message: "プランが見つかりません。" },
      { status: 404 }
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({
      mock: true,
      credits: plan.credits,
      message: "Stripe未設定のため、デモ購入としてクレジットを追加できます。"
    });
  }

  const stripe = getStripeClient();
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { message: "購入にはログインが必要です。" },
      { status: 401 }
    );
  }

  const metadata = {
    userId: user.id,
    planId: plan.id,
    credits: String(plan.credits)
  };

  const session = await stripe!.checkout.sessions.create({
    mode: "payment",
    success_url: `${getAppUrl()}/pricing?checkout=success`,
    cancel_url: `${getAppUrl()}/pricing?checkout=cancelled`,
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata,
    payment_intent_data: {
      metadata
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "jpy",
          unit_amount: plan.priceJpy,
          product_data: {
            name: `AI FANTASY Generator ${plan.name}`,
            description: `${plan.credits}クレジット`
          }
        }
      }
    ]
  });

  return NextResponse.json({ url: session.url });
}
