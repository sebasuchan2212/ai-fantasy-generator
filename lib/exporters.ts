import type { ExportFormat, GenerationItem, GeneratorType, Monster, NPC } from "@/lib/types";

function isNPC(item: GenerationItem): item is NPC {
  return "race" in item;
}

function escapeCsv(value: unknown) {
  const raw = Array.isArray(value)
    ? value.join(" / ")
    : typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function itemToFlatRecord(type: GeneratorType, item: GenerationItem) {
  if (type === "npc" && isNPC(item)) {
    return {
      index: item.index,
      name: item.name,
      race: item.race,
      gender: item.gender,
      role: item.role,
      ageGroup: item.ageGroup,
      personality: item.personality,
      shortDescription: item.shortDescription,
      detailedProfile: item.detailedProfile,
      backstory: item.backstory,
      speakingStyle: item.speakingStyle,
      imagePrompt: item.imagePrompt,
      imageUrl: item.imageUrl
    };
  }

  const monster = item as Monster;
  return {
    index: monster.index,
    name: monster.name,
    monsterType: monster.monsterType,
    size: monster.size,
    dangerLevel: monster.dangerLevel,
    habitat: monster.habitat,
    abilities: monster.abilities,
    shortDescription: monster.shortDescription,
    detailedProfile: monster.detailedProfile,
    weakness: monster.weakness,
    dropItems: monster.dropItems,
    imagePrompt: monster.imagePrompt,
    imageUrl: monster.imageUrl
  };
}

function toCsv(type: GeneratorType, items: GenerationItem[]) {
  const rows = items.map((item) => itemToFlatRecord(type, item));
  const headers = Object.keys(rows[0] ?? {});
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(",")
    )
  ].join("\n");
}

function npcToMarkdown(item: NPC) {
  return `# ${item.name}

種族：${item.race}
性別：${item.gender}
役割：${item.role}
年代：${item.ageGroup}

説明：${item.shortDescription}

## 詳細設定
${item.detailedProfile}

## 背景
${item.backstory}

## 口調
${item.speakingStyle}

## 画像プロンプト
${item.imagePrompt}
`;
}

function monsterToMarkdown(item: Monster) {
  return `# ${item.name}

タイプ：${item.monsterType}
サイズ：${item.size}
危険度：${item.dangerLevel}
生息地：${item.habitat}

説明：${item.shortDescription}

## 詳細設定
${item.detailedProfile}

## 能力
${item.abilities.map((ability) => `- ${ability}`).join("\n")}

## 弱点
${item.weakness}

## ドロップ
${item.dropItems.map((itemName) => `- ${itemName}`).join("\n")}

## 画像プロンプト
${item.imagePrompt}
`;
}

function toMarkdown(type: GeneratorType, items: GenerationItem[]) {
  return items
    .map((item) =>
      type === "npc" && isNPC(item)
        ? npcToMarkdown(item)
        : monsterToMarkdown(item as Monster)
    )
    .join("\n---\n\n");
}

export function exportItems(
  type: GeneratorType,
  items: GenerationItem[],
  format: ExportFormat
) {
  if (format === "json") {
    return {
      content: JSON.stringify(items.map((item) => itemToFlatRecord(type, item)), null, 2),
      contentType: "application/json; charset=utf-8",
      extension: "json"
    };
  }

  if (format === "csv") {
    return {
      content: toCsv(type, items),
      contentType: "text/csv; charset=utf-8",
      extension: "csv"
    };
  }

  return {
    content: toMarkdown(type, items),
    contentType: "text/markdown; charset=utf-8",
    extension: "md"
  };
}
