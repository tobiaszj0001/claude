import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { templateInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.workoutTemplate.findMany({
    where: { archived: false },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
      },
      // Kiedy ostatnio wykonany (§7.2)
      workouts: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    serialize(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        items: t.items,
        lastPerformed: t.workouts[0]?.date ?? null,
      }))
    )
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = templateInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const tpl = await prisma.workoutTemplate.create({
    data: {
      name: d.name,
      description: d.description ?? null,
      items: {
        create: d.items.map((i) => ({
          exerciseId: i.exerciseId,
          order: i.order,
          targetSets: i.targetSets ?? null,
          targetReps: i.targetReps ?? null,
          note: i.note ?? null,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(serialize(tpl), { status: 201 });
}
