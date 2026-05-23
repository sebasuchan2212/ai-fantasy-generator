"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createLocalFallbackImage } from "@/lib/image-generation/local-fallback";
import type { GeneratorType } from "@/lib/types";

type GeneratedImageProps = Omit<ImageProps, "alt" | "src"> & {
  alt: string;
  kind: GeneratorType;
  src: string;
};

export function GeneratedImage({
  alt,
  kind,
  src,
  unoptimized = true,
  ...props
}: GeneratedImageProps) {
  const fallback = useMemo(
    () => createLocalFallbackImage({ kind, label: alt }),
    [alt, kind]
  );
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
