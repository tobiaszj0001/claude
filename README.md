# NAVI Partner — strona internetowa

Statyczna strona certyfikowanego partnera rozliczeniowego Uber i Bolt (Navi Partner sp. z o.o., Kraków).
Czysty HTML, CSS i JavaScript — bez zależności i procesu budowania.

## Struktura

- `index.html` — treść strony: hero, pasek zaufania, oferta, dlaczego partner (Lex Uber), wymagania 2026, jak to działa, kalkulator wypłaty, cennik, miasta, benefity Medicover Sport i program poleceń, opinie, poradnik, FAQ, kontakt z komunikatorami, stopka z danymi rejestrowymi
- `style.css` — style oparte na identyfikacji wizualnej (błękit `#2F5CF0`, granat `#060B1A`)
- `script.js` — menu mobilne, animacje, liczniki, kalkulator, walidacja formularza
- `i18n.js` — tłumaczenia ukraińskie i angielskie (przełącznik PL / UA / EN w nagłówku, wybór zapamiętywany w przeglądarce, automatyczne wykrywanie języka przeglądarki)
- `assets/logo.svg`, `assets/logo-mark.svg` — logo odtworzone w SVG

## Uruchomienie

Otwórz `index.html` w przeglądarce albo wystaw folder na dowolnym hostingu statycznym
(GitHub Pages, Netlify, Vercel, zwykły serwer WWW).

## Dane zweryfikowane w publicznych rejestrach

- Navi Partner sp. z o.o., ul. Prandoty 10A/104, 31‑435 Kraków
- KRS 0000946399, NIP 6762609777, REGON 520971439, rejestracja 2022
- Miasta: Kraków (centrala), Warszawa, Katowice, Lublin, Radom
- Facebook: NaviPartnerPL, Instagram: navi.partner, profil OLX
- Wyróżnienia 2024: Gepard Biznesu, Efektywna Firma, Mocna Firma Godna Zaufania

## Placeholdery do uzupełnienia przed publikacją

- **Numery telefonów** do biur (`+48 000 000 001`…`005`) w sekcji Miasta, Kontakt i pasku mobilnym; numer WhatsApp w linku `wa.me`
- **Telegram** — link `t.me/navipartner` jest przykładowy
- **Ceny planów** (39 zł / 59 zł tygodniowo) i model opłaty — do potwierdzenia z firmą
- **Premia za polecenie** (200 zł) i warunek 4 tygodni
- **Opinie kierowców** — przykładowe, zastąp prawdziwymi z Facebooka lub Google
- **Godziny infolinii**, linki do regulaminu i polityki prywatności
- **Wysyłka formularza** — w `script.js` podłącz własne API lub usługę typu Formspree
- **Stawki w kalkulatorze** (`script.js`, funkcja `recalc`) — orientacyjne stawki 2026; zaktualizuj przy zmianie przepisów

Uwaga: domena `navipartner.pl` należy do innej firmy (sklep z lokalizatorami GPS). Strona nie używa adresu e‑mail w tej domenie.
