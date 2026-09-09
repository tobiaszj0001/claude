# Strona: video dla firm z gwarancją efektów

Statyczna strona (HTML + CSS + JS). Wgraj pliki na dowolny hosting (Netlify, Vercel, GitHub Pages, home.pl).

## Pliki

| Plik | Co zawiera |
|---|---|
| `index.html` | treść strony: hero, Ty/Ja, opinie, realizacje, gwarancja, cennik, proces, FAQ, rezerwacja |
| `content.js` | **Twoje video, opinie video klientów, realizacje i rolki** |
| `script.js` | `CONFIG` (telefon, e-mail, kalendarz, formularz) + logika |
| `style.css` | wygląd |

## 1. Nagraj i podepnij video (`content.js`)

- **Twoje video w hero** (`founder`): 60–90 s, poziome 16:9, Ty do kamery. Wpisz link w `video`, kadr w `poster`, popraw `chapters` (czas w sekundach, tytuły rozdziałów) i `duration`.
- **Opinie klientów** (`testimonials`): pionowe 9:16, 30–60 s, nagrane telefonem. Masz 3, dodaj 4. i 5. kopiując blok. Układ działa dla 3–5.
- **Realizacje** (`cases`): klient, wyniki, 3 rolki z linkami.

Obsługiwane linki: plik `.mp4` (najlepiej, ładuje się bez logo YouTube), YouTube, Vimeo, Instagram, TikTok.
Pliki mp4 wgraj do folderu `video/` obok `index.html` i wpisz np. `video/opinia-1.mp4`.

## 2. Uzupełnij `CONFIG` w `script.js`

```js
phone: '+48 000 000 000',
email: 'kontakt@twojadomena.pl',
bookingUrl: '',     // Calendly / Cal.com / Google Calendar
formEndpoint: ''    // np. https://formspree.io/f/xxxxxxxx
```

**Kalendarz**: załóż darmowe konto na Calendly lub Cal.com, utwórz wydarzenie „Darmowa konsultacja, 30 min”, połącz z Kalendarzem Google i wklej link. Kalendarz pokaże się w sekcji Kontakt i w oknie po kliknięciu każdego przycisku „Umów darmową konsultację”.

**Formularz**: strona jest statyczna, więc do wysyłki potrzebna jest usługa (Formspree, Web3Forms, Getform). Bez niej formularz otwiera program pocztowy.

## 3. Podmień w `index.html`

- „Imię Nazwisko” w nagłówku i stopce (nazwa marki)
- NIP i link do polityki prywatności w stopce
- linki do profili społecznościowych w sekcji Kontakt
- `og-image.jpg` (1200×630 px) – obrazek przy udostępnianiu linku
- kod Meta Pixel / GA4 w `<head>` (zdarzenie Lead wysyła się automatycznie)

## Do potwierdzenia

Pakiety **Wzrost** i **Skala**, zapis „pracuję dalej za 0 zł” i liczby w przykładowych realizacjach to propozycje. Podmień na swoje.
