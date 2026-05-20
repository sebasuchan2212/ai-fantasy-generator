"use client";

import { Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PricingCards } from "@/components/PricingCards";

export function CreditPurchaseModal({
  open,
  onOpenChange,
  onPurchased
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased: (credits: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="text-primary" />
            クレジットが不足しています
          </DialogTitle>
          <DialogDescription>
            クレジットが不足しています。追加購入してください。
          </DialogDescription>
        </DialogHeader>
        <PricingCards
          onPurchased={(credits) => {
            onPurchased(credits);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
