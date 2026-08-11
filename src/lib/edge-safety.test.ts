import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Regresja: middleware działa w Edge Runtime (na Netlify jako funkcja Deno).
// Wciągnięcie tam `bcryptjs` wywala funkcję przy starcie i daje 500 na KAŻDEJ
// trasie — łącznie z /login, więc aplikacji nie da się nawet otworzyć.
// `next dev` tego nie wyłapuje, bo uruchamia middleware w pobłażliwym
// sandboksie Node. Dlatego pilnujemy tego testem na poziomie źródeł.

/** Wczytuje plik BEZ komentarzy — inaczej test potyka się o słowo
 *  „bcrypt" użyte w komentarzu ostrzegawczym zamiast w kodzie. */
function readCode(p: string): string {
  return readFileSync(resolve(process.cwd(), p), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("bezpieczeństwo Edge Runtime", () => {
  it("middleware nie importuje bcrypta ani modułu haseł", () => {
    const src = readCode("src/middleware.ts");
    expect(src).not.toMatch(/bcrypt/);
    expect(src).not.toMatch(/@\/lib\/password/);
  });

  it("middleware korzysta wyłącznie z modułu sesji", () => {
    const src = readCode("src/middleware.ts");
    const imports = [...src.matchAll(/from\s+"(@\/[^"]+)"/g)].map((m) => m[1]);
    expect(imports).toEqual(["@/lib/session"]);
  });

  it("moduł sesji jest wolny od zależności Node", () => {
    const src = readCode("src/lib/session.ts");
    expect(src).not.toMatch(/bcrypt/);
    expect(src).not.toMatch(/from\s+"node:/);
    expect(src).not.toMatch(/require\(/);
  });

  it("moduł haseł jest oznaczony jako serwerowy", () => {
    const src = readCode("src/lib/password.ts");
    expect(src).toMatch(/server-only/);
  });

  it("route logowania wymusza runtime Node (bcrypt nie działa na Edge)", () => {
    const src = readCode("src/app/api/auth/login/route.ts");
    expect(src).toMatch(/runtime\s*=\s*"nodejs"/);
  });
});
