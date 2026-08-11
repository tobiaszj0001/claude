"use client";

import * as React from "react";
import { CalendarHeart, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Spinner, SegmentedControl } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { useItems } from "@/lib/use-items";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { rangeForPeriod, type PeriodKey } from "@/lib/dates";
import type { ItemDTO } from "@/lib/types";

const MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

/**
 * Oś czasu wydarzeń z życia (§8).
 * Pokazujemy eventy — czyli to, co się faktycznie wydarzyło i zajęło czas —
 * pogrupowane miesiącami, od najnowszych.
 */
export function LifeTimeline() {
  const { openAdd, openEdit } = useApp();
  const { items, loading, reload } = useItems({ area: "ZYCIE", type: "EVENT" });
  const confirm = useConfirm();
  const toast = useToast();
  const [period, setPeriod] = React.useState<PeriodKey>("QUARTER");

  const groups = React.useMemo(() => {
    const { start, end } = rangeForPeriod(period);
    const inRange = items.filter((i) => {
      if (!i.startAt) return false;
      const d = new Date(i.startAt);
      return d >= start && d <= end;
    });
    inRange.sort((a, b) => (b.startAt ?? "").localeCompare(a.startAt ?? ""));

    const map = new Map<string, ItemDTO[]>();
    for (const i of inRange) {
      const d = new Date(i.startAt!);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    }
    return [...map.entries()].map(([key, list]) => {
      const [y, m] = key.split("-").map(Number);
      return { key, label: `${MONTHS[m]} ${y}`, list };
    });
  }, [items, period]);

  async function remove(item: ItemDTO) {
    const ok = await confirm({
      title: "Usunąć wydarzenie?",
      description: `„${item.title}" zostanie trwale usunięte.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/items/${item.id}`, { method: "DELETE" });
      toast("Usunięto");
      reload();
    } catch {
      toast("Nie udało się usunąć", "error");
    }
  }

  const total = groups.reduce((a, g) => a + g.list.length, 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Co się wydarzyło</h2>
        {total > 0 && (
          <span className="tnum text-sm text-muted-foreground">{total}</span>
        )}
      </div>

      <SegmentedControl<PeriodKey>
        value={period}
        onChange={setPeriod}
        options={[
          { value: "WEEK", label: "Tydzień" },
          { value: "MONTH", label: "Miesiąc" },
          { value: "QUARTER", label: "3 mies." },
          { value: "YEAR", label: "Rok" },
          { value: "ALL", label: "Wszystko" },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={CalendarHeart}
          title="Brak wydarzeń"
          description="Zapisz, co się wydarzyło — spotkania, wyjazdy, wizyty."
          action={
            <Button onClick={() => openAdd({ area: "ZYCIE", type: "EVENT" })}>
              Dodaj wydarzenie
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="sticky top-14 z-[5] bg-background/90 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur md:top-0">
                {g.label}
              </p>
              {/* Oś: pionowa linia z kropkami przy każdym wydarzeniu */}
              <div className="relative mt-2 flex flex-col gap-2 pl-5">
                <span
                  className="absolute bottom-2 left-[5px] top-2 w-px bg-border"
                  aria-hidden
                />
                {g.list.map((item) => {
                  const d = new Date(item.startAt!);
                  return (
                    <div key={item.id} className="relative">
                      <span
                        className="absolute -left-5 top-3 h-2.5 w-2.5 rounded-full bg-zycie ring-4 ring-background"
                        aria-hidden
                      />
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 pl-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="min-w-0 flex-1 py-1.5 text-left"
                        >
                          <span className="block truncate font-medium">{item.title}</span>
                          <span className="tnum block truncate text-xs text-muted-foreground">
                            {d.toLocaleDateString("pl-PL", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                            {" · "}
                            {d.toLocaleTimeString("pl-PL", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {item.description ? ` · ${item.description}` : ""}
                          </span>
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                          aria-label="Edytuj"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(item)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                          aria-label="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
