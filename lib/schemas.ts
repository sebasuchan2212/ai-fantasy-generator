import { z } from "zod";
import {
  MAX_GENERATION_COUNT,
  MONSTER_COUNT_DEFAULT,
  NPC_COUNT_DEFAULT
} from "@/lib/constants";

export const npcSettingsSchema = z.object({
  count: z.coerce.number().int().min(1).max(MAX_GENERATION_COUNT).default(NPC_COUNT_DEFAULT),
  race: z.string().default("すべて"),
  gender: z.string().default("すべて"),
  role: z.string().default("傭兵"),
  world: z.string().default("ファンタジー（中世風）"),
  ageGroup: z.string().default("すべて"),
  featureStrength: z.coerce.number().min(1).max(100).default(72),
  randomness: z.coerce.number().min(1).max(100).default(65),
  hairColor: z.string().optional().default(""),
  outfit: z.string().optional().default(""),
  weapon: z.string().optional().default(""),
  personality: z.string().optional().default(""),
  backstory: z.string().optional().default(""),
  speakingStyle: z.string().optional().default(""),
  negativePrompt: z.string().optional().default(""),
  imageStyle: z.string().optional().default("高品質ファンタジーイラスト"),
  highQualityImage: z.coerce.boolean().default(false)
});

export const monsterSettingsSchema = z.object({
  count: z.coerce.number().int().min(1).max(MAX_GENERATION_COUNT).default(MONSTER_COUNT_DEFAULT),
  monsterType: z.string().default("すべて"),
  size: z.string().default("すべて"),
  dangerLevel: z.coerce.number().min(1).max(100).default(76),
  world: z.string().default("ダークファンタジー"),
  colorTheme: z.string().default("すべて"),
  options: z.array(z.string()).default([]),
  background: z.enum(["transparent", "simple"]).default("transparent"),
  imageStyle: z.string().optional().default("高品質モンスターコンセプトアート"),
  negativePrompt: z.string().optional().default(""),
  highQualityImage: z.coerce.boolean().default(false)
});

export const favoriteSchema = z.object({
  generationType: z.enum(["npc", "monster"]),
  item: z.record(z.unknown()),
  action: z.enum(["add", "remove", "toggle"]).default("toggle")
});

export const saveSetSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["npc", "monster"]),
  items: z.array(z.record(z.unknown())).min(1)
});

export const exportSchema = z.object({
  type: z.enum(["npc", "monster"]),
  format: z.enum(["json", "csv", "markdown"]),
  items: z.array(z.record(z.unknown())).min(1)
});

export const checkoutSchema = z.object({
  planId: z.enum(["starter", "creator", "pro"])
});
