import { mockImageProvider } from "@/lib/image-generation/mock-provider";
import { openAIImageProvider } from "@/lib/image-generation/openai-provider";
import { pollinationsImageProvider } from "@/lib/image-generation/pollinations-provider";
import type {
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

export async function generateImageSafe(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const providerName = process.env.IMAGE_API_PROVIDER ?? "pollinations";
  const provider =
    providerName === "openai" && process.env.OPENAI_API_KEY
      ? openAIImageProvider
      : providerName === "mock"
        ? mockImageProvider
        : pollinationsImageProvider;

  try {
    return await provider.generateImage(request);
  } catch {
    return mockImageProvider.generateImage(request);
  }
}
