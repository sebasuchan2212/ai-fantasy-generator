import type {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResult
} from "@/lib/image-generation/types";

const PALETTES = [
  ["#f5f3ff", "#6d5bd0", "#26345d"],
  ["#eef6ff", "#4f7fd8", "#172447"],
  ["#f3fbf7", "#47a875", "#163a35"],
  ["#fff7ed", "#d77b3f", "#38251b"],
  ["#fdf2f8", "#c75a9b", "#342047"]
];

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function svgPlaceholder(request: ImageGenerationRequest) {
  const hash = stableHash(`${request.kind}:${request.seed}:${request.prompt}`);
  const palette = PALETTES[hash % PALETTES.length];
  const title = request.kind === "npc" ? "NPC" : "MONSTER";
  const icon =
    request.kind === "npc"
      ? `<path d="M320 210c42 0 76 34 76 76s-34 76-76 76-76-34-76-76 34-76 76-76Z" fill="${palette[1]}" opacity=".88"/><path d="M205 482c21-76 72-116 115-116s94 40 115 116H205Z" fill="${palette[2]}" opacity=".88"/><path d="M245 183c38-51 113-66 160-21 21 21 30 45 31 71-39-40-98-47-145-23-22 11-37 26-46 43-9-25-9-49 0-70Z" fill="${palette[2]}" opacity=".22"/>`
      : `<path d="M320 190 396 274 368 406H272L244 274 320 190Z" fill="${palette[1]}" opacity=".86"/><path d="M238 282 142 245l54 101-72 82 120-23m158-123 96-37-54 101 72 82-120-23" stroke="${palette[2]}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/><circle cx="292" cy="304" r="12" fill="#fff"/><circle cx="348" cy="304" r="12" fill="#fff"/>`;
  const prompt = request.prompt
    .replace(/[<>&"]/g, "")
    .slice(0, 84)
    .trim();

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${palette[0]}"/>
        <stop offset="1" stop-color="#ffffff"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="42%" r="42%">
        <stop offset="0" stop-color="${palette[1]}" stop-opacity=".18"/>
        <stop offset="1" stop-color="${palette[1]}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="960" height="600" fill="url(#bg)"/>
    <circle cx="480" cy="250" r="260" fill="url(#halo)"/>
    <g transform="translate(160 40) scale(1.0)">
      ${icon}
    </g>
    <rect x="80" y="456" width="800" height="88" rx="24" fill="#fff" opacity=".82"/>
    <text x="110" y="498" font-family="Inter, Noto Sans JP, sans-serif" font-size="30" font-weight="800" fill="${palette[2]}">${title} CONCEPT</text>
    <text x="110" y="527" font-family="Inter, Noto Sans JP, sans-serif" font-size="18" fill="${palette[2]}" opacity=".72">${prompt}</text>
  </svg>`;
}

export const mockImageProvider: ImageGenerationProvider = {
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    const svg = svgPlaceholder(request);
    return {
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      provider: "mock"
    };
  }
};
