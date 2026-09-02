import "server-only";
import { prisma } from "@/lib/prisma";
import { dueMonths, occurrenceForMonth } from "@/lib/fixed-costs";

/**
 * Dopisuje brakujące wpisy PENDING dla kosztów stałych, którym minął już
 * dzień księgowania. Nie tworzy żadnych transakcji — te powstają dopiero
 * po zatwierdzeniu przez użytkownika.
 *
 * Wywoływane leniwie przy odczycie, więc aplikacja nie potrzebuje żadnego
 * crona ani zadania w tle.
 */
export async function ensurePendingEntries(now: Date = new Date()): Promise<number> {
  const costs = await prisma.fixedCost.findMany({ where: { active: true } });
  if (costs.length === 0) return 0;

  const existing = await prisma.fixedCostEntry.findMany({
    where: { fixedCostId: { in: costs.map((c) => c.id) } },
    select: { fixedCostId: true, month: true },
  });
  const have = new Set(existing.map((e) => `${e.fixedCostId}|${e.month}`));

  const toCreate: { fixedCostId: string; month: string }[] = [];
  for (const c of costs) {
    for (const month of dueMonths(c, now)) {
      if (!have.has(`${c.id}|${month}`)) {
        toCreate.push({ fixedCostId: c.id, month });
      }
    }
  }
  if (toCreate.length === 0) return 0;

  // createMany + skipDuplicates chroni przed wyścigiem dwóch równoległych
  // żądań (unikalny indeks fixedCostId+month).
  const res = await prisma.fixedCostEntry.createMany({
    data: toCreate.map((t) => ({ ...t, status: "PENDING" })),
    skipDuplicates: true,
  });
  return res.count;
}

/** Zatwierdza wpis: tworzy transakcję i wiąże ją z wpisem. */
export async function confirmEntry(
  entryId: string,
  override?: { amount?: number; date?: Date }
) {
  const entry = await prisma.fixedCostEntry.findUnique({
    where: { id: entryId },
    include: { fixedCost: true },
  });
  if (!entry) return { error: "Nie znaleziono pozycji" as const };
  if (entry.status === "CONFIRMED") return { error: "Ta pozycja jest już zatwierdzona" as const };

  const fc = entry.fixedCost;
  const date = override?.date ?? occurrenceForMonth(entry.month, fc.dayOfMonth);
  const amount = override?.amount ?? fc.amount;

  // Zmiana kwoty/daty dotyczy tylko tego miesiąca — definicja kosztu
  // stałego zostaje bez zmian (§2).
  return prisma.$transaction(async (db) => {
    const tx = await db.transaction.create({
      data: {
        kind: "EXPENSE",
        amount,
        date,
        area: fc.area,
        businessSection: fc.businessSection,
        category: "Koszt stały",
        description: fc.name,
        fixedCostId: fc.id,
      },
    });
    await db.fixedCostEntry.update({
      where: { id: entry.id },
      data: { status: "CONFIRMED", transactionId: tx.id },
    });
    return { transaction: tx };
  });
}

/** Pomija wpis w tym miesiącu — decyzja zapada, pozycja nie wraca. */
export async function skipEntry(entryId: string) {
  const entry = await prisma.fixedCostEntry.findUnique({ where: { id: entryId } });
  if (!entry) return { error: "Nie znaleziono pozycji" as const };
  if (entry.status === "CONFIRMED") {
    return { error: "Pozycja jest już zatwierdzona — usuń transakcję, żeby ją cofnąć" as const };
  }
  await prisma.fixedCostEntry.update({
    where: { id: entryId },
    data: { status: "SKIPPED", transactionId: null },
  });
  return { ok: true as const };
}
