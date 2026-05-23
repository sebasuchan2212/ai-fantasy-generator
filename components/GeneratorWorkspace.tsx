"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Grid2X2,
  Heart,
  List,
  RefreshCw,
  SquareCheckBig,
  Tags,
  UserRound,
  Skull
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CreditPurchaseModal } from "@/components/CreditPurchaseModal";
import { DetailDrawer } from "@/components/DetailDrawer";
import { EmptyState } from "@/components/EmptyState";
import { ExportButton } from "@/components/ExportButton";
import { GeneratorTabs } from "@/components/GeneratorTabs";
import { LoadingGeneration } from "@/components/LoadingGeneration";
import { Pagination } from "@/components/Pagination";
import { ResultGrid } from "@/components/ResultGrid";
import { ResultList } from "@/components/ResultList";
import { SaveSetDialog } from "@/components/SaveSetDialog";
import { SidebarGeneratorSettings } from "@/components/SidebarGeneratorSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MONSTER_COUNT_DEFAULT,
  NPC_COUNT_DEFAULT
} from "@/lib/constants";
import {
  addDemoCredits,
  getDemoCredits,
  saveLocalGeneration,
  saveLocalSet,
  setDemoCredits,
  toggleLocalFavorite
} from "@/lib/demo-store";
import { calculateCreditCost } from "@/lib/credits";
import { monsterSettingsSchema, npcSettingsSchema } from "@/lib/schemas";
import { getAccessToken } from "@/lib/supabase/client";
import type {
  GenerateResponse,
  GenerationItem,
  GenerationRecord,
  GeneratorType,
  Monster,
  MonsterSettings,
  NPC,
  NPCSettings,
  SavedSet,
  ViewMode
} from "@/lib/types";
import { formatCredits } from "@/lib/utils";

const PAGE_SIZE = 20;

function defaultNpcSettings(): NPCSettings {
  return {
    count: NPC_COUNT_DEFAULT,
    race: "すべて",
    gender: "すべて",
    role: "傭兵",
    world: "ファンタジー（中世風）",
    ageGroup: "すべて",
    featureStrength: 82,
    randomness: 75,
    hairColor: "",
    outfit: "",
    weapon: "",
    personality: "",
    backstory: "",
    speakingStyle: "",
    negativePrompt: "",
    imageStyle: "高品質ファンタジーイラスト",
    highQualityImage: false
  };
}

function defaultMonsterSettings(): MonsterSettings {
  return {
    count: MONSTER_COUNT_DEFAULT,
    monsterType: "すべて",
    size: "すべて",
    dangerLevel: 82,
    world: "ダークファンタジー",
    colorTheme: "すべて",
    options: [],
    background: "transparent",
    imageStyle: "高品質モンスターコンセプトアート",
    negativePrompt: "",
    highQualityImage: false
  };
}

function createRecord(
  type: GeneratorType,
  settings: NPCSettings | MonsterSettings,
  results: GenerationItem[]
): GenerationRecord {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `generation_${Date.now()}`,
    type,
    title: `${type === "npc" ? "NPC" : "モンスター"}生成 ${results.length}体`,
    settings,
    results,
    createdAt: new Date().toISOString()
  };
}

