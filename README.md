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
| Supermoc    | E lub Q (solo też Enter)    | O lub I                  |
| Pauza       | Esc lub P                   |                          |

Na telefonie pojawiają się przyciski na ekranie. Graj poziomo.

## Tryby

- **Kampania**: pokonujesz po kolei całą ekipę, legendy na końcu, tytuł Króla i korona.
- **Przetrwanie**: cała ekipa po kolei w losowej kolejności, między falami odzyskujesz tylko 30 HP. Liczy się liczba pokonanych.
- **2 graczy**: jedna klawiatura, WASD kontra strzałki.

## Supermoce

Każda postać ma jedną. Pasek MOCY pod paskiem HP ładuje się od zadawania i przyjmowania ciosów
(i powoli sam). Gdy jest pełny, wciśnij E (gracz 2: O, telefon: przycisk MOC).

| Postać | Supermoc | Co robi |
|--------|----------|---------|
| Miśka | Słomkowa Zamrażarka | rzut napojem, trafiony zamarza na 1,5 s, 12 HP |
| Bianka | Neonowy Błysk | przeciwnik ma pomylone kierunki przez 3 s, 8 HP |
| Cypis | Cień z Bytomia | teleport za plecy i cios za 22 HP |
| Diddy | Piorun z Fryzury | piorun w miejsce przeciwnika po 0,6 s, 26 HP, da się uciec |
| Gaździoł | Garnitur Pancerny | 6 s pancerza: 30% obrażeń, mocniejsze odrzuty |
| Miszalinaq | Buziak Zagłady | całus: 14 HP, ogłuszenie 1 s, leczy 18 HP |
| Piotszu | Laser z Okularów | laser na wysokości głowy przez cały ring, 20 HP, unik omija |
| Rociu | Rudy Wulkan | 3 fale ognia po 7 HP i podpalenie na 3 s |
| Szon | Co Ty Odwalasz? | 1,5 s kontry: kto trafi, dostaje 2,5x z powrotem i ogłuszenie |
| Zośka | Pazurki Zagłady | 5 szybkich drapnięć po 5 HP |
| Wiczka | Uśmiech Rozbrajający | przeciwnik 3 s nie atakuje i idzie do niej |
| Król Pała | Dekret Królewski | korona spada: 30 HP, ogłuszenie 1,2 s, Król leczy 15 HP |
| Watol Wszechwładny | Wszechwładza | przeciwnik 4 s spowolniony |

Definicje są w `SPECIALS` na górze `game.js`, nowa postać bez wpisu po prostu nie ma mocy.

## Żetony, skrzynki, szatnia

- **Żetony** dostajesz za każdą walkę, za codzienne wejście do gry (7-dniowa drabinka, 7. dzień daje Złotą Skrzynkę) i za bossa tygodnia.
- **Skrzynki** wypadają po wygranych (co trzecia gwarantowana, za legendy i bossów Złota) i są w Sklepie. W środku rękawice, gacie, rzeczy na głowę, efekty K.O. i teksty przed walką w czterech rzadkościach. Duplikat zwraca żetony.
- **Sklep**: skrzynki, oferta dnia (3 przedmioty, zmienia się o północy) i pole na tajne kody.
- **Szatnia**: zakładasz przedmioty (widać je na Twojej postaci w walce, w każdej postaci) i kupujesz **Rozwój postaci**: 3 poziomy na postać za żetony, wymagane wygrane nią (3 / 10 / 25). Poziom 3 wzmacnia jej supermoc w unikalny sposób.
- **Tajne kody** wpisuje się w Sklepie. Kilka jest w kodzie gry (`useCode` w `game.js`), np. `PANTSLOW`.

## Wydarzenia na ringu

Co kilkanaście sekund coś się dzieje: spada przedmiot na spadochronie (pizza, gumowy kurczak, przepychacz, krzesło, mokra ryba, papier toaletowy, krupniok, banan, gacie, energetyk, kebab), ktoś z widowni rzuca butelką, ring się trzęsie, wchodzą podwójne obrażenia, pojawia się bomba albo deszcz jedzenia. Bronie trzyma się w ręce i zmieniają ciosy. Lista w `PICKUPS` w `game.js`.

