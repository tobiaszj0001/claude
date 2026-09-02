import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { progressSeries } from "@/lib/sport";
import { computeExerciseRecords } from "@/lib/training";

export const dynamic = "force-dynamic";

/** Karta ćwiczenia: wykres, rekordy, pełna historia serii (§7.2). */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const exercise = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!exercise) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  const sets = await prisma.workoutSet.findMany({
    where: { exerciseId: params.id },
    include: { workout: { select: { id: true, date: true, name: true } } },
    orderBy: [{ workout: { date: "asc" } }, { setNumber: "asc" }],
  });

  // Grupujemy serie po sesji treningowej.
  const byWorkout = new Map<string, { date: Date; name: string | null; sets: typeof sets }>();
  for (const s of sets) {
    const key = s.workout.id;
    if (!byWorkout.has(key)) {
      byWorkout.set(key, { date: s.workout.date, name: s.workout.name, sets: [] });
    }
    byWorkout.get(key)!.sets.push(s);
  }

  const sessions = [...byWorkout.values()].map((w) => ({
    date: w.date,
    sets: w.sets.map((s) => ({
      reps: s.reps,
      weight: s.weight ? Number(s.weight) : null,
      difficulty: s.difficulty,
    })),
  }));

  const series = progressSeries(sessions);
  const records = computeExerciseRecords(
    sessions.flatMap((s) => s.sets),
    series.map((p) => p.volume)
  );

  return NextResponse.json(
    serialize({
      exercise,
      series,
      records,
      totalSessions: sessions.length,
      history: [...byWorkout.entries()]
        .map(([id, w]) => ({
          workoutId: id,
          date: w.date,
          name: w.name,
          sets: w.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            difficulty: s.difficulty,
          })),
        }))
        .reverse(),
    })
  );
}
