/* =========================================================
   COIN LIVE — dane startowe (snapshot z 15.09.2026)
   Źródło: wyniki PKO BP Ekstraklasy 2026/27, kolejki 1–8
   + plan 9. kolejki. Strona próbuje też pobrać dane na żywo
   z TheSportsDB (patrz app.js → fetchLive).
   ========================================================= */

window.COIN_DATA = (function () {
  // id, nazwa, skrót, miasto, kolory herbu (dwa), sezon: beniaminek?
  const TEAMS = [
    { id: "gornik",     name: "Górnik Zabrze",         short: "Górnik",      abbr: "GÓR", c1: "#1f5fbf", c2: "#e6e6e6" },
    { id: "lech",       name: "Lech Poznań",           short: "Lech",        abbr: "LPO", c1: "#0d56a6", c2: "#ffffff" },
    { id: "legia",      name: "Legia Warszawa",        short: "Legia",       abbr: "LEG", c1: "#0f7a3c", c2: "#d21f26" },
    { id: "wisla-k",    name: "Wisła Kraków",          short: "Wisła Kr.",   abbr: "WKR", c1: "#d7001d", c2: "#1d4ea3", promoted: true },
    { id: "jagiellonia",name: "Jagiellonia Białystok", short: "Jagiellonia", abbr: "JAG", c1: "#f5c400", c2: "#d0021b" },
    { id: "pogon",      name: "Pogoń Szczecin",        short: "Pogoń",       abbr: "POG", c1: "#0b1e4a", c2: "#8a1c2e" },
    { id: "zaglebie",   name: "Zagłębie Lubin",        short: "Zagłębie",    abbr: "ZAG", c1: "#f28c00", c2: "#0f7a3c" },
    { id: "gks",        name: "GKS Katowice",          short: "GKS Kat.",    abbr: "GKS", c1: "#ffd200", c2: "#007a33" },
    { id: "korona",     name: "Korona Kielce",         short: "Korona",      abbr: "KOR", c1: "#ffd400", c2: "#e30613" },
    { id: "widzew",     name: "Widzew Łódź",           short: "Widzew",      abbr: "WID", c1: "#e30613", c2: "#ffffff" },
    { id: "piast",      name: "Piast Gliwice",         short: "Piast",       abbr: "PIA", c1: "#1c4d9c", c2: "#e2001a" },
    { id: "cracovia",   name: "Cracovia",              short: "Cracovia",    abbr: "CRA", c1: "#c8102e", c2: "#ffffff" },
    { id: "wisla-p",    name: "Wisła Płock",           short: "Wisła Pł.",   abbr: "WPŁ", c1: "#1d5fb0", c2: "#ffffff" },
    { id: "slask",      name: "Śląsk Wrocław",         short: "Śląsk",       abbr: "ŚLĄ", c1: "#00843d", c2: "#e30613", promoted: true },
    { id: "motor",      name: "Motor Lublin",          short: "Motor",       abbr: "MOT", c1: "#ffd200", c2: "#1b4d9c" },
    { id: "wieczysta",  name: "Wieczysta Kraków",      short: "Wieczysta",   abbr: "WIE", c1: "#0a8f3c", c2: "#111111", promoted: true },
    { id: "radomiak",   name: "Radomiak Radom",        short: "Radomiak",    abbr: "RAD", c1: "#1e8f3c", c2: "#ffffff" },
    { id: "rakow",      name: "Raków Częstochowa",     short: "Raków",       abbr: "RAK", c1: "#c00a1a", c2: "#1c2c8a" },
  ];

  // [kolejka, data, godzina, gospodarz, gość, bramki gosp., bramki gości, status]
  // status: "FT" = koniec, "NS" = nierozegrany, "PP" = przełożony (bez terminu)
  const M = [
    // ---- 1. kolejka (24–27.07.2026) ----
    [1, "2026-07-24", "18:00", "radomiak", "wieczysta", 2, 1, "FT"],
    [1, "2026-07-24", "20:30", "pogon", "legia", 0, 1, "FT"],
    [1, "2026-07-25", "14:45", "jagiellonia", "korona", 1, 0, "FT"],
    [1, "2026-07-25", "17:30", "gornik", "slask", 2, 1, "FT"],
    [1, "2026-07-25", "20:15", "lech", "cracovia", 0, 0, "FT"],
    [1, "2026-07-26", "14:45", "rakow", "wisla-p", 1, 2, "FT"],
    [1, "2026-07-26", "17:30", "widzew", "motor", 2, 2, "FT"],
    [1, "2026-07-26", "20:15", "wisla-k", "gks", 2, 1, "FT"],
    [1, "2026-07-27", "19:00", "zaglebie", "piast", 2, 0, "FT"],
    // ---- 2. kolejka (31.07–03.08) ----
    [2, "2026-07-31", "18:00", "wisla-p", "widzew", 0, 0, "FT"],
    [2, "2026-07-31", "20:30", "motor", "jagiellonia", 1, 2, "FT"],
    [2, "2026-08-01", "14:45", "gks", "radomiak", 3, 1, "FT"],
    [2, "2026-08-01", "17:30", "piast", "wisla-k", 4, 3, "FT"],
    [2, "2026-08-01", "20:15", "wieczysta", "lech", 1, 2, "FT"],
    [2, "2026-08-02", "14:45", "slask", "rakow", 2, 1, "FT"],
    [2, "2026-08-02", "17:30", "cracovia", "pogon", 0, 2, "FT"],
    [2, "2026-08-02", "20:15", "legia", "zaglebie", 3, 1, "FT"],
    [2, null, null, "korona", "gornik", null, null, "PP"],
    // ---- 3. kolejka (07–09.08) ----
    [3, "2026-08-07", "18:00", "wisla-k", "wisla-p", 2, 1, "FT"],
    [3, "2026-08-08", "14:45", "radomiak", "gornik", 1, 3, "FT"],
    [3, "2026-08-08", "17:30", "pogon", "motor", 3, 1, "FT"],
    [3, "2026-08-08", "20:15", "korona", "legia", 1, 1, "FT"],
    [3, "2026-08-09", "14:45", "slask", "cracovia", 0, 0, "FT"],
    [3, "2026-08-09", "17:30", "lech", "piast", 3, 0, "FT"],
    [3, "2026-08-09", "20:15", "jagiellonia", "widzew", 0, 2, "FT"],
    [3, "2026-09-15", "18:00", "rakow", "zaglebie", null, null, "NS"],
    [3, "2026-10-12", "20:30", "gks", "wieczysta", null, null, "NS"],
    // ---- 4. kolejka (14–16.08) ----
    [4, "2026-08-14", "20:30", "legia", "radomiak", 5, 0, "FT"],
    [4, "2026-08-15", "14:45", "zaglebie", "slask", 2, 1, "FT"],
    [4, "2026-08-15", "17:30", "piast", "wieczysta", 3, 4, "FT"],
    [4, "2026-08-15", "20:15", "widzew", "korona", 1, 2, "FT"],
    [4, "2026-08-16", "14:45", "motor", "gks", 1, 0, "FT"],
    [4, "2026-08-16", "17:30", "cracovia", "rakow", 2, 1, "FT"],
    [4, "2026-08-16", "20:15", "gornik", "wisla-k", 2, 1, "FT"],
    [4, null, null, "wisla-p", "lech", null, null, "PP"],
    [4, "2026-12-16", null, "jagiellonia", "pogon", null, null, "NS"],
    // ---- 5. kolejka (21–23.08 + zaległe 03.09) ----
    [5, "2026-08-21", "20:30", "cracovia", "wieczysta", 3, 2, "FT"],
    [5, "2026-08-22", "14:45", "korona", "motor", 1, 1, "FT"],
    [5, "2026-08-22", "17:30", "piast", "legia", 1, 1, "FT"],
    [5, "2026-08-22", "20:15", "slask", "widzew", 3, 3, "FT"],
    [5, "2026-08-23", "14:45", "radomiak", "zaglebie", 0, 0, "FT"],
    [5, "2026-08-23", "17:30", "gks", "wisla-p", 5, 0, "FT"],
    [5, "2026-08-23", "20:15", "pogon", "wisla-k", 2, 2, "FT"],
    [5, "2026-09-03", "18:00", "rakow", "gornik", 1, 2, "FT"],
    [5, "2026-09-03", "20:30", "lech", "jagiellonia", 2, 1, "FT"],
    // ---- 6. kolejka (28–30.08) ----
    [6, "2026-08-28", "18:00", "wisla-p", "korona", 0, 2, "FT"],
    [6, "2026-08-28", "20:30", "legia", "slask", 1, 1, "FT"],
    [6, "2026-08-29", "14:45", "radomiak", "cracovia", 2, 1, "FT"],
    [6, "2026-08-29", "17:30", "motor", "piast", 0, 2, "FT"],
    [6, "2026-08-29", "20:15", "wisla-k", "wieczysta", 2, 0, "FT"],
    [6, "2026-08-30", "12:15", "zaglebie", "pogon", 0, 0, "FT"],
    [6, "2026-08-30", "14:45", "rakow", "jagiellonia", 2, 5, "FT"],
    [6, "2026-08-30", "17:30", "gornik", "gks", 2, 3, "FT"],
    [6, "2026-08-30", "20:15", "widzew", "lech", 2, 3, "FT"],
    // ---- 7. kolejka (04–07.09) ----
    [7, "2026-09-04", "18:00", "piast", "gks", 3, 0, "FT"],
    [7, "2026-09-04", "20:30", "widzew", "radomiak", 0, 0, "FT"],
    [7, "2026-09-05", "14:45", "korona", "wisla-k", 1, 1, "FT"],
    [7, "2026-09-05", "17:30", "motor", "legia", 2, 3, "FT"],
    [7, "2026-09-05", "20:15", "cracovia", "gornik", 0, 1, "FT"],
    [7, "2026-09-06", "14:45", "lech", "rakow", 1, 0, "FT"],
    [7, "2026-09-06", "17:30", "jagiellonia", "slask", 2, 1, "FT"],
    [7, "2026-09-06", "20:15", "wieczysta", "zaglebie", 1, 1, "FT"],
    [7, "2026-09-07", "19:00", "pogon", "wisla-p", 1, 1, "FT"],
    // ---- 8. kolejka (11–14.09) ----
    [8, "2026-09-11", "18:00", "rakow", "motor", 2, 1, "FT"],
    [8, "2026-09-11", "20:30", "wisla-k", "jagiellonia", 2, 0, "FT"],
    [8, "2026-09-12", "14:45", "slask", "korona", 1, 2, "FT"],
    [8, "2026-09-12", "17:30", "gornik", "lech", 2, 1, "FT"],
    [8, "2026-09-12", "20:15", "zaglebie", "gks", 2, 1, "FT"],
    [8, "2026-09-13", "12:15", "wisla-p", "cracovia", 3, 1, "FT"],
    [8, "2026-09-13", "14:45", "pogon", "wieczysta", 2, 0, "FT"],
    [8, "2026-09-13", "17:30", "legia", "widzew", 1, 1, "FT"],
    [8, "2026-09-14", "19:00", "radomiak", "piast", 0, 2, "FT"],
    // ---- 9. kolejka (18–20.09) ----
    [9, "2026-09-18", "18:00", "widzew", "wieczysta", null, null, "NS"],
    [9, "2026-09-18", "20:30", "wisla-k", "slask", null, null, "NS"],
    [9, "2026-09-19", "14:45", "korona", "rakow", null, null, "NS"],
    [9, "2026-09-19", "17:30", "gks", "cracovia", null, null, "NS"],
    [9, "2026-09-19", "20:15", "motor", "gornik", null, null, "NS"],
    [9, "2026-09-20", "12:15", "piast", "pogon", null, null, "NS"],
    [9, "2026-09-20", "14:45", "zaglebie", "wisla-p", null, null, "NS"],
    [9, "2026-09-20", "17:30", "jagiellonia", "legia", null, null, "NS"],
    [9, "2026-09-20", "20:15", "lech", "radomiak", null, null, "NS"],
  ];

  const MATCHES = M.map((r, i) => ({
    id: `r${r[0]}-${r[3]}-${r[4]}`,
    round: r[0], date: r[1], time: r[2],
    home: r[3], away: r[4],
    hs: r[5], as: r[6], status: r[7],
  }));

  return {
    SNAPSHOT_DATE: "2026-09-15",
    SEASON: "2026-2027",
    LEAGUE_ID_TSDB: 4422, // Polish Ekstraklasa w TheSportsDB
    TEAMS, MATCHES,
  };
})();
