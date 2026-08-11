import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activityInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") ?? 60);
  const activities = await prisma.activity.findMany({
    orderBy: { date: "desc" },
    take: Math.min(Math.max(take, 1), 200),
  });
  return NextResponse.json(serialize(activities));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = activityInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const a = await prisma.activity.create({
    data: {
      name: d.name,
      date: new Date(d.date),
      durationMin: d.durationMin ?? null,
      note: d.note ?? null,
    },
  });
  return NextResponse.json(serialize(a), { status: 201 });
}
