"use client";

import Link from "next/link";
import { Box, Coins, Download, Heart, History, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/CreditBadge";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  credits?: number;
  compact?: boolean;
};

export function AppHeader({ credits = 20, compact = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1480px] items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-extrabold tracking-normal">
              AI FANTASY Generator
            </span>
            {!compact ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                ワンクリックでNPC・モンスターを大量生成！
              </span>
            ) : null}
          </span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground lg:flex">
          <Link className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard">
            <History /> 生成履歴
          </Link>
          <Link className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard#favorites">
            <Heart /> お気に入り
          </Link>
          <Link className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard#sets">
            <Box /> 保存済みセット
          </Link>
          <Link className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/pricing">
            <Coins /> プラン
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className={cn("hidden sm:block", compact && "md:hidden")}>
            <CreditBadge credits={credits} />
          </div>
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/dashboard">
              <LayoutDashboard data-icon="inline-start" />
              Dashboard
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/generator/npc">
              <Download data-icon="inline-start" />
              生成する
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
