import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmEntry, ensurePendingEntries } from "@/lib/fixed-costs.server";

/** „Zatwierdź wszystkie" — księguje wszystkie oczekujące pozycje. */
export async function POST() {
  await ensurePendingEntries();
  const pending = await prisma.fixedCostEntry.findMany({
    where: { status: "PENDING" },
    select: { id: true },
    orderBy: { month: "asc" },
  });

  let confirmed = 0;
  const failed: string[] = [];
  for (const p of pending) {
    const res = await confirmEntry(p.id);
    if ("error" in res) failed.push(res.error);
    else confirmed += 1;
  }

  return NextResponse.json({ ok: true, confirmed, failed });
}
