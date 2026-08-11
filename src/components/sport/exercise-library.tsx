"use client";

import * as React from "react";
import { Search, Plus, Dumbbell, Archive, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS } from "@/lib/enums";
import { ExerciseCard } from "./exercise-card";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  isMachine: boolean;
  equipment: string | null;
  note: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  archived: boolean;
};

/** „Moje ćwiczenia" — lista z filtrem po partii i wyszukiwarką (§7.2). */
export function ExerciseLibrary() {
  const confirm = useConfirm();
  const toast = useToast();
  const [list, setList] = React.useState<Exercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [group, setGroup] = React.useState<string>("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Exercise | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setList(await api<Exercise[]>("/api/exercises"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = list.filter(
    (e) =>
      (!group || e.muscleGroup === group) &&
      e.name.toLowerCase().includes(q.toLowerCase())
  );

  async function archive(ex: Exercise) {
    const ok = await confirm({
      title: "Zarchiwizować ćwiczenie?",
      description: `„${ex.name}" zniknie z listy wyboru, ale cała historia treningów zostaje.`,
      confirmLabel: "Archiwizuj",
    });
    if (!ok) return;
    try {
      await api(`/api/exercises/${ex.id}`, { method: "DELETE" });
      toast("Zarchiwizowano");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Moje ćwiczenia</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Dodaj
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj…"
          className="pl-9"
        />
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        <Chip active={!group} onClick={() => setGroup("")}>
          Wszystkie
        </Chip>
        {MUSCLE_GROUPS.map((g) => (
          <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
            {g}
          </Chip>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Brak ćwiczeń"
          description={q || group ? "Zmień filtr albo dodaj nowe." : "Dodaj pierwsze ćwiczenie."}
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Dodaj ćwiczenie
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 pl-3"
            >
              <button
                onClick={() => setOpenId(ex.id)}
                className="min-w-0 flex-1 py-2 text-left"
              >
                <span className="block truncate text-sm font-medium">{ex.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {ex.muscleGroup}
                  {ex.isMachine && " · maszyna"}
                  {ex.note ? ` · ${ex.note}` : ""}
                </span>
              </button>
              <button
                onClick={() => {
                  setEditing(ex);
                  setFormOpen(true);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Edytuj"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => archive(ex)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Archiwizuj"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ExerciseCard id={openId} onClose={() => setOpenId(null)} />
      <ExerciseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSaved={load}
      />
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-sport bg-sport/10 text-sport" : "border-border text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ExerciseForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Exercise | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [group, setGroup] = React.useState("klatka");
  const [isMachine, setIsMachine] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [sets, setSets] = React.useState("");
  const [reps, setReps] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    setName(initial?.name ?? "");
    setGroup(initial?.muscleGroup ?? "klatka");
    setIsMachine(initial?.isMachine ?? false);
    setNote(initial?.note ?? "");
    setSets(initial?.defaultSets ? String(initial.defaultSets) : "");
    setReps(initial?.defaultReps ? String(initial.defaultReps) : "");
  }, [open, initial]);

  async function save() {
    if (!name.trim()) {
      setErr("Podaj nazwę");
      return;
    }
    const payload = {
      name: name.trim(),
      muscleGroup: group,
      isMachine,
      note: note.trim() || null,
      defaultSets: sets ? parseInt(sets, 10) : null,
      defaultReps: reps ? parseInt(reps, 10) : null,
      archived: initial?.archived ?? false,
    };
    setSaving(true);
    try {
      if (initial) {
        await api(`/api/exercises/${initial.id}`, { method: "PUT", json: payload });
        toast("Zapisano zmiany");
      } else {
        await api("/api/exercises", { method: "POST", json: payload });
        toast("Dodano ćwiczenie");
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
      title={initial ? "Edytuj ćwiczenie" : "Nowe ćwiczenie"}
      footer={
        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : "Zapisz"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Nazwa</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Partia mięśniowa</Label>
          <Select value={group} onChange={(e) => setGroup(e.target.value)}>
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={isMachine}
            onChange={(e) => setIsMachine(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--accent))]"
          />
          To maszyna
        </label>
        <div>
          <Label>Notatka — technika, ustawienia maszyny</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="np. Siedzisko 4, chwyt szeroki"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Domyślne serie</Label>
            <Input
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              inputMode="numeric"
              className="tnum"
              placeholder="3"
            />
          </div>
          <div>
            <Label>Domyślne powt.</Label>
            <Input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              inputMode="numeric"
              className="tnum"
              placeholder="10"
            />
          </div>
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </Sheet>
  );
}
