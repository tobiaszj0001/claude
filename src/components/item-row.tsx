"use client";

import * as React from "react";
import { Calendar, CheckSquare, Clock, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/misc";
import { useApp } from "@/components/providers";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AREA_COLOR, AREA_LABELS, ITEM_TYPE_LABELS } from "@/lib/enums";
import { formatTime, itemTime } from "@/lib/items";
import type { ItemDTO } from "@/lib/types";

const TYPE_ICON = { EVENT: Calendar, TASK: CheckSquare, TIMED_TASK: Clock };

export function ItemRow({
  item,
  onChanged,
  showTime = true,
}: {
  item: ItemDTO;
  onChanged?: () => void;
  showTime?: boolean;
}) {
  const { openEdit } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  // Optymistyczny stan odhaczenia
  const [done, setDone] = React.useState(item.done);
  React.useEffect(() => setDone(item.done), [item.done]);

  const TypeIcon = TYPE_ICON[item.type];
  const color = AREA_COLOR[item.area];
  const t = itemTime(item);

  async function toggle(next: boolean) {
    setDone(next); // optymistycznie
    try {
      await api(`/api/items/${item.id}`, { method: "PATCH", json: { done: next } });
      onChanged?.();
    } catch {
      setDone(!next);
      toast("Nie udało się zapisać", "error");
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Usunąć?",
      description: `„${item.title}" zostanie trwale usunięte.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/items/${item.id}`, { method: "DELETE" });
      toast("Usunięto");
      onChanged?.();
    } catch {
      toast("Nie udało się usunąć", "error");
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-card px-1 py-1 transition-colors",
        item.priority === "PILNE" && !done ? "border-danger/40 bg-danger/5" : "border-border",
        done && "opacity-55"
      )}
    >
      <Checkbox checked={done} onChange={toggle} ariaLabel={`Odhacz ${item.title}`} />

      <button
        onClick={() => openEdit(item)}
        className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pr-1 text-left"
      >
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color.dot)} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-medium", done && "line-through")}>
            {item.priority === "PILNE" && !done && (
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-danger" />
            )}
            {item.title}
          </span>
          {/* Jedna linia — „Zadanie czasowe" łamało wiersz na wąskim ekranie. */}
          <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs text-muted-foreground">
            <TypeIcon className="h-3 w-3" />
            <span>{ITEM_TYPE_LABELS[item.type]}</span>
            <span aria-hidden>·</span>
            <span>{AREA_LABELS[item.area]}</span>
            {showTime && t != null && (
              <>
                <span aria-hidden>·</span>
                <span className="tnum">{formatTime((item.startAt ?? item.dueAt)!)}</span>
              </>
            )}
          </span>
        </span>
      </button>

      <button
        onClick={() => openEdit(item)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label="Edytuj"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={remove}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
        aria-label="Usuń"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
