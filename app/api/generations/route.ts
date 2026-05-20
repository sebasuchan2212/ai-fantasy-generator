import { NextResponse } from "next/server";
import { getDashboardData, getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({
      profile: null,
      generations: [],
      favorites: [],
      savedSets: [],
      demoMode: true
    });
  }

  const data = await getDashboardData(user.id);
  return NextResponse.json({ ...data, demoMode: false });
}
