import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { weekStats } from "@/lib/sport";
import { startOfWeek, subWeeks } from "date-fns";

export const dynamic = "force-dynamic";

/** Podsumowanie tygodnia + poprzedniego, do porównania (§7.2, §9). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = Number(searchParams.get("weekOffset") ?? 0);

  const thisWeek = startOfWeek(subWeeks(new Date(), offset), { weekStartsOn: 1 });
  const prevWeek = subWeeks(thisWeek, 1);
  const from = prevWeek;

  const [workouts, activities] = await Promise.all([
    prisma.workout.findMany({
      where: { date: { gte: from } },
      include: { sets: { select: { reps: true, weight: true } } },
    }),
    prisma.activity.findMany({ where: { date: { gte: from } } }),
  ]);

  const shape = workouts.map((w) => ({
    date: w.date,
    sets: w.sets.map((s) => ({ reps: s.reps, weight: s.weight ? Number(s.weight) : null })),
  }));

  return NextResponse.json({
    weekStart: thisWeek.toISOString(),
    current: weekStats(shape, activities, thisWeek),
    previous: weekStats(shape, activities, prevWeek),
  });
}
