import OpenAI from "openai";
import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

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
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt: request.prompt,
      size: "1024x1024",
      quality: request.quality === "high" ? "high" : "medium"
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
