import { NextResponse } from "next/server";
import { saveSetSchema } from "@/lib/schemas";
import { getUserFromRequest, saveSetToSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = saveSetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "保存するセットの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const id = await saveSetToSupabase({
    userId: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    items: parsed.data.items
  });

  return NextResponse.json({ ok: true, id, demoMode: false });
}
