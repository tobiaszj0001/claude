"use client";

import * as React from "react";
import { Dumbbell, Plus, Trash2, Pencil, Search, Activity as ActivityIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { WorkoutSheet } from "@/components/calendar/workout-sheet";
import { WorkoutLogger } from "./workout-logger";

type WorkoutRow = {
  id: string;
  date: string;
  name: string | null;
  exerciseCount: number;
  setCount: number;
  volume: number;
};
type ActivityRow = { id: string; date: string; name: string; durationMin: number | null; note: string | null };
type Summary = {
  current: { workouts: number; activities: number; restDays: number; volume: number; sets: number };
  previous: { workouts: number; activities: number; restDays: number; volume: number; sets: number };
};

/** Tydzień w liczbach (§7.2). */
export function WeekSummary() {
  const { dataVersion } = useApp();
  const [s, setS] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    let alive = true;
    api<Summary>("/api/sport/summary").then((d) => alive && setS(d));
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const cur = s?.current;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-sport" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ten tydzień
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <Stat label="Treningi" value={cur?.workouts} prev={s?.previous.workouts} />
        <Stat label="Aktywności" value={cur?.activities} prev={s?.previous.activities} />
        <Stat label="Serie" value={cur?.sets} prev={s?.previous.sets} />
        <Stat label="Przerwy" value={cur?.restDays} prev={s?.previous.restDays} lowerIsBetter />
      </div>
      {cur && (
        <p className="tnum mt-3 text-sm text-muted-foreground">
          Objętość: <span className="font-semibold text-foreground">
            {cur.volume.toLocaleString("pl-PL")} kg
          </span>
        </p>
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  prev,
  lowerIsBetter,
}: {
  label: string;
  value?: number;
  prev?: number;
  lowerIsBetter?: boolean;
}) {
  const diff = value != null && prev != null ? value - prev : null;
  const good = diff == null || diff === 0 ? null : lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className="tnum text-xl font-bold">{value ?? "—"}</p>
      {diff != null && diff !== 0 && (
        <p className={cn("tnum text-[10px]", good ? "text-success" : "text-danger")}>
          {diff > 0 ? "+" : ""}
          {diff}
        </p>
      )}
    </div>
  );
}

/** Chronologiczna historia treningów z wyszukiwarką (§7.2). */
export function WorkoutHistory() {
  const { dataVersion, refresh } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [rows, setRows] = React.useState<WorkoutRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api<WorkoutRow[]>("/api/workouts?take=100"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  async function remove(w: WorkoutRow) {
    const ok = await confirm({
      title: "Usunąć trening?",
      description: `${w.name ?? "Trening"} z ${new Date(w.date).toLocaleDateString("pl-PL")} zostanie usunięty razem z seriami.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    setRows((p) => p.filter((x) => x.id !== w.id));
    try {
      await api(`/api/workouts/${w.id}`, { method: "DELETE" });
      toast("Usunięto");
      refresh();
    } catch {
      toast("Nie udało się usunąć", "error");
      load();
    }
  }

  const filtered = rows.filter((r) =>
    (r.name ?? "Trening").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Historia treningów</h2>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj po nazwie…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Dumbbell} title="Brak treningów" description="Zapisz pierwszy trening." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.slice(0, 50).map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 pl-3"
            >
              <button onClick={() => setOpenId(w.id)} className="min-w-0 flex-1 py-2 text-left">
                <span className="block truncate text-sm font-medium">{w.name ?? "Trening"}</span>
                <span className="tnum block truncate text-xs text-muted-foreground">
                  {new Date(w.date).toLocaleDateString("pl-PL")} · {w.exerciseCount} ćw ·{" "}
                  {w.setCount} serii · {Math.round(w.volume).toLocaleString("pl-PL")} kg
                </span>
              </button>
              <button
                onClick={() => setEditId(w.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Edytuj trening"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(w)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                aria-label="Usuń trening"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <WorkoutSheet
        id={openId}
        onClose={() => setOpenId(null)}
        onEdit={(id) => {
          setOpenId(null);
          setEditId(id);
        }}
      />
      <WorkoutLogger
        open={!!editId}
        workoutId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => {
          load();
          refresh();
        }}
      />
    </section>
  );
}

/** Dodatkowe aktywności fizyczne (§7.2). */
export function Activities() {
  const { dataVersion, refresh } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [rows, setRows] = React.useState<ActivityRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api<ActivityRow[]>("/api/activities?take=60"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, dataVersion]);

  async function remove(a: ActivityRow) {
    const ok = await confirm({
      title: "Usunąć aktywność?",
      description: `„${a.name}" z ${new Date(a.date).toLocaleDateString("pl-PL")}.`,
      confirmLabel: "Usuń",
      danger: true,
    });
    if (!ok) return;
    setRows((p) => p.filter((x) => x.id !== a.id));
    try {
      await api(`/api/activities/${a.id}`, { method: "DELETE" });
      toast("Usunięto");
      refresh();
    } catch {
      load();
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Dodatkowe aktywności</h2>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Dodaj
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="Brak aktywności"
          description="Bieganie, rower, basen, spacer — wszystko poza siłownią."
          action={<Button onClick={() => setOpen(true)}>Dodaj pierwszą</Button>}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.slice(0, 30).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 pl-3"
            >
              <ActivityIcon className="h-4 w-4 shrink-0 text-sport" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="tnum truncate text-xs text-muted-foreground">
                  {new Date(a.date).toLocaleDateString("pl-PL")}
                  {a.durationMin ? ` · ${a.durationMin} min` : ""}
                </p>
              </div>
              <button
                onClick={() => remove(a)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                aria-label="Usuń"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ActivityForm open={open} onClose={() => setOpen(false)} onSaved={load} />
    </section>
  );
}

function ActivityForm({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { refresh } = useApp();
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [dur, setDur] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const d = new Date();
    setName("");
    setDur("");
    setErr(null);
    setDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }, [open]);

  async function save() {
    if (!name.trim()) {
      setErr("Podaj nazwę");
      return;
    }
    const [y, m, d] = date.split("-").map(Number);
    setSaving(true);
    try {
      await api("/api/activities", {
        method: "POST",
        json: {
          name: name.trim(),
          date: new Date(y, m - 1, d, 12).toISOString(),
          durationMin: dur ? parseInt(dur, 10) : null,
        },
      });
      toast("Dodano aktywność");
      onSaved();
      refresh();
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
      title="Nowa aktywność"
      footer={
        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : "Dodaj"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Nazwa</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Bieganie"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Czas (min)</Label>
            <Input
              value={dur}
              onChange={(e) => setDur(e.target.value)}
              inputMode="numeric"
              className="tnum"
              placeholder="—"
            />
          </div>
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
