import { mockImageProvider } from "@/lib/image-generation/mock-provider";
import { openAIImageProvider } from "@/lib/image-generation/openai-provider";
import { pollinationsImageProvider } from "@/lib/image-generation/pollinations-provider";
import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

function productionSafeProviderName(requestedProvider: string) {
  const isDeployedProduction =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (
    requestedProvider === "mock" &&
    isDeployedProduction &&
    process.env.FORCE_MOCK_IMAGES !== "true"
  ) {
    return "pollinations";
  }

  return requestedProvider;
}

function selectImageProvider(request: ImageGenerationRequest): ImageGenerationProvider {
  const requestedProvider = productionSafeProviderName(
    process.env.IMAGE_API_PROVIDER ?? "pollinations"
  );
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const shouldUseOpenAIForPaidImage =
    request.quality === "high" && requestedProvider !== "mock" && hasOpenAIKey;
  const shouldUseOpenAIForStandardImage =
    requestedProvider === "openai" &&
    process.env.OPENAI_STANDARD_IMAGES_ENABLED === "true" &&
    hasOpenAIKey;

  if (shouldUseOpenAIForPaidImage || shouldUseOpenAIForStandardImage) {
    return openAIImageProvider;
  }

  if (requestedProvider === "mock") {
    return mockImageProvider;
  }

  return pollinationsImageProvider;
}

export async function generateImageSafe(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const provider = selectImageProvider(request);

  try {
    return await provider.generateImage(request);
  } catch {
    if (provider !== pollinationsImageProvider && process.env.FORCE_MOCK_IMAGES !== "true") {
      try {
        return await pollinationsImageProvider.generateImage(request);
      } catch {
        return mockImageProvider.generateImage(request);
      }
    }

    return mockImageProvider.generateImage(request);
  }
}
