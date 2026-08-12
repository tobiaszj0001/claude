"use client";

import * as React from "react";
import { Plus, X, Copy, RotateCcw, Dumbbell, Search, ChevronDown } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS } from "@/lib/enums";
import { NumberField } from "./number-field";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  isMachine: boolean;
  note: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
};
type Template = {
  id: string;
  name: string;
  items: { exerciseId: string; targetSets: number | null; targetReps: number | null; exercise: Exercise }[];
};
type SetDraft = { reps: string; weight: string; difficulty: string };
type ExDraft = {
  exercise: Exercise;
  sets: SetDraft[];
  /** Co robiłem ostatnim razem — podpowiedź „od czego zacząć" (§7.2). */
  last?: { maxWeight: number; maxReps: number; date: string } | null;
  lastSets?: { reps: number; weight: number | null }[];
};

type ExistingWorkout = {
  id: string;
  date: string;
  name: string | null;
  durationMin: number | null;
  sets: {
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: string | null;
    difficulty: number | null;
    exercise: { id: string; name: string; muscleGroup: string };
  }[];
};

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function WorkoutLogger({
  open,
  onClose,
  onSaved,
  template,
  workoutId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  template?: Template | null;
  /** Ustawione = edycja istniejącego treningu zamiast tworzenia nowego. */
  workoutId?: string | null;
}) {
  const toast = useToast();
  const { refresh } = useApp();
  const [date, setDate] = React.useState(todayInput());
  const [name, setName] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [drafts, setDrafts] = React.useState<ExDraft[]>([]);
  const [picker, setPicker] = React.useState(false);
  // Trudność domyślnie schowana — przy trzech polach seria nie mieści się
  // w jednej linii na 375 px, a RPE i tak rzadko notuje się przy każdej serii.
  const [showDifficulty, setShowDifficulty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Wypełnij z istniejącego treningu (edycja) albo z szablonu.
  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    setDate(todayInput());
    setDuration("");

    if (workoutId) {
      setLoading(true);
      api<ExistingWorkout>(`/api/workouts/${workoutId}`)
        .then((w) => {
          const d = new Date(w.date);
          setDate(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
          );
          setName(w.name ?? "");
          setDuration(w.durationMin ? String(w.durationMin) : "");

          // Grupujemy serie po ćwiczeniu, zachowując kolejność wystąpienia.
          const order: string[] = [];
          const byEx = new Map<string, ExistingWorkout["sets"]>();
          for (const st of w.sets) {
            if (!byEx.has(st.exerciseId)) {
              byEx.set(st.exerciseId, []);
              order.push(st.exerciseId);
            }
            byEx.get(st.exerciseId)!.push(st);
          }
          const loaded: ExDraft[] = order.map((exId) => {
            const sets = byEx.get(exId)!;
            return {
              exercise: {
                id: exId,
                name: sets[0].exercise.name,
                muscleGroup: sets[0].exercise.muscleGroup,
                isMachine: false,
                note: null,
                defaultSets: null,
                defaultReps: null,
              },
              sets: sets
                .slice()
                .sort((a, b) => a.setNumber - b.setNumber)
                .map((st) => ({
                  reps: String(st.reps),
                  weight: st.weight != null ? String(Number(st.weight)) : "",
                  difficulty: st.difficulty != null ? String(st.difficulty) : "",
                })),
            };
          });
          setDrafts(loaded);
          // Jeśli w zapisanym treningu jest trudność, pokaż od razu kolumnę.
          if (w.sets.some((st) => st.difficulty != null)) setShowDifficulty(true);
        })
        .catch(() => setErr("Nie udało się wczytać treningu"))
        .finally(() => setLoading(false));
      return;
    }

    if (template) {
      setName(template.name);
      const init = template.items.map((i) => ({
        exercise: i.exercise,
        sets: Array.from({ length: i.targetSets ?? 3 }, () => ({
          reps: String(i.targetReps ?? i.exercise.defaultReps ?? 10),
          weight: "",
          difficulty: "",
        })),
      }));
      setDrafts(init);
      init.forEach((d, idx) => hydrateLast(d.exercise.id, idx));
    } else {
      setName("");
      setDrafts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template, workoutId]);

  /** Dociąga ostatnią sesję ćwiczenia, żeby pokazać punkt wyjścia. */
  async function hydrateLast(exerciseId: string, index: number) {
    try {
      const st = await api<{
        series: { date: string; maxWeight: number; maxReps: number }[];
        history: { sets: { reps: number; weight: string | null }[] }[];
      }>(`/api/exercises/${exerciseId}/stats`);
      const last = st.series.length ? st.series[st.series.length - 1] : null;
      const lastSets = st.history[0]?.sets.map((s) => ({
        reps: s.reps,
        weight: s.weight ? Number(s.weight) : null,
      }));
      setDrafts((prev) =>
        prev.map((d, i) =>
          i === index ? { ...d, last, lastSets } : d
        )
      );
    } catch {
      /* brak historii to nie błąd */
    }
  }

  function addExercise(ex: Exercise) {
    setDrafts((prev) => [
      ...prev,
      {
        exercise: ex,
        sets: Array.from({ length: ex.defaultSets ?? 3 }, () => ({
          reps: String(ex.defaultReps ?? 10),
          weight: "",
          difficulty: "",
        })),
      },
    ]);
    setPicker(false);
    hydrateLast(ex.id, drafts.length);
  }

  const update = (ei: number, si: number, patch: Partial<SetDraft>) =>
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === ei ? { ...d, sets: d.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : d
      )
    );

  /** „Powtórz poprzednią serię" (§7.2). */
  const repeatLastSet = (ei: number) =>
    setDrafts((prev) =>
      prev.map((d, i) => {
        if (i !== ei) return d;
        const last = d.sets[d.sets.length - 1] ?? { reps: "10", weight: "", difficulty: "" };
        return { ...d, sets: [...d.sets, { ...last }] };
      })
    );

  /** „Skopiuj poprzedni trening tego ćwiczenia" (§7.2). */
  const copyPrevious = (ei: number) =>
    setDrafts((prev) =>
      prev.map((d, i) => {
        if (i !== ei || !d.lastSets?.length) return d;
        return {
          ...d,
          sets: d.lastSets.map((s) => ({
            reps: String(s.reps),
            weight: s.weight != null ? String(s.weight) : "",
            difficulty: "",
          })),
        };
      })
    );

  const removeSet = (ei: number, si: number) =>
    setDrafts((prev) =>
      prev.map((d, i) => (i === ei ? { ...d, sets: d.sets.filter((_, j) => j !== si) } : d))
    );

  const removeExercise = (ei: number) =>
    setDrafts((prev) => prev.filter((_, i) => i !== ei));

  async function save() {
    setErr(null);
    const sets = drafts.flatMap((d) =>
      d.sets
        .map((s, i) => ({
          exerciseId: d.exercise.id,
          setNumber: i + 1,
          reps: parseInt(s.reps, 10),
          weight: s.weight ? parseFloat(s.weight.replace(",", ".")) : null,
          difficulty: s.difficulty ? parseInt(s.difficulty, 10) : null,
        }))
        .filter((s) => Number.isFinite(s.reps) && s.reps > 0)
    );
    if (sets.length === 0) {
      setErr("Dodaj przynajmniej jedną serię z liczbą powtórzeń");
      return;
    }
    const [y, m, d] = date.split("-").map(Number);
    setSaving(true);
    try {
      const payload = {
        date: new Date(y, m - 1, d, 18).toISOString(),
        name: name.trim() || null,
        templateId: template?.id ?? null,
        durationMin: duration ? parseInt(duration, 10) : null,
        sets,
      };
      if (workoutId) {
        await api(`/api/workouts/${workoutId}`, { method: "PUT", json: payload });
      } else {
        await api("/api/workouts", { method: "POST", json: payload });
      }
      toast(workoutId ? "Zmiany zapisane" : "Trening zapisany");
      onSaved();
      refresh();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const totalSets = drafts.reduce((a, d) => a + d.sets.length, 0);
  const totalVolume = drafts.reduce(
    (a, d) =>
      a +
      d.sets.reduce(
        (b, s) => b + (parseInt(s.reps, 10) || 0) * (parseFloat(s.weight.replace(",", ".")) || 0),
        0
      ),
    0
  );

  return (
    <>
      <Sheet
        open={open && !picker}
        onClose={onClose}
        title={workoutId ? "Edytuj trening" : template ? `Trening: ${template.name}` : "Nowy trening"}
        footer={
          <div className="flex flex-col gap-2">
            {totalSets > 0 && (
              <p className="tnum text-center text-xs text-muted-foreground">
                {drafts.length} ćw · {totalSets} serii · objętość{" "}
                {Math.round(totalVolume).toLocaleString("pl-PL")} kg
              </p>
            )}
            {/* Dodawanie ćwiczenia musi być w stopce, nie tylko pod listą:
                przy treningu z szablonu przycisk na dole był 1800 px niżej,
                poza ekranem, więc nie dało się go znaleźć w trakcie ćwiczeń. */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => setPicker(true)}
                aria-label="Dodaj ćwiczenie"
              >
                <Plus className="h-4 w-4" />
                Ćwiczenie
              </Button>
              <Button className="flex-1" size="lg" onClick={save} disabled={saving}>
                {saving ? "Zapisywanie…" : workoutId ? "Zapisz zmiany" : "Zapisz trening"}
              </Button>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Czas (min)</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                inputMode="numeric"
                placeholder="—"
                className="tnum"
              />
            </div>
          </div>
          <div>
            <Label>Nazwa treningu</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Góra A"
            />
          </div>

          {drafts.map((d, ei) => (
            <div key={`${d.exercise.id}-${ei}`} className="rounded-lg border border-border p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.exercise.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.exercise.muscleGroup}
                    {d.exercise.isMachine && " · maszyna"}
                  </p>
                  {d.exercise.note && (
                    <p className="mt-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {d.exercise.note}
                    </p>
                  )}
                  {d.last && (
                    <p className="tnum mt-1 text-xs text-sport">
                      Ostatnio: {d.last.maxWeight ? `${d.last.maxWeight} kg` : "—"} ×{" "}
                      {d.last.maxReps}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeExercise(ei)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                  aria-label="Usuń ćwiczenie"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {ei === 0 && (
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showDifficulty}
                    onChange={(e) => setShowDifficulty(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--accent))]"
                  />
                  Notuj trudność (1–10)
                </label>
              )}
              <div className="mt-3 space-y-1.5">
                {/* Wiersz serii zawija się na wąskim ekranie: powtórzenia
                    i ciężar zostają obok siebie, trudność schodzi niżej —
                    zamiast ściskać wszystkie trzy do nieczytelności. */}
                {d.sets.map((s, si) => (
                  <div
                    key={si}
                    className="flex flex-wrap items-end gap-x-1.5 gap-y-1"
                  >
                    <span className="tnum w-3.5 shrink-0 pb-3 text-center text-xs font-semibold text-muted-foreground">
                      {si + 1}
                    </span>
                    <NumberField
                      label={si === 0 ? "Powtórzenia" : undefined}
                      value={s.reps}
                      onChange={(v) => update(ei, si, { reps: v })}
                    />
                    <NumberField
                      label={si === 0 ? "Ciężar (kg)" : undefined}
                      value={s.weight}
                      onChange={(v) => update(ei, si, { weight: v })}
                      step={2.5}
                      decimal
                    />
                    {/* Stała szerokość: bez min-w-0 input rozpycha się do
                        swojej domyślnej wielkości i zjada całą linię. */}
                    {showDifficulty && (
                      <NumberField
                        className="w-24 min-w-0 flex-none"
                        label={si === 0 ? "Trudność" : undefined}
                        value={s.difficulty}
                        onChange={(v) => update(ei, si, { difficulty: v })}
                        min={1}
                        max={10}
                        compact
                      />
                    )}
                    <button
                      onClick={() => removeSet(ei, si)}
                      className="flex h-11 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-danger"
                      aria-label={`Usuń serię ${si + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => repeatLastSet(ei)}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Powtórz serię
                </Button>
                {d.lastSets?.length ? (
                  <Button size="sm" variant="secondary" onClick={() => copyPrevious(ei)}>
                    <Copy className="h-3.5 w-3.5" />
                    Skopiuj poprzedni
                  </Button>
                ) : null}
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={() => setPicker(true)}>
            <Plus className="h-4 w-4" />
            Dodaj ćwiczenie
          </Button>

          {err && <p className="text-sm text-danger">{err}</p>}
        </div>
        )}
      </Sheet>

      <ExercisePicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={addExercise}
      />
    </>
  );
}

/** Wybór ćwiczenia z wyszukiwarką; można od razu dodać nowe (§7.2). */
export function ExercisePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ex: Exercise) => void;
}) {
  const [list, setList] = React.useState<Exercise[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newGroup, setNewGroup] = React.useState<string>("klatka");
  const [newMachine, setNewMachine] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setCreating(false);
    setLoading(true);
    api<Exercise[]>("/api/exercises")
      .then(setList)
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = list.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));

  async function createAndPick() {
    if (!newName.trim()) return;
    try {
      const ex = await api<Exercise>("/api/exercises", {
        method: "POST",
        json: { name: newName.trim(), muscleGroup: newGroup, isMachine: newMachine },
      });
      toast("Dodano ćwiczenie");
      onPick(ex);
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Wybierz ćwiczenie">
      {creating ? (
        <div className="space-y-4">
          <div>
            <Label>Nazwa</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          </div>
          <div>
            <Label>Partia mięśniowa</Label>
            <Select value={newGroup} onChange={(e) => setNewGroup(e.target.value)}>
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
              checked={newMachine}
              onChange={(e) => setNewMachine(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--accent))]"
            />
            To maszyna
          </label>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCreating(false)}>
              Wstecz
            </Button>
            <Button className="flex-1" onClick={createAndPick}>
              Dodaj i użyj
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Szukaj ćwiczenia…"
              className="pl-9"
              autoFocus
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onPick(ex)}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <Dumbbell className="h-4 w-4 shrink-0 text-sport" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{ex.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {ex.muscleGroup}
                      {ex.isMachine && " · maszyna"}
                    </span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Brak wyników dla „{q}".
                </p>
              )}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setNewName(q);
              setCreating(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nowe ćwiczenie
          </Button>
        </div>
      )}
    </Sheet>
  );
}
