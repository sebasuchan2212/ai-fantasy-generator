"use client";

import { MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GeneratedImage } from "@/components/GeneratedImage";
import type { GenerationItem, GeneratorType, Monster, NPC } from "@/lib/types";
import { cn } from "@/lib/utils";

function isNPC(item: GenerationItem): item is NPC {
  return "race" in item;
}

function metaFor(type: GeneratorType, item: GenerationItem) {
  if (type === "npc" && isNPC(item)) {
    return `${item.role}（${item.race}・${item.gender}）`;
  }
  const monster = item as Monster;
  return `${monster.monsterType} / ${monster.size}`;
}

type ResultCardProps = {
  type: GeneratorType;
  item: GenerationItem;
  showName: boolean;
  onToggleSelected: (id: string) => void;
  onToggleFavorite: (item: GenerationItem) => void;
  onOpenDetail: (item: GenerationItem) => void;
};

export function ResultCard({
  type,
  item,
  showName,
  onToggleSelected,
  onToggleFavorite,
  onOpenDetail
}: ResultCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",
        item.isSelected && "border-primary ring-2 ring-primary/20"
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <GeneratedImage
          src={item.imageUrl}
          alt={item.name}
          kind={type}
          width={960}
          height={600}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-md bg-slate-950/60 px-2 py-1 text-xs font-bold text-white">
          {String(item.index).padStart(2, "0")}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/90 p-1 shadow-sm">
          <Checkbox
            checked={item.isSelected}
            onCheckedChange={() => onToggleSelected(item.id)}
            aria-label={`${item.name}を選択`}
          />
        </span>
      </div>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold">
            {showName ? item.name : "名前非表示"}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
            {metaFor(type, item)}
          </p>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
            {item.shortDescription}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <FavoriteButton
            active={item.isFavorite}
            onClick={() => onToggleFavorite(item)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="詳細メニュー">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onOpenDetail(item)}>
                  詳細を見る
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleSelected(item.id)}>
                  {item.isSelected ? "選択を解除" : "選択する"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
