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
- Legendy (Król Pała, Watol Wszechwładny) czekają na końcu kampanii. HP mają takie jak wszyscy (mnożnik `LEGEND_MULT` w `game.js`, gdyby ekipa zmieniła zdanie).
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
   dostała koronę i miejsce na końcu kampanii.

## Głosy postaci

Postacie mogą mieć własne nagrania. Wrzuć plik do `sounds/` pod nazwą
`<id>_<zdarzenie>.mp3` (może być też m4a, ogg, wav, wtedy skrypt skonwertuje):

| Zdarzenie | Kiedy gra                               | Przykład                 |
|-----------|-----------------------------------------|--------------------------|
| intro     | przed walką i po kliknięciu w menu      | `cypis_intro.mp3`        |
| cios      | gdy postać trafia przeciwnika           | `cypis_cios.mp3`         |
| obrywa    | gdy postać dostaje                      | `cypis_obrywa.mp3`       |
| blok      | gdy postać blokuje                      | `cypis_blok.mp3`         |
| ko        | gdy postać pada                         | `cypis_ko.mp3`           |
| wygrana   | gdy postać wygrywa walkę                | `cypis_wygrana.mp3`      |
| wybor     | tylko po kliknięciu w menu wyboru       | `cypis_wybor.mp3`        |

Kilka wersji tego samego zdarzenia dostaje numer: `cypis_obrywa2.mp3`, `cypis_obrywa3.mp3`,
gra losuje jedną. Krótkie nagrania (do 2 sekund) działają najlepiej, intro może mieć 3-4 sekundy.

Po wrzuceniu plików uruchom `python3 tools/make_sounds.py` (do konwersji potrzebny ffmpeg albo
`pip install imageio-ffmpeg`). Skrypt wyrównuje głośność i zapisuje listę w `sounds/manifest.json`.
Bez tej listy gra nie wie o nagraniach.

## Pliki

- `index.html`, `style.css`, `game.js`: cała gra, czysty canvas 2D bez bibliotek.
- `assets/heads/`: wycięte głowy (PNG z przezroczystością).
- `photos/`: oryginalne zdjęcia.
- `tools/make_heads.py`: wycinanie głów ze zdjęć.
- `sounds/`: głosy postaci, `tools/make_sounds.py`: budowanie listy nagrań.
