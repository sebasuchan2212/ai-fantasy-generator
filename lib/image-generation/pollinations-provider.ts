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

function buildProductionPrompt(request: ImageGenerationRequest) {
  const base =
    request.kind === "npc"
      ? [
          "one original fantasy NPC character portrait",
          "Japanese anime RPG key visual style",
          "bust portrait, upper body visible, centered composition",
          "clear attractive face, expressive eyes, detailed hair",
          "detailed armor, cloak, robe, jewelry, weapons or accessories",
          "premium game character card illustration",
          "painterly fantasy concept art",
          "warm parchment background like a character roster",
          "soft cinematic lighting, sharp focus, clean silhouette",
          "looks like a polished TRPG or JRPG character asset"
        ]
      : [
          "one original fantasy monster concept art",
          "Japanese RPG bestiary illustration style",
          "full body creature visible, centered composition",
          "clear anatomy, unique silhouette, detailed head and claws",
          "scales, fur, horns, wings, armor plates, magical effects where appropriate",
          "premium game monster card illustration",
          "painterly fantasy concept art",
          "warm parchment or light studio background",
          "dramatic cinematic lighting, sharp focus, clean readable shape",
          "looks like a polished TRPG or JRPG monster asset"
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
    "no text, no captions, no logo, no watermark, no UI, no simple icon, no flat vector, no placeholder, no abstract symbol, no low resolution, no blur, no distorted face, no extra limbs, no cropped head, no duplicate character"
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
      enhance: "true",
      nologo: "true",
      safe: "true",
      referrer: process.env.POLLINATIONS_REFERRER ?? "ai-fantasy-generator",
      ...(request.transparent ? { transparent: "true" as const } : {})
    };
    const useSignedProxy =
      Boolean(process.env.POLLINATIONS_API_KEY) ||
      process.env.POLLINATIONS_FORCE_PROXY === "true";

    return {
      imageUrl: useSignedProxy
        ? buildPollinationsProxyUrl(params)
        : buildPollinationsPublicUrl(params).toString(),
      provider: "pollinations"
    };
  }
};