export function GeneratorWorkspace({ type }: { type: GeneratorType }) {
  const isNPC = type === "npc";
  const form = useForm<NPCSettings | MonsterSettings>({
    resolver: zodResolver(isNPC ? npcSettingsSchema : monsterSettingsSchema),
    defaultValues: isNPC ? defaultNpcSettings() : defaultMonsterSettings()
  });
  const values = form.watch();
  const [credits, setCredits] = useState(20);
  const [results, setResults] = useState<GenerationItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showName, setShowName] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<GenerationItem | null>(null);

  useEffect(() => {
    const sync = () => setCredits(getDemoCredits());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("aifantasy-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("aifantasy-storage", sync);
    };
  }, []);

  const creditCost = calculateCreditCost(
    values.count,
    values.highQualityImage
  );

  const selectedItems = useMemo(
    () => results.filter((item) => item.isSelected),
    [results]
  );

  const filteredResults = useMemo(
    () => (favoriteOnly ? results.filter((item) => item.isFavorite) : results),
    [favoriteOnly, results]
  );

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const paginatedResults = filteredResults.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [favoriteOnly, results.length]);

  const setValue = (field: string, value: unknown) => {
    form.setValue(field as never, value as never, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleGenerate = form.handleSubmit(async (settings) => {
    const cost = calculateCreditCost(settings.count, settings.highQualityImage);
    const currentCredits = getDemoCredits();

    if (currentCredits < cost) {
      setPurchaseOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/generate/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-mode": token ? "false" : "true",
          "x-demo-credits": String(currentCredits),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings)
      });

      if (response.status === 402) {
        setPurchaseOpen(true);
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        toast.error(data?.message ?? "生成に失敗しました。");
        return;
      }

      const data = (await response.json()) as GenerateResponse<NPC | Monster>;
      const nextResults = data.results.map((item) => ({
        ...item,
        isSelected: false,
        isFavorite: false
      }));
      setResults(nextResults);

      if (typeof data.remainingCredits === "number") {
        setDemoCredits(data.remainingCredits);
        setCredits(data.remainingCredits);
      }

      saveLocalGeneration(createRecord(type, settings, nextResults));
      toast.success(
        `${nextResults.length}体生成しました。${formatCredits(data.creditsUsed)}クレジット消費。`
      );
    } catch {
      toast.error("通信エラーが発生しました。デモモードでもう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  });

  const toggleSelected = (id: string) => {
    setResults((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const toggleAllSelected = () => {
    const allSelected =
      results.length > 0 && results.every((item) => item.isSelected);
    setResults((current) =>
      current.map((item) => ({ ...item, isSelected: !allSelected }))
    );
  };

  const toggleFavorite = async (item: GenerationItem) => {
    const nextFavorite = !item.isFavorite;
    setResults((current) =>
      current.map((result) =>
        result.id === item.id ? { ...result, isFavorite: nextFavorite } : result
      )
    );
    toggleLocalFavorite(type, { ...item, isFavorite: nextFavorite });

    const token = await getAccessToken();
    await fetch("/api/favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        generationType: type,
        item: { ...item, isFavorite: nextFavorite },
        action: nextFavorite ? "add" : "remove"
      })
    }).catch(() => null);
  };

  const handleSavedSet = (name: string) => {
    const set: SavedSet = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `set_${Date.now()}`,
      name,
      type,
      items: selectedItems,
      createdAt: new Date().toISOString()
    };
    saveLocalSet(set);
  };

  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader credits={credits} compact />
      <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 py-4">
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-background p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {isNPC ? <UserRound /> : <Skull />}
            </span>
            <div>
              <h1 className="text-xl font-extrabold">
                {isNPC ? "NPC量産メーカー" : "モンスター量産メーカー"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                ワンクリックで{isNPC ? "NPC" : "敵モンスターの立ち絵素材"}を大量生成！
              </p>
            </div>
          </div>
          <GeneratorTabs active={type} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[350px_minmax(0,1fr)]">
          <SidebarGeneratorSettings
            type={type}
            values={values}
            credits={credits}
            creditCost={creditCost}
            isGenerating={isGenerating}
            onGenerate={() => void handleGenerate()}
            setValue={setValue}
          />

          <section className="rounded-lg border bg-background p-4 shadow-sm md:p-5">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    生成結果（{results.length}体）
                  </h2>
                  {selectedItems.length > 0 ? (
                    <Badge variant="secondary">
                      選択中 {selectedItems.length}体
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  カードを選択して、保存・エクスポートできます。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating}
                >
                  <RefreshCw data-icon="inline-start" />
                  再生成
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleAllSelected}
                  disabled={results.length === 0}
                >
                  <SquareCheckBig data-icon="inline-start" />
                  すべて選択
                </Button>
                <Button
                  type="button"
                  variant={favoriteOnly ? "default" : "outline"}
                  onClick={() => setFavoriteOnly((current) => !current)}
                  disabled={results.length === 0}
                >
                  <Heart data-icon="inline-start" />
                  お気に入り
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowName((current) => !current)}
                  disabled={results.length === 0}
                >
                  <Tags data-icon="inline-start" />
                  {showName ? "名前を一括非表示" : "名前を一括表示"}
                </Button>
                <div className="flex rounded-md border bg-background p-1">
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    aria-label="グリッド表示"
                  >
                    <Grid2X2 />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    aria-label="リスト表示"
                  >
                    <List />
                  </Button>
                </div>
              </div>
            </div>

            {isGenerating ? (
              <LoadingGeneration count={values.count} />
            ) : results.length === 0 ? (
              <EmptyState
                title={`${isNPC ? "NPC" : "モンスター"}をまだ生成していません`}
                description="左側の設定を選んで生成ボタンを押すと、画像付きカードと詳細プロフィールがここに表示されます。"
                actionLabel="サンプル生成"
                onAction={() => void handleGenerate()}
              />
            ) : filteredResults.length === 0 ? (
              <EmptyState
                title="お気に入りがまだありません"
                description="カード右上の星を押すと、お気に入りだけを絞り込めます。"
              />
            ) : (
              <div className="flex flex-col gap-5">
                {viewMode === "grid" ? (
                  <ResultGrid
                    type={type}
                    items={paginatedResults}
                    showName={showName}
                    onToggleSelected={toggleSelected}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetail={setDetailItem}
                  />
                ) : (
                  <ResultList
                    type={type}
                    items={paginatedResults}
                    showName={showName}
                    onToggleSelected={toggleSelected}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetail={setDetailItem}
                  />
                )}

                <div className="flex flex-col justify-between gap-3 border-t pt-4 md:flex-row md:items-center">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <SaveSetDialog
                      type={type}
                      items={selectedItems}
                      onSaved={handleSavedSet}
                    />
                    <ExportButton type={type} items={selectedItems} />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <CreditPurchaseModal
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        onPurchased={(nextCredits) => {
          if (nextCredits < credits) {
            setCredits(addDemoCredits(nextCredits));
          } else {
            setCredits(nextCredits);
          }
        }}
      />
      <DetailDrawer
        type={type}
        item={detailItem}
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailItem(null)}
      />
    </div>
  );
}
