# Coin Live — wyniki Ekstraklasy z zakładami za Coiny

Strona typu Flashscore dla PKO BP Ekstraklasy 2026/27: terminarz, wyniki kolejek, tabela
i zakłady bukmacherskie za **Coiny (CN)** — wirtualną walutę, nie pieniądze.

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

## Herby
Prawdziwe herby klubów leżą w `herby/<id drużyny>.png` (139×181 px, przezroczyste tło),
pobrane z publicznego repozytorium [luukhopman/football-logos](https://github.com/luukhopman/football-logos).
Gdy plik się nie wczyta, strona pokazuje kolorowy znaczek ze skrótem klubu.

## Kody doładowania Coinów
| Kod | Ile | Uwagi |
|---|---|---|
| `COIN2026` | +1000 CN | działa zawsze, bez limitu |
| `COIN+<kwota>` | dowolna, np. `COIN+2500` | działa zawsze |
| `START500` | +500 CN | jednorazowy |
| `MISTRZ` | +250 CN | jednorazowy |
| `DERBY` | +100 CN | jednorazowy |
| `BANKRUT` | +200 CN | tylko gdy saldo < 20 CN |

Kody edytujesz w `app.js` w obiekcie `PROMO`.

## Kupony
Kliknij kurs (1 / X / 2, a po rozwinięciu także +2,5 / −2,5 gola), ustaw stawkę, „Postaw kupon”.
Kilka typów tworzy kupon AKO (kursy się mnożą). Kupony rozliczają się automatycznie,
gdy strona zobaczy końcowy wynik (po odświeżeniu danych na żywo).
