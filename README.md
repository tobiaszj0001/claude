# Only Pantslow Gang: Turniej

Bokserska bijatyka w przeglądarce. Patyczaki z głowami ekipy walczą o tytuł
**Króla Only Pantslow Gang**. Działa na komputerze i na telefonie, bez instalacji.

## Jak uruchomić

Najprościej: włącz GitHub Pages dla tego brancha (Settings → Pages → branch
`only-pantslow-gang`, folder `/`). Po chwili gra będzie pod adresem
`https://tobiaszj0001.github.io/claude/`.

Lokalnie: otwórz `index.html` w przeglądarce albo odpal `python3 -m http.server`
w tym folderze i wejdź na `http://localhost:8000`.

## Sterowanie

| Akcja       | Solo / Gracz 1              | Gracz 2 (tryb 2 graczy)  |
|-------------|-----------------------------|--------------------------|
| Ruch        | A / D lub ← / →             | ← / →                    |
| Skok        | W lub ↑                     | ↑                        |
| Unik        | S lub ↓                     | ↓                        |
| Cios        | Spacja lub F                | K                        |
| Mocny cios  | G                           | L                        |
| Blok        | Shift lub H                 | ; lub prawy Shift        |
| Pauza       | Esc lub P                   |                          |

Na telefonie pojawiają się przyciski na ekranie. Graj poziomo.

## Zasady

- Kampania: pokonujesz po kolei całą ekipę, na końcu dwie legendy.
- Legendy (Król Pała, Watol Wszechwładny) mają 10x więcej HP.
- Blok zmniejsza obrażenia do 15%, mocny cios przełamuje blok.
- Unik daje chwilę nietykalności.
- Kolejne trafienia bez oberwania podbijają mnożnik combo do 2x.
- Zwycięzca kampanii trafia do listy królów w menu (zapis w przeglądarce).

## Dodawanie nowej postaci

1. Wrzuć zdjęcie do `photos/` pod nazwą będącą ksywką, np. `photos/zenek.jpg`
   (małe litery, bez polskich znaków i spacji).
2. Wygeneruj głowę:
   ```
   pip install pillow numpy "opencv-python-headless<4.13"
   python3 tools/make_heads.py
   ```
   Powstanie `assets/heads/zenek.png`.
3. Dopisz postać do listy `ROSTER` na górze `game.js`:
   ```js
   { id: 'zenek', name: 'Zenek', title: 'Postrach Osiedla', glove: '#00ff88', speed: 1.0, power: 1.0, taunt: 'Zaraz zobaczysz.' },
   ```
   `speed` i `power` w okolicach 0.85–1.2. Dodaj `legendary: true`, żeby postać
   dostała 10x HP i koronę.

## Pliki

- `index.html`, `style.css`, `game.js`: cała gra, czysty canvas 2D bez bibliotek.
- `assets/heads/`: wycięte głowy (PNG z przezroczystością).
- `photos/`: oryginalne zdjęcia.
- `tools/make_heads.py`: wycinanie głów ze zdjęć.
