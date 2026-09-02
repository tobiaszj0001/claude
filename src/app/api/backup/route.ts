import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Eksport wszystkich danych do JSON — backup użytkownika (§11). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";

  const [items, transactions, fixedCosts, fixedCostEntries, goals,
         exercises, templates, templateItems, workouts, workoutSets, activities] =
    await Promise.all([
      prisma.item.findMany(),
      prisma.transaction.findMany(),
      prisma.fixedCost.findMany(),
      prisma.fixedCostEntry.findMany(),
      prisma.goal.findMany(),
      prisma.exercise.findMany(),
      prisma.workoutTemplate.findMany(),
      prisma.workoutTemplateItem.findMany(),
      prisma.workout.findMany(),
      prisma.workoutSet.findMany(),
      prisma.activity.findMany(),
    ]);

  const data = serialize({
    exportedAt: new Date().toISOString(),
    version: 1,
    items, transactions, fixedCosts, fixedCostEntries, goals,
    exercises, templates, templateItems, workouts, workoutSets, activities,
  });

  if (format === "csv") {
    // CSV ma sens tylko dla transakcji — reszta jest zagnieżdżona.
    const head = "data;typ;kwota;obszar;podzakladka;kategoria;opis";
    const rows = transactions.map((t) =>
      [
        t.date.toISOString().slice(0, 10),
        t.kind === "INCOME" ? "przychod" : "koszt",
        String(t.amount).replace(".", ","),
        t.area,
        t.businessSection ?? "",
        (t.category ?? "").replace(/;/g, ","),
        (t.description ?? "").replace(/;/g, ","),
      ].join(";")
    );
    return new NextResponse("﻿" + [head, ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tobiaszcrm-transakcje-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="tobiaszcrm-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** Import z backupu JSON. Zastępuje całą zawartość bazy. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "To nie wygląda na plik backupu" }, { status: 400 });
  }

  const d = (v: any) => (v ? new Date(v) : null);

  try {
    await prisma.$transaction(async (db) => {
      // Kolejność ma znaczenie — najpierw to, co się do czegoś odwołuje.
      await db.workoutSet.deleteMany();
      await db.workout.deleteMany();
      await db.workoutTemplateItem.deleteMany();
      await db.workoutTemplate.deleteMany();
      await db.activity.deleteMany();
      await db.exercise.deleteMany();
      await db.fixedCostEntry.deleteMany();
      await db.transaction.deleteMany();
      await db.fixedCost.deleteMany();
      await db.item.deleteMany();
      await db.goal.deleteMany();

      const put = async (rows: any[] | undefined, fn: (r: any) => Promise<unknown>) => {
        for (const r of rows ?? []) await fn(r);
      };

      await put(body.items, (r) =>
        db.item.create({
          data: { ...r, startAt: d(r.startAt), endAt: d(r.endAt), dueAt: d(r.dueAt),
                  doneAt: d(r.doneAt), createdAt: d(r.createdAt) ?? undefined,
                  updatedAt: d(r.updatedAt) ?? undefined },
        })
      );
      await put(body.goals, (r) =>
        db.goal.create({ data: { ...r, targetDate: d(r.targetDate),
          createdAt: d(r.createdAt) ?? undefined, updatedAt: d(r.updatedAt) ?? undefined } })
      );
      await put(body.fixedCosts, (r) =>
        db.fixedCost.create({ data: { ...r, startDate: d(r.startDate)!, endDate: d(r.endDate),
          createdAt: d(r.createdAt) ?? undefined } })
      );
      await put(body.transactions, (r) =>
        db.transaction.create({ data: { ...r, date: d(r.date)!, createdAt: d(r.createdAt) ?? undefined } })
      );
      await put(body.fixedCostEntries, (r) =>
        db.fixedCostEntry.create({ data: { ...r, createdAt: d(r.createdAt) ?? undefined,
          updatedAt: d(r.updatedAt) ?? undefined } })
      );
      await put(body.exercises, (r) =>
        db.exercise.create({ data: { ...r, createdAt: d(r.createdAt) ?? undefined } })
      );
      await put(body.templates, (r) =>
        db.workoutTemplate.create({ data: { ...r, createdAt: d(r.createdAt) ?? undefined } })
      );
      await put(body.templateItems, (r) => db.workoutTemplateItem.create({ data: r }));
      await put(body.workouts, (r) =>
        db.workout.create({ data: { ...r, date: d(r.date)!, createdAt: d(r.createdAt) ?? undefined } })
      );
      await put(body.workoutSets, (r) => db.workoutSet.create({ data: r }));
      await put(body.activities, (r) =>
        db.activity.create({ data: { ...r, date: d(r.date)!, createdAt: d(r.createdAt) ?? undefined } })
      );
    }, { timeout: 120_000 });
  } catch (e: any) {
    console.error("[backup] import nieudany:", e);
    return NextResponse.json(
      { error: "Import nieudany — baza została bez zmian." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
