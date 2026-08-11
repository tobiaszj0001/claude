"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AREAS,
  AREA_LABELS,
  BUSINESS_SECTIONS,
  BUSINESS_SECTION_LABELS,
} from "@/lib/enums";
import type { Area, BusinessSection } from "@/lib/enums";
import type { TransactionDTO } from "@/lib/types";

const CATEGORIES: Record<Area, string[]> = {
  BIZNES: ["Abonament", "Wdrożenie", "Konsultacje", "Reklamy", "Narzędzia", "Koszt stały", "Inne"],
  SPORT: ["Siłownia", "Suplementy", "Sprzęt", "Odzież", "Koszt stały", "Inne"],
  ZYCIE: ["Jedzenie", "Mieszkanie", "Transport", "Rozrywka", "Koszt stały", "Inne"],
};

function toDateInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TransactionForm({
  open,
  onClose,
  onSaved,
  initial,
  defaultArea = "BIZNES",
  defaultSection,
  allowIncome = true,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: TransactionDTO | null;
  defaultArea?: Area;
  defaultSection?: BusinessSection;
  allowIncome?: boolean;
}) {
  const toast = useToast();
  const [kind, setKind] = React.useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(toDateInput());
  const [area, setArea] = React.useState<Area>(defaultArea);
  const [section, setSection] = React.useState<BusinessSection>(defaultSection ?? "SOCIAL_MEDIA");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    if (initial) {
      setKind(initial.kind);
      setAmount(initial.amount);
      setDate(toDateInput(initial.date));
      setArea(initial.area);
      setSection((initial.businessSection as BusinessSection) ?? "SOCIAL_MEDIA");
      setCategory(initial.category ?? "");
      setDescription(initial.description ?? "");
    } else {
      setKind("EXPENSE");
      setAmount("");
      setDate(toDateInput());
      setArea(defaultArea);
      setSection(defaultSection ?? "SOCIAL_MEDIA");
      setCategory("");
      setDescription("");
    }
  }, [open, initial, defaultArea, defaultSection]);

  // Przychód istnieje tylko w Biznesie (§2) — pilnujemy tego też w UI.
  React.useEffect(() => {
    if (area !== "BIZNES" && kind === "INCOME") setKind("EXPENSE");
  }, [area, kind]);

  async function save() {
    setErr(null);
    const n = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Podaj poprawną kwotę");
      return;
    }
    const [y, m, d] = date.split("-").map(Number);
    const payload = {
      kind,
      amount: n,
      date: new Date(y, m - 1, d, 12).toISOString(),
      area,
      businessSection: area === "BIZNES" ? section : null,
      category: category || null,
      description: description.trim() || null,
    };
    setSaving(true);
    try {
      if (initial) {
        await api(`/api/transactions/${initial.id}`, { method: "PUT", json: payload });
        toast("Zapisano zmiany");
      } else {
        await api("/api/transactions", { method: "POST", json: payload });
        toast("Dodano");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const canIncome = allowIncome && area === "BIZNES";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edytuj transakcję" : "Dodaj transakcję"}
      footer={
        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : initial ? "Zapisz zmiany" : "Dodaj"}
        </Button>
      }
    >
      <div className="space-y-4">
        {canIncome && (
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["EXPENSE", "INCOME"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-md py-2 text-sm font-medium transition-colors",
                  kind === k
                    ? k === "INCOME"
                      ? "bg-card text-success shadow-sm"
                      : "bg-card text-danger shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {k === "INCOME" ? "Przychód" : "Koszt"}
              </button>
            ))}
          </div>
        )}

        <div>
          <Label>Kwota (zł)</Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="tnum text-xl font-semibold"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Obszar</Label>
            <Select value={area} onChange={(e) => setArea(e.target.value as Area)}>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {AREA_LABELS[a]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {area === "BIZNES" && (
          <div>
            <Label>Podzakładka</Label>
            <Select value={section} onChange={(e) => setSection(e.target.value as BusinessSection)}>
              {BUSINESS_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {BUSINESS_SECTION_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label>Kategoria</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— brak —</option>
            {CATEGORIES[area].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Opis</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Czego dotyczy?"
          />
        </div>

        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
