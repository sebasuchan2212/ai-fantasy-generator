"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="前のページ"
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
        <Button
          key={value}
          type="button"
          variant={value === page ? "default" : "outline"}
          size="icon"
          className={cn(value === page && "shadow-sm")}
          onClick={() => onPageChange(value)}
        >
          {value}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="次のページ"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
