// Sesja — TYLKO kod bezpieczny dla Edge Runtime (middleware).
//
// UWAGA: ten plik importuje middleware, które na Vercel działa jako funkcja
// edge (Deno). Nie wolno tu wciągać niczego z Node API — w szczególności
// `bcryptjs`. Hashowanie hasła siedzi w `password.ts` i jest używane
// wyłącznie po stronie serwera Node (route /api/auth/login).

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "tcrm_session";

export const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30; // 30 dni
export const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24; // 1 dzień

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET nie jest ustawiony (min. 16 znaków).");
  }
  return new TextEncoder().encode(secret);
}

/** Czy sekret sesji jest w ogóle skonfigurowany (do czytelnych błędów). */
export function hasSessionSecret(): boolean {
  const s = process.env.AUTH_SECRET;
  return !!s && s.length >= 16;
}

/** Tworzy podpisany token sesji. remember=true -> 30 dni, inaczej 1 dzień. */
export async function createSessionToken(
  remember: boolean
): Promise<{ token: string; maxAge: number }> {
  const maxAge = remember ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_DEFAULT;
  const token = await new SignJWT({ sub: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecret());
  return { token, maxAge };
}

/** Zwraca true, jeśli token jest ważny. Nigdy nie rzuca. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
