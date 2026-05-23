"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { GeneratorType } from "@/lib/types";

type GeneratedImageProps = Omit<ImageProps, "alt" | "src"> & {
  alt: string;
  kind: GeneratorType;
  src: string;
};

function fallbackDataUrl(kind: GeneratorType, label: string) {
  const isNpc = kind === "npc";
  const title = isNpc ? "NPC CONCEPT" : "MONSTER CONCEPT";
  const escapedLabel = label.replace(/[<>&"]/g, "").slice(0, 48);
  const accent = isNpc ? "#6d5bd0" : "#7153cf";
  const ink = "#172447";
  const icon = isNpc
    ? `<circle cx="240" cy="178" r="55" fill="${accent}" opacity=".9"/><path d="M150 370c20-88 76-137 90-137s70 49 90 137H150Z" fill="${ink}" opacity=".9"/><path d="M167 130c31-52 113-71 153-20 18 23 23 52 18 80-35-33-84-42-126-25-22 9-37 22-45 37-12-27-12-51 0-72Z" fill="${ink}" opacity=".18"/>`
    : `<path d="M240 88 316 183 286 325H194L164 183 240 88Z" fill="${accent}" opacity=".88"/><path d="M160 194 72 153l50 101-62 77 111-30m149-107 88-41-50 101 62 77-111-30" stroke="${ink}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/><circle cx="214" cy="209" r="12" fill="#fff"/><circle cx="266" cy="209" r="12" fill="#fff"/>`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f6f3ff"/>
          <stop offset=".55" stop-color="#eef4ff"/>
          <stop offset="1" stop-color="#ffffff"/>
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="40%" r="44%">
          <stop offset="0" stop-color="${accent}" stop-opacity=".2"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="960" height="600" fill="url(#bg)"/>
      <circle cx="480" cy="250" r="270" fill="url(#halo)"/>
      <g transform="translate(240 55)">
        ${icon}
      </g>
      <rect x="92" y="448" width="776" height="86" rx="22" fill="#fff" opacity=".86"/>
      <text x="122" y="490" font-family="Inter, Noto Sans JP, sans-serif" font-size="30" font-weight="800" fill="${ink}">${title}</text>
      <text x="122" y="522" font-family="Inter, Noto Sans JP, sans-serif" font-size="18" font-weight="600" fill="${ink}" opacity=".68">${escapedLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function GeneratedImage({
  alt,
  kind,
  src,
  unoptimized = true,
  ...props
}: GeneratedImageProps) {
  const fallback = useMemo(() => fallbackDataUrl(kind, alt), [alt, kind]);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [fallback, src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized={unoptimized}
      onError={() => setCurrentSrc(fallback)}
    />
  );
}
