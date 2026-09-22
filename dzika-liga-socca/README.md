# Dzika Liga Socca — strona ligi

Statyczna strona (HTML + CSS + JS, bez backendu). Otwórz `index.html` w przeglądarce
albo wrzuć folder na dowolny hosting (GitHub Pages, Netlify, home.pl).

## Jak aktualizować

Cała treść jest w **`data.js`**:

- `liga` — nazwa, sezon, miasto, boisko, kontakt, wpisowe, link do Facebooka.
- `druzyny` — lista drużyn (nazwa, skrót na herbie, kolory herbu, kapitan).
- `kolejki` — terminarz. Wpisz `wynik: [gole gospodarza, gole gościa]` po meczu
  i strzelców w `strzelcy`. Mecz bez wyniku ma `wynik: null`.
- `aktualnosci`, `partnerzy`, `faq`.

**Tabela, forma, klasyfikacja strzelców, pasek wyników i „najbliższa kolejka”
liczą się automatycznie** z wyników w `kolejki`.

Kolorystyka: zmienne w `:root` na początku `style.css` (`--accent`, `--bg` itd.).
Logo: SVG w `index.html` (nagłówek) i `assets/favicon.svg`.

## Status

Dane drużyn, wyników i kolory są **przykładowe** — do podmiany na prawdziwe
z dzikaligasocca.pl i grafik z Facebooka ligi.
