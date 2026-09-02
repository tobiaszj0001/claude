// Service worker TobiaszCRM.
//
// Świadomie NIE cache'ujemy odpowiedzi API ani stron z danymi — to dane
// finansowe i treningowe, a pokazanie nieaktualnego stanu konta byłoby
// gorsze niż komunikat o braku sieci. Trzymamy tylko powłokę offline
// i statyczne zasoby.

const VERSION = "v1";
const SHELL_CACHE = `tcrm-shell-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const SHELL_ASSETS = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API i logowanie zawsze z sieci — żadnego cache'owania danych.
  if (url.pathname.startsWith("/api/") || url.pathname === "/login") return;

  // Nawigacja: sieć, a gdy jej nie ma — strona offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error()))
    );
    return;
  }

  // Statyczne zasoby: cache-first, w tle uzupełniany.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
