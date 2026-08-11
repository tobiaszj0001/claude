import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      sets: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
      },
    },
  });
  if (!workout) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  return NextResponse.json(serialize(workout));
}

/** Nadpisuje trening razem z seriami (edycja całości). */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = workoutInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const workout = await prisma.$transaction(async (db) => {
    await db.workoutSet.deleteMany({ where: { workoutId: params.id } });
    return db.workout.update({
      where: { id: params.id },
      data: {
        date: new Date(d.date),
        name: d.name ?? null,
        note: d.note ?? null,
        durationMin: d.durationMin ?? null,
        sets: {
          create: d.sets.map((s) => ({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight ?? null,
            difficulty: s.difficulty ?? null,
            note: s.note ?? null,
          })),
        },
      },
      include: { sets: true },
    });
  });

  return NextResponse.json(serialize(workout));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workout.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
