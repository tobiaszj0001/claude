# TobiaszCRM

Osobisty system do zarządzania życiem — jeden użytkownik, dostęp z przeglądarki
na telefonie i komputerze. Łączy kalendarz, zadania, finanse (przychody, koszty,
koszty stałe), moduł treningowy i cele w jednym miejscu.

Waluta: **PLN**. Strefa czasowa: **Europe/Warsaw**. Interfejs po polsku.

---

## Stack

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Style | Tailwind CSS (własne komponenty, mobile-first) |
| Baza | Prisma + PostgreSQL (Neon na produkcji, lokalny Postgres w dev) |
| Wykresy | Recharts |
| Logowanie | hasło w zmiennej środowiskowej (bcrypt) + sesja JWT w cookie `httpOnly` |
| Testy | Vitest (logika biznesowa) |
| PWA | manifest + service worker |

---

## Uruchomienie lokalnie

```bash
# 1. Zależności
npm install

# 2. Konfiguracja
cp .env.example .env

# 3. Wygeneruj hash hasła i wklej go do .env jako AUTH_PASSWORD_HASH
node scripts/hash-password.mjs "twoje-haslo"

# 4. Wygeneruj sekret sesji i wklej do .env jako AUTH_SECRET
openssl rand -base64 48

# 5. Baza — potrzebujesz Postgresa. Najprościej darmowa baza na Neonie
#    (ta sama co produkcja) albo lokalny Postgres w Dockerze:
#    docker run -d --name tcrm-pg -e POSTGRES_PASSWORD=postgres \
#      -p 5432:5432 postgres:16
#    Wtedy DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

# 6. Schema + dane przykładowe (ostatnie 3 miesiące)
npm run db:push
npm run db:seed

# 7. Start
npm run dev
```

Aplikacja: http://localhost:3000 — zostaniesz przekierowany na `/login`.

### Przydatne komendy

| Komenda | Opis |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | build produkcyjny |
| `npm test` | testy jednostkowe |
| `npm run db:push` | zsynchronizuj schema z bazą |
| `npm run db:seed` | wypełnij bazę danymi przykładowymi |
| `npm run db:reset` | wyczyść bazę i zasiej od nowa |
| `npm run db:studio` | przeglądarka bazy (Prisma Studio) |

---

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `DATABASE_URL` | connection string do Postgresa (Neon na produkcji) |
| `AUTH_PASSWORD_HASH` | hash bcrypt hasła do aplikacji (`scripts/hash-password.mjs`) |
| `AUTH_SECRET` | losowy sekret (min. 32 znaki) do podpisywania sesji |
| `TZ` | `Europe/Warsaw` |

**Nigdy nie commituj `.env`.** Plik jest w `.gitignore`; wzór zmiennych trzymamy
w `.env.example`.

---

## Wdrożenie na Netlify + Neon

Konfiguracja builda jest w `netlify.toml` — Netlify sam wykryje Next.js
i użyje runtime'u `@netlify/plugin-nextjs`.

### 1. Baza na Neonie

