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
| Baza | Prisma — SQLite lokalnie, Postgres (Neon) na produkcji |
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

# 5. Baza + dane przykładowe (ostatnie 3 miesiące)
npm run db:push
npm run db:seed

# 6. Start
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
| `DATABASE_URL` | SQLite lokalnie (`file:./dev.db`), Postgres na produkcji |
| `AUTH_PASSWORD_HASH` | hash bcrypt hasła do aplikacji (`scripts/hash-password.mjs`) |
| `AUTH_SECRET` | losowy sekret (min. 32 znaki) do podpisywania sesji |
| `TZ` | `Europe/Warsaw` |

**Nigdy nie commituj `.env`.** Plik jest w `.gitignore`; wzór zmiennych trzymamy
w `.env.example`.

---

## Wdrożenie na Vercel + Neon

1. **Baza (Neon).** Załóż projekt na [neon.tech](https://neon.tech), skopiuj
   connection string (`postgresql://…?sslmode=require`).

2. **Przełącz Prismę na Postgresa.** W `prisma/schema.prisma` zmień:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Schema jest kompatybilna z obydwoma silnikami — „enumy" trzymamy jako `String`
   i walidujemy w kodzie (Zod), więc nic więcej nie trzeba zmieniać.

3. **Vercel.** Zaimportuj repozytorium, a w *Settings → Environment Variables*
   ustaw `DATABASE_URL`, `AUTH_PASSWORD_HASH`, `AUTH_SECRET` i `TZ`.

4. **Migracja schematu na produkcji:**
   ```bash
   DATABASE_URL="<neon-url>" npx prisma db push
   ```
   Opcjonalnie dane przykładowe: `DATABASE_URL="<neon-url>" npm run db:seed`.

5. **Deploy.** `npm run build` uruchamia `prisma generate` automatycznie.

---

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
| 4 | Finanse: transakcje, koszty stałe, karta stanu konta | ⏳ |
| 5 | Biznes: trzy podzakładki, przychód/koszty/dochód, widok zbiorczy | ⏳ |
| 6 | Sport: moduł treningów, historia, wykresy progresu | ⏳ |
| 7 | Życie: wydarzenia, oś czasu, koszty | ⏳ |
| 8 | Podsumowania i cele: okresy, porównania, główny cel | ⏳ |
| 9 | PWA + deploy: manifest, offline shell, Vercel + Neon | ⏳ |
