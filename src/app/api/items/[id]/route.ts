import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const patchSchema = z.object({ done: z.boolean() });

// Odhaczanie / cofnięcie
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }
  const item = await prisma.item.update({
    where: { id: params.id },
    data: { done: parsed.data.done, doneAt: parsed.data.done ? new Date() : null },
  });
  return NextResponse.json(serialize(item));
}

// Pełna edycja
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = itemInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const item = await prisma.item.update({
    where: { id: params.id },
    data: {
      type: d.type,
      title: d.title,
      description: d.description ?? null,
      area: d.area,
      businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
      startAt: d.startAt ? new Date(d.startAt) : null,
      endAt: d.endAt ? new Date(d.endAt) : null,
      dueAt: d.dueAt ? new Date(d.dueAt) : null,
      priority: d.priority,
      recurrenceRule: d.recurrenceRule ?? null,
    },
  });
  return NextResponse.json(serialize(item));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.item.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
