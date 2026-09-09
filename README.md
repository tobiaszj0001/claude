# NAVI partner — strona internetowa

Statyczna strona partnera rozliczeniowego dla kierowców taxi (Uber, Bolt, FreeNow) i kurierów.
Zbudowana w czystym HTML, CSS i JavaScript — bez zależności i procesu budowania.

## Struktura

- `index.html` — treść strony (hero, oferta, jak to działa, cennik, benefity Medicover Sport, opinie, FAQ, kontakt)
- `style.css` — style oparte na identyfikacji wizualnej (błękit `#2F5CF0`, granat `#060B1A`)
- `script.js` — menu mobilne, animacje, liczniki, walidacja formularza
- `assets/logo.svg`, `assets/logo-mark.svg` — logo odtworzone w SVG

## Uruchomienie

Otwórz `index.html` w przeglądarce albo wystaw folder na dowolnym hostingu statycznym
(GitHub Pages, Netlify, Vercel, zwykły serwer WWW).

## Do uzupełnienia przed publikacją

- Dane kontaktowe: telefon, e‑mail i adres biura (sekcja **Kontakt** i stopka)
- Cennik i liczby w sekcji hero (liczba kierowców, czas startu)
- Opinie kierowców — obecnie przykładowe
- Linki do regulaminu, polityki prywatności i social mediów
- Wysyłka formularza — w `script.js` podłącz własne API lub usługę typu Formspree
