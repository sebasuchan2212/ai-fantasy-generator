export type ImageGenerationRequest = {
  prompt: string;
  kind: "npc" | "monster";
  seed?: string;
  quality?: "standard" | "high";
};

export type ImageGenerationResult = {
  imageUrl: string;
  provider: "mock" | "openai";
};

export type ImageGenerationProvider = {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
};
