"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/misc";
import { api } from "@/lib/api";

type WorkoutDetail = {
  id: string;
  date: string;
  name: string | null;
  note: string | null;
  durationMin: number | null;
  sets: {
    id: string;
    setNumber: number;
    reps: number;
    weight: string | null;
    difficulty: number | null;
    exercise: { name: string; muscleGroup: string };
  }[];
};

/** Podgląd wykonanego treningu (read-only). Pełna edycja: etap Sport. */
export function WorkoutSheet({
  id,
  onClose,
  onEdit,
}: {
  id: string | null;
  onClose: () => void;
  /** Gdy podane, w stopce pojawia się przycisk edycji tego treningu. */
  onEdit?: (id: string) => void;
}) {
  const [data, setData] = React.useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    api<WorkoutDetail>(`/api/workouts/${id}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  // Grupuj serie po ćwiczeniu, zachowując kolejność.
  const groups = React.useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { name: string; sets: WorkoutDetail["sets"] }>();
    for (const s of data.sets) {
      const key = s.exercise.name;
      if (!map.has(key)) map.set(key, { name: key, sets: [] });
      map.get(key)!.sets.push(s);
    }
    return [...map.values()];
  }, [data]);

  return (
    <Sheet
      open={!!id}
      onClose={onClose}
      title={data?.name ?? "Trening"}
      footer={
        onEdit && id ? (
          <Button className="w-full" size="lg" variant="secondary" onClick={() => onEdit(id)}>
            <Pencil className="h-4 w-4" />
            Edytuj trening
          </Button>
        ) : undefined
      }
    >
      {loading || !data ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {new Date(data.date).toLocaleDateString("pl-PL", { dateStyle: "full" })}
            {data.durationMin ? ` · ${data.durationMin} min` : ""}
          </p>
          {data.note && <p className="text-sm">{data.note}</p>}
          {groups.map((g) => (
            <div key={g.name} className="rounded-lg border border-border p-3">
              <p className="mb-2 font-medium">{g.name}</p>
              <div className="space-y-1">
                {g.sets.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Seria {s.setNumber}</span>
                    <span className="tnum">
                      {s.reps} × {s.weight ? `${s.weight} kg` : "—"}
                      {s.difficulty ? ` · trud. ${s.difficulty}/10` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
