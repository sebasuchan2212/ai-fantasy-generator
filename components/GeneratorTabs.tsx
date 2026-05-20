"use client";

import Link from "next/link";
import { Skull, UserRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GeneratorType } from "@/lib/types";

export function GeneratorTabs({ active }: { active: GeneratorType }) {
  return (
    <Tabs value={active}>
      <TabsList className="h-11">
        <TabsTrigger value="npc" asChild>
          <Link href="/generator/npc" className="gap-2">
            <UserRound />
            NPC量産
          </Link>
        </TabsTrigger>
        <TabsTrigger value="monster" asChild>
          <Link href="/generator/monster" className="gap-2">
            <Skull />
            モンスター量産
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
