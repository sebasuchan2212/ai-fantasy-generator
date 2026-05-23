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
  const requestedProvider = process.env.IMAGE_API_PROVIDER ?? "pollinations";
  const isDeployedProduction =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const providerName =
    requestedProvider === "mock" &&
    isDeployedProduction &&
    process.env.FORCE_MOCK_IMAGES !== "true"
      ? "pollinations"
      : requestedProvider;
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
