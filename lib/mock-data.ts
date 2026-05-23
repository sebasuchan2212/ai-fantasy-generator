import {
  COLOR_THEMES,
  MONSTER_NAME_POOL,
  MONSTER_OPTIONS,
  MONSTER_SIZES,
  MONSTER_TYPES,
  MONSTER_WORLDS,
  NPC_AGE_GROUPS,
  NPC_GENDERS,
  NPC_NAME_POOL,
  NPC_RACES,
  NPC_ROLES,
  NPC_WORLDS
} from "@/lib/constants";
import { generateImageSafe } from "@/lib/image-generation";
import {
  buildMonsterImagePrompt,
  buildNPCImagePrompt
} from "@/lib/image-generation/prompt-presets";
import { calculateCreditCost } from "@/lib/credits";
import type { Monster, MonsterSettings, NPC, NPCSettings } from "@/lib/types";

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function createRng(seed: string) {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pick<T>(values: readonly T[], rng: () => number) {
  return values[Math.floor(rng() * values.length)];
}

function pickConfigured(value: string, options: string[], rng: () => number) {
  if (value && value !== "すべて" && value !== "その他") {
    return value;
  }
  const candidates = options.filter((item) => item !== "すべて" && item !== "その他");
  return pick(candidates, rng);
}

function createId(prefix: string, index: number) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${index}_${Math.random().toString(36).slice(2)}`;
}

function dangerLabel(value: number) {
  if (value >= 86) return "伝説級";
  if (value >= 68) return "強い";
  if (value >= 42) return "普通";
  if (value >= 20) return "弱い";
  return "無害に近い";
}

function featureTone(value: number) {
  if (value >= 78) return "一目で記憶に残る強い個性";
  if (value >= 48) return "物語に馴染むほどよい個性";
  return "控えめで扱いやすい個性";
}

function randomTone(value: number) {
  if (value >= 75) return "意外性のある設定";
  if (value >= 45) return "王道と変化のバランス";
  return "安定した王道設定";
}

const PERSONALITIES = [
  "冷静沈着だが仲間への情は深い",
  "陽気で人懐っこく、危機ほど口数が増える",
  "慎重で観察眼に優れ、秘密を抱えている",
  "誇り高く、敗北から学ぶことを恐れない",
  "穏やかな語り口の奥に鋭い判断力を隠す",
  "無鉄砲に見えて、弱者を見捨てられない"
];

const HABITATS = [
  "古い森の境界",
  "霧に覆われた山道",
  "地下遺跡の深部",
  "魔力が淀む湿地",
  "廃都の外壁付近",
  "海沿いの洞窟",
  "雪原の裂け目",
  "機械仕掛けの研究区画"
];

const ABILITIES = [
  "突進",
  "魔力吸収",
  "毒霧",
  "火炎放射",
  "氷結",
  "雷撃",
  "再生",
  "擬態",
  "精神干渉",
  "群れの号令"
];

const DROPS = [
  "魔石の欠片",
  "硬い外殻",
  "古びた紋章",
  "薬草の種",
  "銀色の牙",
  "透明な粘液",
  "焦げた角",
  "精霊粉",
  "錆びた鍵",
  "黒曜石の鱗"
];

const MONSTER_NAMES_BY_TYPE: Record<string, string[]> = {
  獣系: [
    "ダークウルフ",
    "コープスドッグ",
    "ブラックバット",
    "サーベルファング",
    "グレイブベア"
  ],
  魔物系: [
    "ゴブリン・シャーマン",
    "フレイムインプ",
    "ヴェノムスライム",
    "ミミック",
    "ブレインフロート"
  ],
  アンデッド: [
    "スケルトン・ウォーリア",
    "リビングアーマー",
    "コープスドッグ",
    "ゴースト",
    "ワイトナイト"
  ],
  悪魔系: [
    "デーモン・ソルジャー",
    "ナイトメア",
    "サキュバス",
    "ヘルガーゴイル",
    "アビスロード"
  ],
  竜系: [
    "バジリスク",
    "サンダードレイク",
    "クリムゾンワイバーン",
    "アイスドラゴン",
    "ストームリザード"
  ],
  機械系: [
    "リビングアーマー",
    "アイアンゴーレム",
    "クロックワークビースト",
    "マナリアクター",
    "ギアスパイダー"
  ],
  精霊系: [
    "アイスゴーレム",
    "サンダーバード",
    "ウィルオウィスプ",
    "ルーンスピリット",
    "クリスタルシェイド"
  ],
  昆虫系: [
    "スコーピオンキング",
    "キラービー",
    "マンティスリーパー",
    "キチンビートル",
    "ヴェノムモス"
  ],
  海洋系: [
    "シーサーペント",
    "アビスクラーケン",
    "コーラルリザード",
    "シェルガーディアン",
    "マロウスライム"
  ],
  植物系: [
    "マンドレイク",
    "トレント",
    "ローズマンイーター",
    "スポアブルーム",
    "ヴァインゴーレム"
  ]
};

function monsterNameForType(monsterType: string, index: number, rng: () => number) {
  const candidates = MONSTER_NAMES_BY_TYPE[monsterType] ?? MONSTER_NAME_POOL;
  const base =
    index <= candidates.length
      ? candidates[index - 1]
      : pick(candidates, rng);

  if (index <= candidates.length) {
    return base;
  }

  return `${base}亜種${Math.floor(rng() * 90 + 10)}`;
}

export { calculateCreditCost };

export async function generateNPCs(settings: NPCSettings): Promise<NPC[]> {
  const now = new Date().toISOString();
  const results: NPC[] = [];

  for (let index = 1; index <= settings.count; index += 1) {
    const rng = createRng(`npc:${index}:${JSON.stringify(settings)}:${now}`);
    const nameBase = pick(NPC_NAME_POOL, rng);
    const name =
      index <= NPC_NAME_POOL.length
        ? NPC_NAME_POOL[index - 1]
        : `${nameBase}${Math.floor(rng() * 90 + 10)}`;
    const race = pickConfigured(settings.race, NPC_RACES, rng);
    const gender = pickConfigured(settings.gender, NPC_GENDERS, rng);
    const role = pickConfigured(settings.role, NPC_ROLES, rng);
    const world = settings.world || pick(NPC_WORLDS, rng);
    const ageGroup = pickConfigured(settings.ageGroup, NPC_AGE_GROUPS, rng);
    const personality = settings.personality || pick(PERSONALITIES, rng);
    const visualFeature = featureTone(settings.featureStrength);
    const randomFeature = randomTone(settings.randomness);
    const hair = settings.hairColor ? `${settings.hairColor}の髪` : "印象的な髪型";
    const outfit = settings.outfit || `${world}に馴染む旅装`;
    const weapon = settings.weapon || (role === "魔法使い" ? "杖" : "実用的な武器");
    const backstory =
      settings.backstory ||
      `${name}はかつて小さな共同体を守る役目を担っていたが、ある事件をきっかけに旅へ出た。今は表向き${role}として暮らしながら、失われた手がかりを追っている。`;
    const speakingStyle =
      settings.speakingStyle ||
      (settings.randomness > 70
        ? "短い比喩を交え、相手の反応を試すように話す。"
        : "落ち着いた敬体で、必要な情報を簡潔に伝える。");
    const imagePrompt = buildNPCImagePrompt({
      name,
      race,
      gender,
      role,
      world,
      ageGroup,
      personality,
      hair,
      outfit,
      weapon,
      visualFeature,
      randomFeature,
      settings
    });
    const image = await generateImageSafe({
      prompt: imagePrompt,
      kind: "npc",
      seed: `${name}-${index}`,
      quality: settings.highQualityImage ? "high" : "standard",
      transparent: false
    });

    results.push({
      id: createId("npc", index),
      index,
      name,
      race,
      gender,
      role,
      ageGroup,
      personality,
      shortDescription: `${personality}な${race}の${role}。${randomFeature}で、すぐに物語へ配置できます。`,
      detailedProfile: `${name}は${world}の空気をまとった${race}の${role}です。${visualFeature}を持ち、${outfit}と${weapon}が立ち絵の印象を決めます。性格は「${personality}」。交渉、導入、同行者、依頼人のどれにも使いやすい人物です。`,
      backstory,
      speakingStyle,
      imagePrompt,
      imageUrl: image.imageUrl,
      isFavorite: false,
      isSelected: false,
      createdAt: now
    });
  }

  return results;
}

export async function generateMonsters(
  settings: MonsterSettings
): Promise<Monster[]> {
  const now = new Date().toISOString();
  const results: Monster[] = [];

  for (let index = 1; index <= settings.count; index += 1) {
    const rng = createRng(`monster:${index}:${JSON.stringify(settings)}:${now}`);
    const monsterType = pickConfigured(settings.monsterType, MONSTER_TYPES, rng);
    const name = monsterNameForType(monsterType, index, rng);
    const size = pickConfigured(settings.size, MONSTER_SIZES, rng);
    const world = settings.world || pick(MONSTER_WORLDS, rng);
    const colorTheme = pickConfigured(settings.colorTheme, COLOR_THEMES, rng);
    const selectedOptions =
      settings.options.length > 0
        ? settings.options
        : Array.from({ length: 2 + Math.floor(rng() * 3) }, () =>
            pick(MONSTER_OPTIONS, rng)
          );
    const abilities = Array.from(
      new Set([
        ...selectedOptions.slice(0, 3),
        pick(ABILITIES, rng),
        pick(ABILITIES, rng)
      ])
    ).slice(0, 5);
    const habitat = pick(HABITATS, rng);
    const danger = dangerLabel(settings.dangerLevel);
    const weakness =
      settings.dangerLevel > 75
        ? "核となる部位を露出させた瞬間だけ、聖属性か冷気が有効。"
        : "光、音、塩、銀製武器など明確な対策を用意しやすい。";
    const dropItems = Array.from(new Set([pick(DROPS, rng), pick(DROPS, rng)]));
    const imagePrompt = buildMonsterImagePrompt({
      name,
      monsterType,
      size,
      world,
      colorTheme,
      danger,
      abilities,
      habitat,
      settings
    });
    const image = await generateImageSafe({
      prompt: imagePrompt,
      kind: "monster",
      seed: `${name}-${index}`,
      quality: settings.highQualityImage ? "high" : "standard",
      transparent: settings.background === "transparent"
    });

    results.push({
      id: createId("monster", index),
      index,
      name,
      monsterType,
      size,
      dangerLevel: danger,
      habitat,
      abilities,
      shortDescription: `${habitat}に現れる${monsterType}。${abilities.slice(0, 2).join("・")}を使う${danger}個体です。`,
      detailedProfile: `${name}は${world}に適した${size}の${monsterType}です。体色は${colorTheme}系で、${abilities.join("、")}を組み合わせて戦います。遭遇時は地形と群れの有無を決めるだけで、すぐに戦闘や探索イベントへ投入できます。`,
      weakness,
      dropItems,
      imagePrompt,
      imageUrl: image.imageUrl,
      isFavorite: false,
      isSelected: false,
      createdAt: now
    });
  }

  return results;
}
