import { createHmac, timingSafeEqual } from "node:crypto";

export type PollinationsImageProxyParams = {
  kind: "npc" | "monster";
  prompt: string;
  model: string;
  width: string;
  height: string;
  seed: string;
  enhance: "true" | "false";
  nologo: "true" | "false";
  safe: "true" | "false";
  referrer: string;
  transparent?: "true";
};

const SIGNED_KEYS: Array<keyof PollinationsImageProxyParams> = [
  "kind",
  "prompt",
  "model",
  "width",
  "height",
  "seed",
  "enhance",
  "nologo",
  "safe",
  "referrer",
  "transparent"
];

function signingSecret() {
  return (
    process.env.POLLINATIONS_PROXY_SECRET ??
    process.env.POLLINATIONS_API_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.STRIPE_SECRET_KEY ??
    "ai-fantasy-generator-demo-signing-key"
  );
}

function canonicalPayload(params: PollinationsImageProxyParams) {
  return SIGNED_KEYS.map((key) => `${key}=${params[key] ?? ""}`).join("&");
}

export function createPollinationsSignature(params: PollinationsImageProxyParams) {
  return createHmac("sha256", signingSecret())
    .update(canonicalPayload(params))
    .digest("hex");
}

export function verifyPollinationsSignature(
  params: PollinationsImageProxyParams,
  signature: string
) {
  const expected = createPollinationsSignature(params);
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function buildPollinationsProxyUrl(params: PollinationsImageProxyParams) {
  const searchParams = new URLSearchParams();

  SIGNED_KEYS.forEach((key) => {
    const value = params[key];
    if (value) {
      searchParams.set(key, value);
    }
  });

  searchParams.set("sig", createPollinationsSignature(params));
  return `/api/image/pollinations?${searchParams.toString()}`;
}

export function buildPollinationsRemoteUrl(params: PollinationsImageProxyParams) {
  const baseUrl =
    process.env.POLLINATIONS_BASE_URL?.replace(/\/$/, "") ??
    "https://gen.pollinations.ai";
  const url = new URL(`${baseUrl}/image/${encodeURIComponent(params.prompt)}`);

  url.searchParams.set("model", params.model);
  url.searchParams.set("width", params.width);
  url.searchParams.set("height", params.height);
  url.searchParams.set("seed", params.seed);
  url.searchParams.set("enhance", params.enhance);
  url.searchParams.set("nologo", params.nologo);
  url.searchParams.set("safe", params.safe);
  url.searchParams.set("referrer", params.referrer);

  if (params.transparent) {
    url.searchParams.set("transparent", params.transparent);
  }

  if (process.env.POLLINATIONS_API_KEY) {
    url.searchParams.set("key", process.env.POLLINATIONS_API_KEY);
    url.searchParams.set("private", "true");
  }

  return url;
}

export function pollinationsParamsFromSearch(
  searchParams: URLSearchParams
): PollinationsImageProxyParams | null {
  const kind = searchParams.get("kind");
  const prompt = searchParams.get("prompt");
  const model = searchParams.get("model");
  const width = searchParams.get("width");
  const height = searchParams.get("height");
  const seed = searchParams.get("seed");
  const enhance = searchParams.get("enhance");
  const nologo = searchParams.get("nologo");
  const safe = searchParams.get("safe");
  const referrer = searchParams.get("referrer");
  const transparent = searchParams.get("transparent");

  const widthNumber = Number(width);
  const heightNumber = Number(height);

  if (
    (kind !== "npc" && kind !== "monster") ||
    !prompt ||
    prompt.length > 2400 ||
    !model ||
    !width ||
    !height ||
    !Number.isInteger(widthNumber) ||
    !Number.isInteger(heightNumber) ||
    widthNumber < 512 ||
    widthNumber > 1536 ||
    heightNumber < 512 ||
    heightNumber > 1536 ||
    !seed ||
    (enhance !== "true" && enhance !== "false") ||
    (nologo !== "true" && nologo !== "false") ||
    (safe !== "true" && safe !== "false") ||
    !referrer ||
    (transparent !== null && transparent !== "true")
  ) {
    return null;
  }

  return {
    kind,
    prompt,
    model,
    width,
    height,
    seed,
    enhance,
    nologo,
    safe,
    referrer,
    ...(transparent === "true" ? { transparent: "true" as const } : {})
  };
}
