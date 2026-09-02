import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { ensurePendingEntries } from "@/lib/fixed-costs.server";
import { occurrenceForMonth } from "@/lib/fixed-costs";

export const dynamic = "force-dynamic";

/** Pozycje czekające na decyzję („Do zatwierdzenia"). */
export async function GET() {
  await ensurePendingEntries();

  const entries = await prisma.fixedCostEntry.findMany({
    where: { status: "PENDING" },
    include: { fixedCost: true },
    orderBy: { month: "asc" },
  });

  const dto = entries.map((e) => ({
    id: e.id,
    month: e.month,
    status: e.status,
    suggestedDate: occurrenceForMonth(e.month, e.fixedCost.dayOfMonth).toISOString(),
    fixedCost: {
      id: e.fixedCost.id,
      name: e.fixedCost.name,
      amount: e.fixedCost.amount,
      area: e.fixedCost.area,
      businessSection: e.fixedCost.businessSection,
      dayOfMonth: e.fixedCost.dayOfMonth,
    },
  }));

  return NextResponse.json(serialize(dto));
}
