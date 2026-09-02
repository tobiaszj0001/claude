import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fixedCostInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const where: any = {};
  if (area) where.area = area;

  const costs = await prisma.fixedCost.findMany({
    where,
    orderBy: [{ active: "desc" }, { dayOfMonth: "asc" }],
  });
  return NextResponse.json(serialize(costs));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = fixedCostInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const fc = await prisma.fixedCost.create({
    data: {
      name: d.name,
      amount: d.amount,
      area: d.area,
      businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
      dayOfMonth: d.dayOfMonth,
      startDate: new Date(d.startDate),
      endDate: d.endDate ? new Date(d.endDate) : null,
      active: d.active ?? true,
    },
  });
  return NextResponse.json(serialize(fc), { status: 201 });
}
