import type { MonsterSettings, NPCSettings } from "@/lib/types";

type NPCPromptInput = {
  name: string;
  race: string;
  gender: string;
  role: string;
  world: string;
  ageGroup: string;
  personality: string;
  hair: string;
  outfit: string;
  weapon: string;
  visualFeature: string;
  randomFeature: string;
  settings: NPCSettings;
};

type MonsterPromptInput = {
  name: string;
  monsterType: string;
  size: string;
  world: string;
  colorTheme: string;
  danger: string;
  abilities: string[];
  habitat: string;
  settings: MonsterSettings;
};

const NPC_RACE_VISUALS: Record<string, string> = {
  人間:
    "human fantasy adventurer, natural human ears, believable medieval face, grounded heroic design",
  エルフ:
    "elegant elf, long pointed ears, graceful slender face, refined forest nobility, delicate jewelry",
  ドワーフ:
    "stout dwarf, compact powerful build, broad shoulders, strong nose, thick braided beard or heavy braids, metal ornaments",
  獣人:
    "beastfolk humanoid, animal ears, subtle fur texture, sharp eyes, clawed gloves, feline or wolf traits, not a mascot",
  魔族:
    "demonkin humanoid, small curved horns, faint glowing eyes, dark magical aura, ornate black and crimson accents",
  天使:
    "angelic humanoid, small luminous wings, soft halo-like backlight, white and gold sacred ornaments, serene expression",
  その他:
    "mysterious fantasy race, unusual eyes, unique silhouette, rare magical markings, memorable nonhuman details"
};

const NPC_GENDER_VISUALS: Record<string, string> = {
  男性: "male character, masculine facial structure",
  女性: "female character, feminine facial structure",
  その他: "androgynous character, elegant balanced facial structure",
  すべて: "fantasy character"
};

const NPC_ROLE_VISUALS: Record<string, string> = {
  戦士:
    "warrior class, polished plate armor, leather straps, battle-worn pauldrons, sword or axe visible",
  魔法使い:
    "mage class, embroidered robe, staff, spellbook, glowing arcane motifs, layered cloak",
  盗賊:
    "rogue class, hooded leather armor, daggers, stealth belt pouches, agile silhouette",
  僧侶:
    "cleric class, sacred robe and light armor, holy symbol, gentle but resolute expression",
  商人:
    "merchant class, elegant travel coat, ledger pouch, rings, refined practical clothes",
  貴族:
    "noble class, ornate formal coat, embroidery, jeweled brooch, dignified posture",
  旅人:
    "traveler class, weathered cloak, backpack straps, map case, road-worn boots",
  村人:
    "villager class, simple linen clothes, apron or shawl, humble friendly expression",
  学者:
    "scholar class, glasses or monocle, layered academic robe, scrolls and books",
  傭兵:
    "mercenary class, practical armor, cloak, sword at the shoulder, confident guarded expression",
  その他:
    "adventurer class, distinctive fantasy equipment, balanced armor and travel gear"
};

const NPC_WORLD_VISUALS: Record<string, string> = {
  "ファンタジー（中世風）":
    "classic medieval fantasy, warm parchment background, realistic leather and steel, tavern and castle atmosphere",
  ダークファンタジー:
    "dark fantasy, muted smoky palette, gothic armor details, ominous rim light, tragic heroic mood",
  和風ファンタジー:
    "Japanese fantasy, kimono-inspired armor, haori, katana fittings, shrine and yokai motifs",
  近未来ファンタジー:
    "near future fantasy, subtle neon runes, techno-magic accessories, sleek armor plates",
  スチームパンク:
    "steampunk fantasy, brass goggles, gears, leather coat, Victorian fantasy engineering",
  学園ファンタジー:
    "academy fantasy, magical school uniform, cloak, crest badge, youthful scholarly atmosphere"
};

const NPC_AGE_VISUALS: Record<string, string> = {
  若年: "young adult face, energetic expression",
  成人: "adult face, mature confident expression",
  中年: "middle aged face, experienced eyes, subtle age lines",
  老年: "elderly face, wise expression, visible wrinkles, dignified posture",
  すべて: "adult face"
};

const HAIR_COLOR_VISUALS: Record<string, string> = {
  黒: "black hair",
  茶: "brown hair",
  金: "blonde hair",
  銀: "silver hair",
  白: "white hair",
  赤: "red hair",
  青: "blue hair",
  緑: "green hair",
  紫: "purple hair",
  ピンク: "pink hair"
};

