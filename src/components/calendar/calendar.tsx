"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { SegmentedControl } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { AREA_COLOR, AREA_LABELS, AREAS } from "@/lib/enums";
import type { Area } from "@/lib/enums";
import type { ItemDTO } from "@/lib/types";
import { layoutBlocks, minutesOf } from "@/lib/calendar-layout";
import { WorkoutSheet } from "./workout-sheet";

type WorkoutLite = {
  id: string;
  date: string;
  name: string | null;
  exerciseCount: number;
  setCount: number;
};
type ActivityLite = { id: string; date: string; name: string; durationMin: number | null };
type CalData = { items: ItemDTO[]; workouts: WorkoutLite[]; activities: ActivityLite[] };

type View = "month" | "week" | "day";
const HOUR_START = 6;
const HOUR_END = 23;
const HOUR_PX = 48;

/**
 * Kalendarz. `sportOnly` zawęża go do samego Sportu — ten sam mechanizm
 * co na ekranie głównym, użyty w historii treningów (§7.2).
 */
export function Calendar({ sportOnly = false }: { sportOnly?: boolean } = {}) {
  const { openAdd, openEdit, dataVersion } = useApp();
  const [view, setView] = React.useState<View>("week");
  const [cursor, setCursor] = React.useState(() => new Date());
  const [data, setData] = React.useState<CalData>({ items: [], workouts: [], activities: [] });
  const [areaFilter, setAreaFilter] = React.useState<Set<Area>>(
    sportOnly ? new Set<Area>(["SPORT"]) : new Set(AREAS)
  );
  const [trainingOnly, setTrainingOnly] = React.useState(sportOnly);
  const [workoutId, setWorkoutId] = React.useState<string | null>(null);

  // Domyślny widok wg szerokości ekranu (mobile: dzień).
  React.useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) setView("day");
  }, []);

  // Zakres do pobrania zależny od widoku.
  const range = React.useMemo(() => {
    if (view === "month") {
      return {
        start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
      };
    }
    if (view === "week") {
      return {
        start: startOfWeek(cursor, { weekStartsOn: 1 }),
        end: endOfWeek(cursor, { weekStartsOn: 1 }),
      };
    }
    return { start: cursor, end: cursor };
  }, [view, cursor]);

  React.useEffect(() => {
    const from = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate(), 0, 0);
    const to = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate(), 23, 59);
    api<CalData>(`/api/calendar?from=${from.toISOString()}&to=${to.toISOString()}`).then(setData);
  }, [range.start, range.end, dataVersion]);

  const showArea = (a: Area) => areaFilter.has(a);
  const toggleArea = (a: Area) =>
    setAreaFilter((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });

  const visibleItems = trainingOnly
    ? []
    : data.items.filter((i) => i.type !== "TASK" && showArea(i.area));
  const showSport = showArea("SPORT");
  const visibleWorkouts = showSport ? data.workouts : [];
  const visibleActivities = showSport ? data.activities : [];

  function move(dir: number) {
    if (view === "month") setCursor((c) => addMonths(c, dir));
    else if (view === "week") setCursor((c) => addDays(c, 7 * dir));
    else setCursor((c) => addDays(c, dir));
  }

  const title =
    view === "month"
      ? format(cursor, "LLLL yyyy", { locale: pl })
      : view === "week"
      ? `${format(range.start, "d MMM", { locale: pl })} – ${format(range.end, "d MMM", { locale: pl })}`
      : format(cursor, "EEEE, d MMMM", { locale: pl });

  return (
    <section>
      {/* Sterowanie */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => move(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Poprzedni"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => move(1)}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Następny"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="ml-1 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Dziś
          </button>
        </div>
        <span className="text-base font-semibold capitalize">{title}</span>
        <div className="ml-auto">
          <SegmentedControl<View>
            value={view}
            onChange={setView}
            options={[
              { value: "month", label: "Miesiąc" },
              { value: "week", label: "Tydzień" },
              { value: "day", label: "Dzień" },
            ]}
          />
        </div>
      </div>

      {/* Legenda + filtry obszarów (w trybie sportowym niepotrzebne) */}
      {!sportOnly && (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => toggleArea(a)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              showArea(a) ? "border-border" : "border-dashed border-border opacity-40"
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", AREA_COLOR[a].dot)} />
            {AREA_LABELS[a]}
          </button>
        ))}
        <button
          onClick={() => setTrainingOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            trainingOnly ? "border-sport bg-sport/10 text-sport" : "border-border"
          )}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Tylko treningi
        </button>
      </div>
      )}

      {view === "month" && (
        <MonthView
          cursor={cursor}
          items={visibleItems}
          workouts={visibleWorkouts}
          onDay={(d) => {
            setCursor(d);
            setView("day");
          }}
        />
      )}
      {view === "week" && (
        <TimeGrid
          days={eachDay(range.start, 7)}
          items={visibleItems}
          workouts={visibleWorkouts}
          activities={visibleActivities}
          onEmpty={(d) => openAdd({ type: "EVENT", date: d })}
          onItem={openEdit}
          onWorkout={setWorkoutId}
        />
      )}
      {view === "day" && (
        <TimeGrid
          days={[cursor]}
          items={visibleItems}
          workouts={visibleWorkouts}
          activities={visibleActivities}
          onEmpty={(d) => openAdd({ type: "EVENT", date: d })}
          onItem={openEdit}
          onWorkout={setWorkoutId}
        />
      )}

      <WorkoutSheet id={workoutId} onClose={() => setWorkoutId(null)} />
    </section>
  );
}

