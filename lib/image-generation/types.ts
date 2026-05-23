export type ImageGenerationRequest = {
  prompt: string;
  kind: "npc" | "monster";
  seed?: string;
  quality?: "standard" | "high";
  transparent?: boolean;
};

export type ImageGenerationResult = {
  imageUrl: string;
  provider: "mock" | "openai" | "pollinations";
};

export type ImageGenerationProvider = {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
};
