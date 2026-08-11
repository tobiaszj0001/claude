"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Trophy } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Spinner, SegmentedControl } from "@/components/ui/misc";
import { api } from "@/lib/api";

type Stats = {
  exercise: { id: string; name: string; muscleGroup: string; isMachine: boolean; note: string | null };
  series: { date: string; maxWeight: number; maxReps: number; volume: number }[];
  records: {
    maxWeight: number | null;
    maxReps: number | null;
    maxSessionVolume: number | null;
    avgDifficulty: number | null;
  };
  totalSessions: number;
  history: {
    workoutId: string;
    date: string;
    sets: { setNumber: number; reps: number; weight: string | null; difficulty: number | null }[];
  }[];
};

type Metric = "weight" | "reps" | "volume";

const METRIC_LABEL: Record<Metric, string> = {
  weight: "Ciężar (kg)",
  reps: "Powtórzenia",
  volume: "Objętość (kg)",
};

/** Karta ćwiczenia: wykres, rekordy, pełna historia serii (§7.2). */
export function ExerciseCard({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [data, setData] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [metric, setMetric] = React.useState<Metric>("weight");

  React.useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    setMetric("weight");
    api<Stats>(`/api/exercises/${id}/stats`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  const chart = React.useMemo(
    () =>
      (data?.series ?? []).map((p) => ({
        label: new Date(p.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
        weight: p.maxWeight,
        reps: p.maxReps,
        volume: p.volume,
      })),
    [data]
  );

  return (
    <Sheet open={!!id} onClose={onClose} title={data?.exercise.name ?? "Ćwiczenie"}>
      {loading || !data ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {data.exercise.muscleGroup}
            {data.exercise.isMachine && " · maszyna"} ·{" "}
            <span className="tnum">{data.totalSessions}</span>{" "}
            {data.totalSessions === 1 ? "sesja" : "sesji"}
          </p>

          {data.exercise.note && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">{data.exercise.note}</p>
          )}

          {/* Rekordy */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-warning" />
              Rekordy
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Rec label="Najwyższy ciężar" value={data.records.maxWeight} unit="kg" />
              <Rec label="Najwięcej powtórzeń" value={data.records.maxReps} />
              <Rec label="Objętość w sesji" value={data.records.maxSessionVolume} unit="kg" />
              <Rec label="Średnia trudność" value={data.records.avgDifficulty} unit="/10" />
            </div>
          </div>

          {/* Wykres progresu */}
          {chart.length > 1 ? (
            <div>
              <SegmentedControl<Metric>
                value={metric}
                onChange={setMetric}
                options={[
                  { value: "weight", label: "Ciężar" },
                  { value: "reps", label: "Powtórzenia" },
                  { value: "volume", label: "Objętość" },
                ]}
              />
              <div className="mt-3 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={16}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "0.8125rem",
                      }}
                      formatter={(v: number) => [v, METRIC_LABEL[metric]]}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                    <Line
                      type="monotone"
                      dataKey={metric}
                      name={METRIC_LABEL[metric]}
                      stroke="hsl(var(--sport))"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Wykres pojawi się po drugiej sesji z tym ćwiczeniem.
            </p>
          )}

          {/* Historia serii */}
          <div>
            <p className="mb-2 text-sm font-semibold">Historia</p>
            <div className="flex flex-col gap-2">
              {data.history.slice(0, 20).map((h) => (
                <div key={h.workoutId} className="rounded-md border border-border p-2.5">
                  <p className="tnum text-xs font-medium text-muted-foreground">
                    {new Date(h.date).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {h.sets.map((s) => (
                      <span
                        key={s.setNumber}
                        className="tnum rounded bg-muted px-1.5 py-0.5 text-xs"
                      >
                        {s.reps}
                        {s.weight ? ` × ${Number(s.weight)}kg` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {data.history.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak wykonanych serii.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Rec({ label, value, unit }: { label: string; value: number | null; unit?: string }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="tnum text-lg font-bold">
        {value == null ? "—" : `${value}${unit ?? ""}`}
      </p>
    </div>
  );
}
