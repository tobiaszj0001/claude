import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Chroni WSZYSTKIE trasy poza /login, /api/auth/*, zasobami PWA i statykami.
//
// WAŻNE: middleware działa w Edge Runtime (na Vercel jako Edge Function).
// Importujemy tylko `@/lib/session` (jose). Wciągnięcie tu `bcryptjs`
// wywala funkcję edge przy starcie i daje 500 na każdej trasie — łącznie
// z /login, przez co nie da się nawet zalogować.
const PUBLIC_PATHS = ["/login", "/api/auth"];
const PUBLIC_FILES = [
  "/manifest.webmanifest",
  "/sw.js",
  "/favicon.ico",
  "/robots.txt",
  "/offline.html",
];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    PUBLIC_FILES.includes(pathname) ||
    pathname.startsWith("/icons/")
  );
}

function denyResponse(req: NextRequest, pathname: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  const url = new URL("/login", req.url);
  if (pathname !== "/") url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const authed = await verifySessionToken(token);

    // Zalogowany wchodzący na /login -> przekieruj na stronę główną.
    if (pathname === "/login" && authed) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isPublicPath(pathname)) return NextResponse.next();

    if (!authed) return denyResponse(req, pathname);

    return NextResponse.next();
  } catch (err) {
    // Cokolwiek pójdzie nie tak (np. brak AUTH_SECRET) — nie zwracamy 500,
    // tylko zamykamy dostęp. Ekran logowania musi zostać osiągalny, inaczej
    // aplikacja jest nie do odratowania bez redeployu.
    console.error("[middleware] błąd autoryzacji:", err);
    if (isPublicPath(pathname)) return NextResponse.next();
    return denyResponse(req, pathname);
  }
}

export const config = {
  // Pomijamy tylko wewnętrzne zasoby Next.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
