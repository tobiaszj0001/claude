import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(1, "Podaj hasło"),
  remember: z.boolean().optional().default(false),
});

// Prosta ochrona przed brute-force w pamięci procesu.
let attempts = 0;
let lockedUntil = 0;

export async function POST(req: NextRequest) {
  if (Date.now() < lockedUntil) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj za chwilę." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const ok = await verifyPassword(parsed.data.password);
  if (!ok) {
    attempts += 1;
    if (attempts >= 5) {
      lockedUntil = Date.now() + 30_000;
      attempts = 0;
    }
    return NextResponse.json({ error: "Błędne hasło" }, { status: 401 });
  }

  attempts = 0;
  const { token, maxAge } = await createSessionToken(parsed.data.remember);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
