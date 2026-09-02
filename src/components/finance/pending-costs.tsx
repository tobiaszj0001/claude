"use client";

import * as React from "react";
import { Check, X, Clock, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN } from "@/lib/money";
import { AREA_COLOR, AREA_LABELS } from "@/lib/enums";
import type { Area } from "@/lib/enums";

type Entry = {
  id: string;
  month: string;
  suggestedDate: string;
  fixedCost: {
    id: string;
    name: string;
    amount: string;
    area: Area;
    dayOfMonth: number;
  };
};

const MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
function toDateInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PendingCosts() {
  const { dataVersion, refresh } = useApp();
  const toast = useToast();
  const confirm = useConfirm();
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Entry | null>(null);

  const load = React.useCallback(async () => {
    try {
      setEntries(await api<Entry[]>("/api/fixed-costs/entries"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  async function act(entry: Entry, action: "confirm" | "skip", override?: { amount?: number; date?: string }) {
    setBusy(entry.id);
    // Optymistycznie znikamy pozycję z listy.
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    try {
      await api(`/api/fixed-costs/entries/${entry.id}`, {
        method: "POST",
        json: { action, ...override },
      });
      toast(action === "confirm" ? "Zaksięgowano" : "Pominięto w tym miesiącu");
      refresh();
    } catch (e: any) {
      toast(e.message, "error");
      load();
    } finally {
      setBusy(null);
    }
  }

  async function confirmAll() {
    const ok = await confirm({
      title: `Zatwierdzić ${entries.length}?`,
      description: "Wszystkie oczekujące koszty zostaną zaksięgowane z domyślną kwotą i datą.",
      confirmLabel: "Zatwierdź wszystkie",
    });
    if (!ok) return;
    setBusy("all");
    try {
      const res = await api<{ confirmed: number }>("/api/fixed-costs/entries/confirm-all", {
        method: "POST",
      });
      toast(`Zaksięgowano ${res.confirmed}`);
      refresh();
      load();
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  if (entries.length === 0) return null;

  return (
    <section id="do-zatwierdzenia" className="flex scroll-mt-4 flex-col gap-3">
      {/* Zawijamy: przy 375 px nagłówek i przycisk nie mieszczą się w rzędzie,
          a ściśnięty „Zatwierdź wszystkie" łamał się na dwie linie. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="flex shrink-0 items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 shrink-0 text-warning" />
          <span className="whitespace-nowrap">Do zatwierdzenia</span>
          <span className="tnum rounded-full bg-warning px-2 py-0.5 text-xs font-bold text-white">
            {entries.length}
          </span>
        </h2>
        {entries.length > 1 && (
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto whitespace-nowrap"
            onClick={confirmAll}
            disabled={busy === "all"}
          >
            {busy === "all" ? "Księgowanie…" : "Zatwierdź wszystkie"}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Te koszty nie wliczają się do stanu konta, dopóki ich nie zatwierdzisz.
      </p>

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <Card key={e.id} className={cn("p-3", busy === e.id && "opacity-50")}>
            <div className="flex items-start gap-2">
              <span
                className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", AREA_COLOR[e.fixedCost.area].dot)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.fixedCost.name}</p>
                <p className="text-xs text-muted-foreground">
                  {AREA_LABELS[e.fixedCost.area]} · {monthLabel(e.month)}
                </p>
              </div>
              <span className="tnum shrink-0 text-lg font-semibold">
                {formatPLN(e.fixedCost.amount)}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => act(e, "confirm")}
                disabled={!!busy}
              >
                <Check className="h-4 w-4" />
                Zatwierdź
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(e)}
                disabled={!!busy}
                aria-label="Zmień kwotę lub datę"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => act(e, "skip")}
                disabled={!!busy}
              >
                <X className="h-4 w-4" />
                Pomiń
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <EditBeforeConfirm
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(amount, date) => {
          const e = editing!;
          setEditing(null);
          act(e, "confirm", { amount, date });
        }}
      />
    </section>
  );
}

/** Zmiana kwoty i daty dotyczy tylko tego miesiąca — definicja zostaje. */
function EditBeforeConfirm({
  entry,
  onClose,
  onSave,
}: {
  entry: Entry | null;
  onClose: () => void;
  onSave: (amount: number, date: string) => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entry) return;
    setAmount(entry.fixedCost.amount);
    setDate(toDateInput(entry.suggestedDate));
    setErr(null);
  }, [entry]);

  function save() {
    const n = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Podaj poprawną kwotę");
      return;
    }
    if (!date) {
      setErr("Podaj datę");
      return;
    }
    const [y, m, d] = date.split("-").map(Number);
    onSave(n, new Date(y, m - 1, d, 12).toISOString());
  }

  return (
    <Sheet
      open={!!entry}
      onClose={onClose}
      title={entry ? entry.fixedCost.name : ""}
      footer={
        <Button className="w-full" size="lg" onClick={save}>
          Zatwierdź
        </Button>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Zmiana dotyczy tylko tego miesiąca. Definicja kosztu stałego zostaje bez zmian.
      </p>
      <div className="space-y-4">
        <div>
          <Label>Kwota (zł)</Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            autoFocus
          />
        </div>
        <div>
          <Label>Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
