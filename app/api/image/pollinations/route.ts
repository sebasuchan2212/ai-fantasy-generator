import { NextRequest, NextResponse } from "next/server";
import { mockImageProvider } from "@/lib/image-generation/mock-provider";
import {
  buildPollinationsRemoteUrl,
  pollinationsParamsFromSearch,
  verifyPollinationsSignature
} from "@/lib/image-generation/pollinations-url";

export const runtime = "nodejs";

function dataUriToImageResponse(dataUri: string) {
  const match = dataUri.match(/^data:([^,]+),(.*)$/);

  if (!match) {
    return NextResponse.json(
      { message: "画像フォールバックの生成に失敗しました。" },
      { status: 500 }
    );
  }

  const metadata = match[1] ?? "image/svg+xml;utf8";
  const [contentType = "image/svg+xml", ...metadataParts] = metadata.split(";");
  const isBase64 = metadataParts.includes("base64");
  const payload = match[2] ?? "";
  const body = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}

export async function GET(request: NextRequest) {
  const params = pollinationsParamsFromSearch(request.nextUrl.searchParams);
  const signature = request.nextUrl.searchParams.get("sig") ?? "";

  if (!params || !verifyPollinationsSignature(params, signature)) {
    return NextResponse.json(
      { message: "画像URLの署名が正しくありません。" },
      { status: 403 }
    );
  }

  try {
    const remoteUrl = buildPollinationsRemoteUrl(params);
    const response = await fetch(remoteUrl, {
      headers: {
        Accept: "image/*"
      },
      next: {
        revalidate: 60 * 60 * 24 * 30
      }
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.startsWith("image/") || !response.body) {
      throw new Error("Pollinations did not return an image.");
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=604800"
      }
    });
  } catch {
    const fallback = await mockImageProvider.generateImage({
      prompt: params.prompt,
      kind: params.kind,
      seed: params.seed,
      quality: Number(params.width) >= 1280 ? "high" : "standard",
      transparent: params.transparent === "true"
    });

    return dataUriToImageResponse(fallback.imageUrl);
  }
}
