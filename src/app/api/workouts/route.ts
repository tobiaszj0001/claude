import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");
  const q = searchParams.get("q");
  const take = Number(searchParams.get("take") ?? 50);

  const where: any = {};
  if (exerciseId) where.sets = { some: { exerciseId } };
  if (q) where.name = { contains: q, mode: "insensitive" };

  const workouts = await prisma.workout.findMany({
    where,
    include: {
      sets: { include: { exercise: { select: { id: true, name: true, muscleGroup: true } } } },
    },
    orderBy: { date: "desc" },
    take: Math.min(Math.max(take, 1), 200),
  });

  return NextResponse.json(
    serialize(
      workouts.map((w) => ({
        id: w.id,
        date: w.date,
        name: w.name,
        note: w.note,
        durationMin: w.durationMin,
        exerciseCount: new Set(w.sets.map((s) => s.exerciseId)).size,
        setCount: w.sets.length,
        volume: w.sets.reduce(
          (acc, s) => acc + s.reps * (s.weight ? Number(s.weight) : 0),
          0
        ),
        sets: w.sets,
      }))
    )
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = workoutInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const workout = await prisma.workout.create({
    data: {
      date: new Date(d.date),
      name: d.name ?? null,
      templateId: d.templateId || null,
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

  return NextResponse.json(serialize(workout), { status: 201 });
}
