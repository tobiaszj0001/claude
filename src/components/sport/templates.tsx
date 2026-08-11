"use client";

import * as React from "react";
import { Play, Copy, Archive, LayoutList, Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { WorkoutLogger, ExercisePicker } from "./workout-logger";

type Exercise = { id: string; name: string; muscleGroup: string; isMachine: boolean; note: string | null; defaultSets: number | null; defaultReps: number | null };
type Item = { exerciseId: string; order: number; targetSets: number | null; targetReps: number | null; exercise: Exercise };
type Template = { id: string; name: string; description: string | null; items: Item[]; lastPerformed: string | null };

export function Templates({ onWorkoutSaved }: { onWorkoutSaved: () => void }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [list, setList] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState<Template | null>(null);
  const [editing, setEditing] = React.useState<Template | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setList(await api<Template[]>("/api/workout-templates"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function duplicate(t: Template) {
    try {
      await api(`/api/workout-templates/${t.id}`, { method: "POST", json: { action: "duplicate" } });
      toast("Zduplikowano");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  async function archive(t: Template) {
    const ok = await confirm({
      title: "Zarchiwizować szablon?",
      description: `„${t.name}" zniknie z listy. Wykonane treningi zostają.`,
      confirmLabel: "Archiwizuj",
    });
    if (!ok) return;
    try {
      await api(`/api/workout-templates/${t.id}`, { method: "DELETE" });
      toast("Zarchiwizowano");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Moje treningi</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Szablon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={LayoutList}
          title="Brak szablonów"
          description="Zbuduj trening raz i uruchamiaj go jednym kliknięciem."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            >
              Utwórz szablon
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="tnum">{t.items.length}</span> ćwiczeń
                    {t.lastPerformed
                      ? ` · ostatnio ${new Date(t.lastPerformed).toLocaleDateString("pl-PL")}`
                      : " · jeszcze nie wykonany"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {t.items.map((i) => i.exercise.name).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => setRunning(t)}>
                  <Play className="h-4 w-4" />
                  Rozpocznij
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(t);
                    setEditorOpen(true);
                  }}
                  aria-label="Edytuj szablon"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => duplicate(t)} aria-label="Duplikuj">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => archive(t)} aria-label="Archiwizuj">
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkoutLogger
        open={!!running}
        onClose={() => setRunning(null)}
        onSaved={() => {
          onWorkoutSaved();
          load();
        }}
        template={running}
      />
      <TemplateEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
        onSaved={load}
      />
    </section>
  );
}

function TemplateEditor({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Template | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [items, setItems] = React.useState<
    { exercise: Exercise; targetSets: string; targetReps: string }[]
  >([]);
  const [picker, setPicker] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    setName(initial?.name ?? "");
    setDesc(initial?.description ?? "");
    setItems(
      initial?.items.map((i) => ({
        exercise: i.exercise,
        targetSets: i.targetSets ? String(i.targetSets) : "3",
        targetReps: i.targetReps ? String(i.targetReps) : "10",
      })) ?? []
    );
  }, [open, initial]);

  async function save() {
    if (!name.trim()) {
      setErr("Podaj nazwę");
      return;
    }
    if (items.length === 0) {
      setErr("Dodaj przynajmniej jedno ćwiczenie");
      return;
    }
    const payload = {
      name: name.trim(),
      description: desc.trim() || null,
      items: items.map((i, idx) => ({
        exerciseId: i.exercise.id,
        order: idx,
        targetSets: i.targetSets ? parseInt(i.targetSets, 10) : null,
        targetReps: i.targetReps ? parseInt(i.targetReps, 10) : null,
      })),
    };
    setSaving(true);
    try {
      if (initial) {
        await api(`/api/workout-templates/${initial.id}`, { method: "PUT", json: payload });
        toast("Zapisano szablon");
      } else {
        await api("/api/workout-templates", { method: "POST", json: payload });
        toast("Utworzono szablon");
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
    <>
      <Sheet
        open={open && !picker}
        onClose={onClose}
        title={initial ? "Edytuj szablon" : "Nowy szablon"}
        footer={
          <Button className="w-full" size="lg" onClick={save} disabled={saving}>
            {saving ? "Zapisywanie…" : "Zapisz szablon"}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Nazwa</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Góra A"
              autoFocus
            />
          </div>
          <div>
            <Label>Opis (opcjonalnie)</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={`${it.exercise.id}-${idx}`} className="rounded-md border border-border p-2.5">
                <div className="flex items-center gap-2">
                  <span className="tnum w-4 shrink-0 text-xs text-muted-foreground">{idx + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {it.exercise.name}
                  </span>
                  <button
                    onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-danger"
                    aria-label="Usuń z szablonu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[11px] text-muted-foreground">Serie</p>
                    <Input
                      value={it.targetSets}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, targetSets: e.target.value } : x))
                        )
                      }
                      inputMode="numeric"
                      className="tnum h-9"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] text-muted-foreground">Powtórzenia</p>
                    <Input
                      value={it.targetReps}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, targetReps: e.target.value } : x))
                        )
                      }
                      inputMode="numeric"
                      className="tnum h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={() => setPicker(true)}>
            <Plus className="h-4 w-4" />
            Dodaj ćwiczenie
          </Button>

          {err && <p className="text-sm text-danger">{err}</p>}
        </div>
      </Sheet>

      <ExercisePicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(ex) => {
          setItems((p) => [
            ...p,
            {
              exercise: ex,
              targetSets: String(ex.defaultSets ?? 3),
              targetReps: String(ex.defaultReps ?? 10),
            },
          ]);
          setPicker(false);
        }}
      />
    </>
  );
}