function eachDay(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

// ── Widok miesiąca ─────────────────────────────────────────────────
function MonthView({
  cursor,
  items,
  workouts,
  onDay,
}: {
  cursor: Date;
  items: ItemDTO[];
  workouts: WorkoutLite[];
  onDay: (d: Date) => void;
}) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDay(start, 42);
  const dow = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-medium text-muted-foreground">
        {dow.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const today = isSameDay(day, new Date());
          const dayItems = items.filter((i) => {
            const iso = i.startAt ?? i.dueAt;
            return iso && isSameDay(new Date(iso), day);
          });
          const hasWorkout = workouts.some((w) => isSameDay(new Date(w.date), day));
          const areasHere = new Set(dayItems.map((i) => i.area));
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDay(day)}
              className={cn(
                "min-h-[60px] border-b border-r border-border p-1 text-left transition-colors last:border-r-0 hover:bg-muted/50",
                !inMonth && "bg-muted/20 text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "tnum inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    today && "bg-accent font-semibold text-accent-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
                {hasWorkout && <Dumbbell className="h-3.5 w-3.5 text-sport" />}
              </div>
              <div className="mt-1 flex flex-wrap gap-0.5">
                {[...areasHere].map((a) => (
                  <span key={a} className={cn("h-1.5 w-1.5 rounded-full", AREA_COLOR[a as Area].dot)} />
                ))}
                {dayItems.length > 0 && (
                  <span className="tnum ml-0.5 text-[10px] leading-none text-muted-foreground">
                    {dayItems.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Widok siatki czasu (tydzień / dzień) ───────────────────────────
function TimeGrid({
  days,
  items,
  workouts,
  activities,
  onEmpty,
  onItem,
  onWorkout,
}: {
  days: Date[];
  items: ItemDTO[];
  workouts: WorkoutLite[];
  activities: ActivityLite[];
  onEmpty: (slot: Date) => void;
  onItem: (item: ItemDTO) => void;
  onWorkout: (id: string) => void;
}) {
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  const gridHeight = (HOUR_END - HOUR_START + 1) * HOUR_PX;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Bieżący czas — odświeżany co minutę. Startujemy od null, żeby serwer
  // i klient wyrenderowały to samo (inaczej błąd hydracji).
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Pozycja znacznika „teraz" w pikselach od góry siatki.
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : null;
  const nowTop =
    nowMin != null && nowMin >= HOUR_START * 60 && nowMin <= (HOUR_END + 1) * 60
      ? ((nowMin - HOUR_START * 60) / 60) * HOUR_PX
      : null;

  // Przewiń tak, żeby „teraz" było widoczne (a nie pusty poranek).
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nowH = new Date().getHours();
    const target = Math.max(HOUR_START, Math.min(nowH - 1, HOUR_END - 4));
    el.scrollTop = (target - HOUR_START) * HOUR_PX;
  }, [days.length]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Nagłówek dni */}
      <div className="flex border-b border-border bg-muted/30">
        <div className="w-12 shrink-0" />
        {days.map((d) => {
          const today = isSameDay(d, new Date());
          return (
            <div key={d.toISOString()} className="flex-1 py-2 text-center">
              <div className="text-xs text-muted-foreground">{format(d, "EEE", { locale: pl })}</div>
              <div
                className={cn(
                  "tnum mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  today && "bg-accent font-semibold text-accent-foreground"
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Treningi i aktywności — pasek całodniowy nad siatką */}
      {(workouts.length > 0 || activities.length > 0) && (
        <div className="flex border-b border-border bg-muted/10">
          <div className="w-12 shrink-0" />
          {days.map((d) => {
            const dayWorkouts = workouts.filter((w) => isSameDay(new Date(w.date), d));
            const dayActs = activities.filter((a) => isSameDay(new Date(a.date), d));
            return (
              <div key={d.toISOString()} className="min-w-0 flex-1 space-y-1 p-1">
                {dayWorkouts.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onWorkout(w.id)}
                    className="flex w-full items-center gap-1 rounded-md bg-sport/15 px-1.5 py-1 text-left text-[11px] font-medium text-sport"
                  >
                    <Dumbbell className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {w.name ?? "Trening"} · {w.exerciseCount} ćw · {w.setCount} serii
                    </span>
                  </button>
                ))}
                {dayActs.map((a) => (
                  <div
                    key={a.id}
                    className="truncate rounded-md bg-sport/10 px-1.5 py-1 text-[11px] text-sport"
                  >
                    {a.name}
                    {a.durationMin ? ` · ${a.durationMin} min` : ""}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Siatka godzin — przewijana wewnętrznie, żeby nie spychać listy „Na dziś" */}
      <div
        ref={scrollRef}
        className="relative max-h-[55vh] overflow-y-auto md:max-h-[70vh]"
      >
        <div className="relative flex" style={{ height: gridHeight }}>
          {/* Oś godzin */}
          <div className="sticky left-0 z-20 w-12 shrink-0 bg-card">
            {hours.map((h) => (
              <div
                key={h}
                className="tnum relative border-b border-border text-right"
                style={{ height: HOUR_PX }}
              >
                <span className="absolute -top-2 right-1 text-[10px] text-muted-foreground">
                  {h}:00
                </span>
              </div>
            ))}
            {/* Aktualna godzina na osi — plakietka przy linii „teraz" */}
            {nowTop != null && now && (
              <span
                className="tnum absolute right-0.5 z-30 rounded px-1 py-px text-[10px] font-semibold text-white"
                style={{ top: nowTop - 8, backgroundColor: "hsl(var(--danger))" }}
              >
                {format(now, "HH:mm")}
              </span>
            )}
          </div>

          {/* Kolumny dni */}
          {days.map((day) => {
            const dayEvents = items.filter(
              (i) => i.type === "EVENT" && i.startAt && isSameDay(new Date(i.startAt), day)
            );
            const dayTimed = items.filter(
              (i) => i.type === "TIMED_TASK" && i.dueAt && isSameDay(new Date(i.dueAt), day)
            );

            // Wspólny układ pasów: eventy + zadania czasowe nie zasłaniają się.
            const blocks = layoutBlocks<{ item: ItemDTO; kind: "event" | "timed" }>([
              ...dayEvents.map((ev) => ({
                data: { item: ev, kind: "event" as const },
                startMin: minutesOf(ev.startAt!),
                endMin: Math.max(minutesOf(ev.startAt!) + 30, minutesOf(ev.endAt!)),
              })),
              ...dayTimed.map((tt) => ({
                data: { item: tt, kind: "timed" as const },
                startMin: minutesOf(tt.dueAt!),
                endMin: minutesOf(tt.dueAt!) + 30,
              })),
            ]);

            const showNow = nowTop != null && now != null && isSameDay(day, now);

            return (
              <div key={day.toISOString()} className="relative min-w-0 flex-1 border-l border-border">
                {/* Znacznik „teraz" — tylko w kolumnie dzisiejszego dnia */}
                {showNow && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                    style={{ top: nowTop! }}
                    aria-hidden
                  >
                    <span
                      className="-ml-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: "hsl(var(--danger))" }}
                    />
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: "hsl(var(--danger))" }}
                    />
                  </div>
                )}

                {/* Sloty do klikania */}
                {hours.map((h) => (
                  <button
                    key={h}
                    onClick={() =>
                      onEmpty(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0))
                    }
                    className="block w-full border-b border-border transition-colors hover:bg-accent/5"
                    style={{ height: HOUR_PX }}
                    aria-label={`Dodaj o ${h}:00`}
                  />
                ))}

                {blocks.map(({ data, startMin, endMin, lane, lanes }) => {
                  const { item, kind } = data;
                  const c = AREA_COLOR[item.area];
                  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_PX;
                  const height =
                    kind === "event"
                      ? Math.max(24, ((endMin - startMin) / 60) * HOUR_PX)
                      : 22;
                  const widthPct = 100 / lanes;

                  if (top + height < 0) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onItem(item)}
                      title={item.title}
                      className={cn(
                        "absolute overflow-hidden rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight",
                        c.bg,
                        c.text,
                        kind === "event"
                          ? cn(
                              "border-l-2",
                              item.priority === "PILNE" ? "border-l-danger" : "border-l-current"
                            )
                          : cn("flex items-center gap-1 border", c.border),
                        item.done && "line-through opacity-60"
                      )}
                      style={{
                        top: Math.max(0, top),
                        height,
                        left: `calc(${lane * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                    >
                      {kind === "timed" && (
                        <span className={cn("h-1.5 w-1.5 shrink-0 rotate-45", c.dot)} aria-hidden />
                      )}
                      <span className="block truncate font-medium">{item.title}</span>
                      {kind === "event" && height > 32 && (
                        <span className="tnum block truncate opacity-80">
                          {format(new Date(item.startAt!), "HH:mm")}–
                          {format(new Date(item.endAt!), "HH:mm")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
