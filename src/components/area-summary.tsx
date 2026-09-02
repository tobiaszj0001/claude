"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl, Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN, fromCents, pctChange } from "@/lib/money";
import { formatMinutes } from "@/lib/summary";
import { AREA_COLOR, AREA_LABELS } from "@/lib/enums";
import type { Area } from "@/lib/enums";
import { useApp } from "@/components/providers";
import type { PeriodKey } from "@/lib/dates";

type Sum = {
  incomeCents: number;
  expenseCents: number;
  profitCents: number;
  tasksDone: number;
  tasksTotal: number;
  completionPct: number;
  eventMinutes: number;
};
type SportSum = { workouts: number; activities: number; volume: number; restDays: number };
type Resp = { current: Sum; previous: Sum; sport: { current: SportSum; previous: SportSum } | null };

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "DAY", label: "Dzień" },
  { value: "WEEK", label: "Tydzień" },
  { value: "MONTH", label: "Miesiąc" },
  { value: "QUARTER", label: "3 mies." },
  { value: "YEAR", label: "Rok" },
];

/**
 * Wspólny komponent podsumowania okresu, ten sam w każdym obszarze (§9).
 * Przychody pokazujemy tylko w Biznesie — w Sporcie i Życiu są same koszty.
 */
export function AreaSummary({ area }: { area: Area }) {
  const { dataVersion } = useApp();
  const [period, setPeriod] = React.useState<PeriodKey>("MONTH");
  const [data, setData] = React.useState<Resp | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    api<Resp>(`/api/summary/area?area=${area}&period=${period}`)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [area, period, dataVersion]);

  const c = data?.current;
  const p = data?.previous;
  const isBiznes = area === "BIZNES";
  const color = AREA_COLOR[area];

  return (
    <section className="flex flex-col gap-3">
      <SegmentedControl<PeriodKey> value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Podsumowanie · {AREA_LABELS[area]}
          </span>
          {loading && <Spinner className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Finanse */}
        <div className={cn("mt-3 grid gap-2", isBiznes ? "grid-cols-3" : "grid-cols-1")}>
          {isBiznes && (
            <Metric label="Przychód" value={c && formatPLN(fromCents(c.incomeCents))} change={pct(c?.incomeCents, p?.incomeCents)} tone="success" />
          )}
          <Metric
            label="Koszty"
            value={c && formatPLN(fromCents(c.expenseCents))}
            change={pct(c?.expenseCents, p?.expenseCents)}
            invert
          />
          {isBiznes && (
            <Metric
              label="Dochód"
              value={c && formatPLN(fromCents(c.profitCents))}
              change={pct(c?.profitCents, p?.profitCents)}
              tone={c && c.profitCents < 0 ? "danger" : "default"}
            />
          )}
        </div>

        {/* Zadania i czas */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">Zadania</p>
            <p className="tnum text-lg font-bold">
              {c ? `${c.tasksDone} / ${c.tasksTotal}` : "—"}
            </p>
            {c && c.tasksTotal > 0 && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", color.dot)}
                  style={{ width: `${c.completionPct}%` }}
                />
              </div>
            )}
            {c && (
              <p className="tnum mt-1 text-[11px] text-muted-foreground">
                {c.completionPct}% ukończone
              </p>
            )}
          </div>
          <Metric
            label="Czas na eventy"
            value={c && formatMinutes(c.eventMinutes)}
            change={pct(c?.eventMinutes, p?.eventMinutes)}
          />
        </div>

        {/* Sport dodatkowo */}
        {data?.sport && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
            <Metric
              label="Treningi"
              value={String(data.sport.current.workouts)}
              change={pct(data.sport.current.workouts, data.sport.previous.workouts)}
            />
            <Metric
              label="Objętość"
              value={`${data.sport.current.volume.toLocaleString("pl-PL")} kg`}
              change={pct(data.sport.current.volume, data.sport.previous.volume)}
            />
            <Metric
              label="Aktywności"
              value={String(data.sport.current.activities)}
              change={pct(data.sport.current.activities, data.sport.previous.activities)}
            />
          </div>
        )}
      </Card>
    </section>
  );
}

function pct(cur?: number, prev?: number): number | null {
  if (cur == null || prev == null) return null;
  return pctChange(cur, prev);
}

function Metric({
  label,
  value,
  change,
  tone = "default",
  invert,
}: {
  label: string;
  value?: string | null;
  change: number | null;
  tone?: "default" | "success" | "danger";
  /** Dla kosztów wzrost jest zły. */
  invert?: boolean;
}) {
  const up = (change ?? 0) > 0;
  const flat = change == null || Math.round(change) === 0;
  const good = invert ? !up : up;

  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tnum truncate text-lg font-bold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger"
        )}
      >
        {value ?? "—"}
      </p>
      {change != null && (
        <p
          className={cn(
            "flex items-center gap-0.5 text-[11px]",
            flat ? "text-muted-foreground" : good ? "text-success" : "text-danger"
          )}
        >
          {flat ? (
            <Minus className="h-3 w-3" />
          ) : up ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="tnum">{Math.abs(Math.round(change))}%</span>
        </p>
      )}
    </div>
  );
}
