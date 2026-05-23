import { NextResponse } from "next/server";
import {
  calculateActualCreditCostForItems,
  calculateCreditCost
} from "@/lib/credits";
import { generateMonsters } from "@/lib/mock-data";
import { monsterSettingsSchema } from "@/lib/schemas";
import {
  consumeCreditsForUser,
  getCreditsForUser,
  getUserFromRequest,
  saveGenerationToSupabase,
  shouldUseDemoMode
} from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = monsterSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "生成設定の形式が正しくありません。", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const settings = parsed.data;
  const maximumCreditsUsed = calculateCreditCost(
    settings.count,
    settings.highQualityImage
  );
  const user = await getUserFromRequest(request);
  const demoMode = shouldUseDemoMode(request);

  if (!demoMode && !user) {
    return NextResponse.json(
      { message: "ログインが必要です。" },
      { status: 401 }
    );
  }

  if (user) {
    const currentCredits = await getCreditsForUser(user.id);
    if (currentCredits === null || currentCredits < maximumCreditsUsed) {
      return NextResponse.json(
        { message: "クレジットが不足しています。追加購入してください。" },
        { status: 402 }
      );
    }

    const results = await generateMonsters(settings);
    const creditsUsed = calculateActualCreditCostForItems(
      results,
      settings.highQualityImage
    );
    const debit = await consumeCreditsForUser(
      user.id,
      creditsUsed,
      "monster_generation"
    );
    if (!debit.ok) {
      return NextResponse.json(
        { message: "クレジットが不足しています。追加購入してください。" },
        { status: 402 }
      );
    }

    const generationId = await saveGenerationToSupabase({
      userId: user.id,
      type: "monster",
      title: `モンスター生成 ${results.length}体`,
      settings,
      results
    });

    return NextResponse.json({
      results,
      creditsUsed,
      remainingCredits: debit.remainingCredits,
      generationId,
      demoMode: false
    });
  }

  const demoCredits = Number(request.headers.get("x-demo-credits") ?? "0");
  if (Number.isFinite(demoCredits) && demoCredits < maximumCreditsUsed) {
    return NextResponse.json(
      { message: "クレジットが不足しています。追加購入してください。" },
      { status: 402 }
    );
  }

  const results = await generateMonsters(settings);
  const creditsUsed = calculateActualCreditCostForItems(
    results,
    settings.highQualityImage
  );
  return NextResponse.json({
    results,
    creditsUsed,
    remainingCredits: Math.max(0, demoCredits - creditsUsed),
    demoMode: true
  });
}
