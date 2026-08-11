// Hasło — kod wyłącznie dla środowiska Node (nigdy dla Edge Runtime).
// `bcryptjs` nie może trafić do bundla middleware, bo na Netlify middleware
// działa jako funkcja edge i wywala się przy starcie (500 na każdej trasie).

import "server-only";
import bcrypt from "bcryptjs";

/** Czy hash hasła jest skonfigurowany. */
export function hasPasswordHash(): boolean {
  return !!process.env.AUTH_PASSWORD_HASH;
}

/** Weryfikuje hasło względem hasha z env. */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) throw new Error("AUTH_PASSWORD_HASH nie jest ustawiony.");
  return bcrypt.compare(password, hash);
}
