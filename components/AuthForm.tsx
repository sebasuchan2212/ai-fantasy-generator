"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDemoUser } from "@/lib/demo-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function postAuthPath() {
  if (typeof window === "undefined") return "/dashboard";

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  const plan = params.get("plan");
  const safeRedirect =
    redirect?.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/dashboard";

  if (safeRedirect === "/pricing" && plan) {
    return `/pricing?checkoutPlan=${encodeURIComponent(plan)}`;
  }

  return safeRedirect;
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        toast.error(result.error.message);
        setIsLoading(false);
          return;
      }

      if (mode === "signup" && !result.data.session) {
        toast.success("登録しました。確認メールが届いた場合は、確認後にログインしてください。");
        router.push("/auth");
        return;
      }

      toast.success(mode === "login" ? "ログインしました。" : "登録しました。");
      router.push(postAuthPath());
      return;
    }

    setDemoUser(email);
    toast.success("デモユーザーとして開始しました。");
    router.push(postAuthPath());
  };

  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{mode === "login" ? "ログイン" : "新規登録"}</CardTitle>
            <CardDescription>
              購入したクレジットを保存するため、メールアドレスでアカウントを作成します。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Supabase接続時のみ必要"
              />
            </div>
            <Button type="button" onClick={submit} disabled={isLoading}>
              {isLoading
                ? "処理中..."
                : mode === "login"
                  ? "ログインする"
                  : "登録する"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login"
                ? "はじめての方は新規登録"
                : "登録済みの方はログイン"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
