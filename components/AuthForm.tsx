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

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@aifantasy.local");
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

      toast.success(mode === "login" ? "ログインしました。" : "登録しました。");
      router.push("/dashboard");
      return;
    }

    setDemoUser(email);
    toast.success("デモユーザーとして開始しました。");
    router.push("/generator/npc");
  };

  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{mode === "login" ? "ログイン" : "新規登録"}</CardTitle>
            <CardDescription>
              Supabase未設定時はデモユーザーとしてそのまま利用できます。
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
                ? "新規登録に切り替え"
                : "ログインに切り替え"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
