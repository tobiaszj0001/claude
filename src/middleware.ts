import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Chroni WSZYSTKIE trasy poza /login, /api/auth/*, zasobami PWA i statykami.
const PUBLIC_PATHS = ["/login", "/api/auth"];
const PUBLIC_FILES = [
  "/manifest.webmanifest",
  "/sw.js",
  "/favicon.ico",
  "/robots.txt",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    PUBLIC_FILES.includes(pathname) ||
    pathname.startsWith("/icons/");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  // Zalogowany wchodzący na /login -> przekieruj na stronę główną.
  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPublic) return NextResponse.next();

  if (!authed) {
    // API -> 401, strony -> redirect na /login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Pomijamy tylko wewnętrzne zasoby Next i pliki z rozszerzeniem.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
