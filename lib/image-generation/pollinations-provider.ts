import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";
import { buildPollinationsProxyUrl } from "@/lib/image-generation/pollinations-url";

function stableSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function buildProductionPrompt(request: ImageGenerationRequest) {
  const base =
    request.kind === "npc"
      ? [
          "premium fantasy NPC character portrait",
          "single character",
          "waist-up composition",
          "highly detailed face",
          "expressive eyes",
          "professional anime fantasy illustration",
          "clean concept art for TRPG and game production",
          "soft cinematic lighting",
          "detailed costume and accessories",
          "sharp focus",
          "polished card artwork"
        ]
      : [
          "premium fantasy monster concept art",
          "single creature",
          "full body creature design",
          "highly detailed anatomy",
          "professional game bestiary illustration",
          "dynamic silhouette",
          "clean readable shape language",
          "dramatic but bright studio lighting",
          "sharp focus",
          "polished card artwork"
        ];

  const quality =
    request.quality === "high"
      ? [
          "masterpiece quality",
          "ultra detailed",
          "intricate rendering",
          "high resolution",
          "rich materials"
        ]
      : ["high quality", "detailed", "clean rendering"];

  const background = request.transparent
    ? "isolated subject, transparent background if supported, no scene clutter"
    : "simple light fantasy background, readable thumbnail composition";

  return [
    ...base,
    ...quality,
    background,
    `source description: ${request.prompt}`,
    "avoid text, captions, logo, watermark, low resolution, blurry, extra limbs, distorted face, cropped head, messy background, duplicate character"
  ].join(", ");
}

export const pollinationsImageProvider: ImageGenerationProvider = {
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    const model = process.env.POLLINATIONS_IMAGE_MODEL ?? "flux";
    const prompt = buildProductionPrompt(request);

    return {
      imageUrl: buildPollinationsProxyUrl({
        kind: request.kind,
        prompt,
        model,
        width: request.quality === "high" ? "1280" : "1024",
        height: request.quality === "high" ? "800" : "640",
        seed: stableSeed(`${request.seed ?? ""}:${request.prompt}`),
        enhance: "true",
        nologo: "true",
        safe: "true",
        referrer: process.env.POLLINATIONS_REFERRER ?? "ai-fantasy-generator",
        ...(request.transparent ? { transparent: "true" as const } : {})
      }),
      provider: "pollinations"
    };
  }
};
