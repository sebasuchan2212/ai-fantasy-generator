import type { PricingPlan } from "@/lib/types";

export const FREE_CREDITS = 20;

export const NPC_COUNT_DEFAULT = 20;
export const MONSTER_COUNT_DEFAULT = 30;
export const MAX_GENERATION_COUNT = 100;

export const NPC_RACES = [
  "すべて",
  "人間",
  "エルフ",
  "ドワーフ",
  "獣人",
  "魔族",
  "天使",
  "その他"
];

export const NPC_GENDERS = ["すべて", "男性", "女性", "その他"];

export const NPC_ROLES = [
  "戦士",
  "魔法使い",
  "盗賊",
  "僧侶",
  "商人",
  "貴族",
  "旅人",
  "村人",
  "学者",
  "傭兵",
  "その他"
];

export const NPC_WORLDS = [
  "ファンタジー（中世風）",
  "ダークファンタジー",
  "和風ファンタジー",
  "近未来ファンタジー",
  "スチームパンク",
  "学園ファンタジー"
];

export const NPC_AGE_GROUPS = ["すべて", "若年", "成人", "中年", "老年"];

export const MONSTER_TYPES = [
  "すべて",
  "獣系",
  "魔物系",
  "アンデッド",
  "悪魔系",
  "竜系",
  "機械系",
  "精霊系",
  "昆虫系",
  "海洋系",
  "植物系"
];

export const MONSTER_SIZES = ["すべて", "小型", "中型", "大型", "超大型"];

export const MONSTER_WORLDS = [
  "ダークファンタジー",
  "王道ファンタジー",
  "ホラー",
  "神話風",
  "和風妖怪",
  "近未来モンスター"
];

export const COLOR_THEMES = [
  "すべて",
  "赤",
  "青",
  "紫",
  "緑",
  "黄",
  "白",
  "黒"
];

export const MONSTER_OPTIONS = [
  "飛行",
  "多脚",
  "角",
  "翼",
  "毒",
  "炎",
  "氷",
  "雷",
  "触手",
  "再生",
  "透明",
  "巨大",
  "群体",
  "知性あり"
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    priceJpy: 500,
    description: "短編や単発セッション用に少しだけ追加。"
  },
  {
    id: "creator",
    name: "Creator",
    credits: 500,
    priceJpy: 1980,
    description: "TRPG・小説・ゲーム制作を継続する人向け。",
    highlighted: true
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1500,
    priceJpy: 4980,
    description: "世界観資料や大量の敵データをまとめて作る制作向け。"
  }
];

export const LOADING_MESSAGES = [
  "設定を解析しています",
  "名前を生成しています",
  "外見を設計しています",
  "画像を生成しています",
  "カードを整理しています"
];

export const NPC_NAME_POOL = [
  "レオン",
  "リリア",
  "グラム",
  "セイン",
  "ミラ",
  "ガロウ",
  "エマ",
  "カイン",
  "トマス",
  "アイラ",
  "アルヴィン",
  "セレス",
  "バルド",
  "ユリナ",
  "ヴォルク",
  "ニコ",
  "エルドレッド",
  "ベアトリス",
  "オルド",
  "フィオ"
];

export const MONSTER_NAME_POOL = [
  "スケルトン・ウォーリア",
  "ゴブリン・シャーマン",
  "フレイムインプ",
  "アイスゴーレム",
  "ダークウルフ",
  "ヴェノムスライム",
  "リビングアーマー",
  "バジリスク",
  "ナイトメア",
  "マンドレイク",
  "サンダーバード",
  "ストーンゴーレム",
  "コープスドッグ",
  "ミミック",
  "デーモン・ソルジャー",
  "ブレインフロート",
  "スコーピオンキング",
  "ゴースト",
  "トレント",
  "ブラックバット"
];