Załóż projekt na [neon.tech](https://neon.tech) i skopiuj connection string
w postaci `postgresql://…?sslmode=require`.

### 2. Zmienne środowiskowe w Netlify

*Site configuration → Environment variables* — ustaw:

| Zmienna | Wartość |
|---|---|
| `DATABASE_URL` | connection string z Neona |
| `AUTH_PASSWORD_HASH` | hash z `node scripts/hash-password.mjs "haslo"` |
| `AUTH_SECRET` | `openssl rand -base64 48` |

> **Uwaga na hash.** W panelu Netlify wklejasz hash **surowy**
> (`$2a$10$...`). Escapowanie znaków `$` przez `\$` obowiązuje **wyłącznie**
> w lokalnym pliku `.env` — Next.js rozwija tam zmienne. Wklejenie
> zescapowanej wersji do panelu skończy się komunikatem „Błędne hasło".

### 3. Utwórz tabele w bazie (raz)

Build celowo **nie** dotyka schematu bazy — automatyczne migracje przy każdym
deployu to najprostsza droga do zepsucia danych. Uruchom lokalnie:

```bash
DATABASE_URL="<neon-url>" npx prisma db push
```

Opcjonalnie dane przykładowe: `DATABASE_URL="<neon-url>" npm run db:seed`.
(Seed **czyści bazę przed zasianiem** — nie odpalaj go na bazie z realnymi
danymi.)

### 4. Deploy

Po połączeniu repozytorium Netlify buduje przy każdym pushu. Domyślnie
buduje się tylko gałąź produkcyjna — jeśli chcesz podglądać pracę z gałęzi
`claude/*`, włącz *branch deploys* w *Build & deploy → Branches*.

### 5. Sprawdź, czy ochrona działa

Aplikacja nie może być publicznie dostępna. Po pierwszym deployu:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<twoja-domena>/api/items   # 401
curl -s -o /dev/null -w "%{http_code}\n" https://<twoja-domena>/            # 307
```

`401` i `307` oznaczają, że middleware działa. Jeśli zobaczysz `200` —
nie wgrywaj tam żadnych realnych danych, dopóki to nie zostanie naprawione.

---

## Kopia zapasowa

*Ustawienia* → eksport wszystkich danych do JSON (pełny backup) albo transakcji
do CSV. Import wgrywa plik JSON, **zastępując całą zawartość bazy** — operacja
jest w transakcji, więc nieudany import zostawia bazę bez zmian.

## PWA

`manifest.webmanifest` + service worker (`public/sw.js`). Aplikację można
zainstalować na telefonie z menu przeglądarki („Dodaj do ekranu głównego").

Service worker **celowo nie cache'uje odpowiedzi API** — pokazanie
nieaktualnego stanu konta byłoby gorsze niż komunikat o braku sieci.
Cache'owana jest tylko powłoka offline i statyczne zasoby.

## Bezpieczeństwo

To są dane finansowe — aplikacja nie ma żadnych publicznych stron poza ekranem
logowania:

- `src/middleware.ts` chroni **wszystkie** trasy i endpointy API poza `/login`
  i `/api/auth/*`; nieautoryzowane żądania do API dostają `401`, a strony
  przekierowanie na `/login`.
- Hasło trzymamy wyłącznie jako hash bcrypt w zmiennej środowiskowej.
- Sesja to podpisany JWT w cookie `httpOnly`, `sameSite=lax`, `secure`
  na produkcji. „Zapamiętaj mnie" wydłuża ważność do 30 dni.
- Prosty limit prób logowania (5 prób → 30 s przerwy).
- Brak konfiguracji nie odsłania danych: gdy zabraknie `AUTH_SECRET` lub
  `AUTH_PASSWORD_HASH`, middleware **zamyka** dostęp (307/401), a `/login`
  nadal się otwiera i logowanie zwraca czytelne `503` z nazwą brakującej
  zmiennej — zamiast pustego 500.

### Pułapka: Edge Runtime a bcrypt

Middleware Next.js działa w **Edge Runtime** (na Netlify jako funkcja Deno),
gdzie nie ma API Node. Zaimportowanie `bcryptjs` do middleware — choćby
pośrednio, przez wspólny moduł `auth.ts` — wywala funkcję przy starcie
i daje **500 na każdej trasie, łącznie z `/login`**, więc aplikacji nie da
się nawet otworzyć.

Dlatego kod jest rozdzielony:

| Moduł | Runtime | Zawiera |
|---|---|---|
| `src/lib/session.ts` | Edge (i Node) | tylko `jose` — podpisywanie i weryfikacja sesji |
| `src/lib/password.ts` | wyłącznie Node | `bcryptjs`, oznaczony `server-only` |

Middleware importuje **tylko** `session.ts`. Route `/api/auth/login` ma
`export const runtime = "nodejs"`. Pilnuje tego zestaw testów
`src/lib/edge-safety.test.ts` — `npm test` wyłapie regresję, zanim trafi
na produkcję.

> `next dev` **nie** wykrywa tego problemu, bo uruchamia middleware
> w pobłażliwym sandboksie Node. Błąd pojawia się dopiero po wdrożeniu.

---

## Model danych (skrót)

- **Item** — wspólny model dla `EVENT` (blok czasu), `TASK` (zadanie bez czasu)
  i `TIMED_TASK` (zadanie na konkretną godzinę). Walidacja pilnuje, że EVENT ma
  `startAt`/`endAt`, a TIMED_TASK `dueAt`.
- **Transaction** — przychody (tylko Biznes) i koszty; kwoty jako `Decimal`.
- **FixedCost** + **FixedCostEntry** — koszty stałe nie księgują się same;
  każdy miesiąc czeka na zatwierdzenie (`PENDING` → `CONFIRMED` / `SKIPPED`).
- **Exercise / WorkoutTemplate / WorkoutTemplateItem** — baza ćwiczeń i szablony.
- **Workout / WorkoutSet / Activity** — historia wykonanych treningów.
- **Goal** — cele; `isMainFocus` wyróżnia główny cel obszaru.

---

## Status budowy

| Etap | Zakres | Status |
|---|---|---|
| 1 | Fundament: repo, Next.js, Tailwind, Prisma, seed, logowanie, nawigacja, dark mode | ✅ |
| 2 | Itemy: model, CRUD, wspólny modal, PILNE, sortowanie, odhaczanie | ✅ |
| 3 | Ekran główny: kalendarz (miesiąc/tydzień/dzień), lista na dziś, zaległe | ✅ |
| 4 | Finanse: transakcje, koszty stałe, karta stanu konta | ✅ |
| 5 | Biznes: trzy podzakładki, przychód/koszty/dochód, widok zbiorczy | ✅ |
| 6 | Sport: moduł treningów, historia, wykresy progresu | ✅ |
| 7 | Życie: wydarzenia, oś czasu, koszty | ✅ |
| 8 | Podsumowania i cele: okresy, porównania, główny cel | ✅ |
| 9 | PWA + deploy: manifest, offline shell, Netlify + Neon | ✅ |

---

## Podgląd interfejsu (artifact)

Poza aplikacją utrzymywany jest samodzielny, klikalny podgląd
(`scratchpad/preview.html`, publikowany jako artifact) — jeden plik HTML
bez zależności, ze stanem w pamięci przeglądarki. Służy do oglądania
i oceniania interfejsu bez stawiania bazy i serwera.

**Podgląd nie zapisuje danych** — odświeżenie strony przywraca stan
wyjściowy. To makieta do recenzji, nie miejsce na realne dane.

Ponieważ to druga, równoległa implementacja tego samego interfejsu, łatwo
o rozjazd. `scripts/audit-parity.mjs` porównuje oba: przechodzi po
wszystkich zakładkach w aplikacji i w podglądzie, zbiera widoczne akcje
i nagłówki, po czym wypisuje, czego brakuje w podglądzie.

```bash
npm run dev                      # aplikacja na :3000
node scripts/serve-preview.mjs   # podgląd na :4000
node scripts/audit-parity.mjs    # różnice
```

Podgląd serwujemy przez HTTP, a nie przez `file://` — przy `file://`
przeglądarka zgaduje kodowanie i polskie znaki się psują, czego
opublikowany artifact nie robi (dostaje `charset=utf-8` w nagłówku).
