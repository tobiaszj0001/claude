/* =====================================================================
   DZIKA LIGA SOCCA — DANE STRONY
   ---------------------------------------------------------------------
   To jedyny plik, który trzeba edytować, żeby zaktualizować stronę.
   - Drużyny, terminarz i wyniki wpisujesz tutaj.
   - Tabela i klasyfikacja strzelców liczą się AUTOMATYCZNIE z wyników.
   - Jeśli mecz nie ma jeszcze wyniku, zostaw `wynik: null`.
   ===================================================================== */

window.DLS = {

  /* ---------- Informacje ogólne ---------- */
  liga: {
    nazwa: "Dzika Liga Socca",
    sezon: "Jesień 2026",
    miasto: "Twoje Miasto",
    boisko: "Orlik przy ul. Sportowej 1",
    dzienMeczowy: "Niedziele, 17:00–21:00",
    email: "kontakt@dzikaligasocca.pl",
    telefon: "+48 600 000 000",
    facebook: "https://www.facebook.com/share/1FB5p3Nr5t/",
    instagram: "#",
    wpisowe: "1200 zł / drużyna / sezon",
    zapisyDo: "5 października 2026",
    liczbaKolejek: 9
  },

  /* ---------- Drużyny ----------
     kolor / kolor2: kolory herbu generowanego automatycznie
     skrot: max 3 litery na herbie                                */
  druzyny: [
    { id: "wilki",      nazwa: "Wilki Północ",      skrot: "WLK", kolor: "#c8ff00", kolor2: "#0b0d10", kapitan: "Marek K." },
    { id: "bizony",     nazwa: "Bizony FC",         skrot: "BZN", kolor: "#ff6b00", kolor2: "#1a1a1a", kapitan: "Tomasz W." },
    { id: "rysie",      nazwa: "Rysie United",      skrot: "RYS", kolor: "#ffffff", kolor2: "#111827", kapitan: "Piotr Z." },
    { id: "pantery",    nazwa: "Czarne Pantery",    skrot: "PNT", kolor: "#a855f7", kolor2: "#0b0d10", kapitan: "Adam S." },
    { id: "jastrzebie", nazwa: "Jastrzębie Team",   skrot: "JST", kolor: "#38bdf8", kolor2: "#0f172a", kapitan: "Kamil D." },
    { id: "zubry",      nazwa: "Żubry Mazowsze",    skrot: "ŻBR", kolor: "#fbbf24", kolor2: "#1c1917", kapitan: "Łukasz M." },
    { id: "lisy",       nazwa: "Lisy Socca",        skrot: "LSY", kolor: "#ef4444", kolor2: "#0b0d10", kapitan: "Bartek R." },
    { id: "niedzwiedzie", nazwa: "Niedźwiedzie",    skrot: "NDZ", kolor: "#22c55e", kolor2: "#052e16", kapitan: "Michał P." },
    { id: "orly",       nazwa: "Orły Zachód",       skrot: "ORŁ", kolor: "#f472b6", kolor2: "#111111", kapitan: "Jakub N." },
    { id: "dziki",      nazwa: "Dziki Legion",      skrot: "DZK", kolor: "#e5e7eb", kolor2: "#3f3f46", kapitan: "Paweł G." }
  ],

  /* ---------- Terminarz i wyniki ----------
     Każda kolejka: data, godzina pierwszego meczu, mecze.
     Mecz: gospodarz (id), gosc (id), godzina, boisko,
           wynik: [goleGospodarza, goleGoscia] albo null,
           strzelcy: [{ zawodnik, druzyna (id), gole }]           */
  kolejki: [
    {
      nr: 1, data: "2026-09-13",
      mecze: [
        { gospodarz: "wilki",  gosc: "bizony",       godzina: "17:00", boisko: "A", wynik: [4, 2],
          strzelcy: [{ zawodnik: "Marek Kowal", druzyna: "wilki", gole: 2 }, { zawodnik: "Igor Lis", druzyna: "wilki", gole: 2 }, { zawodnik: "Tomasz Wrona", druzyna: "bizony", gole: 2 }] },
        { gospodarz: "rysie",  gosc: "pantery",      godzina: "17:00", boisko: "B", wynik: [1, 1],
          strzelcy: [{ zawodnik: "Piotr Zając", druzyna: "rysie", gole: 1 }, { zawodnik: "Adam Sowa", druzyna: "pantery", gole: 1 }] },
        { gospodarz: "jastrzebie", gosc: "zubry",    godzina: "18:00", boisko: "A", wynik: [3, 5],
          strzelcy: [{ zawodnik: "Kamil Dąb", druzyna: "jastrzebie", gole: 3 }, { zawodnik: "Łukasz Mróz", druzyna: "zubry", gole: 3 }, { zawodnik: "Olek Bąk", druzyna: "zubry", gole: 2 }] },
        { gospodarz: "lisy",   gosc: "niedzwiedzie", godzina: "18:00", boisko: "B", wynik: [2, 0],
          strzelcy: [{ zawodnik: "Bartek Rudy", druzyna: "lisy", gole: 2 }] },
        { gospodarz: "orly",   gosc: "dziki",        godzina: "19:00", boisko: "A", wynik: [0, 3],
          strzelcy: [{ zawodnik: "Paweł Gruby", druzyna: "dziki", gole: 2 }, { zawodnik: "Rafał Kieł", druzyna: "dziki", gole: 1 }] }
      ]
    },
    {
      nr: 2, data: "2026-09-20",
      mecze: [
        { gospodarz: "bizony", gosc: "rysie",        godzina: "17:00", boisko: "A", wynik: [3, 3],
          strzelcy: [{ zawodnik: "Tomasz Wrona", druzyna: "bizony", gole: 2 }, { zawodnik: "Jan Byk", druzyna: "bizony", gole: 1 }, { zawodnik: "Piotr Zając", druzyna: "rysie", gole: 2 }, { zawodnik: "Filip Ryś", druzyna: "rysie", gole: 1 }] },
        { gospodarz: "pantery", gosc: "jastrzebie",  godzina: "17:00", boisko: "B", wynik: [2, 1],
          strzelcy: [{ zawodnik: "Adam Sowa", druzyna: "pantery", gole: 2 }, { zawodnik: "Kamil Dąb", druzyna: "jastrzebie", gole: 1 }] },
        { gospodarz: "zubry",  gosc: "lisy",         godzina: "18:00", boisko: "A", wynik: [4, 1],
          strzelcy: [{ zawodnik: "Łukasz Mróz", druzyna: "zubry", gole: 2 }, { zawodnik: "Olek Bąk", druzyna: "zubry", gole: 2 }, { zawodnik: "Bartek Rudy", druzyna: "lisy", gole: 1 }] },
        { gospodarz: "niedzwiedzie", gosc: "orly",   godzina: "18:00", boisko: "B", wynik: [2, 2],
          strzelcy: [{ zawodnik: "Michał Puch", druzyna: "niedzwiedzie", gole: 2 }, { zawodnik: "Jakub Nowak", druzyna: "orly", gole: 2 }] },
        { gospodarz: "dziki",  gosc: "wilki",        godzina: "19:00", boisko: "A", wynik: [1, 2],
          strzelcy: [{ zawodnik: "Paweł Gruby", druzyna: "dziki", gole: 1 }, { zawodnik: "Marek Kowal", druzyna: "wilki", gole: 1 }, { zawodnik: "Igor Lis", druzyna: "wilki", gole: 1 }] }
      ]
    },
    {
      nr: 3, data: "2026-09-27",
      mecze: [
        { gospodarz: "wilki",  gosc: "rysie",        godzina: "17:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "bizony", gosc: "pantery",      godzina: "17:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "jastrzebie", gosc: "lisy",     godzina: "18:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "zubry",  gosc: "orly",         godzina: "18:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "niedzwiedzie", gosc: "dziki",  godzina: "19:00", boisko: "A", wynik: null, strzelcy: [] }
      ]
    },
    {
      nr: 4, data: "2026-10-04",
      mecze: [
        { gospodarz: "rysie",  gosc: "bizony",       godzina: "17:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "pantery", gosc: "wilki",       godzina: "17:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "lisy",   gosc: "zubry",        godzina: "18:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "orly",   gosc: "jastrzebie",   godzina: "18:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "dziki",  gosc: "niedzwiedzie", godzina: "19:00", boisko: "A", wynik: null, strzelcy: [] }
      ]
    },
    {
      nr: 5, data: "2026-10-11",
      mecze: [
        { gospodarz: "wilki",  gosc: "jastrzebie",   godzina: "17:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "bizony", gosc: "zubry",        godzina: "17:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "rysie",  gosc: "lisy",         godzina: "18:00", boisko: "A", wynik: null, strzelcy: [] },
        { gospodarz: "pantery", gosc: "niedzwiedzie", godzina: "18:00", boisko: "B", wynik: null, strzelcy: [] },
        { gospodarz: "orly",   gosc: "dziki",        godzina: "19:00", boisko: "A", wynik: null, strzelcy: [] }
      ]
    }
  ],

  /* ---------- Aktualności ---------- */
  aktualnosci: [
    {
      data: "2026-09-21",
      tag: "Wyniki",
      tytul: "Żubry rozbijają Lisy. Wilki nadal bez porażki!",
      tekst: "Druga kolejka za nami. Żubry Mazowsze pokazały moc i po zwycięstwie 4:1 nad Lisami zostały liderem. Wilki Północ wygrały w Legionie 2:1 po golu w ostatniej minucie.",
      obraz: "wyniki"
    },
    {
      data: "2026-09-15",
      tag: "Liga",
      tytul: "Ruszyła Dzika Liga Socca — sezon Jesień 2026!",
      tekst: "Dziesięć drużyn, dziewięć kolejek, jedno boisko i mnóstwo emocji. Pierwsza kolejka przyniosła 21 bramek i hat-tricka Kamila Dąba, który mimo tego nie uratował Jastrzębi.",
      obraz: "start"
    },
    {
      data: "2026-09-01",
      tag: "Zapisy",
      tytul: "Ostatnie wolne miejsca w lidze — zgłoś swoją ekipę",
      tekst: "Zbierz kumpli, wymyślcie dziką nazwę i zgłoście się przez formularz. Wpisowe obejmuje sędziów, boisko, statystyki i nagrody na koniec sezonu.",
      obraz: "zapisy"
    }
  ],

  /* ---------- Sponsorzy / partnerzy (nazwy wyświetlane jako logotypy tekstowe) ---------- */
  partnerzy: ["Twój Sponsor", "Sklep Sportowy", "Pizzeria Dzika", "Miasto", "Orlik"],

  /* ---------- Najczęstsze pytania ---------- */
  faq: [
    { q: "Ile osób gra na boisku?", a: "Socca to 6 na 6 (5 zawodników w polu + bramkarz). Zmiany lotne, bez limitu. W kadrze drużyny może być maksymalnie 14 osób." },
    { q: "Jak długo trwa mecz?", a: "2 × 20 minut z krótką przerwą. Każda drużyna gra jeden mecz w kolejce, zwykle w niedzielę między 17:00 a 21:00." },
    { q: "Czy potrzebujemy własnych strojów?", a: "Wystarczy komplet koszulek w jednym kolorze. Organizator zapewnia znaczniki, jeśli kolory się pokrywają." },
    { q: "Co obejmuje wpisowe?", a: "Wynajem boiska, sędziów, prowadzenie statystyk i tabeli, relacje foto oraz nagrody dla najlepszych drużyn i strzelców." },
    { q: "Kto może grać?", a: "Każdy powyżej 16. roku życia (osoby niepełnoletnie ze zgodą opiekuna). Liga jest amatorska — zawodnicy zrzeszeni w klubach od IV ligi wzwyż nie mogą brać udziału." }
  ]
};
