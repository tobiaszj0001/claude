import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exerciseInput } from "@/lib/validation";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const muscleGroup = searchParams.get("muscleGroup");
  const q = searchParams.get("q");
  const includeArchived = searchParams.get("archived") === "true";

  const where: any = {};
  if (muscleGroup) where.muscleGroup = muscleGroup;
  if (!includeArchived) where.archived = false;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: [{ archived: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(serialize(exercises));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = exerciseInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const ex = await prisma.exercise.create({ data: parsed.data });
  return NextResponse.json(serialize(ex), { status: 201 });
}
