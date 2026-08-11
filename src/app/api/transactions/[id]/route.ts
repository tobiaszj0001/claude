import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = transactionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const tx = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      kind: d.kind,
      amount: d.amount,
      date: new Date(d.date),
      area: d.area,
      businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
      category: d.category ?? null,
      description: d.description ?? null,
    },
  });
  return NextResponse.json(serialize(tx));
}

/**
 * Usuwa transakcję. Jeśli powstała z kosztu stałego, wpis miesięczny wraca
 * do stanu oczekującego — sam koszt stały zostaje nietknięty (§2).
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const entry = await prisma.fixedCostEntry.findUnique({
    where: { transactionId: params.id },
  });

  await prisma.$transaction(async (tx) => {
    if (entry) {
      await tx.fixedCostEntry.update({
        where: { id: entry.id },
        data: { status: "PENDING", transactionId: null },
      });
    }
    await tx.transaction.delete({ where: { id: params.id } });
  });

  return NextResponse.json({ ok: true, revertedToPending: !!entry });
}
