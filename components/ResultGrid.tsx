"use client";

import { ResultCard } from "@/components/ResultCard";
import type { GenerationItem, GeneratorType } from "@/lib/types";

type ResultGridProps = {
  type: GeneratorType;
  items: GenerationItem[];
  showName: boolean;
  onToggleSelected: (id: string) => void;
  onToggleFavorite: (item: GenerationItem) => void;
  onOpenDetail: (item: GenerationItem) => void;
};

export function ResultGrid(props: ResultGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {props.items.map((item) => (
        <ResultCard key={item.id} {...props} item={item} />
      ))}
    </div>
  );
}
