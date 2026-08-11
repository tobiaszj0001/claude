import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "tcrm_session";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET nie jest ustawiony (min. 16 znaków).");
  }
  return new TextEncoder().encode(secret);
}

/** Weryfikuje hasło względem hasha z env. */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) throw new Error("AUTH_PASSWORD_HASH nie jest ustawiony.");
  return bcrypt.compare(password, hash);
}

/** Tworzy podpisany token sesji. remember=true -> 30 dni, inaczej 1 dzień. */
export async function createSessionToken(remember: boolean): Promise<{ token: string; maxAge: number }> {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const token = await new SignJWT({ sub: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecret());
  return { token, maxAge };
}

/** Zwraca true, jeśli token jest ważny. Bezpieczne dla edge/middleware. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
