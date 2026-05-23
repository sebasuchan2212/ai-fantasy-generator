"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Heart, History, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CreditBadge } from "@/components/CreditBadge";
import { EmptyState } from "@/components/EmptyState";
import { GeneratedImage } from "@/components/GeneratedImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDemoCredits,
  getLocalFavorites,
  getLocalGenerations,
  getLocalSavedSets
} from "@/lib/demo-store";
import type { GenerationRecord, SavedSet } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function DashboardClient() {
  const [credits, setCredits] = useState(20);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [favorites, setFavorites] = useState<ReturnType<typeof getLocalFavorites>>([]);
  const [sets, setSets] = useState<SavedSet[]>([]);

  useEffect(() => {
    const sync = () => {
      setCredits(getDemoCredits());
      setGenerations(getLocalGenerations());
      setFavorites(getLocalFavorites());
      setSets(getLocalSavedSets());
    };
    sync();
    window.addEventListener("aifantasy-storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aifantasy-storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader credits={credits} />
      <main className="mx-auto flex max-w-[1480px] flex-col gap-6 px-4 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>クレジット残高</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <CreditBadge credits={credits} />
              <Button asChild>
                <Link href="/pricing">追加購入</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History /> 生成履歴
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold">
              {generations.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart /> お気に入り
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold">
              {favorites.length}
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>生成履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {generations.length === 0 ? (
                <EmptyState
                  title="生成履歴はまだありません"
                  description="NPCまたはモンスターを生成すると、ここに履歴が残ります。"
                  actionLabel="NPCを生成する"
                  onAction={() => {
                    window.location.href = "/generator/npc";
                  }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {generations.map((generation) => (
                    <div
                      key={generation.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border p-4 md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="font-bold">{generation.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDateTime(generation.createdAt)} / {generation.results.length}体
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/generator/${generation.type}`}>同じメーカーへ</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card id="favorites">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart /> お気に入り一覧
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {favorites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    星を押した生成結果がここに表示されます。
                  </p>
                ) : (
                  favorites.slice(0, 8).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border p-2">
                      <GeneratedImage
                        src={item.imageUrl}
                        alt={item.name}
                        kind={item.generationType}
                        width={96}
                        height={96}
                        className="size-12 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.generationType === "npc" ? "NPC" : "モンスター"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card id="sets">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box /> 保存済みセット
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {sets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    選択した項目をセット保存すると、ここに一覧化されます。
                  </p>
                ) : (
                  sets.map((set) => (
                    <div key={set.id} className="rounded-lg border p-3">
                      <p className="font-bold">{set.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {set.type === "npc" ? "NPC" : "モンスター"} / {set.items.length}体 / {formatDateTime(set.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="rounded-lg border bg-background p-5 text-sm text-muted-foreground shadow-sm">
          <Sparkles className="mb-2 text-primary" />
          Supabase接続後は、自分の生成履歴・お気に入り・保存済みセットだけがRLSで取得されます。未設定時はブラウザ内のデモデータで動作します。
        </div>
      </main>
    </div>
  );
}
