"use client";

import * as React from "react";
import { Repeat, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPLN } from "@/lib/money";
import { AREAS, AREA_COLOR, AREA_LABELS, BUSINESS_SECTIONS, BUSINESS_SECTION_LABELS } from "@/lib/enums";
import type { Area, BusinessSection } from "@/lib/enums";

type FixedCost = {
  id: string;
  name: string;
  amount: string;
  area: Area;
  businessSection: BusinessSection | null;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
};

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function FixedCostManager() {
  const { dataVersion, refresh } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [costs, setCosts] = React.useState<FixedCost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FixedCost | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setCosts(await api<FixedCost[]>("/api/fixed-costs"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  async function remove(fc: FixedCost) {
    const ok = await confirm({
      title: "Usunąć koszt stały?",
      description: `„${fc.name}" przestanie się pojawiać. Już zaksięgowane transakcje zostają.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/fixed-costs/${fc.id}`, { method: "DELETE" });
      toast("Usunięto");
      load();
      refresh();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Repeat className="h-5 w-5 text-muted-foreground" />
          Koszty stałe
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Dodaj
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : costs.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Brak kosztów stałych"
          description="Dodaj powtarzalne wydatki — czynsz, karnet, subskrypcje."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Dodaj pierwszy
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {costs.map((fc) => (
            <div
              key={fc.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card p-2 pl-3",
                !fc.active && "opacity-50"
              )}
            >
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", AREA_COLOR[fc.area].dot)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {fc.name}
                  {!fc.active && " (wyłączony)"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {AREA_LABELS[fc.area]} · <span className="tnum">{fc.dayOfMonth}.</span> dnia
                  miesiąca
                </p>
              </div>
              <span className="tnum shrink-0 text-sm font-semibold">{formatPLN(fc.amount)}</span>
              <button
                onClick={() => {
                  setEditing(fc);
                  setOpen(true);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Edytuj"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(fc)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                aria-label="Usuń"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <FixedCostForm
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSaved={() => {
          load();
          refresh();
        }}
      />
    </section>
  );
}

function FixedCostForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: FixedCost | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [area, setArea] = React.useState<Area>("ZYCIE");
  const [section, setSection] = React.useState<BusinessSection>("SOCIAL_MEDIA");
  const [day, setDay] = React.useState("1");
  const [start, setStart] = React.useState(todayInput());
  const [active, setActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    if (initial) {
      setName(initial.name);
      setAmount(initial.amount);
      setArea(initial.area);
      setSection(initial.businessSection ?? "SOCIAL_MEDIA");
      setDay(String(initial.dayOfMonth));
      setStart(initial.startDate.slice(0, 10));
      setActive(initial.active);
    } else {
      setName("");
      setAmount("");
      setArea("ZYCIE");
      setSection("SOCIAL_MEDIA");
      setDay("1");
      setStart(todayInput());
      setActive(true);
    }
  }, [open, initial]);

  async function save() {
    setErr(null);
    const n = parseFloat(amount.replace(",", "."));
    const d = parseInt(day, 10);
    if (!name.trim()) return setErr("Podaj nazwę");
    if (!Number.isFinite(n) || n <= 0) return setErr("Podaj poprawną kwotę");
    if (!Number.isInteger(d) || d < 1 || d > 31) return setErr("Dzień miesiąca: 1–31");

    const [y, m, dd] = start.split("-").map(Number);
    const payload = {
      name: name.trim(),
      amount: n,
      area,
      businessSection: area === "BIZNES" ? section : null,
      dayOfMonth: d,
      startDate: new Date(y, m - 1, dd, 12).toISOString(),
      active,
    };
    setSaving(true);
    try {
      if (initial) {
        await api(`/api/fixed-costs/${initial.id}`, { method: "PUT", json: payload });
        toast("Zapisano zmiany");
      } else {
        await api("/api/fixed-costs", { method: "POST", json: payload });
        toast("Dodano koszt stały");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edytuj koszt stały" : "Nowy koszt stały"}
      footer={
        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : "Zapisz"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Nazwa</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Karnet na siłownię"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Kwota (zł)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="tnum"
            />
          </div>
          <div>
            <Label>Dzień miesiąca</Label>
            <Input
              value={day}
              onChange={(e) => setDay(e.target.value)}
              inputMode="numeric"
              className="tnum"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <Label>Obowiązuje od</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
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
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--accent))]"
          />
          Aktywny (pojawia się do zatwierdzenia co miesiąc)
        </label>
        <p className="text-xs text-muted-foreground">
          Koszt stały nie księguje się sam — co miesiąc pojawi się w sekcji „Do zatwierdzenia".
        </p>
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