const MONSTER_TYPE_VISUALS: Record<string, string> = {
  獣系:
    "beast monster, wolf or lion anatomy, muscular body, fur, fangs, claws, predatory stance",
  魔物系:
    "magical fiend monster, twisted fantasy anatomy, glowing core, unnatural limbs, dark mana",
  アンデッド:
    "undead monster, skeleton or corpse body, cracked bones, torn armor, ghostly blue flames",
  悪魔系:
    "demon monster, horns, bat wings, barbed tail, black red skin, infernal aura",
  竜系:
    "dragon monster, reptilian scales, long neck, horns, wings, talons, powerful tail",
  機械系:
    "mechanical monster, clockwork joints, steel armor plates, glowing reactor core, cables and gears",
  精霊系:
    "elemental spirit monster, translucent magical body, floating particles, natural elemental aura",
  昆虫系:
    "insect monster, chitin armor, compound eyes, mandibles, segmented legs, sharp carapace",
  海洋系:
    "sea monster, fins, wet scales, tentacles or shells, aquatic silhouette, deep ocean colors",
  植物系:
    "plant monster, bark body, vines, thorny limbs, leaf crown, glowing spores",
  その他:
    "unique fantasy monster, strange silhouette, memorable creature design, nonhuman anatomy"
};

const MONSTER_SIZE_VISUALS: Record<string, string> = {
  小型: "small creature, nimble compact body, card scale still detailed",
  中型: "medium sized creature, balanced readable full body",
  大型: "large monster, imposing heavy body, powerful limbs",
  超大型: "colossal boss monster, massive scale, intimidating silhouette",
  すべて: "medium sized creature"
};

const MONSTER_WORLD_VISUALS: Record<string, string> = {
  ダークファンタジー:
    "dark fantasy bestiary art, smoky parchment background, ominous lighting, gritty texture",
  王道ファンタジー:
    "classic heroic fantasy bestiary art, warm parchment background, adventure book style",
  ホラー:
    "horror fantasy monster art, unsettling anatomy, eerie shadows, disturbing but readable design",
  神話風:
    "mythological monster art, ancient divine motifs, legendary creature presence, sacred ruins atmosphere",
  和風妖怪:
    "Japanese yokai monster art, folklore motifs, ink painting influence, shrine and mist atmosphere",
  近未来モンスター:
    "near future monster art, bio-mechanical fantasy, neon magic, cyber-organic details"
};

const COLOR_VISUALS: Record<string, string> = {
  赤: "dominant crimson red color palette",
  青: "dominant deep blue color palette",
  紫: "dominant violet purple color palette",
  緑: "dominant emerald green color palette",
  黄: "dominant gold yellow color palette",
  白: "dominant white and silver color palette",
  黒: "dominant black and charcoal color palette",
  すべて: "balanced fantasy color palette"
};

const MONSTER_OPTION_VISUALS: Record<string, string> = {
  飛行: "built for flight, airborne pose, light body",
  多脚: "many legs, arachnid or insect-like lower body",
  角: "large horns, crown-like horn silhouette",
  翼: "wide wings, visible wing membranes or feathers",
  毒: "poison glands, venomous fangs, toxic green mist",
  炎: "flames, ember glow, scorched body parts",
  氷: "ice crystals, frost armor, cold blue glow",
  雷: "lightning arcs, electric aura, sharp energetic pose",
  触手: "tentacles, writhing appendages, eldritch shape",
  再生: "regenerating flesh, glowing wounds closing",
  透明: "translucent body, ghostly glass-like silhouette",
  巨大: "giant body, boss monster scale",
  群体: "swarm or colony design, multiple smaller forms hinted behind it",
  知性あり: "intelligent gaze, ritual ornaments, strategic posture"
};

function lookup(value: string, dictionary: Record<string, string>, fallback: string) {
  return dictionary[value] ?? fallback;
}

function visualStrength(value: number) {
  if (value >= 80) {
    return "very distinctive silhouette, strong memorable visual motif, exaggerated fantasy details";
  }

  if (value >= 50) {
    return "clear visual identity, moderate fantasy details";
  }

  return "subtle grounded design, restrained fantasy details";
}

function randomnessVisual(value: number) {
  if (value >= 80) {
    return "unexpected design twist, asymmetrical accessories, unique personal motif";
  }

  if (value >= 50) {
    return "one distinctive accessory, balanced original design";
  }

  return "classic archetype design, clean readable character concept";
}

function dangerVisual(value: number) {
  if (value >= 86) {
    return "legendary boss threat, overwhelming aura, intimidating scale and sharp silhouette";
  }

  if (value >= 68) {
    return "dangerous elite monster, aggressive pose, strong combat presence";
  }

  if (value >= 42) {
    return "standard encounter monster, readable combat anatomy";
  }

  return "minor weak monster, simple but still creature-like design";
}

