import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";
import {
  buildPollinationsProxyUrl,
  buildPollinationsPublicUrl,
  type PollinationsImageProxyParams
} from "@/lib/image-generation/pollinations-url";

function stableSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function compactPrompt(value: string, maxLength = 1350) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function negativePrompt(kind: ImageGenerationRequest["kind"]) {
  const shared =
    "flat vector, simple icon, simplified avatar, mascot, emoji, clipart, childish cartoon, abstract symbol, UI, text, letters, logo, watermark, blurry, low quality, low detail";

  return kind === "npc"
    ? `${shared}, chibi, stick figure, featureless face, duplicate face, cropped head`
    : `${shared}, toy, plush, human character, duplicate creature, cropped body`;
}

function buildProductionPrompt(request: ImageGenerationRequest) {
  const format =
    request.kind === "npc"
      ? [
          "premium Japanese fantasy RPG character card illustration",
          "bust portrait, upper body visible, detailed face, detailed hair, detailed costume",
          "warm parchment background, painterly anime concept art, cinematic lighting"
        ]
      : [
          "premium Japanese fantasy RPG monster bestiary illustration",
          "single full body creature, detailed anatomy, detailed head, claws, texture, readable silhouette",
          "warm parchment background, painterly concept art, cinematic lighting"
        ];

  const quality =
    request.quality === "high"
      ? "masterpiece quality, ultra detailed, intricate rendering, high resolution"
      : "high quality, detailed, clean rendering";

  const background = request.transparent
    ? "isolated subject, transparent background if supported, no scene clutter"
    : "simple light fantasy background, readable thumbnail composition";

  return [
    "STRICTLY FOLLOW THESE VISUAL SETTINGS",
    compactPrompt(request.prompt),
    ...format,
    quality,
    background,
    "not a flat icon, not a vector avatar, not a simple placeholder"
  ].join(", ");
}

export const pollinationsImageProvider: ImageGenerationProvider = {
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    const model = process.env.POLLINATIONS_IMAGE_MODEL ?? "flux";
    const prompt = buildProductionPrompt(request);
    const params: PollinationsImageProxyParams = {
      kind: request.kind,
      prompt,
      model,
      width: request.quality === "high" ? "1280" : "1024",
      height: request.quality === "high" ? "960" : "768",
      seed: stableSeed(`${request.seed ?? ""}:${request.prompt}`),
      enhance: "false",
      nologo: "true",
      safe: "false",
      negative: negativePrompt(request.kind),
      referrer: process.env.POLLINATIONS_REFERRER ?? "ai-fantasy-generator",
      ...(request.transparent ? { transparent: "true" as const } : {})
    };
    const useSignedProxy = process.env.POLLINATIONS_DIRECT_PUBLIC !== "true";

    return {
      imageUrl: useSignedProxy
        ? buildPollinationsProxyUrl(params)
        : buildPollinationsPublicUrl(params).toString(),
      provider: "pollinations"
    };
  }
};
