import { mockImageProvider } from "@/lib/image-generation/mock-provider";
import { openAIImageProvider } from "@/lib/image-generation/openai-provider";
import type {
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

export async function generateImageSafe(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const provider =
    process.env.IMAGE_API_PROVIDER === "openai" && process.env.OPENAI_API_KEY
      ? openAIImageProvider
      : mockImageProvider;

  try {
    return await provider.generateImage(request);
  } catch {
    return mockImageProvider.generateImage(request);
  }
}
