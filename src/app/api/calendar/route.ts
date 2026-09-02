import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";

// Zwraca wszystko, co pokazujemy w kalendarzu w danym zakresie:
// itemy (event/timed task), wykonane treningi i dodatkowe aktywności.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const fromD = from ? new Date(from) : new Date(0);
  const toD = to ? new Date(to) : new Date(8640000000000000);

  const [items, workouts, activities] = await Promise.all([
    prisma.item.findMany({
      where: {
        OR: [
          { startAt: { gte: fromD, lte: toD } },
          { dueAt: { gte: fromD, lte: toD } },
        ],
      },
    }),
    prisma.workout.findMany({
      where: { date: { gte: fromD, lte: toD } },
      include: {
        sets: { select: { id: true, exerciseId: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.activity.findMany({
      where: { date: { gte: fromD, lte: toD } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Skrót treningu: liczba ćwiczeń i serii.
  const workoutsDTO = workouts.map((w) => {
    const exerciseIds = new Set(w.sets.map((s) => s.exerciseId));
    return {
      id: w.id,
      date: w.date,
      name: w.name,
      exerciseCount: exerciseIds.size,
      setCount: w.sets.length,
    };
  });

  return NextResponse.json(serialize({ items, workouts: workoutsDTO, activities }));
}
