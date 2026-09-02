import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAreaSummary, type SummaryItem, type SummaryTx } from "@/lib/summary";
import { weekStats } from "@/lib/sport";
import { rangeForPeriod, previousRange, type PeriodKey } from "@/lib/dates";
import { AREAS, type Area } from "@/lib/enums";

export const dynamic = "force-dynamic";

const PERIODS: PeriodKey[] = ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"];

/** Podsumowanie obszaru za okres + poprzedni okres do porównania (§9). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawArea = searchParams.get("area") ?? "";
  if (!(AREAS as readonly string[]).includes(rawArea)) {
    return NextResponse.json({ error: "Nieznany obszar" }, { status: 400 });
  }
  const area = rawArea as Area;
  const rawPeriod = (searchParams.get("period") ?? "MONTH").toUpperCase();
  const period = (PERIODS.includes(rawPeriod as PeriodKey) ? rawPeriod : "MONTH") as PeriodKey;

  const cur = rangeForPeriod(period);
  const prev = previousRange(period);
  const from = prev.start < cur.start ? prev.start : cur.start;
  const to = prev.end > cur.end ? prev.end : cur.end;

  const [items, txs] = await Promise.all([
    prisma.item.findMany({
      where: { area },
      select: { type: true, done: true, startAt: true, endAt: true, dueAt: true },
    }),
    prisma.transaction.findMany({
      where: { area, date: { gte: from, lte: to } },
      select: { kind: true, amount: true, date: true },
    }),
  ]);

  const inRange = (d: Date, r: { start: Date; end: Date }) => d >= r.start && d <= r.end;
  const curTx = txs.filter((t) => inRange(t.date, cur)) as unknown as SummaryTx[];
  const prevTx = txs.filter((t) => inRange(t.date, prev)) as unknown as SummaryTx[];

  const current = computeAreaSummary(items as unknown as SummaryItem[], curTx, cur);
  const previous = computeAreaSummary(items as unknown as SummaryItem[], prevTx, prev);

  // Sport ma dodatkowo treningi, objętość i aktywności (§9).
  let sport: { current: ReturnType<typeof weekStats>; previous: ReturnType<typeof weekStats> } | null =
    null;
  if (area === "SPORT") {
    const [workouts, activities] = await Promise.all([
      prisma.workout.findMany({
        where: { date: { gte: from, lte: to } },
        include: { sets: { select: { reps: true, weight: true } } },
      }),
      prisma.activity.findMany({ where: { date: { gte: from, lte: to } } }),
    ]);
    const shape = workouts.map((w) => ({
      date: w.date,
      sets: w.sets.map((s) => ({ reps: s.reps, weight: s.weight ? Number(s.weight) : null })),
    }));
    // weekStats liczy od podanego startu przez 7 dni — dla dłuższych okresów
    // sumujemy ręcznie tym samym wzorem.
    const agg = (r: { start: Date; end: Date }) => {
      const w = shape.filter((x) => inRange(x.date, r));
      const a = activities.filter((x) => inRange(x.date, r));
      const days = new Set(
        [...w.map((x) => x.date), ...a.map((x) => x.date)].map(
          (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        )
      );
      const spanDays = Math.max(
        1,
        Math.round((r.end.getTime() - r.start.getTime()) / 86400000) + 1
      );
      return {
        workouts: w.length,
        activities: a.length,
        restDays: Math.max(0, spanDays - days.size),
        sets: w.reduce((acc, x) => acc + x.sets.length, 0),
        volume: Math.round(
          w.reduce(
            (acc, x) => acc + x.sets.reduce((b, s) => b + s.reps * (s.weight ?? 0), 0),
            0
          )
        ),
      };
    };
    sport = { current: agg(cur), previous: agg(prev) };
  }

  return NextResponse.json({
    area,
    period,
    range: { start: cur.start.toISOString(), end: cur.end.toISOString() },
    current,
    previous,
    sport,
  });
}
