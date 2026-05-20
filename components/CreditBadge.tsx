"use client";

import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCredits } from "@/lib/utils";

export function CreditBadge({ credits }: { credits: number }) {
  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
      <Coins className="text-primary" />
      {formatCredits(credits)} credits
    </Badge>
  );
}
