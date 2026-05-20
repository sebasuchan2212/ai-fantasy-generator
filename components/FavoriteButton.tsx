"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  active: boolean;
  onClick: () => void;
  label?: string;
};

export function FavoriteButton({
  active,
  onClick,
  label = "お気に入り"
}: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cn(active && "text-primary")}
    >
      <Star className={cn(active && "fill-current")} />
    </Button>
  );
}
