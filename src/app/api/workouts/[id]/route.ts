import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";

// Podgląd pojedynczego treningu. Pełny CRUD treningów: etap Sport.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      sets: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        include: { exercise: { select: { name: true, muscleGroup: true } } },
      },
    },
  });
  if (!workout) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  return NextResponse.json(serialize(workout));
}
