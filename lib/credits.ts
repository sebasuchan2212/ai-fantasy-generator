export function calculateCreditCost(count: number, highQualityImage: boolean) {
  return count * (highQualityImage ? 3 : 1);
}
