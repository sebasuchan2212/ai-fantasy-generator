import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";
import { createLocalFallbackImage } from "@/lib/image-generation/local-fallback";

export const mockImageProvider: ImageGenerationProvider = {
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    return {
      imageUrl: createLocalFallbackImage({
        kind: request.kind,
        label: request.prompt,
        seed: request.seed
      }),
      provider: "mock"
    };
  }
};
