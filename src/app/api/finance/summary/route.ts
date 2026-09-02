import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAccountBalance, type MoneyTx } from "@/lib/money";
import { rangeForPeriod, type PeriodKey } from "@/lib/dates";
import { ensurePendingEntries } from "@/lib/fixed-costs.server";
import { occurrenceForMonth } from "@/lib/fixed-costs";

export const dynamic = "force-dynamic";

const PERIODS: PeriodKey[] = ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR", "ALL"];

/**
 * Stan konta dla wybranego okresu.
 * Koszty oczekujące (PENDING) NIE wchodzą do bilansu — zwracamy je osobno
 * jako „zaplanowane", żeby było widać, co jeszcze czeka (§2).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("period") ?? "MONTH").toUpperCase();
  const period = (PERIODS.includes(raw as PeriodKey) ? raw : "MONTH") as PeriodKey;
  const { start, end } = rangeForPeriod(period);

  await ensurePendingEntries();

  const [txs, pending] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
      select: { kind: true, amount: true, area: true },
    }),
    prisma.fixedCostEntry.findMany({
      where: { status: "PENDING" },
      include: { fixedCost: true },
    }),
  ]);

  const balance = computeAccountBalance(txs as unknown as MoneyTx[]);

  const plannedItems = pending.map((e) => ({
    id: e.id,
    name: e.fixedCost.name,
    amount: e.fixedCost.amount.toString(),
    area: e.fixedCost.area,
    date: occurrenceForMonth(e.month, e.fixedCost.dayOfMonth).toISOString(),
  }));
  const plannedCents = pending.reduce(
    (acc, e) => acc + Math.round(Number(e.fixedCost.amount) * 100),
    0
  );

  return NextResponse.json({
    period,
    range: { start: start.toISOString(), end: end.toISOString() },
    ...balance,
    pendingCount: pending.length,
    plannedCents,
    plannedItems,
  });
}
