# Kojny Live — wyniki Ekstraklasy z zakładami za Kojny

Strona typu Flashscore dla PKO BP Ekstraklasy 2026/27: terminarz, wyniki kolejek, tabela
i zakłady bukmacherskie za **Kojny (KJ)** — wirtualną walutę, nie pieniądze.

## Uruchomienie
Otwórz `index.html` w przeglądarce (nie wymaga serwera). Portfel, kupony i motyw
zapisują się w `localStorage` tej przeglądarki.

## Dane
- `data.js` — wbudowany snapshot (wyniki kolejek 1–8, mecze zaległe, plan 9. kolejki) z 15.09.2026.
- Po otwarciu strona próbuje pobrać aktualne mecze i tabelę z TheSportsDB
  (liga id 4422, darmowy klucz testowy). Gdy się uda, w nagłówku pojawi się „Na żywo”;
  w przeciwnym razie zostaje snapshot. Przycisk „Odśwież” powtarza pobieranie.
- Kursy są liczone z formy drużyn (punkty/mecz, bilans bramek, atut własnego boiska) —
  są orientacyjne, nie pochodzą od bukmachera.

## Kody doładowania Kojnów
| Kod | Ile | Uwagi |
|---|---|---|
| `KOJNY2026` | +1000 KJ | działa zawsze, bez limitu |
| `KOJNY+<kwota>` | dowolna, np. `KOJNY+2500` | działa zawsze |
| `START500` | +500 KJ | jednorazowy |
| `MISTRZ` | +250 KJ | jednorazowy |
| `DERBY` | +100 KJ | jednorazowy |
| `BANKRUT` | +200 KJ | tylko gdy saldo < 20 KJ |

Kody edytujesz w `app.js` w obiekcie `PROMO`.

## Kupony
Kliknij kurs (1 / X / 2, a po rozwinięciu także +2,5 / −2,5 gola), ustaw stawkę, „Postaw kupon”.
Kilka typów tworzy kupon AKO (kursy się mnożą). Kupony rozliczają się automatycznie,
gdy strona zobaczy końcowy wynik (po odświeżeniu danych na żywo).
