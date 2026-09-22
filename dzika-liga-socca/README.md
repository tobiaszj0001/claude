# Dzika Liga Socca — strona ligi

Statyczna strona (HTML + CSS + JS, bez backendu) w stylu grafik meczowych ligi.
Otwórz `index.html` w przeglądarce albo wrzuć folder na dowolny hosting
(GitHub Pages, Netlify, home.pl).

## Jak aktualizować

Cała treść jest w **`data.js`**:

- `liga` — nazwa, sezon, region, kontakt, linki social.
- `ligi[]` — dwie ligi. W każdej: `druzyny` (nazwa, skrót, kolory herbu, plik logo),
  `mecze` (kolejka, data, godzina, gospodarz, gość, `wynik: [x, y]` albo `null`),
  `strzelcy`, `asystenci`.
- `brutal` — ranking kartek, `aktualnosci`, `partnerzy`, `onas`, `wspolpraca`.

**Tabele, pasek wyników i statystyki liczą się automatycznie** z wyników w `mecze`
(punkty → różnica bramek → bramki strzelone, tak jak na dzikaligasocca.pl).

## Grafiki

- Herby drużyn: wrzuć pliki do `assets/teams/` (nazwy z pola `logo` w `data.js`,
  czyli te same co na stronie WordPress). Bez pliku strona rysuje herb z inicjałów.
- Logotypy partnerów: `assets/partners/` (nazwy w `data.js`). Bez pliku pokazuje nazwę.
- Logo ligi jest odwzorowane w CSS (korona + napis). Żeby użyć pliku, podmień
  blok `.brand--hero` w `index.html` na `<img>`.

Kolorystyka: zmienne w `:root` na początku `style.css` (`--lime`, `--navy`, `--cream`).
