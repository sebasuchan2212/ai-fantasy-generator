export const BASE_GENERATION_CREDIT_COST = 1;
export const OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST = 20;

export function calculateCreditCost(count: number, highQualityImage: boolean) {
  const perItemCost =
    BASE_GENERATION_CREDIT_COST +
    (highQualityImage ? OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST : 0);

  return count * perItemCost;
}

export function calculateActualCreditCost(input: {
  count: number;
  highQualityImage: boolean;
  openAIImageCount: number;
}) {
  const baseCost = input.count * BASE_GENERATION_CREDIT_COST;
  const openAIImageCost = input.highQualityImage
    ? input.openAIImageCount * OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST
    : 0;

  return baseCost + openAIImageCost;
}

export function calculateActualCreditCostForItems(
  items: Array<{ imageProvider?: string }>,
  highQualityImage: boolean
) {
  return calculateActualCreditCost({
    count: items.length,
    highQualityImage,
    openAIImageCount: items.filter((item) => item.imageProvider === "openai").length
  });
}
