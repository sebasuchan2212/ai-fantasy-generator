import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function shouldUseDemoMode(request: Request) {
  if (!isSupabaseConfigured()) return true;
  return (
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-demo-mode") === "true"
  );
}

export function createSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export function createSupabaseAuthClient(): SupabaseClient | null {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const client = createSupabaseAuthClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

export async function consumeCreditsForUser(
  userId: string,
  amount: number,
  reason: string
) {
  const admin = createSupabaseAdmin();
  if (!admin) return { ok: false, remainingCredits: null, error: "Supabase is not configured." };

  const { data, error } = await admin.rpc("consume_credits_for_user", {
    target_user_id: userId,
    credit_cost: amount,
    transaction_reason: reason
  });

  if (error) {
    return { ok: false, remainingCredits: null, error: error.message };
  }

  return { ok: true, remainingCredits: Number(data), error: null };
}

export async function getCreditsForUser(userId: string) {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) return null;
  return typeof data?.credits === "number" ? data.credits : Number(data?.credits ?? 0);
}

export async function saveGenerationToSupabase(input: {
  userId: string;
  type: "npc" | "monster";
  title: string;
  settings: unknown;
  results: unknown;
}) {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("generations")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      settings: input.settings,
      results: input.results
    })
    .select("id")
    .single();

  return data?.id ?? null;
}

export async function addFavoriteToSupabase(input: {
  userId: string;
  generationType: "npc" | "monster";
  item: unknown;
}) {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from("favorites")
    .insert({
      user_id: input.userId,
      generation_type: input.generationType,
      item: input.item
    })
    .select("id")
    .single();

  if (error) return null;
  return data?.id ?? null;
}

export async function removeFavoriteFromSupabase(userId: string, itemId: string) {
  const admin = createSupabaseAdmin();
  if (!admin) return;

  await admin
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item->>id", itemId);
}

export async function saveSetToSupabase(input: {
  userId: string;
  name: string;
  type: "npc" | "monster";
  items: unknown;
}) {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("saved_sets")
    .insert({
      user_id: input.userId,
      name: input.name,
      type: input.type,
      items: input.items
    })
    .select("id")
    .single();

  return data?.id ?? null;
}

export async function getDashboardData(userId: string) {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const [profile, generations, favorites, savedSets] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).single(),
    admin
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    admin
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(60),
    admin
      .from("saved_sets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
  ]);

  return {
    profile: profile.data,
    generations: generations.data ?? [],
    favorites: favorites.data ?? [],
    savedSets: savedSets.data ?? []
  };
}
