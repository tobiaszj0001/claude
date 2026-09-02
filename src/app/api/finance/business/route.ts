import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeBusinessBreakdown, type SectionTx } from "@/lib/business";
import { rangeForPeriod, previousRange, type PeriodKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

const PERIODS: PeriodKey[] = ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR", "ALL"];

/**
 * Przychód / koszty / dochód Biznesu w rozbiciu na podzakładki (§6),
 * razem z porównaniem do poprzedniego okresu (§9).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("period") ?? "MONTH").toUpperCase();
  const period = (PERIODS.includes(raw as PeriodKey) ? raw : "MONTH") as PeriodKey;

  const cur = rangeForPeriod(period);
  const prev = previousRange(period);

  const [curTxs, prevTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: { area: "BIZNES", date: { gte: cur.start, lte: cur.end } },
      select: { kind: true, amount: true, businessSection: true },
    }),
    prisma.transaction.findMany({
      where: { area: "BIZNES", date: { gte: prev.start, lte: prev.end } },
      select: { kind: true, amount: true, businessSection: true },
    }),
  ]);

  const current = computeBusinessBreakdown(curTxs as unknown as SectionTx[]);
  const previous = computeBusinessBreakdown(prevTxs as unknown as SectionTx[]);

  return NextResponse.json({
    period,
    range: { start: cur.start.toISOString(), end: cur.end.toISOString() },
    current,
    previous,
  });
}
