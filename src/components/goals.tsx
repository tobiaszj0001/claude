"use client";

import * as React from "react";
import { Target, Plus, Pencil, Trash2, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox, EmptyState, Spinner } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AREA_COLOR, PERIOD_LABELS, PERIODS } from "@/lib/enums";
import type { Area, BusinessSection, Period } from "@/lib/enums";

type Goal = {
  id: string;
  area: Area;
  businessSection: BusinessSection | null;
  title: string;
  description: string | null;
  period: Period;
  isMainFocus: boolean;
  done: boolean;
};

export function Goals({
  area,
  businessSection,
}: {
  area: Area;
  businessSection?: BusinessSection;
}) {
  const { dataVersion } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Goal | null>(null);

  const load = React.useCallback(async () => {
    const qs = new URLSearchParams({ area });
    if (businessSection) qs.set("businessSection", businessSection);
    try {
      setGoals(await api<Goal[]>(`/api/goals?${qs}`));
    } finally {
      setLoading(false);
    }
  }, [area, businessSection]);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  async function toggleDone(g: Goal) {
    setGoals((prev) => prev.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)));
    try {
      await api(`/api/goals/${g.id}`, { method: "PATCH", json: { done: !g.done } });
    } catch {
      toast("Nie udało się zapisać", "error");
      load();
    }
  }

  async function setMain(g: Goal) {
    try {
      await api(`/api/goals/${g.id}`, { method: "PATCH", json: { isMainFocus: !g.isMainFocus } });
      toast(g.isMainFocus ? "Zdjęto wyróżnienie" : "Ustawiono jako główny cel");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  async function remove(g: Goal) {
    const ok = await confirm({
      title: "Usunąć cel?",
      description: `„${g.title}" zostanie trwale usunięty.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    setGoals((prev) => prev.filter((x) => x.id !== g.id));
    try {
      await api(`/api/goals/${g.id}`, { method: "DELETE" });
      toast("Usunięto");
    } catch {
      toast("Nie udało się usunąć", "error");
      load();
    }
  }

  const main = goals.find((g) => g.isMainFocus && !g.done);
  const rest = goals.filter((g) => g.id !== main?.id);
  const color = AREA_COLOR[area];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5 text-muted-foreground" />
          Cele i założenia
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
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Brak celów"
          description="Zapisz, na czym chcesz się skupić."
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
        <>
          {/* Główny cel — wyróżniona karta na górze (§9) */}
          {main && (
            <div
              className={cn("rounded-lg border p-4", color.border, color.bg)}
              data-main-focus
            >
              <div className="flex items-start gap-2">
                <Star className={cn("mt-0.5 h-4 w-4 shrink-0", color.text)} fill="currentColor" />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11px] font-bold uppercase tracking-wider", color.text)}>
                    Główny cel
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">{main.title}</p>
                  {main.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{main.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {PERIOD_LABELS[main.period]}
                  </p>
                </div>
                <button
                  onClick={() => toggleDone(main)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-card"
                  aria-label="Odhacz cel"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(main);
                    setOpen(true);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-card"
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {rest.map((g) => (
              <div
                key={g.id}
                className={cn(
                  "flex items-center gap-1 rounded-lg border border-border bg-card p-1",
                  g.done && "opacity-55"
                )}
              >
                <Checkbox
                  checked={g.done}
                  onChange={() => toggleDone(g)}
                  ariaLabel={`Odhacz ${g.title}`}
                />
                <div className="min-w-0 flex-1 py-1">
                  <p className={cn("truncate font-medium", g.done && "line-through")}>{g.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {PERIOD_LABELS[g.period]}
                  </p>
                </div>
                <button
                  onClick={() => setMain(g)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-muted",
                    g.isMainFocus ? color.text : "text-muted-foreground"
                  )}
                  aria-label="Ustaw jako główny cel"
                  title="Ustaw jako główny cel"
                >
                  <Star className="h-4 w-4" fill={g.isMainFocus ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => {
                    setEditing(g);
                    setOpen(true);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(g)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <GoalForm
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        area={area}
        businessSection={businessSection}
        onSaved={load}
      />
    </section>
  );
}

function GoalForm({
  open,
  onClose,
  initial,
  area,
  businessSection,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Goal | null;
  area: Area;
  businessSection?: BusinessSection;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [period, setPeriod] = React.useState<Period>("MONTH");
  const [isMain, setIsMain] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPeriod(initial?.period ?? "MONTH");
    setIsMain(initial?.isMainFocus ?? false);
  }, [open, initial]);

  async function save() {
    if (!title.trim()) {
      setErr("Podaj tytuł");
      return;
    }
    const payload = {
      area,
      businessSection: area === "BIZNES" ? businessSection ?? null : null,
      title: title.trim(),
      description: description.trim() || null,
      period,
      isMainFocus: isMain,
      done: initial?.done ?? false,
    };
    setSaving(true);
    try {
      if (initial) {
        await api(`/api/goals/${initial.id}`, { method: "PUT", json: payload });
        toast("Zapisano zmiany");
      } else {
        await api("/api/goals", { method: "POST", json: payload });
        toast("Dodano cel");
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
      title={initial ? "Edytuj cel" : "Nowy cel"}
      footer={
        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : "Zapisz"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Cel</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Co chcesz osiągnąć?"
            autoFocus
          />
        </div>
        <div>
          <Label>Opis (opcjonalnie)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div>
          <Label>Horyzont</Label>
          <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--accent))]"
          />
          Główny cel — wyróżniony na górze zakładki
        </label>
        <p className="text-xs text-muted-foreground">
          Główny cel może być tylko jeden w obszarze. Ustawienie nowego zdejmie wyróżnienie
          z poprzedniego.
        </p>
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
