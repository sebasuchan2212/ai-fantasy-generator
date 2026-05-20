"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { ExportFormat, GenerationItem, GeneratorType } from "@/lib/types";

type ExportButtonProps = {
  type: GeneratorType;
  items: GenerationItem[];
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  json: "JSON",
  csv: "CSV",
  markdown: "Markdown"
};

export function ExportButton({ type, items }: ExportButtonProps) {
  const exportItems = async (format: ExportFormat) => {
    if (items.length === 0) {
      toast.error("エクスポートする項目を選択してください。");
      return;
    }

    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, format, items })
    });

    if (!response.ok) {
      toast.error("エクスポートに失敗しました。");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-fantasy-${type}.${format === "markdown" ? "md" : format}`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${FORMAT_LABELS[format]}でエクスポートしました。`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Download data-icon="inline-start" />
          選択した{type === "npc" ? "NPC" : "モンスター"}をエクスポート
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {(["json", "csv", "markdown"] as ExportFormat[]).map((format) => (
            <DropdownMenuItem key={format} onClick={() => exportItems(format)}>
              {FORMAT_LABELS[format]}で出力
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
