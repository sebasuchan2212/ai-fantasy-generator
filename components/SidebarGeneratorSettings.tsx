"use client";

import { useState } from "react";
import { Check, ChevronDown, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  COLOR_THEMES,
  MAX_GENERATION_COUNT,
  MONSTER_OPTIONS,
  MONSTER_SIZES,
  MONSTER_TYPES,
  MONSTER_WORLDS,
  NPC_AGE_GROUPS,
  NPC_GENDERS,
  NPC_RACES,
  NPC_ROLES,
  NPC_WORLDS
} from "@/lib/constants";
import type { GeneratorType, MonsterSettings, NPCSettings } from "@/lib/types";
import { cn, formatCredits } from "@/lib/utils";

type SidebarGeneratorSettingsProps = {
  type: GeneratorType;
  values: NPCSettings | MonsterSettings;
  credits: number;
  creditCost: number;
  isGenerating: boolean;
  onGenerate: () => void;
  setValue: (field: string, value: unknown) => void;
};

function OptionButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn("h-9 flex-1 px-2 text-xs", active && "shadow-sm")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="rounded-lg border bg-background shadow-sm">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            className={cn("shrink-0 text-muted-foreground transition", open && "rotate-180")}
          />
        </button>
        {open ? (
          <div className="max-h-56 overflow-y-auto border-t p-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-accent hover:text-accent-foreground",
                  value === option && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span>{option}</span>
                {value === option ? <Check className="text-primary" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  minLabel,
  maxLabel,
  onChange
}: {
  label: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs font-semibold text-muted-foreground">{value}</span>
      </div>
      <Slider
        min={1}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export function SidebarGeneratorSettings({
  type,
  values,
  credits,
  creditCost,
  isGenerating,
  onGenerate,
  setValue
}: SidebarGeneratorSettingsProps) {
  const isNPC = type === "npc";
  const npc = values as NPCSettings;
  const monster = values as MonsterSettings;

  return (
    <aside className="rounded-lg border bg-card shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
      <form
        className="flex flex-col gap-6 p-4 md:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate();
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">生成設定</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              条件を選ぶだけで一括生成できます。
            </p>
          </div>
          <span className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
            Demo OK
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="count">生成数</Label>
            <div className="flex items-center gap-2">
              <Input
                id="count"
                type="number"
                min={1}
                max={MAX_GENERATION_COUNT}
                className="w-20 text-center font-bold"
                value={values.count}
                onChange={(event) =>
                  setValue("count", Number(event.target.value || 1))
                }
              />
              <span className="text-sm text-muted-foreground">体</span>
            </div>
          </div>
          <Slider
            min={1}
            max={MAX_GENERATION_COUNT}
            step={1}
            value={[values.count]}
            onValueChange={(next) => setValue("count", next[0] ?? values.count)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>25</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {isNPC ? (
          <>
            <div className="flex flex-col gap-3">
              <Label>種族</Label>
              <div className="grid grid-cols-4 gap-2">
                {NPC_RACES.map((race) => (
                  <OptionButton
                    key={race}
                    active={npc.race === race}
                    onClick={() => setValue("race", race)}
                  >
                    {race}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>性別</Label>
              <div className="grid grid-cols-4 gap-2">
                {NPC_GENDERS.map((gender) => (
                  <OptionButton
                    key={gender}
                    active={npc.gender === gender}
                    onClick={() => setValue("gender", gender)}
                  >
                    {gender}
                  </OptionButton>
                ))}
              </div>
            </div>

            <SelectField
              label="職業・役割"
              value={npc.role}
              options={NPC_ROLES}
              onChange={(value) => setValue("role", value)}
            />

            <SelectField
              label="雰囲気・世界観"
              value={npc.world}
              options={NPC_WORLDS}
              onChange={(value) => setValue("world", value)}
            />

            <div className="flex flex-col gap-3">
              <Label>年代</Label>
              <div className="grid grid-cols-5 gap-2">
                {NPC_AGE_GROUPS.map((age) => (
                  <OptionButton
                    key={age}
                    active={npc.ageGroup === age}
                    onClick={() => setValue("ageGroup", age)}
                  >
                    {age}
                  </OptionButton>
                ))}
              </div>
            </div>

            <SliderField
              label="特徴の強さ"
              value={npc.featureStrength}
              minLabel="控えめ"
              maxLabel="強め"
              onChange={(value) => setValue("featureStrength", value)}
            />
            <SliderField
              label="設定のランダム性"
              value={npc.randomness}
              minLabel="低い"
              maxLabel="高い"
              onChange={(value) => setValue("randomness", value)}
            />

            <details className="group rounded-lg border bg-muted/20 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">
                詳細設定
                <ChevronDown className="transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                <Input
                  placeholder="髪色"
                  value={npc.hairColor}
                  onChange={(event) => setValue("hairColor", event.target.value)}
                />
                <Input
                  placeholder="服装"
                  value={npc.outfit}
                  onChange={(event) => setValue("outfit", event.target.value)}
                />
                <Input
                  placeholder="武器"
                  value={npc.weapon}
                  onChange={(event) => setValue("weapon", event.target.value)}
                />
                <Input
                  placeholder="性格"
                  value={npc.personality}
                  onChange={(event) => setValue("personality", event.target.value)}
                />
                <Textarea
                  placeholder="背景設定"
                  value={npc.backstory}
                  onChange={(event) => setValue("backstory", event.target.value)}
                />
                <Input
                  placeholder="口調"
                  value={npc.speakingStyle}
                  onChange={(event) => setValue("speakingStyle", event.target.value)}
                />
                <Input
                  placeholder="禁止要素"
                  value={npc.negativePrompt}
                  onChange={(event) => setValue("negativePrompt", event.target.value)}
                />
                <Input
                  placeholder="画像スタイル"
                  value={npc.imageStyle}
                  onChange={(event) => setValue("imageStyle", event.target.value)}
                />
              </div>
            </details>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Label>モンスタータイプ</Label>
              <div className="grid grid-cols-3 gap-2">
                {MONSTER_TYPES.map((monsterType) => (
                  <OptionButton
                    key={monsterType}
                    active={monster.monsterType === monsterType}
                    onClick={() => setValue("monsterType", monsterType)}
                  >
                    {monsterType}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>サイズ</Label>
              <div className="grid grid-cols-5 gap-2">
                {MONSTER_SIZES.map((size) => (
                  <OptionButton
                    key={size}
                    active={monster.size === size}
                    onClick={() => setValue("size", size)}
                  >
                    {size}
                  </OptionButton>
                ))}
              </div>
            </div>

            <SliderField
              label="危険度（強さ）"
              value={monster.dangerLevel}
              minLabel="弱い"
              maxLabel="強い"
              onChange={(value) => setValue("dangerLevel", value)}
            />

            <SelectField
              label="世界観・テイスト"
              value={monster.world}
              options={MONSTER_WORLDS}
              onChange={(value) => setValue("world", value)}
            />

            <div className="flex flex-col gap-3">
              <Label>カラーテーマ</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_THEMES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => setValue("colorTheme", color)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border text-xs font-bold shadow-sm",
                      monster.colorTheme === color
                        ? "border-primary bg-accent text-primary"
                        : "border-input bg-background text-muted-foreground"
                    )}
                  >
                    {color === "すべて" ? (
                      "すべて"
                    ) : (
                      <span
                        className={cn(
                          "size-4 rounded-full border",
                          color === "赤" && "bg-red-500",
                          color === "青" && "bg-blue-500",
                          color === "紫" && "bg-violet-500",
                          color === "緑" && "bg-green-500",
                          color === "黄" && "bg-yellow-400",
                          color === "白" && "bg-white",
                          color === "黒" && "bg-slate-950"
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>特徴・オプション（複数選択可）</Label>
              <div className="grid grid-cols-4 gap-2">
                {MONSTER_OPTIONS.map((option) => {
                  const checked = monster.options.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setValue(
                          "options",
                          checked
                            ? monster.options.filter((item) => item !== option)
                            : [...monster.options, option]
                        )
                      }
                      className={cn(
                        "h-9 rounded-md border px-2 text-xs font-bold shadow-sm transition",
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>背景</Label>
              <div className="grid grid-cols-2 gap-2">
                <OptionButton
                  active={monster.background === "transparent"}
                  onClick={() => setValue("background", "transparent")}
                >
                  透過背景
                </OptionButton>
                <OptionButton
                  active={monster.background === "simple"}
                  onClick={() => setValue("background", "simple")}
                >
                  シンプル背景
                </OptionButton>
              </div>
            </div>

            <details className="group rounded-lg border bg-muted/20 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">
                詳細設定
                <ChevronDown className="transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                <Input
                  placeholder="画像スタイル"
                  value={monster.imageStyle}
                  onChange={(event) => setValue("imageStyle", event.target.value)}
                />
                <Input
                  placeholder="禁止要素"
                  value={monster.negativePrompt}
                  onChange={(event) => setValue("negativePrompt", event.target.value)}
                />
              </div>
            </details>
          </>
        )}

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3">
          <span className="flex flex-col gap-1">
            <span className="text-sm font-bold">高品質画像生成</span>
            <span className="text-xs text-muted-foreground">
              1体あたり追加2クレジット
            </span>
          </span>
          <Checkbox
            checked={values.highQualityImage}
            onCheckedChange={(checked) => setValue("highQualityImage", Boolean(checked))}
          />
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={isGenerating}
          className="w-full gap-2"
        >
          <Sparkles data-icon="inline-start" />
          {isGenerating ? "生成中..." : "生成する"}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Coins className="text-primary" />
          消費クレジット：{formatCredits(creditCost)}
          <span className={cn(credits < creditCost && "font-bold text-destructive")}>
            / 残高 {formatCredits(credits)}
          </span>
        </div>
      </form>
    </aside>
  );
}