function normalizeCustomText(text?: string) {
  return text?.trim().replace(/\s+/g, " ").slice(0, 160);
}

function hairVisual(text: string) {
  const normalized = normalizeCustomText(text);
  if (!normalized) return "carefully designed hair, visible hairstyle";

  const matched = Object.entries(HAIR_COLOR_VISUALS).find(([keyword]) =>
    normalized.includes(keyword)
  );
  return `${matched?.[1] ?? normalized}, carefully designed visible hairstyle`;
}

export function buildNPCImagePrompt(input: NPCPromptInput) {
  const customStyle = normalizeCustomText(input.settings.imageStyle);
  const customOutfit = normalizeCustomText(input.settings.outfit);
  const customWeapon = normalizeCustomText(input.settings.weapon);
  const customPersonality = normalizeCustomText(input.settings.personality);
  const customBackstory = normalizeCustomText(input.settings.backstory);
  const customNegative = normalizeCustomText(input.settings.negativePrompt);

  return [
    `exact subject: ${input.name}, ${lookup(input.gender, NPC_GENDER_VISUALS, "fantasy character")}, ${lookup(input.ageGroup, NPC_AGE_VISUALS, "adult face")}`,
    `race must be visible: ${lookup(input.race, NPC_RACE_VISUALS, "human fantasy adventurer")}`,
    `class and outfit must be visible: ${lookup(input.role, NPC_ROLE_VISUALS, "fantasy adventurer equipment")}`,
    `world style: ${lookup(input.world, NPC_WORLD_VISUALS, "classic fantasy setting")}`,
    `hair: ${hairVisual(input.hair)}`,
    `clothing: ${customOutfit || input.outfit}`,
    `weapon or prop: ${customWeapon || input.weapon}`,
    `personality shown in expression: ${customPersonality || input.personality}`,
    `visual strength: ${visualStrength(input.settings.featureStrength)}, ${input.visualFeature}`,
    `randomness: ${randomnessVisual(input.settings.randomness)}, ${input.randomFeature}`,
    customBackstory ? `story clue in design: ${customBackstory}` : "",
    customStyle || "high quality anime fantasy character portrait",
    "composition: bust portrait, upper body, centered, face clearly visible, character roster card artwork",
    "rendering: premium Japanese fantasy RPG illustration, painterly, detailed costume, soft cinematic lighting, warm beige parchment background",
    "strict negative: no text, no letters, no logo, no watermark, no flat icon, no simplified avatar, no chibi mascot, no abstract symbol"
      + (customNegative ? `, avoid ${customNegative}` : "")
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildMonsterImagePrompt(input: MonsterPromptInput) {
  const optionVisuals = input.abilities
    .map((ability) => lookup(ability, MONSTER_OPTION_VISUALS, ability))
    .join(", ");
  const customStyle = normalizeCustomText(input.settings.imageStyle);
  const customNegative = normalizeCustomText(input.settings.negativePrompt);
  const background =
    input.settings.background === "transparent"
      ? "isolated full body on clean light background, transparent background if supported"
      : "simple warm parchment bestiary background";

  return [
    `exact subject: ${input.name}`,
    `monster type must be visible: ${lookup(input.monsterType, MONSTER_TYPE_VISUALS, "unique fantasy monster")}`,
    `size and threat: ${lookup(input.size, MONSTER_SIZE_VISUALS, "medium sized creature")}, ${dangerVisual(input.settings.dangerLevel)}, ${input.danger}`,
    `world style: ${lookup(input.world, MONSTER_WORLD_VISUALS, "dark fantasy bestiary art")}`,
    `color theme: ${lookup(input.colorTheme, COLOR_VISUALS, "balanced fantasy color palette")}`,
    `abilities must be visible: ${optionVisuals}`,
    `habitat clue: ${input.habitat}`,
    background,
    customStyle || "high quality Japanese RPG monster concept art",
    "composition: single monster, full body visible, centered, readable silhouette, no human character, bestiary card artwork",
    "rendering: premium fantasy creature design, detailed anatomy, claws, head, skin texture, cinematic lighting, painterly concept art",
    "strict negative: no text, no letters, no logo, no watermark, no flat icon, no simplified mascot, no abstract symbol, no duplicate creatures"
      + (customNegative ? `, avoid ${customNegative}` : "")
  ]
    .filter(Boolean)
    .join(", ");
}
