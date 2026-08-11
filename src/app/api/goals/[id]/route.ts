import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { goalInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

const patchSchema = z.object({
  done: z.boolean().optional(),
  isMainFocus: z.boolean().optional(),
});

/** Odhaczenie celu albo ustawienie go jako główny. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const current = await prisma.goal.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  const goal = await prisma.$transaction(async (db) => {
    // Tylko jeden główny cel na obszar.
    if (parsed.data.isMainFocus === true) {
      await db.goal.updateMany({
        where: { area: current.area, isMainFocus: true, NOT: { id: params.id } },
        data: { isMainFocus: false },
      });
    }
    return db.goal.update({ where: { id: params.id }, data: parsed.data });
  });

  return NextResponse.json(serialize(goal));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = goalInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const goal = await prisma.$transaction(async (db) => {
    if (d.isMainFocus) {
      await db.goal.updateMany({
        where: { area: d.area, isMainFocus: true, NOT: { id: params.id } },
        data: { isMainFocus: false },
      });
    }
    return db.goal.update({
      where: { id: params.id },
      data: {
        area: d.area,
        businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
        title: d.title,
        description: d.description ?? null,
        period: d.period,
        targetDate: d.targetDate ? new Date(d.targetDate) : null,
        isMainFocus: d.isMainFocus ?? false,
        done: d.done ?? false,
      },
    });
  });

  return NextResponse.json(serialize(goal));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
