"use client";

import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { GenerationItem, GeneratorType, Monster, NPC } from "@/lib/types";

function isNPC(item: GenerationItem): item is NPC {
  return "race" in item;
}

type ResultListProps = {
  type: GeneratorType;
  items: GenerationItem[];
  showName: boolean;
  onToggleSelected: (id: string) => void;
  onToggleFavorite: (item: GenerationItem) => void;
  onOpenDetail: (item: GenerationItem) => void;
};

export function ResultList({
  type,
  items,
  showName,
  onToggleSelected,
  onToggleFavorite,
  onOpenDetail
}: ResultListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {items.map((item) => {
        const meta =
          type === "npc" && isNPC(item)
            ? `${item.race} / ${item.role} / ${item.ageGroup}`
            : `${(item as Monster).monsterType} / ${(item as Monster).size} / ${(item as Monster).dangerLevel}`;

        return (
          <div
            key={item.id}
            className="grid grid-cols-[auto_72px_minmax(0,1fr)_auto] items-center gap-3 border-b p-3 last:border-b-0"
          >
            <Checkbox
              checked={item.isSelected}
              onCheckedChange={() => onToggleSelected(item.id)}
              aria-label={`${item.name}を選択`}
            />
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={160}
              height={120}
              unoptimized
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                  {String(item.index).padStart(2, "0")}
                </span>
                <h3 className="truncate text-sm font-extrabold">
                  {showName ? item.name : "名前非表示"}
                </h3>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
                {meta}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {item.shortDescription}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <FavoriteButton
                active={item.isFavorite}
                onClick={() => onToggleFavorite(item)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="詳細を見る"
                onClick={() => onOpenDetail(item)}
              >
                <MoreVertical />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
