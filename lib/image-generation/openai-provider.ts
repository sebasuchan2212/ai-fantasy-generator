import OpenAI from "openai";
import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

const OPENAI_GPT_IMAGE_SIZES = new Set([
  "1024x1024",
  "1024x1536",
  "1536x1024"
]);

function openAIImageSize() {
  const configured = process.env.OPENAI_IMAGE_SIZE ?? "1024x1024";
  return OPENAI_GPT_IMAGE_SIZES.has(configured) ? configured : "1024x1024";
}

function buildOpenAIImagePrompt(request: ImageGenerationRequest) {
  const subjectDirection =
    request.kind === "npc"
      ? [
          "Create one premium Japanese fantasy RPG character portrait.",
          "Show a bust or upper-body view with a clear face, expressive eyes, detailed hair, detailed costume, and class-specific equipment.",
          "The result should feel like a polished character roster card for TRPG, novel, and game production."
        ]
      : [
          "Create one premium Japanese fantasy RPG monster bestiary illustration.",
          "Show a single full-body creature with a readable silhouette, detailed head, anatomy, claws, textures, and visible abilities.",
          "The result should feel like polished concept art for TRPG, novel, and game production."
        ];
  const backgroundDirection = request.transparent
    ? "Use an isolated clean composition. If transparency is supported, use a transparent background; otherwise use a simple warm parchment backdrop."
    : "Use a simple warm parchment fantasy backdrop with cinematic lighting and no busy scenery.";

  return [
    ...subjectDirection,
    "Follow every visual setting below exactly. Make race, role/type, age/size, world style, color theme, weapons, outfit, and abilities visibly different in the artwork.",
    request.prompt,
    backgroundDirection,
    "Style: painterly anime fantasy illustration, high-end concept art, rich materials, natural proportions, professional lighting, crisp details.",
    "Do not include any text, captions, letters, UI, borders, logos, watermarks, flat vector icons, placeholder avatars, simplified mascots, or abstract symbols."
  ].join("\n\n");
}

export const openAIImageProvider: ImageGenerationProvider = {
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
      prompt: buildOpenAIImagePrompt(request),
      n: 1,
      size: openAIImageSize(),
      quality: request.quality === "high" ? "high" : "medium",
      background: request.transparent ? "transparent" : "opaque",
      output_format: "png"
    } as never);

    const first = (response as {
      data?: Array<{ b64_json?: string; url?: string }>;
    }).data?.[0];

    if (first?.b64_json) {
      return {
        imageUrl: `data:image/png;base64,${first.b64_json}`,
        provider: "openai"
      };
    }

    if (first?.url) {
      return {
        imageUrl: first.url,
        provider: "openai"
      };
    }

    throw new Error("Image provider did not return an image.");
  }
};
