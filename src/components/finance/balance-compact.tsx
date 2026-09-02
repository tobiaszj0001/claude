"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Clock, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN, fromCents } from "@/lib/money";
import { useApp } from "@/components/providers";
import { TransactionForm } from "./transaction-form";

type Summary = {
  balanceCents: number;
  pendingCount: number;
  plannedCents: number;
};

/**
 * Kompaktowy stan konta na zakładce „Dziś".
 *
 * Pełna karta z rozbiciem i przełącznikiem okresu zjadała cały pierwszy
 * ekran, przez co lista zadań zaczynała się dopiero po przewinięciu.
 * Tutaj pokazujemy samą liczbę (miesiąc) — po szczegóły przenosimy
 * do zakładki Finanse.
 */
export function BalanceCompact() {
  const { dataVersion, refresh } = useApp();
  const [data, setData] = React.useState<Summary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    api<Summary>("/api/finance/summary?period=MONTH")
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const positive = (data?.balanceCents ?? 0) >= 0;

  return (
    <>
      <Card className="overflow-hidden">
        {/* Cała górna część prowadzi do Finansów */}
        <Link
          href="/finanse"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stan konta
          </span>
          <span
            className={cn(
              "tnum ml-auto text-xl font-bold tracking-tight sm:text-2xl",
              positive ? "text-success" : "text-danger"
            )}
          >
            {loading ? (
              <Spinner className="h-4 w-4 text-muted-foreground" />
            ) : data ? (
              formatPLN(fromCents(data.balanceCents), { sign: true })
            ) : (
              "—"
            )}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>

        {data && data.pendingCount > 0 && (
          <Link
            href="/finanse#do-zatwierdzenia"
            className="flex items-center gap-2 border-t border-border bg-warning/10 px-4 py-2 text-xs transition-colors hover:bg-warning/15"
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-warning" />
            <span className="min-w-0 flex-1 truncate">
              <span className="tnum font-semibold">{formatPLN(fromCents(data.plannedCents))}</span>{" "}
              <span className="text-muted-foreground">do zatwierdzenia</span>
            </span>
            <span className="tnum flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-white">
              {data.pendingCount}
            </span>
          </Link>
        )}

        {/* Osobny przycisk — nie zagnieżdżamy go w linku powyżej */}
        <button
          onClick={() => setFormOpen(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Dodaj transakcję
        </button>
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
      />
    </>
  );
}
