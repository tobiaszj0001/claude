import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serialize } from "@/lib/utils";
import { confirmEntry, skipEntry } from "@/lib/fixed-costs.server";

const schema = z.object({
  action: z.enum(["confirm", "skip"]),
  amount: z.coerce.number().positive().optional(),
  date: z.string().datetime().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  if (parsed.data.action === "skip") {
    const res = await skipEntry(params.id);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const res = await confirmEntry(params.id, {
    amount: parsed.data.amount,
    date: parsed.data.date ? new Date(parsed.data.date) : undefined,
  });
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json(serialize(res));
}
