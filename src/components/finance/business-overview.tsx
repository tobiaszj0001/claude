"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl, Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN, fromCents, pctChange } from "@/lib/money";
import { BUSINESS_SECTIONS, BUSINESS_SECTION_LABELS } from "@/lib/enums";
import type { BusinessSection } from "@/lib/enums";
import { useApp } from "@/components/providers";
import type { PeriodKey } from "@/lib/dates";

type Fin = { incomeCents: number; expenseCents: number; profitCents: number };
type Breakdown = { bySection: Record<BusinessSection, Fin>; total: Fin };
type Resp = { current: Breakdown; previous: Breakdown };

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "DAY", label: "Dzień" },
  { value: "WEEK", label: "Tydzień" },
  { value: "MONTH", label: "Miesiąc" },
  { value: "QUARTER", label: "3 mies." },
  { value: "YEAR", label: "Rok" },
];

export function BusinessOverview() {
  const { dataVersion } = useApp();
  const [period, setPeriod] = React.useState<PeriodKey>("MONTH");
  const [data, setData] = React.useState<Resp | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    api<Resp>(`/api/finance/business?period=${period}`)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [period, dataVersion]);

  const cur = data?.current.total;
  const prev = data?.previous.total;

  const chartData = React.useMemo(
    () =>
      BUSINESS_SECTIONS.map((s) => ({
        name: BUSINESS_SECTION_LABELS[s],
        short: BUSINESS_SECTION_LABELS[s].split(" ")[0],
        Przychód: data ? fromCents(data.current.bySection[s].incomeCents) : 0,
        Koszty: data ? fromCents(data.current.bySection[s].expenseCents) : 0,
        Dochód: data ? fromCents(data.current.bySection[s].profitCents) : 0,
      })),
    [data]
  );

  const hasData = chartData.some((d) => d.Przychód || d.Koszty);

  return (
    <section className="flex flex-col gap-3">
      <SegmentedControl<PeriodKey> value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />

      {/* Przychód · Koszty · Dochód razem */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Biznes razem
          </span>
          {loading && <Spinner className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Metric label="Przychód" cents={cur?.incomeCents} prev={prev?.incomeCents} tone="success" />
          <Metric label="Koszty" cents={cur?.expenseCents} prev={prev?.expenseCents} tone="muted" invertTrend />
          <Metric label="Dochód" cents={cur?.profitCents} prev={prev?.profitCents} tone="auto" />
        </div>
      </Card>

      {/* Porównanie podzakładek */}
      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">Porównanie podzakładek</p>
        {!hasData && !loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Brak transakcji w tym okresie.
          </p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="short"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(v) => (v >= 1000 || v <= -1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <Tooltip
                  formatter={(v: number, n) => [formatPLN(v), n as string]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8125rem",
                  }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 4 }} />
                <Bar dataKey="Przychód" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Koszty" fill="hsl(var(--danger))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Dochód" fill="hsl(var(--biznes))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Wiersze per podzakładka */}
      <div className="flex flex-col gap-1.5">
        {BUSINESS_SECTIONS.map((s) => {
          const f = data?.current.bySection[s];
          return (
            <div key={s} className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-medium">{BUSINESS_SECTION_LABELS[s]}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <SmallStat label="Przychód" cents={f?.incomeCents} className="text-success" />
                <SmallStat label="Koszty" cents={f?.expenseCents} />
                <SmallStat
                  label="Dochód"
                  cents={f?.profitCents}
                  className={f && f.profitCents < 0 ? "text-danger" : "font-semibold"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SmallStat({
  label,
  cents,
  className,
}: {
  label: string;
  cents?: number;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className={cn("tnum truncate", className)}>
        {cents == null ? "—" : formatPLN(fromCents(cents))}
      </p>
    </div>
  );
}

function Metric({
  label,
  cents,
  prev,
  tone,
  invertTrend,
}: {
  label: string;
  cents?: number;
  prev?: number;
  tone: "success" | "muted" | "auto";
  /** Dla kosztów wzrost jest zły — strzałka w górę na czerwono. */
  invertTrend?: boolean;
}) {
  const change = cents != null && prev != null ? pctChange(cents, prev) : null;
  const up = (change ?? 0) > 0;
  const flat = change === 0 || change == null;
  const good = invertTrend ? !up : up;

  const color =
    tone === "success"
      ? "text-success"
      : tone === "auto"
      ? cents != null && cents < 0
        ? "text-danger"
        : "text-foreground"
      : "text-foreground";

  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className={cn("tnum truncate text-lg font-bold", color)}>
        {cents == null ? "—" : formatPLN(fromCents(cents))}
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
