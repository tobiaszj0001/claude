/* =========================================================
   COIN LIVE — logika strony
   - wyniki / terminarz / tabela Ekstraklasy
   - kursy liczone z formy drużyn (orientacyjne)
   - kupony za Coiny (CN) — wirtualna waluta, nie pieniądze
   - kody doładowania (sekcja PROMO poniżej)
   - pobieranie danych na żywo z TheSportsDB (fetchLive)
   ========================================================= */
(function () {
  "use strict";

  const D = window.COIN_DATA;
  const STORE_KEY = "coin-live-v1";
  const START_BALANCE = 1000;

  /* ---------- KODY DOŁADOWANIA ----------
     Tu dodajesz własne kody. `reusable: true` = można wpisywać wiele razy.
     Dodatkowo działa format COIN+<kwota>, np. COIN+2500.            */
  const PROMO = {
    COIN2026: { amount: 1000, reusable: true,  label: "Kod stały" },
    START500:  { amount: 500,  reusable: false, label: "Bonus na start" },
    MISTRZ:    { amount: 250,  reusable: false, label: "Bonus mistrza" },
    DERBY:     { amount: 100,  reusable: false, label: "Bonus derbowy" },
    BANKRUT:   { amount: 200,  reusable: true,  label: "Ratunek", onlyIfBelow: 20 },
  };

  /* ---------- Stan ---------- */
  const teams = Object.fromEntries(D.TEAMS.map(t => [t.id, t]));
  let matches = D.MATCHES.map(m => ({ ...m }));
  let liveTable = null;              // tabela z API (jeśli pobrana)
  let source = { kind: "snap", label: `snapshot ${fmtDate(D.SNAPSHOT_DATE)}` };

  const state = loadState();
  let view = "fixtures";
  let round = null;
  let slip = [];                     // [{matchId, type, odd, label}]
  const expanded = new Set();

  function loadState() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) { s = null; }
    if (!s) {
      s = { balance: START_BALANCE, ledger: [], bets: [], usedCodes: {}, theme: null };
      s.ledger.unshift({ t: Date.now(), amount: START_BALANCE, note: "Bonus powitalny" });
    }
    return s;
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* prywatne okno itp. */ }
  }
  function credit(amount, note) {
    state.balance = Math.round(state.balance + amount);
    state.ledger.unshift({ t: Date.now(), amount, note });
    if (state.ledger.length > 60) state.ledger.length = 60;
    saveState();
    renderWallet();
  }

  /* ---------- Narzędzia ---------- */
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtCN = (n) => `${Math.round(n).toLocaleString("pl-PL")} CN`;
  const fmtOdd = (o) => o.toFixed(2);
  function fmtDate(iso) { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  const DAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
  const DAYS_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];
  const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
  function dayLabel(iso) {
    const d = new Date(iso + "T12:00:00");
    const t = todayISO();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tISO = tomorrow.toISOString().slice(0, 10);
    const base = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    if (iso === t) return `Dziś · ${base}`;
    if (iso === tISO) return `Jutro · ${base}`;
    return base;
  }
  function shortWhen(m) {
    if (!m.date) return "termin?";
    const d = new Date(m.date + "T12:00:00");
    const t = todayISO();
    const day = m.date === t ? "Dziś" : `${DAYS_SHORT[d.getDay()]} ${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    return m.time ? `${day} ${m.time}` : day;
  }
  function teamName(id) { return teams[id] ? teams[id].name : id; }
  const CRESTS = window.COIN_CRESTS || {};          // wbudowane data-URI (wersja jednoplikowa)
  const CREST_BASE = D.CREST_BASE || "herby/";      // pliki PNG obok strony
  function crestSrc(id) { return CRESTS[id] || `${CREST_BASE}${id}.png`; }
  function crest(id, lg) {
    const t = teams[id];
    if (!t) return `<span class="crest${lg ? " crest--lg" : ""}" style="--c1:#555;--c2:#999">?</span>`;
    return `<span class="crest crest--img${lg ? " crest--lg" : ""}" style="--c1:${t.c1};--c2:${t.c2}" aria-hidden="true"><i>${t.abbr}</i><img src="${crestSrc(id)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('crest--fallback')"></span>`;
  }
  function isLive(m) { return m.status === "LIVE"; }
  function isFinished(m) { return m.status === "FT"; }
  function sortByKickoff(a, b) {
    const ka = (a.date || "9999") + " " + (a.time || "99:99");
    const kb = (b.date || "9999") + " " + (b.time || "99:99");
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  }

  /* ---------- Tabela ---------- */
  function computeTable() {
    const rows = {};
    D.TEAMS.forEach(t => rows[t.id] = { id: t.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] });
    const played = matches.filter(isFinished).slice().sort(sortByKickoff);
    for (const m of played) {
      const h = rows[m.home], a = rows[m.away];
      if (!h || !a) continue;
      h.p++; a.p++; h.gf += m.hs; h.ga += m.as; a.gf += m.as; a.ga += m.hs;
      if (m.hs > m.as) { h.w++; a.l++; h.pts += 3; h.form.push("W"); a.form.push("L"); }
      else if (m.hs < m.as) { a.w++; h.l++; a.pts += 3; a.form.push("W"); h.form.push("L"); }
      else { h.d++; a.d++; h.pts++; a.pts++; h.form.push("D"); a.form.push("D"); }
    }
    const list = Object.values(rows).map(r => ({ ...r, gd: r.gf - r.ga, form: r.form.slice(-5) }));
    list.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || teamName(x.id).localeCompare(teamName(y.id), "pl"));
    list.forEach((r, i) => r.pos = i + 1);
    return list;
  }
  function currentTable() { return liveTable || computeTable(); }

  /* ---------- Kursy (orientacyjne) ---------- */
  function strength(row) {
    if (!row || row.p === 0) return 1.3;
    return row.pts / row.p + 0.35 * ((row.gf - row.ga) / row.p);
  }
  function oddsFor(m) {
    const table = currentTable();
    const byId = Object.fromEntries(table.map(r => [r.id, r]));
    const H = byId[m.home], A = byId[m.away];
    const d = (strength(H) + 0.45) - strength(A);
    const pDraw = Math.min(0.30, Math.max(0.16, 0.27 - 0.045 * Math.abs(d)));
    const pHomeRaw = 1 / (1 + Math.exp(-1.15 * d));
    const pH = pHomeRaw * (1 - pDraw), pA = (1 - pHomeRaw) * (1 - pDraw);
    const margin = 0.92;
    const toOdd = (p) => Math.max(1.08, Math.round((margin / p) * 100) / 100);

    const totGoals = matches.filter(isFinished).reduce((s, x) => s + x.hs + x.as, 0);
    const totGames = matches.filter(isFinished).length || 1;
    const lg = totGoals / totGames;
    const rate = (r, k) => (r && r.p ? r[k] / r.p : lg / 2);
    const lambda = 0.5 * lg + 0.25 * (rate(H, "gf") + rate(A, "ga")) + 0.25 * (rate(A, "gf") + rate(H, "ga"));
    const pUnder = Math.exp(-lambda) * (1 + lambda + lambda * lambda / 2);
    return {
      "1": toOdd(pH), "X": toOdd(pDraw), "2": toOdd(pA),
      "O25": toOdd(1 - pUnder), "U25": toOdd(pUnder),
    };
  }
  const TYPE_LABEL = { "1": "1", "X": "X", "2": "2", "O25": "+2.5", "U25": "-2.5" };
  function typeText(m, type) {
    if (type === "1") return `Wygra ${teamName(m.home)}`;
    if (type === "2") return `Wygra ${teamName(m.away)}`;
    if (type === "X") return "Remis";
    if (type === "O25") return "Powyżej 2,5 gola";
    return "Poniżej 2,5 gola";
  }

  /* ---------- Rozliczanie kuponów ---------- */
  function legResult(leg) {
    const m = matches.find(x => x.id === leg.matchId);
    if (!m) return "open";
    if (m.status === "PP") return "void";
    if (!isFinished(m)) return "open";
    const tot = m.hs + m.as;
    const won = leg.type === "1" ? m.hs > m.as
      : leg.type === "2" ? m.hs < m.as
      : leg.type === "X" ? m.hs === m.as
      : leg.type === "O25" ? tot >= 3 : tot <= 2;
    return won ? "won" : "lost";
  }
  function settleBets() {
    let changed = false;
    for (const b of state.bets) {
      if (b.status !== "open") continue;
      const results = b.legs.map(legResult);
      b.legs.forEach((l, i) => l.result = results[i]);
      if (results.includes("lost")) { b.status = "lost"; changed = true; continue; }
      if (results.includes("open")) continue;
      const odds = b.legs.reduce((p, l) => p * (l.result === "void" ? 1 : l.odd), 1);
      b.status = odds === 1 ? "void" : "won";
      b.payout = Math.round(b.stake * odds);
      credit(b.payout, b.status === "void" ? `Zwrot kuponu #${b.no}` : `Wygrana kuponu #${b.no}`);
      showToast(b.status === "void" ? `Kupon #${b.no} zwrócony` : `🎉 Kupon #${b.no} wygrany: +${fmtCN(b.payout)}`);
      changed = true;
    }
    if (changed) { saveState(); renderBetsCount(); }
  }

  /* ---------- Render: nagłówek / portfel ---------- */
  function renderWallet() {
    $("#balance").textContent = Math.round(state.balance).toLocaleString("pl-PL");
    const ul = $("#ledger");
    ul.innerHTML = state.ledger.slice(0, 12).map(e => {
      const d = new Date(e.t);
      const when = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return `<li><span>${when} · ${esc(e.note)}</span><span class="${e.amount >= 0 ? "plus" : "minus"} num">${e.amount >= 0 ? "+" : "−"}${Math.abs(Math.round(e.amount)).toLocaleString("pl-PL")}</span></li>`;
    }).join("") || `<li>Brak operacji</li>`;
    $("#ledgerCount").textContent = `${state.ledger.length} operacji`;
    renderSlip();
  }
  function renderSource() {
    const el = $("#source");
    el.classList.toggle("source--live", source.kind === "live");
    el.classList.toggle("source--snap", source.kind !== "live");
    $("#sourceText").textContent = source.kind === "live" ? `Na żywo · ${source.label}` : `Dane: ${source.label}`;
  }
  function renderHero() {
    const table = currentTable();
    $("#statLeader").textContent = table[0] ? (teams[table[0].id] ? teams[table[0].id].short : table[0].id) : "—";
    const fin = matches.filter(isFinished);
    const goals = fin.reduce((s, m) => s + m.hs + m.as, 0);
    $("#statGoals").textContent = fin.length ? (goals / fin.length).toFixed(2).replace(".", ",") : "—";
    const next = matches.filter(m => !isFinished(m) && m.date && m.status !== "PP").sort(sortByKickoff)[0];
    $("#statNext").textContent = next ? shortWhen(next) : "—";
  }
  function renderBetsCount() {
    const open = state.bets.filter(b => b.status === "open").length;
    document.querySelectorAll(".betsCount").forEach(el => { el.hidden = open === 0; el.textContent = open; });
  }

  /* ---------- Render: mecze ---------- */
  function matchRow(m, opts = {}) {
    const fin = isFinished(m), live = isLive(m);
    const hw = fin && m.hs > m.as, aw = fin && m.hs < m.as;
    const when = m.status === "PP"
      ? `<span class="match__time">—</span><span class="match__status">przełożony</span>`
      : live
        ? `<span class="match__time">${esc(m.minute || "LIVE")}</span><span class="match__status"><i class="live-pulse"></i>na żywo</span>`
        : fin
          ? `<span class="match__time">${m.time || "—"}</span><span class="match__status">koniec</span>`
          : `<span class="match__time">${m.time || "TBA"}</span><span class="match__status">${m.date ? `${DAYS_SHORT[new Date(m.date + "T12:00:00").getDay()]} ${m.date.slice(8)}.${m.date.slice(5, 7)}` : "termin?"}</span>`;

    const score = (fin || live)
      ? `<b class="${aw ? "dim" : ""}">${m.hs}</b><b class="${hw ? "dim" : ""}">${m.as}</b>`
      : `<span class="vs">–</span><span class="vs">–</span>`;

    let right = "";
    const bettable = !fin && !live && m.status !== "PP";
    if (bettable) {
      const o = oddsFor(m);
      right = `<div class="odds">${["1", "X", "2"].map(t => oddBtn(m, t, o[t])).join("")}</div>`;
    } else if (opts.roundView && m.status !== "PP" && !fin && !live) {
      right = `<span class="odds--locked">zaległy</span>`;
    } else if (m.status === "PP") {
      right = `<span class="odds--locked">termin do ustalenia</span>`;
    } else if (live) {
      right = `<span class="odds--locked">zakłady zamknięte</span>`;
    } else {
      right = `<span class="odds--locked">${m.round ? `${m.round}. kolejka` : ""}</span>`;
    }

    let more = "";
    if (bettable) {
      const open = expanded.has(m.id);
      const o = oddsFor(m);
      more = open
        ? `<div class="match__more"><span>Gole:</span><div class="odds">${oddBtn(m, "O25", o.O25)}${oddBtn(m, "U25", o.U25)}</div><span>${m.round}. kolejka · kursy orientacyjne</span></div>
           <button type="button" class="more-btn" data-more="${m.id}">▴ mniej</button>`
        : `<button type="button" class="more-btn" data-more="${m.id}">▾ więcej zakładów</button>`;
    }

    return `<article class="match${live ? " match--live" : ""}" data-id="${esc(m.id)}">
      <div class="match__when">${when}</div>
      <div class="teams">
        <div class="team ${hw ? "team--winner" : aw ? "team--loser" : ""}">${crest(m.home)}<span class="team__name">${esc(teamName(m.home))}</span></div>
        <div class="team ${aw ? "team--winner" : hw ? "team--loser" : ""}">${crest(m.away)}<span class="team__name">${esc(teamName(m.away))}</span></div>
      </div>
      <div class="score">${score}</div>
      ${right}
      ${more}
    </article>`;
  }
  function oddBtn(m, type, odd) {
    const picked = slip.some(p => p.matchId === m.id && p.type === type);
    return `<button type="button" class="odd" data-bet="${esc(m.id)}" data-type="${type}" data-odd="${odd}" aria-pressed="${picked}" title="${esc(typeText(m, type))}"><small>${TYPE_LABEL[type]}</small><b>${fmtOdd(odd)}</b></button>`;
  }
  function groupByDay(list, opts) {
    const dated = list.filter(m => m.date).sort(sortByKickoff);
    const undated = list.filter(m => !m.date);
    const days = [];
    for (const m of dated) {
      let g = days[days.length - 1];
      if (!g || g.date !== m.date) { g = { date: m.date, items: [] }; days.push(g); }
      g.items.push(m);
    }
    let html = days.map(g => `<section class="day"><div class="day__head"><span>${dayLabel(g.date)}</span><span class="line"></span><span>${g.items.length} ${g.items.length === 1 ? "mecz" : g.items.length < 5 ? "mecze" : "meczów"}</span></div>${g.items.map(m => matchRow(m, opts)).join("")}</section>`).join("");
    if (undated.length) html += `<section class="day"><div class="day__head"><span>Przełożone · termin do ustalenia</span><span class="line"></span></div>${undated.map(m => matchRow(m, opts)).join("")}</section>`;
    return html || `<div class="empty">Brak meczów do pokazania.</div>`;
  }

  function renderFixtures() {
    $("#rounds").hidden = true;
    const list = matches.filter(m => !isFinished(m));
    $("#content").innerHTML = groupByDay(list, {});
  }
  function renderResults() {
    const rounds = [...new Set(matches.filter(isFinished).map(m => m.round))].sort((a, b) => a - b);
    if (!rounds.length) { $("#rounds").hidden = true; $("#content").innerHTML = `<div class="empty">Brak rozegranych meczów.</div>`; return; }
    if (round == null || !rounds.includes(round)) round = rounds[rounds.length - 1];
    const rc = $("#rounds");
    rc.hidden = false;
    rc.innerHTML = rounds.map(r => `<button type="button" class="round-chip${matches.some(m => m.round === r && isLive(m)) ? " has-live" : ""}" data-round="${r}" aria-pressed="${r === round}">${r}. kolejka</button>`).join("");
    const list = matches.filter(m => m.round === round);
    $("#content").innerHTML = groupByDay(list, { roundView: true });
    const active = rc.querySelector('[aria-pressed="true"]');
    if (active) active.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function renderTable() {
    $("#rounds").hidden = true;
    const table = currentTable();
    const zone = (pos) => pos === 1 ? "zone-ucl" : pos <= 3 ? "zone-eu" : pos >= 16 ? "zone-rel" : "";
    $("#content").innerHTML = `<div class="table-wrap"><table class="standings">
      <thead><tr><th>#</th><th class="team-cell">Drużyna</th><th>M</th><th class="hide-sm">Z</th><th class="hide-sm">R</th><th class="hide-sm">P</th><th class="hide-xs">Bramki</th><th>+/−</th><th>Pkt</th><th class="hide-sm">Forma</th></tr></thead>
      <tbody>${table.map(r => `<tr class="${zone(r.pos)}">
        <td class="pos num">${r.pos}</td>
        <td class="team-cell"><span class="team">${crest(r.id)}<span class="team__name">${esc(teamName(r.id))}</span>${teams[r.id] && teams[r.id].promoted ? ` <span class="eyebrow" title="Beniaminek">B</span>` : ""}</span></td>
        <td class="num">${r.p}</td><td class="num hide-sm">${r.w}</td><td class="num hide-sm">${r.d}</td><td class="num hide-sm">${r.l}</td>
        <td class="num hide-xs">${r.gf}:${r.ga}</td><td class="num">${r.gd > 0 ? "+" : ""}${r.gd}</td>
        <td class="pts num">${r.pts}</td>
        <td class="hide-sm"><span class="form">${(r.form || []).map(f => `<i class="${f}">${f === "W" ? "Z" : f === "D" ? "R" : "P"}</i>`).join("") || "—"}</span></td>
      </tr>`).join("")}</tbody></table></div>
      <div class="legend"><span><i style="background:var(--pitch)"></i>Mistrz / el. Ligi Mistrzów</span><span><i style="background:var(--accent)"></i>Europejskie puchary</span><span><i style="background:var(--lose)"></i>Spadek</span><span>B = beniaminek</span><span>${liveTable ? "Tabela z TheSportsDB" : "Tabela liczona z wyników na stronie"}</span></div>`;
  }
  function renderBets() {
    $("#rounds").hidden = true;
    if (!state.bets.length) { $("#content").innerHTML = `<div class="empty">Nie masz jeszcze kuponów. Kliknij kurs przy meczu, ustaw stawkę i postaw kupon.</div>`; return; }
    const badge = { open: ["badge--open", "W grze"], won: ["badge--won", "Wygrany"], lost: ["badge--lost", "Przegrany"], void: ["badge--void", "Zwrot"] };
    $("#content").innerHTML = `<div class="bets">${state.bets.map(b => {
      const d = new Date(b.t);
      const when = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const legs = b.legs.map(l => {
        const m = matches.find(x => x.id === l.matchId);
        const res = l.result || legResult(l);
        const score = m && (isFinished(m) || isLive(m)) ? ` ${m.hs}:${m.as}` : "";
        return `<div class="bet__leg ${res}"><span>${m ? esc(teamName(m.home)) + " – " + esc(teamName(m.away)) : "?"} · <b>${esc(l.label)}</b></span><span class="r">${fmtOdd(l.odd)}${score}${res === "won" ? " ✓" : res === "lost" ? " ✗" : ""}</span></div>`;
      }).join("");
      const [cls, txt] = badge[b.status];
      return `<div class="bet"><div class="bet__top"><span>Kupon #${b.no} · ${when}${b.legs.length > 1 ? ` · AKO ${b.legs.length}` : ""}</span><span class="badge ${cls}">${txt}</span></div>
        <div class="bet__legs">${legs}</div>
        <div class="bet__foot"><span>Stawka <b class="num">${fmtCN(b.stake)}</b> · kurs ${fmtOdd(b.odds)}</span><span>${b.status === "open" ? "Możliwa" : b.status === "lost" ? "Wygrana" : "Wypłata"} <b class="num">${fmtCN(b.status === "lost" ? 0 : (b.payout != null ? b.payout : b.stake * b.odds))}</b></span></div></div>`;
    }).join("")}</div>`;
  }
  function render() {
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.view === view)));
    ({ fixtures: renderFixtures, results: renderResults, table: renderTable, bets: renderBets })[view]();
    renderHero();
    renderBetsCount();
  }

  /* ---------- Kupon ---------- */
  function slipOdds() { return slip.reduce((p, s) => p * s.odd, 1); }
  function renderSlip() {
    const box = $("#picks");
    const form = $("#slipForm");
    if (!slip.length) {
      box.innerHTML = `<div class="slip__empty">Kliknij kurs przy meczu, żeby dodać typ. Kilka typów = kupon AKO (kursy się mnożą).</div>`;
      form.hidden = true;
    } else {
      box.innerHTML = slip.map(s => {
        const m = matches.find(x => x.id === s.matchId);
        return `<div class="pick"><div><div class="pick__match">${m ? esc(teamName(m.home)) + " – " + esc(teamName(m.away)) : ""}</div><div class="pick__sel">${esc(s.label)}</div></div><span class="pick__odd num">${fmtOdd(s.odd)}</span><button type="button" class="pick__rm" data-rm="${esc(s.matchId)}" aria-label="Usuń">×</button></div>`;
      }).join("");
      form.hidden = false;
      const stake = Number($("#stake").value) || 0;
      const odds = slipOdds();
      $("#totalOdds").textContent = fmtOdd(odds);
      $("#potential").textContent = fmtCN(stake * odds);
      const msg = $("#slipMsg");
      const btn = $("#placeBet");
      if (stake < 1) { msg.textContent = "Minimalna stawka to 1 CN."; msg.className = "msg msg--err"; btn.disabled = true; }
      else if (stake > state.balance) { msg.textContent = `Za mało Coinów — masz ${fmtCN(state.balance)}. Użyj kodu doładowania.`; msg.className = "msg msg--err"; btn.disabled = true; }
      else { msg.textContent = ""; msg.className = "msg"; btn.disabled = false; }
    }
    const bar = $("#slipbar");
    bar.hidden = slip.length === 0;
    $("#slipbarCount").textContent = slip.length;
    $("#slipbarOdds").textContent = fmtOdd(slipOdds());
    const nb = $("#navSlipCount"); nb.hidden = slip.length === 0; nb.textContent = slip.length;
  }
  function togglePick(matchId, type, odd) {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;
    const idx = slip.findIndex(p => p.matchId === matchId);
    if (idx >= 0 && slip[idx].type === type) slip.splice(idx, 1);
    else {
      const pick = { matchId, type, odd, label: `${typeText(m, type)} (${TYPE_LABEL[type]})` };
      if (idx >= 0) slip[idx] = pick; else slip.push(pick);
    }
    renderSlip();
    document.querySelectorAll(`.odd[data-bet="${CSS.escape(matchId)}"]`).forEach(b => {
      b.setAttribute("aria-pressed", String(slip.some(p => p.matchId === matchId && p.type === b.dataset.type)));
    });
  }
  function placeBet() {
    const stake = Math.floor(Number($("#stake").value) || 0);
    if (!slip.length || stake < 1 || stake > state.balance) return;
    const no = (state.bets[0] ? state.bets[0].no : 0) + 1;
    const bet = { no, t: Date.now(), stake, odds: Math.round(slipOdds() * 100) / 100, status: "open", legs: slip.map(s => ({ ...s })) };
    state.bets.unshift(bet);
    credit(-stake, `Kupon #${no}`);
    slip = [];
    renderSlip();
    closeSheet();
    render();
    showToast(`Kupon #${no} przyjęty. Możliwa wygrana: ${fmtCN(stake * bet.odds)}`);
  }

  /* ---------- Kody doładowania ---------- */
  function redeem(raw) {
    const code = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) return { ok: false, msg: "Wpisz kod." };
    const custom = code.match(/^COIN\+(\d{1,7})$/);
    if (custom) {
      const amt = Number(custom[1]);
      if (amt < 1) return { ok: false, msg: "Kwota musi być większa od zera." };
      credit(amt, `Kod ${code}`);
      return { ok: true, msg: `Dodano ${fmtCN(amt)}.` };
    }
    const p = PROMO[code];
    if (!p) return { ok: false, msg: "Nieznany kod. Sprawdź pisownię." };
    if (p.onlyIfBelow != null && state.balance >= p.onlyIfBelow) return { ok: false, msg: `Ten kod działa tylko, gdy masz mniej niż ${p.onlyIfBelow} CN.` };
    if (!p.reusable && state.usedCodes[code]) return { ok: false, msg: "Ten kod był już użyty." };
    state.usedCodes[code] = Date.now();
    credit(p.amount, `${p.label} (${code})`);
    return { ok: true, msg: `Dodano ${fmtCN(p.amount)}.` };
  }

  /* ---------- Dane na żywo (TheSportsDB) ---------- */
  const TSDB_KEYS = ["123", "3"];
  const NAME_KEYS = [
    ["plock", "wisla-p"], ["wisla", "wisla-k"], ["gornik", "gornik"], ["lech", "lech"], ["legia", "legia"],
    ["jagiellonia", "jagiellonia"], ["pogon", "pogon"], ["zaglebie", "zaglebie"], ["katowice", "gks"], ["korona", "korona"],
    ["widzew", "widzew"], ["piast", "piast"], ["cracovia", "cracovia"], ["slask", "slask"], ["motor", "motor"],
    ["wieczysta", "wieczysta"], ["radomiak", "radomiak"], ["rakow", "rakow"],
  ];
  function normName(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/Ł/g, "L").toLowerCase(); }
  function teamIdFor(name) {
    const n = normName(name);
    for (const [k, id] of NAME_KEYS) if (n.includes(k)) return id;
    return null;
  }
  async function getJSON(path) {
    let lastErr;
    for (const key of TSDB_KEYS) {
      try {
        const r = await fetch(`https://www.thesportsdb.com/api/v1/json/${key}/${path}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("brak połączenia");
  }
  function parseEvent(ev) {
    const home = teamIdFor(ev.strHomeTeam), away = teamIdFor(ev.strAwayTeam);
    if (!home || !away) return null;
    let date = ev.dateEvent || null, time = ev.strTime ? ev.strTime.slice(0, 5) : null;
    if (ev.strTimestamp) {
      const d = new Date(ev.strTimestamp.endsWith("Z") ? ev.strTimestamp : ev.strTimestamp + "Z");
      if (!isNaN(d)) {
        date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      }
    }
    const st = String(ev.strStatus || "").toUpperCase();
    const hs = ev.intHomeScore != null && ev.intHomeScore !== "" ? Number(ev.intHomeScore) : null;
    const as = ev.intAwayScore != null && ev.intAwayScore !== "" ? Number(ev.intAwayScore) : null;
    let status = "NS", minute = null;
    if (/POSTPONED|CANCEL/.test(st)) status = "PP";
    else if (/FINISHED|^FT$|AET|PEN/.test(st)) status = "FT";
    else if (/^1H$|^2H$|^HT$|^ET$|^BT$|LIVE|^\d+'?$/.test(st)) { status = "LIVE"; minute = /^\d+'?$/.test(st) ? st.replace("'", "") + "'" : st; }
    else if (hs != null && as != null && date && date < todayISO()) status = "FT";
    if (status === "FT" && (hs == null || as == null)) status = "NS";
    return { id: `r${ev.intRound || "x"}-${home}-${away}`, round: ev.intRound ? Number(ev.intRound) : null, date, time, home, away, hs, as, status, minute };
  }
  function mergeEvents(events) {
    let n = 0;
    for (const ev of events) {
      const e = parseEvent(ev);
      if (!e) continue;
      const existing = matches.find(m => m.home === e.home && m.away === e.away);
      if (existing) {
        if (e.status === "FT" || e.status === "LIVE") { existing.hs = e.hs; existing.as = e.as; existing.status = e.status; existing.minute = e.minute; }
        else if (existing.status !== "FT") { existing.status = e.status; }
        if (e.date) existing.date = e.date;
        if (e.time) existing.time = e.time;
        if (e.round) existing.round = e.round;
      } else {
        matches.push({ ...e, round: e.round || 0, id: `r${e.round || 0}-${e.home}-${e.away}` });
      }
      n++;
    }
    return n;
  }
  async function fetchLive(silent) {
    const btn = $("#refreshBtn");
    btn.disabled = true; btn.textContent = "Pobieram…";
    try {
      const id = D.LEAGUE_ID_TSDB;
      const [past, next, table] = await Promise.all([
        getJSON(`eventspastleague.php?id=${id}`),
        getJSON(`eventsnextleague.php?id=${id}`),
        getJSON(`lookuptable.php?l=${id}&s=${D.SEASON}`).catch(() => null),
      ]);
      const n = mergeEvents([...(past && past.events || []), ...(next && next.events || [])]);
      if (n === 0) throw new Error("API nie zwróciło meczów Ekstraklasy");
      if (table && Array.isArray(table.table) && table.table.length >= 10) {
        const rows = table.table.map(r => ({
          id: teamIdFor(r.strTeam), p: +r.intPlayed || 0, w: +r.intWin || 0, d: +r.intDraw || 0, l: +r.intLoss || 0,
          gf: +r.intGoalsFor || 0, ga: +r.intGoalsAgainst || 0, gd: (+r.intGoalsFor || 0) - (+r.intGoalsAgainst || 0), pts: +r.intPoints || 0,
          form: String(r.strForm || "").split("").filter(c => "WDL".includes(c)).slice(-5),
        })).filter(r => r.id);
        if (rows.length >= 10) { rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf); rows.forEach((r, i) => r.pos = i + 1); liveTable = rows; }
      }
      const now = new Date();
      source = { kind: "live", label: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · TheSportsDB` };
      renderSource();
      settleBets();
      render();
      if (!silent) showToast(`Zaktualizowano ${n} meczów z internetu`);
    } catch (e) {
      source = { kind: "snap", label: `snapshot ${fmtDate(D.SNAPSHOT_DATE)}` };
      renderSource();
      if (!silent) showToast("Nie udało się pobrać danych na żywo — pokazuję snapshot");
    } finally {
      btn.disabled = false; btn.textContent = "Odśwież";
    }
  }

  /* ---------- Toast / motyw ---------- */
  let toastTimer;
  function showToast(text) {
    const t = $("#toast");
    t.textContent = text; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }
  function applyTheme() {
    const root = document.documentElement;
    if (state.theme) root.setAttribute("data-theme", state.theme); else root.removeAttribute("data-theme");
  }
  function toggleTheme() {
    const dark = state.theme ? state.theme === "dark" : window.matchMedia("(prefers-color-scheme: light)").matches === false;
    state.theme = dark ? "light" : "dark";
    saveState(); applyTheme();
  }

  /* ---------- Zdarzenia ---------- */
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-bet], [data-more], [data-round], [data-rm], .tab, [data-stake]");
    if (!t) return;
    if (t.dataset.bet) togglePick(t.dataset.bet, t.dataset.type, Number(t.dataset.odd));
    else if (t.dataset.more) { expanded.has(t.dataset.more) ? expanded.delete(t.dataset.more) : expanded.add(t.dataset.more); render(); }
    else if (t.dataset.round) { round = Number(t.dataset.round); render(); }
    else if (t.dataset.rm) { slip = slip.filter(p => p.matchId !== t.dataset.rm); renderSlip(); render(); }
    else if (t.classList.contains("tab")) { view = t.dataset.view; closeSheet(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (t.dataset.stake) { $("#stake").value = t.dataset.stake === "max" ? Math.max(1, Math.floor(state.balance)) : t.dataset.stake; renderSlip(); }
  });
  $("#stake").addEventListener("input", renderSlip);
  $("#placeBet").addEventListener("click", placeBet);
  $("#clearSlip").addEventListener("click", () => { slip = []; renderSlip(); render(); });
  $("#refreshBtn").addEventListener("click", () => fetchLive(false));
  $("#themeBtn").addEventListener("click", toggleTheme);
  function openSheet() { $("#aside").classList.add("open"); $("#sheetBackdrop").hidden = false; document.body.classList.add("sheet-open"); }
  function closeSheet() { $("#aside").classList.remove("open"); $("#sheetBackdrop").hidden = true; document.body.classList.remove("sheet-open"); }
  $("#slipbarOpen").addEventListener("click", openSheet);
  $("#navSlip").addEventListener("click", () => ($("#aside").classList.contains("open") ? closeSheet() : openSheet()));
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetBackdrop").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeSheet(); });

  const dlg = $("#topupDialog");
  $("#topupBtn").addEventListener("click", () => { $("#codeMsg").textContent = ""; $("#codeInput").value = ""; dlg.showModal(); $("#codeInput").focus(); });
  $("#topupClose").addEventListener("click", () => dlg.close());
  $("#topupForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const r = redeem($("#codeInput").value);
    const m = $("#codeMsg");
    m.textContent = r.msg; m.className = `msg ${r.ok ? "msg--ok" : "msg--err"}`;
    if (r.ok) { $("#codeInput").value = ""; showToast(r.msg); }
  });

  /* ---------- Start ---------- */
  applyTheme();
  renderSource();
  renderWallet();
  settleBets();
  render();
  fetchLive(true);
})();
