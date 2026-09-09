# Strona agencji social media

Statyczna strona (HTML + CSS + JS, bez frameworków). Działa na dowolnym hostingu:
Netlify, Vercel, GitHub Pages, home.pl, OVH itd. Wystarczy wgrać pliki.

## Pliki

| Plik | Co zawiera |
|---|---|
| `index.html` | cała treść strony (teksty, sekcje, cennik, FAQ) |
| `style.css` | wygląd |
| `script.js` | konfiguracja (telefon, e-mail, kalendarz, formularz) + logika |
| `portfolio-data.js` | lista klientów i rolek w portfolio |

## Przed publikacją: uzupełnij `CONFIG` w `script.js`

```js
const CONFIG = {
  phone: '+48 000 000 000',          // Twój numer – podmienia wszystkie przyciski "Zadzwoń"
  email: 'kontakt@socialreach.pl',   // Twój e-mail
  bookingUrl: '',                    // link do kalendarza (patrz niżej)
  formEndpoint: ''                   // usługa wysyłki formularza (patrz niżej)
};
```

### Moduł rezerwacji konsultacji (`bookingUrl`)

Po kliknięciu "Umów darmową konsultację" otwiera się okno z kalendarzem.
Obsługiwane bez dodatkowej konfiguracji:

- **Calendly** – `https://calendly.com/twoja-nazwa/konsultacja-30-min`
- **Cal.com** – `https://cal.com/twoja-nazwa/konsultacja-30-min`
- **Google Calendar** (Harmonogram spotkań → Udostępnij → link) – `https://calendar.app.google/XXXX`

Wszystkie trzy synchronizują się z Twoim Kalendarzem Google i wysyłają
zaproszenia obu stronom. Dopóki `bookingUrl` jest puste, w oknie pokazuje się
formularz zastępczy (imię, telefon, preferowany termin).

### Formularz kontaktowy (`formEndpoint`)

Strona nie ma backendu, więc do wysyłki formularza potrzebna jest usługa:

1. Załóż darmowe konto na [formspree.io](https://formspree.io) (lub Web3Forms, Getform, Basin).
2. Utwórz formularz i skopiuj adres, np. `https://formspree.io/f/abcd1234`.
3. Wklej go do `formEndpoint`.

Dopóki pole jest puste, formularz otwiera program pocztowy z gotową treścią (mailto).

## Portfolio (`portfolio-data.js`)

Każdy klient ma opis, wyniki i listę rolek. Każda rolka ma pole `video`,
w które wklejasz link do Instagrama, TikToka lub YouTube. Po kliknięciu
miniatury rolka odtwarza się w oknie na stronie. Pole `thumb` to opcjonalna
miniatura (np. `img/glow-1.jpg`); bez niej wyświetla się kolorowy gradient.

## Co jeszcze podmienić w `index.html`

- nazwa marki `SocialReach` (nagłówek, stopka, `<title>`)
- sekcja **O mnie**: imię, nazwisko, lata doświadczenia, liczby, zdjęcie
- sekcja **Opinie**: prawdziwe opinie klientów
- pasek **Zaufały mi firmy**: logotypy klientów
- stopka: NIP, link do polityki prywatności
- `og-image.jpg`: obrazek 1200×630 px pokazywany przy udostępnianiu linku
- kod **Meta Pixel / GA4** w `<head>` (miejsce oznaczone komentarzem);
  zdarzenie `Lead` wysyła się automatycznie po wysłaniu formularza i otwarciu rezerwacji

## Cennik i gwarancja

Teksty pakietów i zasady gwarancji są w `index.html` (sekcje `#cennik` i `#gwarancja`).
Pakiety **Wzrost** i **Skala** oraz zapis „pracuję dalej bez opłat, jeśli nie dowiozę”
to propozycje do potwierdzenia.
