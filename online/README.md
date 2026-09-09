# Ranking online: jak podłączyć (5 minut)

Ranking działa na darmowym Supabase. Każdy z ekipy zakłada w grze konto (ksywka + PIN),
wyniki lecą do chmury i wszyscy widzą wspólną tabelę. Profil synchronizuje się między
telefonem a komputerem.

1. Wejdź na https://supabase.com, załóż konto (można przez GitHub) i kliknij **New project**.
   Nazwa dowolna, np. `opg`, region Frankfurt, hasło do bazy zapisz gdziekolwiek (nie będzie potrzebne w grze).
2. Gdy projekt się utworzy, w menu po lewej kliknij **SQL Editor** → **New query**.
   Wklej całą zawartość pliku `online/supabase.sql` z tego repo i kliknij **Run**. Ma być „Success”.
3. W menu po lewej kliknij **Project Settings** (zębatka) → **API**.
   Skopiuj dwie rzeczy: **Project URL** (np. `https://abcdefgh.supabase.co`) i klucz **anon public** (długi, zaczyna się od `eyJ`).
4. W repo otwórz plik `online-config.js` i podmień linię na:
   ```js
   window.OPG_ONLINE = { url: 'https://abcdefgh.supabase.co', key: 'eyJ...' };
   ```
   Zapisz (commit). Po wdrożeniu w grze pojawi się ekran logowania pod „Ranking online”.

Klucz „anon public” jest z założenia publiczny. Tabela z graczami jest zablokowana (RLS),
dostęp idzie tylko przez funkcje, które sprawdzają PIN. PIN-y są haszowane (bcrypt).

Jeśli wolisz, wyślij mi te dwie wartości w czacie, a ja wpiszę je do pliku.
