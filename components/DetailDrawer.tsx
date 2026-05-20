"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { GenerationItem, GeneratorType, Monster, NPC } from "@/lib/types";

function isNPC(item: GenerationItem): item is NPC {
  return "race" in item;
}

export function DetailDrawer({
  type,
  item,
  open,
  onOpenChange
}: {
  type: GeneratorType;
  item: GenerationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.shortDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={960}
            height={720}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg border object-cover"
          />
          <div className="flex flex-col gap-4 text-sm leading-6">
            {type === "npc" && isNPC(item) ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.race}</Badge>
                  <Badge variant="secondary">{item.gender}</Badge>
                  <Badge variant="secondary">{item.role}</Badge>
                  <Badge variant="secondary">{item.ageGroup}</Badge>
                </div>
                <section>
                  <h3 className="font-bold">詳細プロフィール</h3>
                  <p className="mt-1 text-muted-foreground">{item.detailedProfile}</p>
                </section>
                <section>
                  <h3 className="font-bold">背景</h3>
                  <p className="mt-1 text-muted-foreground">{item.backstory}</p>
                </section>
                <section>
                  <h3 className="font-bold">口調</h3>
                  <p className="mt-1 text-muted-foreground">{item.speakingStyle}</p>
                </section>
              </>
            ) : (
              (() => {
                const monster = item as Monster;
                return (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{monster.monsterType}</Badge>
                      <Badge variant="secondary">{monster.size}</Badge>
                      <Badge variant="secondary">{monster.dangerLevel}</Badge>
                      <Badge variant="secondary">{monster.habitat}</Badge>
                    </div>
                    <section>
                      <h3 className="font-bold">詳細プロフィール</h3>
                      <p className="mt-1 text-muted-foreground">
                        {monster.detailedProfile}
                      </p>
                    </section>
                    <section>
                      <h3 className="font-bold">能力</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {monster.abilities.map((ability) => (
                          <Badge key={ability} variant="outline">
                            {ability}
                          </Badge>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h3 className="font-bold">弱点 / ドロップ</h3>
                      <p className="mt-1 text-muted-foreground">{monster.weakness}</p>
                      <p className="mt-1 text-muted-foreground">
                        {monster.dropItems.join("、")}
                      </p>
                    </section>
                  </>
                );
              })()
            )}
            <section>
              <h3 className="font-bold">画像プロンプト</h3>
              <p className="mt-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {item.imagePrompt}
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
