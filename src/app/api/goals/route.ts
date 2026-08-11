import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const businessSection = searchParams.get("businessSection");

  const where: any = {};
  if (area) where.area = area;
  if (businessSection) where.businessSection = businessSection;

  const goals = await prisma.goal.findMany({
    where,
    orderBy: [{ isMainFocus: "desc" }, { done: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(serialize(goals));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = goalInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // Maksymalnie jeden główny cel na obszar (§2) — nowy zdejmuje flagę z reszty.
  const goal = await prisma.$transaction(async (db) => {
    if (d.isMainFocus) {
      await db.goal.updateMany({
        where: { area: d.area, isMainFocus: true },
        data: { isMainFocus: false },
      });
    }
    return db.goal.create({
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

  return NextResponse.json(serialize(goal), { status: 201 });
}
