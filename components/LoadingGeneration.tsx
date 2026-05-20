"use client";

import { useEffect, useState } from "react";
import { WandSparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LOADING_MESSAGES } from "@/lib/constants";

export function LoadingGeneration({ count = 12 }: { count?: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <WandSparkles />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold">{LOADING_MESSAGES[step]}</p>
          <p className="text-xs text-muted-foreground">
            生成結果をカードに整えています。画面はそのままお待ちください。
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: Math.min(count, 15) }, (_, index) => (
          <div key={index} className="rounded-lg border bg-card p-3 shadow-sm">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
