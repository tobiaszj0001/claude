import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exerciseInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = exerciseInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const ex = await prisma.exercise.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(serialize(ex));
}

/**
 * Archiwizacja zamiast twardego usunięcia (§2): historia treningów
 * odwołuje się do ćwiczenia i nie może zniknąć.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ex = await prisma.exercise.update({
    where: { id: params.id },
    data: { archived: true },
  });
  return NextResponse.json(serialize({ ...ex, archived: true }));
}