## Boss tygodnia, turniej, powtórki

- **Boss tygodnia**: co poniedziałek inna postać z modyfikatorem (Gigant, Błyskawica, Pancerny, Wampir, Mocarz, Księżycowy, Chaos). Pierwsze zwycięstwo w tygodniu daje 500 żetonów, Złotą Skrzynkę i odznakę z datą w Pucharkach.
- **Turniej**: 4 lub 8 osób na jednym urządzeniu, drabinka. Na klawiaturze pojedynki 1 na 1, na telefonie „na punkty” (każdy gra z AI postacią rywala, podajecie telefon z ręki do ręki).
- **Powtórka K.O.**: po nokaucie ostatnie 2,5 s w zwolnionym tempie ze zbliżeniem. Gra nagrywa ją jako wideo, na ekranie wyniku jest „Udostępnij powtórkę” (na telefonie otwiera udostępnianie, na komputerze podgląd i pobranie).
- **Krytyki** (8% ciosów, 1,6x, pęknięty ekran), **Pierwsza krew**, **PERFECT** za walkę bez obrażeń, nazwy combo od 5x.

## Kasyno u Gaździoła

Grasz swoimi żetonami. Ruletka europejska z pełnym stołem (numer 35:1, tuziny i kolumny 2:1, kolor, parzyste i połówki 1:1),
blackjack (krupier stoi na 17, blackjack 3:2, podwojenie, split par). Krupierem jest Gaździoł i komentuje.
Przegrane żetony liczą się w „do odkucia”: możesz wyzwać krupiera na pojedynek w ringu. Wygrasz, odzyskujesz wszystko.
Przegrasz, licznik się zeruje.

Do tego: **jednoręki bandyta** z głowami ekipy (3x Król Pała = jackpot), **poker Texas hold'em** z trzema AI o różnych stylach
(blefiarz, pasiwo, all-in), **wyścigi ekipy** z kursami według formy i komentarzem, **kości** i **wyżej/niżej** z rosnącym mnożnikiem.
**Jackpot progresywny** rośnie o 5% każdej przegranej, do wzięcia na pojedynczym numerze w ruletce albo trzech Królach na bandycie.
**VIP room** odblokowuje się po 10 000 żetonów obrotu (złoty stół, żetony do 10K, Gaździoł w koronie).
**Dług**: przy pustej kieszeni Gaździoł pożycza 500, oddajesz 600 w 3 dni. Po terminie przychodzi Watol windykator:
wygrasz, dług znika; przegrasz, zabiera żetony, a jak ich brakuje, jeden przedmiot z szatni. Kasyno ma 11 pucharków,
a ranking online pokazuje bilans, rekord i jackpoty.

## Ranking online

Wspólna tabela dla całej ekipy z kontami (ksywka + PIN) i synchronizacją profilu między urządzeniami.
Wymaga jednorazowego podłączenia darmowej bazy: instrukcja w `online/README.md`.

## Nagrody

- XP za każdą walkę (K.O., zostałe HP, combo, supermoce, szybkość, legendy, seria zwycięstw), poziomy i rangi od Świeżaka do Boga Pięści.
- 36 pucharków (osiągnięć) z paskami postępu, ekran „Pucharki” w menu ze statystykami i odznakami bossów.
- Wyzwanie dnia: co dzień inna postać i warunek, 300 XP.
- Gwiazdki mistrzostwa przy postaciach za wygrane (3, 10, 25) i korony za kampanie.
- Wszystko zapisuje się w przeglądarce (localStorage), osobno na każdym urządzeniu.

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
| moc       | przy użyciu supermocy                   | `cypis_moc.mp3`          |

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
- `online-config.js`, `online/`: ranking online (konfiguracja, SQL, instrukcja).
