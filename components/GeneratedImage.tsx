"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createLocalFallbackImage } from "@/lib/image-generation/local-fallback";
import type { GeneratorType } from "@/lib/types";

type GeneratedImageProps = Omit<ImageProps, "alt" | "src"> & {
  alt: string;
  kind: GeneratorType;
  src: string;
};

const MAX_RETRY_COUNT = 5;
const MAX_ACTIVE_REMOTE_IMAGES = 3;
const LOADING_PLACEHOLDER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='720' viewBox='0 0 960 720'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23f4efe7'/%3E%3Cstop offset='.5' stop-color='%23ede7f8'/%3E%3Cstop offset='1' stop-color='%23f8f5ef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='960' height='720' fill='url(%23g)'/%3E%3Ccircle cx='480' cy='330' r='160' fill='%23ffffff' opacity='.35'/%3E%3C/svg%3E";

let activeRemoteImages = 0;
const remoteImageQueue: Array<() => void> = [];

function pumpRemoteImageQueue() {
  while (
    activeRemoteImages < MAX_ACTIVE_REMOTE_IMAGES &&
    remoteImageQueue.length > 0
  ) {
    const next = remoteImageQueue.shift();
    next?.();
  }
}

function acquireRemoteImageSlot(onReady: () => void) {
  let acquired = false;
  let cancelled = false;

  const start = () => {
    if (cancelled) return;
    acquired = true;
    activeRemoteImages += 1;
    onReady();
  };

  if (activeRemoteImages < MAX_ACTIVE_REMOTE_IMAGES) {
    start();
  } else {
    remoteImageQueue.push(start);
  }

  return () => {
    if (cancelled) return;
    cancelled = true;

    if (!acquired) {
      const index = remoteImageQueue.indexOf(start);
      if (index >= 0) {
        remoteImageQueue.splice(index, 1);
      }
      return;
    }

    activeRemoteImages = Math.max(0, activeRemoteImages - 1);
    pumpRemoteImageQueue();
  };
}

function retryableSource(src: string, attempt: number) {
  if (!src || src.startsWith("data:") || attempt === 0) {
    return src;
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}retry=${attempt}`;
}

export function GeneratedImage({
  alt,
  kind,
  src,
  unoptimized = true,
  onError,
  onLoad,
  ...props
}: GeneratedImageProps) {
  const fallback = useMemo(
    () => createLocalFallbackImage({ kind, label: alt }),
    [alt, kind]
  );
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseSlot = useRef<null | (() => void)>(null);
  const [attempt, setAttempt] = useState(0);
  const [canLoadRemoteImage, setCanLoadRemoteImage] = useState(
    !src || src.startsWith("data:")
  );
  const [useFallback, setUseFallback] = useState(false);
  const currentSrc = useFallback
    ? fallback
    : canLoadRemoteImage
      ? retryableSource(src || fallback, attempt)
      : LOADING_PLACEHOLDER;

  useEffect(() => {
    setAttempt(0);
    setUseFallback(false);
    setCanLoadRemoteImage(!src || src.startsWith("data:"));

    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }

    releaseSlot.current?.();
    releaseSlot.current = null;

    if (src && !src.startsWith("data:")) {
      releaseSlot.current = acquireRemoteImageSlot(() => {
        setCanLoadRemoteImage(true);
      });
    }
  }, [src]);

  useEffect(
    () => () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
      releaseSlot.current?.();
    },
    []
  );

  const releaseCurrentSlot = () => {
    releaseSlot.current?.();
    releaseSlot.current = null;
  };

  const handleImageLoad: NonNullable<ImageProps["onLoad"]> = (event) => {
    if (canLoadRemoteImage && !currentSrc.startsWith("data:")) {
      releaseCurrentSlot();
    }

    onLoad?.(event);
  };

  const handleImageError: NonNullable<ImageProps["onError"]> = (event) => {
    onError?.(event);

    if (!src || src.startsWith("data:") || attempt >= MAX_RETRY_COUNT) {
      releaseCurrentSlot();
      setUseFallback(true);
      return;
    }

    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
    }

    retryTimer.current = setTimeout(
      () => setAttempt((current) => current + 1),
      1200 + attempt * 1100
    );
  };

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized={unoptimized}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
