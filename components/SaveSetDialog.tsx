"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/supabase/client";
import type { GenerationItem, GeneratorType } from "@/lib/types";

type SaveSetDialogProps = {
  type: GeneratorType;
  items: GenerationItem[];
  onSaved: (name: string) => void;
};

export function SaveSetDialog({ type, items, onSaved }: SaveSetDialogProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (items.length === 0) {
      toast.error("保存する項目を選択してください。");
      return;
    }
    if (!name.trim()) {
      toast.error("セット名を入力してください。");
      return;
    }

    setIsSaving(true);
    const token = await getAccessToken();
    await fetch("/api/save-set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name, type, items })
    }).catch(() => null);
    onSaved(name);
    setIsSaving(false);
    setOpen(false);
    setName("");
    toast.success("保存済みセットに追加しました。");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Save data-icon="inline-start" />
          セット保存
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存済みセットを作成</DialogTitle>
          <DialogDescription>
            選択中の{type === "npc" ? "NPC" : "モンスター"}をまとめて保存します。
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例：第3章の街NPC"
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button type="button" onClick={save} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
