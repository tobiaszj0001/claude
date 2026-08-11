"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl, Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN, fromCents } from "@/lib/money";
import { AREA_COLOR, AREA_LABELS, AREAS } from "@/lib/enums";
import type { Area } from "@/lib/enums";
import { useApp } from "@/components/providers";
import type { PeriodKey } from "@/lib/dates";

type Summary = {
  period: PeriodKey;
  incomeCents: number;
  expenseTotalCents: number;
  expenseByAreaCents: Record<Area, number>;
  balanceCents: number;
  pendingCount: number;
  plannedCents: number;
  plannedItems: { id: string; name: string; amount: string; area: Area; date: string }[];
};

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "DAY", label: "Dziś" },
  { value: "WEEK", label: "Tydzień" },
  { value: "MONTH", label: "Miesiąc" },
  { value: "QUARTER", label: "3 mies." },
  { value: "YEAR", label: "Rok" },
  { value: "ALL", label: "Od początku" },
];

export function BalanceCard({ defaultPeriod = "MONTH" }: { defaultPeriod?: PeriodKey }) {
  const { dataVersion } = useApp();
  const [period, setPeriod] = React.useState<PeriodKey>(defaultPeriod);
  const [data, setData] = React.useState<Summary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    api<Summary>(`/api/finance/summary?period=${period}`)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [period, dataVersion]);

  const positive = (data?.balanceCents ?? 0) >= 0;

  return (
    <section className="flex flex-col gap-3">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-1 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Stan konta
            </span>
            {loading && <Spinner className="h-4 w-4 text-muted-foreground" />}
          </div>

          {/* Najważniejsza liczba na ekranie — duża i czytelna (§11) */}
          <div
            className={cn(
              "tnum text-[2rem] font-bold leading-tight tracking-tight sm:text-4xl",
              positive ? "text-success" : "text-danger"
            )}
          >
            {data ? formatPLN(fromCents(data.balanceCents), { sign: true }) : "—"}
          </div>

          {/* Rozbicie */}
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <LineItem
              label="Przychody (biznes)"
              value={data ? fromCents(data.incomeCents) : null}
              positive
              href={`/finanse?kind=INCOME&period=${period}`}
            />
            <LineItem
              label="Koszty razem"
              value={data ? -fromCents(data.expenseTotalCents) : null}
              href={`/finanse?kind=EXPENSE&period=${period}`}
            />
            <div className="flex flex-col gap-1 pl-3">
              {AREAS.map((a) => (
                <LineItem
                  key={a}
                  nested
                  dotClass={AREA_COLOR[a].dot}
                  label={AREA_LABELS[a]}
                  value={data ? -fromCents(data.expenseByAreaCents[a]) : null}
                  href={`/finanse?kind=EXPENSE&area=${a}&period=${period}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Zaplanowane — NIE wliczone w stan konta, dopóki niezatwierdzone */}
        {data && data.pendingCount > 0 && (
          <Link
            href="/finanse#do-zatwierdzenia"
            className="flex items-center gap-2 border-t border-border bg-warning/10 px-4 py-3 text-sm transition-colors hover:bg-warning/15 sm:px-5"
          >
            <Clock className="h-4 w-4 shrink-0 text-warning" />
            <span className="min-w-0 flex-1">
              Zaplanowane:{" "}
              <span className="tnum font-semibold">{formatPLN(fromCents(data.plannedCents))}</span>{" "}
              <span className="text-muted-foreground">
                ({data.pendingCount} {plural(data.pendingCount)} do zatwierdzenia)
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )}
      </Card>

      <SegmentedControl<PeriodKey>
        value={period}
        onChange={setPeriod}
        options={PERIOD_OPTIONS}
      />
    </section>
  );
}

function plural(n: number) {
  if (n === 1) return "pozycja";
  const last = n % 10;
  const teen = n % 100 >= 12 && n % 100 <= 14;
  return !teen && last >= 2 && last <= 4 ? "pozycje" : "pozycji";
}

function LineItem({
  label,
  value,
  positive,
  nested,
  dotClass,
  href,
}: {
  label: string;
  value: number | null;
  positive?: boolean;
  nested?: boolean;
  dotClass?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "-mx-1 flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-muted",
        nested && "text-muted-foreground"
      )}
    >
      {dotClass && <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={cn(
          "tnum shrink-0 font-semibold",
          value == null ? "text-muted-foreground" : positive ? "text-success" : ""
        )}
      >
        {value == null ? "—" : formatPLN(value, { sign: positive })}
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </Link>
  );
}
