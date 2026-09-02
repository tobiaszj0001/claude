"use client";

import * as React from "react";
import { Pencil, Trash2, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Spinner, SegmentedControl } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN } from "@/lib/money";
import { rangeForPeriod, type PeriodKey } from "@/lib/dates";
import { AREA_COLOR, AREA_LABELS, BUSINESS_SECTION_LABELS } from "@/lib/enums";
import type { Area, BusinessSection } from "@/lib/enums";
import type { TransactionDTO } from "@/lib/types";
import { TransactionForm } from "./transaction-form";

const PAGE = 50;

export function TransactionList({
  area,
  businessSection,
  period = "MONTH",
  showPeriodSwitch = true,
  title = "Transakcje",
  allowIncome = true,
}: {
  area?: Area;
  businessSection?: BusinessSection;
  period?: PeriodKey;
  showPeriodSwitch?: boolean;
  title?: string;
  allowIncome?: boolean;
}) {
  const { dataVersion, refresh } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [p, setP] = React.useState<PeriodKey>(period);
  const [txs, setTxs] = React.useState<TransactionDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [limit, setLimit] = React.useState(PAGE);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TransactionDTO | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { start, end } = rangeForPeriod(p);
    const qs = new URLSearchParams({
      from: start.toISOString(),
      to: end.toISOString(),
    });
    if (area) qs.set("area", area);
    if (businessSection) qs.set("businessSection", businessSection);
    try {
      setTxs(await api<TransactionDTO[]>(`/api/transactions?${qs}`));
    } finally {
      setLoading(false);
    }
  }, [p, area, businessSection]);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  React.useEffect(() => setLimit(PAGE), [p, area, businessSection]);

  async function remove(tx: TransactionDTO) {
    const ok = await confirm({
      title: "Usunąć transakcję?",
      description: `${formatPLN(tx.amount)} — ${tx.description ?? tx.category ?? "bez opisu"}`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    setTxs((prev) => prev.filter((t) => t.id !== tx.id));
    try {
      const res = await api<{ revertedToPending: boolean }>(`/api/transactions/${tx.id}`, {
        method: "DELETE",
      });
      toast(
        res.revertedToPending
          ? "Usunięto — koszt stały wrócił do zatwierdzenia"
          : "Usunięto"
      );
      refresh();
    } catch (e: any) {
      toast(e.message, "error");
      load();
    }
  }

  const visible = txs.slice(0, limit);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Dodaj
        </Button>
      </div>

      {showPeriodSwitch && (
        <SegmentedControl<PeriodKey>
          value={p}
          onChange={setP}
          options={[
            { value: "DAY", label: "Dzień" },
            { value: "WEEK", label: "Tydzień" },
            { value: "MONTH", label: "Miesiąc" },
            { value: "QUARTER", label: "3 mies." },
            { value: "YEAR", label: "Rok" },
            { value: "ALL", label: "Wszystko" },
          ]}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : txs.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Brak transakcji"
          description="W tym okresie nic nie zapisano."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Dodaj pierwszą
            </Button>
          }
        />
      ) : (
        <>
          {/* Na mobile karty, nie tabela — żadnego poziomego scrolla (§11) */}
          <div className="flex flex-col gap-1.5">
            {visible.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 pl-3"
              >
                <span
                  className={cn("h-2.5 w-2.5 shrink-0 rounded-full", AREA_COLOR[tx.area].dot)}
                  aria-label={AREA_LABELS[tx.area]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.description || tx.category || "Bez opisu"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="tnum">{new Date(tx.date).toLocaleDateString("pl-PL")}</span>
                    {tx.category && ` · ${tx.category}`}
                    {tx.businessSection && ` · ${BUSINESS_SECTION_LABELS[tx.businessSection]}`}
                  </p>
                </div>
                <span
                  className={cn(
                    "tnum shrink-0 text-sm font-semibold",
                    tx.kind === "INCOME" ? "text-success" : ""
                  )}
                >
                  {tx.kind === "INCOME"
                    ? formatPLN(tx.amount, { sign: true })
                    : formatPLN(-Number(tx.amount))}
                </span>
                <button
                  onClick={() => {
                    setEditing(tx);
                    setFormOpen(true);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(tx)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {txs.length > limit && (
            <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
              Pokaż więcej ({txs.length - limit})
            </Button>
          )}
        </>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          load();
          refresh();
        }}
        initial={editing}
        defaultArea={area ?? "BIZNES"}
        defaultSection={businessSection}
        allowIncome={allowIncome}
      />
    </section>
  );
}
