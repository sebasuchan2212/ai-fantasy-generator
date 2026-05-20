import { NextResponse } from "next/server";
import { favoriteSchema } from "@/lib/schemas";
import {
  addFavoriteToSupabase,
  getUserFromRequest,
  removeFavoriteFromSupabase
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = favoriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "お気に入りデータが正しくありません。" },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const itemId =
    typeof parsed.data.item.id === "string" ? parsed.data.item.id : undefined;

  if (parsed.data.action === "remove" && itemId) {
    await removeFavoriteFromSupabase(user.id, itemId);
    return NextResponse.json({ ok: true, demoMode: false });
  }

  await addFavoriteToSupabase({
    userId: user.id,
    generationType: parsed.data.generationType,
    item: parsed.data.item
  });

  return NextResponse.json({ ok: true, demoMode: false });
}
