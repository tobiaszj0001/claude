import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const type = searchParams.get("type");
  const businessSection = searchParams.get("businessSection");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const done = searchParams.get("done");

  const where: any = {};
  if (area) where.area = area;
  if (type) where.type = type;
  if (businessSection) where.businessSection = businessSection;
  if (done === "true") where.done = true;
  if (done === "false") where.done = false;
  if (from || to) {
    where.OR = [
      { startAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } },
      { dueAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ startAt: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(serialize(items));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = itemInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const item = await prisma.item.create({
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
      done: d.done ?? false,
      recurrenceRule: d.recurrenceRule ?? null,
    },
  });
  return NextResponse.json(serialize(item), { status: 201 });
}
