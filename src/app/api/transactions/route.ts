import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const businessSection = searchParams.get("businessSection");
  const kind = searchParams.get("kind");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const take = Number(searchParams.get("take") ?? 200);

  const where: any = {};
  if (area) where.area = area;
  if (businessSection) where.businessSection = businessSection;
  if (kind) where.kind = kind;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const txs = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(take, 1), 500),
  });
  return NextResponse.json(serialize(txs));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = transactionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const tx = await prisma.transaction.create({
    data: {
      kind: d.kind,
      amount: d.amount,
      date: new Date(d.date),
      area: d.area,
      businessSection: d.area === "BIZNES" ? d.businessSection ?? null : null,
      category: d.category ?? null,
      description: d.description ?? null,
    },
  });
  return NextResponse.json(serialize(tx), { status: 201 });
}
