/* =====================================================================
   DZIKA LIGA SOCCA — DANE STRONY (sezon 2026/27)
   ---------------------------------------------------------------------
   Dane ze strony dzikaligasocca.pl i grafik wyników z Facebooka (stan: 20 września 2026).
   To jedyny plik, który trzeba edytować, żeby zaktualizować stronę.

   Herby: jeśli w folderze assets/teams/ leży plik o nazwie z pola `logo`,
   strona go pokaże. Jeśli pliku nie ma, wygeneruje herb z inicjałów.
   ===================================================================== */

window.DLS = {

  liga: {
    nazwa: "Dzika Liga Socca",
    sezon: "2026/27",
    region: "Górny Śląsk",
    opis: "Amatorska liga piłki nożnej sześcioosobowej. Dwie ligi, dwadzieścia drużyn, jeden cel: zostać najdzikszą ekipą Śląska.",
    email: "kontakt@dzikaligasocca.pl",
    facebook: "https://www.facebook.com/share/1FB5p3Nr5t/",
    instagram: "#",
    x: "#",
    stronaOryginalna: "https://dzikaligasocca.pl/",
    logo: "assets/logo.png"
  },

  menu: [
    { nazwa: "Strona Główna", href: "#start" },
    { nazwa: "Aktualności", href: "#aktualnosci" },
    { nazwa: "Wyniki", href: "#terminarz" },
    { nazwa: "Tabela", href: "#tabela" },
    { nazwa: "Ranking", href: "#ranking" },
    { nazwa: "Współpraca", href: "#wspolpraca" },
    { nazwa: "O nas", href: "#onas" },
    { nazwa: "Kontakt", href: "#kontakt" }
  ],

  /* ---------- LIGI ---------- */
  ligi: [
    {
      id: "1liga",
      nazwa: "1 LIGA",
      druzyny: [
        { id: "los-plantinos",      nazwa: "Los Plantinos",       skrot: "LP",  kolor: "#80db00", kolor2: "#031127", logo: "Projekt-bez-nazwy-3-128x128.png" },
        { id: "lekko-spoceni",      nazwa: "Lekko Spoceni Bytom", skrot: "LSB", kolor: "#38bdf8", kolor2: "#031127", logo: "14-102x128.png" },
        { id: "master-drewienko",   nazwa: "Master Drewienko",    skrot: "MD",  kolor: "#f5a524", kolor2: "#2b1a06", logo: "13-128x128.png" },
        { id: "dzikie-knury",       nazwa: "Dzikie Knury",        skrot: "DK",  kolor: "#ffffff", kolor2: "#111827", logo: "KNURY-–-ze-zmianami-128x128.png" },
        { id: "maciejkowice",       nazwa: "DJ RW Maciejkowice",  skrot: "MAC", kolor: "#f7630c", kolor2: "#1a0a02", logo: "Projekt-bez-nazwy-128x128.png" },
        { id: "perla-gliwice",      nazwa: "Perła Gliwice",       skrot: "PG",  kolor: "#e11d48", kolor2: "#1159af", logo: "9-102x128.png" },
        { id: "centrum-hindenburg", nazwa: "Centrum Hindenburg",  skrot: "CH",  kolor: "#a3a3a3", kolor2: "#171717", logo: "Projekt-bez-nazwy-4-128x128.png" },
        { id: "fc-kasprzak",        nazwa: "FC Kasprzak",         skrot: "FCK", kolor: "#fbbf24", kolor2: "#13612e", logo: "7-102x128.png" },
        { id: "sc-bielszowice",     nazwa: "SC Bielszowice",      skrot: "SCB", kolor: "#1159af", kolor2: "#ffffff", logo: "DZIKA-LIGA-POSTY-2-128x128.png" },
        { id: "land-of-fire",       nazwa: "Land Of Fire",        skrot: "LOF", kolor: "#b82105", kolor2: "#1a0a02", logo: "Projekt-bez-nazwy-6-128x128.png" }
      ],
      /* Mecze. Tabela liczy się automatycznie z wyników (zgodnie z tabelą na stronie). */
      mecze: [
        { kolejka: 1, data: "2026-09-13", godzina: "19:00", gospodarz: "sc-bielszowice",     gosc: "lekko-spoceni",      wynik: [2, 8] },
        { kolejka: 1, data: "2026-09-13", godzina: "20:00", gospodarz: "land-of-fire",       gosc: "maciejkowice",       wynik: [0, 5] },
        { kolejka: 1, data: "2026-09-13", godzina: "20:00", gospodarz: "dzikie-knury",       gosc: "perla-gliwice",      wynik: [11, 8] },
        { kolejka: 1, data: "2026-09-13", godzina: "20:00", gospodarz: "master-drewienko",   gosc: "centrum-hindenburg", wynik: [8, 2] },
        { kolejka: 1, data: "2026-09-13", godzina: "20:00", gospodarz: "los-plantinos",      gosc: "fc-kasprzak",        wynik: [5, 4] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "sc-bielszowice",   gosc: "centrum-hindenburg", wynik: [2, 4] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "los-plantinos",    gosc: "land-of-fire",       wynik: [20, 3] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "perla-gliwice",    gosc: "fc-kasprzak",        wynik: [9, 4] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "lekko-spoceni",    gosc: "maciejkowice",       wynik: [7, 6] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "master-drewienko", gosc: "dzikie-knury",       wynik: [3, 3] }
      ],
      strzelcy: [
        ["Szymon Szczepaniak", "los-plantinos", 8],
        ["Robert Rotuski", "los-plantinos", 6],
        ["Maksymilian Roguła", "los-plantinos", 5],
        ["Dawid Wysokinski", "maciejkowice", 5],
        ["Mnochy Ariel", "dzikie-knury", 4],
        ["Grzegorz Glapka", "dzikie-knury", 4],
        ["Igor Rybak", "perla-gliwice", 4],
        ["Jakub Pomykała", "fc-kasprzak", 4],
        ["Paweł Żak", "perla-gliwice", 4],
        ["Igor Buchta", "master-drewienko", 3]
      ],
      asystenci: [
        ["Maksymilian Roguła", "los-plantinos", 7],
        ["Robert Rotuski", "los-plantinos", 4],
        ["Michał Cybul", "los-plantinos", 3],
        ["Mnochy Ariel", "dzikie-knury", 3],
        ["Szymon Przybylski", "centrum-hindenburg", 2],
        ["Kacper Bińkowski", "centrum-hindenburg", 2],
        ["Jakub Kostowski", "dzikie-knury", 2],
        ["Dominik Jankowski", "los-plantinos", 2],
        ["Dominik Środa", "dzikie-knury", 2],
        ["Szymon Szczepaniak", "los-plantinos", 2]
      ]
    },
    {
      id: "2liga",
      nazwa: "2 LIGA",
      druzyny: [
        { id: "bankova-poker",       nazwa: "Bankova Poker",       skrot: "BP",  kolor: "#80db00", kolor2: "#000000", logo: "Projekt-bez-nazwy-1-128x128.png" },
        { id: "silesian-wolves",     nazwa: "Silesian Wolves",     skrot: "SW",  kolor: "#cbd5e1", kolor2: "#1e293b", logo: "3-102x128.png" },
        { id: "dzikie-knury-2",      nazwa: "Dzikie Knury 2",      skrot: "DK2", kolor: "#ffffff", kolor2: "#111827", logo: "KNURY-–-ze-zmianami-128x128.png" },
        { id: "warsztat-blyskawica", nazwa: "Błyskawica Chorzów", skrot: "BŁ",  kolor: "#fde047", kolor2: "#1c1917", logo: "790001491_1603199598120292_7164414215552060507_n-–-ze-zmianami-128x128.png" },
        { id: "profimedical",        nazwa: "Profimedical",        skrot: "PRO", kolor: "#22d3ee", kolor2: "#0c4a6e", logo: "11-102x128.png" },
        { id: "thunder-boys",        nazwa: "Thunder Boys",        skrot: "TB",  kolor: "#a855f7", kolor2: "#1e1b4b", logo: "DZIKA-LIGA-POSTY-1-128x128.png" },
        { id: "rawa-gorny-slask",    nazwa: "Rawa Górny Śląsk",    skrot: "RGŚ", kolor: "#fbbf24", kolor2: "#1159af", logo: "DZIKA-LIGA-POSTY-3-128x128.png" },
        { id: "silesia-warriors",    nazwa: "Silesia Warriors",    skrot: "SWR", kolor: "#ef4444", kolor2: "#171717", logo: "4-102x128.png" },
        { id: "fc-ufoludy",          nazwa: "FC Ufoludy",          skrot: "UFO", kolor: "#4ade80", kolor2: "#052e16", logo: "Projekt-bez-nazwy-2-128x128.png" },
        { id: "dzikie-knury-3",      nazwa: "Dzikie Knury 3",      skrot: "DK3", kolor: "#ffffff", kolor2: "#111827", logo: "KNURY-–-ze-zmianami-128x128.png" }
      ],
      mecze: [
        { kolejka: 1, data: "2026-09-13", godzina: "18:00", gospodarz: "bankova-poker",    gosc: "silesia-warriors",    wynik: [11, 4] },
        { kolejka: 1, data: "2026-09-13", godzina: "18:00", gospodarz: "rawa-gorny-slask", gosc: "profimedical",        wynik: [2, 7] },
        { kolejka: 1, data: "2026-09-13", godzina: "19:00", gospodarz: "dzikie-knury-3",   gosc: "silesian-wolves",     wynik: [5, 10] },
        { kolejka: 1, data: "2026-09-13", godzina: "19:00", gospodarz: "fc-ufoludy",       gosc: "thunder-boys",        wynik: [6, 9] },
        { kolejka: 1, data: "2026-09-13", godzina: "19:00", gospodarz: "dzikie-knury-2",   gosc: "warsztat-blyskawica", wynik: [2, 1] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "warsztat-blyskawica", gosc: "thunder-boys",    wynik: [6, 3] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "silesia-warriors",    gosc: "rawa-gorny-slask", wynik: [7, 8] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "dzikie-knury-2",      gosc: "profimedical",    wynik: [8, 4] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "fc-ufoludy",          gosc: "silesian-wolves", wynik: [4, 12] },
        { kolejka: 2, data: "2026-09-20", gospodarz: "dzikie-knury-3",      gosc: "bankova-poker",   wynik: [4, 11] }
      ],
      strzelcy: [
        ["Tobiasz Jaśniok", "bankova-poker", 6],
        ["Dawid Pacławski", "thunder-boys", 6],
        ["Alan Szczepaniuk", "silesian-wolves", 6],
        ["Jan Wleciałowski", "bankova-poker", 5],
        ["Mariusz Lux", "silesia-warriors", 4],
        ["Dominik Kurpas", "bankova-poker", 3],
        ["Daniel Guziel", "dzikie-knury-3", 3],
        ["Karol Wleciałowski", "bankova-poker", 3],
        ["Piotr Stefanik", "dzikie-knury-3", 3],
        ["Jakub Machowicz", "fc-ufoludy", 3]
      ],
      asystenci: [
        ["Dominik Kurpas", "bankova-poker", 6],
        ["Oliwier Kocjan", "silesian-wolves", 4],
        ["Tobiasz Jaśniok", "bankova-poker", 3],
        ["Miłosz Stankiewicz", "dzikie-knury-3", 3],
        ["Dawid Pacławski", "thunder-boys", 3],
        ["Piotr Stefanik", "dzikie-knury-3", 2],
        ["Mariusz Lux", "silesia-warriors", 2],
        ["Piotr Wilczek", "silesia-warriors", 2],
        ["Kamil Pacławski", "thunder-boys", 2],
        ["Krzysztof Wysocki", "profimedical", 2]
      ]
    }
  ],

  /* Największy brutal 2026/27 (wspólny ranking): [zawodnik, drużyna, żółte, czerwone] */
  brutal: [
    ["Szymon Tomala", "warsztat-blyskawica", 0, 0],
    ["Ivo Rydziński", "fc-kasprzak", 0, 0],
    ["Piotr Płuciennik", "fc-kasprzak", 0, 0],
    ["Szymon Włosek", "fc-kasprzak", 0, 0],
    ["Jakub Penar", "fc-kasprzak", 0, 0],
    ["Szymon Falewicz", "fc-kasprzak", 0, 0],
    ["Kacper Kruk", "fc-kasprzak", 0, 0],
    ["Szymon Pasieka", "profimedical", 0, 0],
    ["Daniel Koniarek", "warsztat-blyskawica", 0, 0],
    ["Marcin Francka", "warsztat-blyskawica", 0, 0]
  ],

  /* ---------- AKTUALNOŚCI (na stronie były wpisy "Lorem Ipsum" — poniżej relacje z realnych wyników) ---------- */
  aktualnosci: [
    {
      liga: "1liga", data: "2026-09-20", tag: "1 LIGA",
      tytul: "Los Plantinos strzelają 20 goli. Lider 1 ligi nie zwalnia",
      tekst: "Druga kolejka za nami. Los Plantinos rozbili Land Of Fire 20:3, Lekko Spoceni Bytom wygrali z Maciejkowicami 7:6, Perła Gliwice pokonała FC Kasprzak 9:4, a hit Master Drewienko – Dzikie Knury zakończył się remisem 3:3."
    },
    {
      liga: "2liga", data: "2026-09-20", tag: "2 LIGA",
      tytul: "Trzy drużyny z kompletem punktów w 2 lidze",
      tekst: "Bankova Poker (11:4 z Dzikimi Knurami 3), Silesian Wolves (12:4 z FC Ufoludy) i Dzikie Knury 2 (8:4 z Profimedical) mają po 6 punktów. Rawa Górny Śląsk wygrała z Silesia Warriors 8:7, a Błyskawica Chorzów z Thunder Boys 6:3."
    },
    {
      liga: "1liga", data: "2026-09-20", tag: "RANKING",
      tytul: "Szymon Szczepaniak liderem klasyfikacji strzelców",
      tekst: "Osiem goli w dwóch meczach. Za nim Robert Rotuski (6) i Maksymilian Roguła (5), który dodatkowo prowadzi w rankingu asystentów z siedmioma asystami. W 2 lidze po 6 goli mają Tobiasz Jaśniok, Dawid Pacławski i Alan Szczepaniuk."
    }
  ],

  /* ---------- PARTNERZY (logotypy w assets/partners/, w razie braku pliku wyświetla się nazwa) ---------- */
  partnerzy: [
    { nazwa: "Before", plik: "before.png" },
    { nazwa: "Decathlon", plik: "decathloon.png" },
    { nazwa: "Panbud", plik: "panbud-1024x1024.png" },
    { nazwa: "Polska Federacja Socca", plik: "pfs-full-hor-CMYK-1.png" },
    { nazwa: "Secret Ball", plik: "secretball-1024x491.png" }
  ],

  /* ---------- O NAS ---------- */
  onas: {
    naglowek: "od kumpli dla kumpli",
    tekst: "Dzika Liga Socca to amatorskie rozgrywki piłki sześcioosobowej na Górnym Śląsku. Gramy w dwóch ligach po dziesięć drużyn, w niedzielne wieczory, z sędziami, statystykami i rankingami zawodników. Liga działa pod patronatem Polskiej Federacji Socca.",
    fakty: [
      { liczba: "2", opis: "ligi" },
      { liczba: "20", opis: "drużyn" },
      { liczba: "6v6", opis: "format gry" },
      { liczba: "2026/27", opis: "sezon" }
    ]
  },

  wspolpraca: {
    tekst: "Szukasz miejsca, gdzie Twoja marka spotka kilkuset aktywnych ludzi co tydzień? Zostań partnerem Dzikiej Ligi Socca: logo na koszulkach i grafikach meczowych, wzmianki w relacjach, obecność na stronie i w social mediach.",
    punkty: ["Logo na stronie i grafikach wyników", "Ekspozycja podczas kolejek ligowych", "Nazwa nagrody lub rankingu partnera", "Pakiety dopasowane do budżetu"]
  }
};
