"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SegmentedControl, Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN, fromCents } from "@/lib/money";
import type { BusinessSection } from "@/lib/enums";
import { useApp } from "@/components/providers";
import type { PeriodKey } from "@/lib/dates";

type Fin = { incomeCents: number; expenseCents: number; profitCents: number };
type Resp = { current: { bySection: Record<BusinessSection, Fin> } };

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "DAY", label: "Dzień" },
  { value: "WEEK", label: "Tydzień" },
  { value: "MONTH", label: "Miesiąc" },
  { value: "QUARTER", label: "3 mies." },
  { value: "YEAR", label: "Rok" },
];

/** Karta Przychód · Koszty · Dochód jednej podzakładki (§6.1). */
export function SectionFinance({
  section,
  period,
  onPeriodChange,
}: {
  section: BusinessSection;
  period: PeriodKey;
  onPeriodChange: (p: PeriodKey) => void;
}) {
  const { dataVersion } = useApp();
  const [fin, setFin] = React.useState<Fin | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    api<Resp>(`/api/finance/business?period=${period}`)
      .then((d) => alive && setFin(d.current.bySection[section]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [period, section, dataVersion]);

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl<PeriodKey>
        value={period}
        onChange={onPeriodChange}
        options={PERIOD_OPTIONS}
      />
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Finanse
          </span>
          {loading && <Spinner className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Przychód" cents={fin?.incomeCents} className="text-success" />
          <Stat label="Koszty" cents={fin?.expenseCents} />
          <Stat
            label="Dochód"
            cents={fin?.profitCents}
            className={fin && fin.profitCents < 0 ? "text-danger" : "text-foreground"}
          />
        </div>
      </Card>
    </div>
  );
}

function Stat({
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
      <p className={cn("tnum truncate text-lg font-bold", className)}>
        {cents == null ? "—" : formatPLN(fromCents(cents))}
      </p>
    </div>
  );
}
