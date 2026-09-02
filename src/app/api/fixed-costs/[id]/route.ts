import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fixedCostInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = fixedCostInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const fc = await prisma.fixedCost.update({
    where: { id: params.id },
    data: {
      name: d.name,
      amount: d.amount,
      area: d.area,
      businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
      dayOfMonth: d.dayOfMonth,
      startDate: new Date(d.startDate),
      endDate: d.endDate ? new Date(d.endDate) : null,
      active: d.active ?? true,
    },
  });
  return NextResponse.json(serialize(fc));
}

/**
 * Usuwa definicję kosztu stałego. Zaksięgowane transakcje ZOSTAJĄ
 * (odpinamy je przez onDelete: SetNull) — historia finansowa nie może
 * zniknąć przez skasowanie definicji.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.fixedCost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
