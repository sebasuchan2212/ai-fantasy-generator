export type GeneratorType = "npc" | "monster";
export type ViewMode = "grid" | "list";
export type ExportFormat = "json" | "csv" | "markdown";

export type NPC = {
  id: string;
  index: number;
  name: string;
  race: string;
  gender: string;
  role: string;
  ageGroup: string;
  personality: string;
  shortDescription: string;
  detailedProfile: string;
  backstory: string;
  speakingStyle: string;
  imagePrompt: string;
  imageUrl: string;
  imageProvider?: "mock" | "openai" | "pollinations";
  isFavorite: boolean;
  isSelected: boolean;
  createdAt: string;
};

export type Monster = {
  id: string;
  index: number;
  name: string;
  monsterType: string;
  size: string;
  dangerLevel: string;
  habitat: string;
  abilities: string[];
  shortDescription: string;
  detailedProfile: string;
  weakness: string;
  dropItems: string[];
  imagePrompt: string;
  imageUrl: string;
  imageProvider?: "mock" | "openai" | "pollinations";
  isFavorite: boolean;
  isSelected: boolean;
  createdAt: string;
};

export type GenerationItem = NPC | Monster;

export type NPCSettings = {
  count: number;
  race: string;
  gender: string;
  role: string;
  world: string;
  ageGroup: string;
  featureStrength: number;
  randomness: number;
  hairColor?: string;
  outfit?: string;
  weapon?: string;
  personality?: string;
  backstory?: string;
  speakingStyle?: string;
  negativePrompt?: string;
  imageStyle?: string;
  highQualityImage: boolean;
};

export type MonsterSettings = {
  count: number;
  monsterType: string;
  size: string;
  dangerLevel: number;
  world: string;
  colorTheme: string;
  options: string[];
  background: "transparent" | "simple";
  imageStyle?: string;
  negativePrompt?: string;
  highQualityImage: boolean;
};

export type GenerationRecord = {
  id: string;
  type: GeneratorType;
  title: string;
  settings: NPCSettings | MonsterSettings;
  results: GenerationItem[];
  createdAt: string;
};

export type SavedSet = {
  id: string;
  name: string;
  type: GeneratorType;
  items: GenerationItem[];
  createdAt: string;
};

export type PricingPlan = {
  id: "starter" | "creator" | "pro";
  name: string;
  credits: number;
  priceJpy: number;
  description: string;
  highlighted?: boolean;
};

export type GenerateResponse<T extends GenerationItem> = {
  results: T[];
  creditsUsed: number;
  remainingCredits?: number;
  generationId?: string;
  demoMode: boolean;
};
