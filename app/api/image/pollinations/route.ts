import { NextRequest, NextResponse } from "next/server";
import {
  buildPollinationsPublicUrl,
  buildPollinationsRemoteUrl,
  pollinationsParamsFromSearch,
  verifyPollinationsSignature
} from "@/lib/image-generation/pollinations-url";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchImageOnce(url: URL) {
  const response = await fetch(url, {
    headers: {
      Accept: "image/*"
    },
    signal: AbortSignal.timeout(45_000),
    next: {
      revalidate: 60 * 60 * 24 * 30
    }
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.startsWith("image/") || !response.body) {
    throw new Error("Image provider did not return an image.");
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=2592000, stale-while-revalidate=604800"
    }
  });
}

async function fetchImageWithRetry(urls: URL[]) {
  let lastError: unknown;

  for (let index = 0; index < urls.length; index += 1) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await fetchImageOnce(urls[index]);
      } catch (error) {
        lastError = error;
        await sleep(900 + attempt * 1400 + index * 700);
      }
    }
  }

  throw lastError;
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
    const urls: URL[] = [];

    if (process.env.POLLINATIONS_API_KEY) {
      urls.push(buildPollinationsRemoteUrl(params));
    }

    urls.push(buildPollinationsPublicUrl(params));

    return await fetchImageWithRetry(urls);
  } catch {
    return NextResponse.json(
      { message: "画像生成APIが混雑しています。自動で再試行します。" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "3"
        }
      }
    );
  }
}
