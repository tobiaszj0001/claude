import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { templateInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = templateInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const tpl = await prisma.$transaction(async (db) => {
    await db.workoutTemplateItem.deleteMany({ where: { templateId: params.id } });
    return db.workoutTemplate.update({
      where: { id: params.id },
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
  });
  return NextResponse.json(serialize(tpl));
}

const actionSchema = z.object({ action: z.literal("duplicate") });

/** Duplikowanie szablonu (§7.2). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!actionSchema.safeParse(body).success) {
    return NextResponse.json({ error: "Nieprawidłowa akcja" }, { status: 400 });
  }
  const src = await prisma.workoutTemplate.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!src) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  const copy = await prisma.workoutTemplate.create({
    data: {
      name: `${src.name} (kopia)`,
      description: src.description,
      items: {
        create: src.items.map((i) => ({
          exerciseId: i.exerciseId,
          order: i.order,
          targetSets: i.targetSets,
          targetReps: i.targetReps,
          note: i.note,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(serialize(copy), { status: 201 });
}

/** Archiwizacja — wykonane treningi zachowują powiązanie. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workoutTemplate.update({ where: { id: params.id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
