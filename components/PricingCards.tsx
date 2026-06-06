"use client";

import { useCallback, useEffect, useRef } from "react";
import { Check, Coins } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/lib/constants";
import {
  BASE_GENERATION_CREDIT_COST,
  OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST
} from "@/lib/credits";
import { addDemoCredits } from "@/lib/demo-store";
import {
  getAccessToken,
  isBrowserSupabaseConfigured
} from "@/lib/supabase/client";
import { cn, formatCredits } from "@/lib/utils";

function redirectToAuthForPurchase(planId: string) {
  const next = `/auth?redirect=/pricing&plan=${encodeURIComponent(planId)}`;
  toast.info("購入にはログインまたは新規登録が必要です。");
  window.location.href = next;
}

export function PricingCards({
  onPurchased
}: {
  onPurchased?: (credits: number) => void;
}) {
  const autoCheckoutStarted = useRef(false);
  const highQualityCost =
    BASE_GENERATION_CREDIT_COST + OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST;

  const purchase = useCallback(async (planId: string) => {
    const token = await getAccessToken();
    if (!token && isBrowserSupabaseConfigured()) {
      redirectToAuthForPurchase(planId);
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ planId })
    });

    if (response.status === 401 && isBrowserSupabaseConfigured()) {
      redirectToAuthForPurchase(planId);
      return;
    }

    const data = (await response.json()) as {
      url?: string;
      mock?: boolean;
      credits?: number;
      message?: string;
    };

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    if (data.mock && data.credits) {
      const next = addDemoCredits(data.credits);
      onPurchased?.(next);
      toast.success(`${formatCredits(data.credits)}クレジットを追加しました。`);
      return;
    }

    toast.error(data.message ?? "購入処理を開始できませんでした。");
  }, [onPurchased]);

  useEffect(() => {
    if (autoCheckoutStarted.current) return;

    const params = new URLSearchParams(window.location.search);
    const planId = params.get("checkoutPlan");
    const isValidPlan = PRICING_PLANS.some((plan) => plan.id === planId);
    if (!planId || !isValidPlan) return;

    autoCheckoutStarted.current = true;
    params.delete("checkoutPlan");
    const nextQuery = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`
    );
    void purchase(planId);
  }, [purchase]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PRICING_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative overflow-hidden",
            plan.highlighted && "border-primary shadow-soft"
          )}
        >
          {plan.highlighted ? (
            <Badge className="absolute right-4 top-4">おすすめ</Badge>
          ) : null}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-3xl font-extrabold">
                ¥{plan.priceJpy.toLocaleString("ja-JP")}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-primary">
                <Coins /> {formatCredits(plan.credits)}クレジット
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="text-primary" /> NPC・モンスター生成に利用可能
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-primary" /> OpenAI高品質は約
                {Math.floor(plan.credits / highQualityCost)}体分
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-primary" /> エクスポート無料
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-primary" /> クレカ・PayPay等はStripe側で表示
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-primary" /> Stripe未設定時はモック購入
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              className="w-full"
              variant={plan.highlighted ? "default" : "outline"}
              onClick={() => purchase(plan.id)}
            >
              購入する
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
