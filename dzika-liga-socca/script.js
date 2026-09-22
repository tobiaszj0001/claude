/* =====================================================================
   DZIKA LIGA SOCCA — LOGIKA STRONY
   Renderuje wyniki, tabele (liczone z wyników), drużyny i rankingi z data.js.
   ===================================================================== */
(function () {
  const D = window.DLS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MIESIACE = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
  const DNI = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = iso => { const d = new Date(iso + "T12:00:00"); return `${DNI[d.getDay()]}, ${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtShort = iso => { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };

  /* ---------- słowniki ---------- */
  const teamById = {};
  D.ligi.forEach(l => l.druzyny.forEach(t => { teamById[t.id] = t; }));

  /* ---------- herby: obraz z assets/teams/, w razie braku herb SVG ---------- */
  function crestSvg(t) {
    const fs = t.skrot.length > 2 ? 20 : 26;
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="${t.kolor2}"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="${t.kolor}" stroke-width="3"/>
      <text x="32" y="${32 + fs * .36}" text-anchor="middle" fill="${t.kolor}" font-size="${fs}">${esc(t.skrot)}</text>
    </svg>`;
  }
  function crest(t, cls = "crest") {
    const src = t.logo ? "assets/teams/" + encodeURIComponent(t.logo) : "";
    return `<span class="${cls}" data-team="${t.id}">${src ? `<img src="${src}" alt="" loading="lazy" onerror="window.DLS_fallback(this)">` : crestSvg(t)}</span>`;
  }
  window.DLS_fallback = img => { const t = teamById[img.parentNode.dataset.team]; if (t) img.parentNode.innerHTML = crestSvg(t); };

  /* ---------- ikony ---------- */
  const ico = {
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    fb: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>`,
    ig: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-7.2 8.2L22 21h-6.6l-5.2-6.4L4.3 21h-3l7.7-8.8L1 3h6.8l4.7 5.9L17.5 3zm-1.1 16.2h1.7L6.7 4.7H4.9l11.5 14.5z"/></svg>`,
    globe: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`
  };
  const socialHtml = [["facebook", "Facebook", ico.fb], ["instagram", "Instagram", ico.ig], ["x", "X", ico.x]]
    .map(([k, label, i]) => `<a href="${esc(D.liga[k])}" target="_blank" rel="noopener" aria-label="${label}">${i}</a>`).join("");
  $("#navSocial").innerHTML = socialHtml;
  $("#footerSocial").innerHTML = socialHtml;

  /* ---------- menu / teksty ---------- */
  $("#navLinks").innerHTML = D.menu.map(m => `<li><a href="${m.href}">${esc(m.nazwa)}</a></li>`).join("");
  $("#footerLinks").innerHTML = D.menu.map(m => `<li><a href="${m.href}">${esc(m.nazwa)}</a></li>`).join("");
  $$(".js-sezon").forEach(e => e.textContent = D.liga.sezon);
  $$(".js-region").forEach(e => e.textContent = D.liga.region);
  $$(".js-opis").forEach(e => e.textContent = D.liga.opis);
  $(".js-onas-naglowek").textContent = D.onas.naglowek;
  $(".js-onas-tekst").textContent = D.onas.tekst;
  $(".js-wspolpraca-tekst").textContent = D.wspolpraca.tekst;
  $("#coopList").innerHTML = D.wspolpraca.punkty.map(p => `<li>${esc(p)}</li>`).join("");
  $("#aboutFacts").innerHTML = D.onas.fakty.map(f => `<div class="stat"><span class="stat__num">${esc(f.liczba)}</span><span class="stat__label">${esc(f.opis)}</span></div>`).join("");
  $("#allMatchesLink").href = D.liga.stronaOryginalna + "wszystkie-mecze-sezon-2026-27/";
  $("#galleryFbLink").href = D.liga.facebook;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- tabela liczona z wyników ---------- */
  function computeTable(l) {
    const S = {};
    l.druzyny.forEach(t => S[t.id] = { team: t, m: 0, w: 0, d: 0, lo: 0, gf: 0, ga: 0, pts: 0 });
    l.mecze.forEach(m => {
      if (!m.wynik) return;
      const [hg, ag] = m.wynik, H = S[m.gospodarz], A = S[m.gosc];
      H.m++; A.m++; H.gf += hg; H.ga += ag; A.gf += ag; A.ga += hg;
      if (hg > ag) { H.w++; A.lo++; H.pts += 3; } else if (hg < ag) { A.w++; H.lo++; A.pts += 3; } else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    return Object.values(S).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.team.nazwa.localeCompare(b.team.nazwa, "pl"));
  }
  const tables = Object.fromEntries(D.ligi.map(l => [l.id, computeTable(l)]));

  /* ---------- statystyki hero ---------- */
  const allMatches = D.ligi.flatMap(l => l.mecze.map(m => ({ ...m, liga: l })));
  const played = allMatches.filter(m => m.wynik);
  const totalGoals = played.reduce((a, m) => a + m.wynik[0] + m.wynik[1], 0);
  const rounds = [...new Set(played.map(m => m.kolejka))].length;
  $("#heroStats").innerHTML = [
    [Object.keys(teamById).length, "drużyn w 2 ligach"],
    [rounds, "rozegrane kolejki"],
    [totalGoals, "bramek w sezonie"],
    [played.length ? (totalGoals / played.length).toFixed(1) : "–", "goli na mecz"]
  ].map(([n, l]) => `<div class="stat"><span class="stat__num">${n}</span><span class="stat__label">${l}</span></div>`).join("");

  /* ---------- pasek ---------- */
  const lastRound = Math.max(...played.map(m => m.kolejka));
  const lastMatches = played.filter(m => m.kolejka === lastRound);
  const tickerItems = lastMatches.map(m => `${m.liga.nazwa}: ${teamById[m.gospodarz].nazwa} ${m.wynik[0]}:${m.wynik[1]} ${teamById[m.gosc].nazwa}`);
  D.ligi.forEach(l => { const t = tables[l.id][0]; tickerItems.push(`Lider ${l.nazwa}: ${t.team.nazwa} (${t.pts} pkt)`); if (l.strzelcy[0]) tickerItems.push(`Król strzelców ${l.nazwa}: ${l.strzelcy[0][0]} — ${l.strzelcy[0][2]} goli`); });
  $("#ticker").innerHTML = tickerItems.concat(tickerItems).map(t => `<span>${esc(t)}</span>`).join("");

  /* ---------- zakładki (generyczne) ---------- */
  function makeTabs(name, items, onSelect, initial) {
    const el = $(`[data-tabs="${name}"]`);
    el.innerHTML = items.map(i => `<button type="button" role="tab" data-id="${i.id}" aria-selected="${i.id === initial}">${esc(i.nazwa)}</button>`).join("");
    const select = id => { $$("button", el).forEach(b => { const on = b.dataset.id === id; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); }); onSelect(id); };
    el.addEventListener("click", e => { const b = e.target.closest("button"); if (b) select(b.dataset.id); });
    select(initial);
    return select;
  }
  const leagueTabs = D.ligi.map(l => ({ id: l.id, nazwa: l.nazwa }));
  const leagueBrush = l => l.nazwa.replace(/^(\d+)\s*/, "$1. ");

  /* ---------- wyniki meczów (układ jak na grafice) ---------- */
  function renderFixtures(ligaId) {
    const l = D.ligi.find(x => x.id === ligaId);
    const byRound = {};
    l.mecze.forEach(m => (byRound[m.kolejka] = byRound[m.kolejka] || []).push(m));
    const nums = Object.keys(byRound).map(Number).sort((a, b) => b - a);
    $("#fixtures").innerHTML = nums.map(nr => {
      const ms = byRound[nr];
      const dates = [...new Set(ms.map(m => m.data))].sort();
      return `<div class="round">
        <div class="round__head"><span>${nr}. kolejka</span><span>${dates.map(fmtShort).join(" / ")} r.</span></div>
        <div class="round__league brush">${esc(leagueBrush(l))}</div>
        <div class="fixtures__list">${ms.map(m => {
          const H = teamById[m.gospodarz], A = teamById[m.gosc];
          const score = m.wynik ? `${m.wynik[0]} : ${m.wynik[1]}` : (m.godzina || "vs");
          const meta = m.wynik ? "" : `<div class="match__meta">${fmtDate(m.data)}${m.godzina ? " · " + esc(m.godzina) : ""} · zapowiedź</div>`;
          return `<div class="match">
            <div class="match__team match__team--home">${esc(H.nazwa)}</div>
            ${crest(H, "crest crest--home")}
            <div class="match__score ${m.wynik ? "" : "upcoming"}">${score}</div>
            ${crest(A, "crest crest--away")}
            <div class="match__team match__team--away">${esc(A.nazwa)}</div>
            ${meta}
          </div>`;
        }).join("")}</div>
      </div>`;
    }).join("") || `<p class="empty">Terminarz pojawi się wkrótce.</p>`;
  }
  makeTabs("fixtures", leagueTabs, renderFixtures, D.ligi[0].id);

  /* ---------- tabela ---------- */
  function renderTable(ligaId) {
    const rows = tables[ligaId], n = rows.length;
    $("#standings").innerHTML = `<div class="table-wrap"><table class="standings">
      <thead><tr><th class="c">#</th><th>Drużyna</th><th class="c">M</th><th class="c">Z</th><th class="c">R</th><th class="c">P</th><th class="c hide-sm">Bramki</th><th class="c">+/−</th><th class="c pts">Pkt</th></tr></thead>
      <tbody>${rows.map((r, i) => {
        const diff = r.gf - r.ga, cls = i < 3 ? "top" : i >= n - 2 ? "bottom" : "";
        return `<tr class="${cls}">
          <td class="c pos">${i + 1}</td>
          <td><div class="team-cell">${crest(r.team)}<span>${esc(r.team.nazwa)}</span></div></td>
          <td class="c">${r.m}</td><td class="c">${r.w}</td><td class="c">${r.d}</td><td class="c">${r.lo}</td>
          <td class="c hide-sm">${r.gf}:${r.ga}</td>
          <td class="c ${diff > 0 ? "diff-pos" : diff < 0 ? "diff-neg" : ""}">${diff > 0 ? "+" : ""}${diff}</td>
          <td class="c pts">${r.pts}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }
  makeTabs("table", leagueTabs, renderTable, D.ligi[0].id);

  /* ---------- aktualności ---------- */
  const newsArt = (n, i) => {
    const pal = ["#9dff1c", "#f4f7e3", "#9dff1c"];
    const label = n.tag.length > 3 ? n.tag.slice(0, 1) : n.tag.replace(" LIGA", "");
    return `<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="160" fill="#0a2a6e"/>
      <rect width="400" height="160" fill="#0a3418" opacity="${i % 2 ? .55 : .25}"/>
      <path d="M8 60 L300 20 L360 100 L60 140 Z" fill="${pal[i % 3]}" opacity=".08"/>
      <use href="#crown" x="20" y="24" width="70" height="46" fill="none" stroke="${pal[i % 3]}" style="color:${pal[i % 3]}"/>
      <text x="380" y="140" text-anchor="end" font-family="Montserrat, sans-serif" font-weight="900" font-size="120" fill="${pal[i % 3]}" opacity=".9">${esc(label)}</text>
    </svg>`;
  };
  function renderNews(filter) {
    const items = D.aktualnosci.filter(n => filter === "all" || n.liga === filter);
    $("#news").innerHTML = items.map((n, i) => `<article class="news__card">
      <div class="news__img">${newsArt(n, i)}</div>
      <div class="news__body">
        <div class="news__meta"><span class="tag">${esc(n.tag)}</span><span>${fmtShort(n.data)}</span></div>
        <h3>${esc(n.tytul)}</h3><p>${esc(n.tekst)}</p>
      </div></article>`).join("") || `<p class="empty">Brak wpisów.</p>`;
  }
  makeTabs("news", [{ id: "all", nazwa: "Wszystkie" }, ...leagueTabs], renderNews, "all");

  /* ---------- ranking ---------- */
  const rankTypes = [
    { id: "strzelcy", nazwa: "Najlepszy strzelec", key: "strzelcy" },
    { id: "asystenci", nazwa: "Najlepszy asystent", key: "asystenci" },
    { id: "brutal", nazwa: "Największy brutal" }
  ];
  let rankType = "strzelcy", rankLiga = D.ligi[0].id;
  function renderRanking() {
    const type = rankTypes.find(r => r.id === rankType);
    let rows, sub = "";
    if (type.id === "brutal") {
      rows = D.brutal.map(r => ({ zawodnik: r[0], team: teamById[r[1]], val: `<span class="cards"><i class="card card--y">${r[2]}</i><i class="card card--r">${r[3]}</i></span>` }));
      sub = `<p class="ranking__note">Żółte i czerwone kartki w sezonie ${esc(D.liga.sezon)}. Ranking wspólny dla obu lig.</p>`;
    } else {
      const l = D.ligi.find(x => x.id === rankLiga);
      rows = l[type.key].map(r => ({ zawodnik: r[0], team: teamById[r[1]], val: r[2] }));
      sub = `<div class="tabs tabs--sm" data-tabs="rankLiga" role="tablist"></div>`;
    }
    const top = rows.slice(0, 3), rest = rows.slice(3);
    $("#ranking").innerHTML = `${sub}
      <div class="ranking__grid">
        <div class="ranking__top">${top.map((r, i) => `<div class="scorer-hero">
          <div class="scorer-hero__rank">#${i + 1}</div>
          <div class="scorer-hero__goals">${r.val}</div>
          <div class="scorer-hero__name">${esc(r.zawodnik)}</div>
          <div class="scorer-hero__team">${crest(r.team)}${esc(r.team.nazwa)}</div>
        </div>`).join("")}</div>
        <div class="ranking__list">${rest.map((r, i) => `<div class="scorer-row">
          <span class="scorer-row__rank">${i + 4}</span>
          <span class="scorer-row__name">${esc(r.zawodnik)}<small>${esc(r.team.nazwa)}</small></span>
          <span class="scorer-row__goals">${r.val}</span>
        </div>`).join("")}</div>
      </div>`;
    if (type.id !== "brutal") makeTabs("rankLiga", leagueTabs, id => { if (id !== rankLiga) { rankLiga = id; renderRanking(); } }, rankLiga);
  }
  makeTabs("rankType", rankTypes, id => { rankType = id; renderRanking(); }, rankType);

  /* ---------- drużyny ---------- */
  function renderTeams(ligaId) {
    const rows = tables[ligaId];
    $("#teams").innerHTML = rows.map((r, i) => `<div class="team-card" style="--team:${r.team.kolor}">
      ${crest(r.team, "crest crest--lg")}
      <h3>${esc(r.team.nazwa)}</h3>
      <span class="team-card__pos">${i + 1}. miejsce · ${r.pts} pkt</span>
    </div>`).join("");
  }
  makeTabs("teams", leagueTabs, renderTeams, D.ligi[0].id);

  /* ---------- galeria (kafelki do podmiany na zdjęcia) ---------- */
  $("#gallery").innerHTML = D.ligi.flatMap(l => l.mecze.filter(m => m.wynik && m.kolejka === lastRound).slice(0, 3).map(m => ({ m, l }))).map(({ m, l }) => {
    const H = teamById[m.gospodarz], A = teamById[m.gosc];
    return `<div class="gallery__tile" style="--a:${H.kolor};--b:${A.kolor}">
      <div class="gallery__teams">${crest(H)}<span>${m.wynik[0]}:${m.wynik[1]}</span>${crest(A)}</div>
      <div class="gallery__caption"><b>${esc(H.nazwa)}</b> vs <b>${esc(A.nazwa)}</b><small>${esc(l.nazwa)} · ${m.kolejka}. kolejka · ${fmtShort(m.data)}</small></div>
    </div>`;
  }).join("");

  /* ---------- partnerzy ---------- */
  $("#partners").innerHTML = D.partnerzy.map(p => `<span class="partner" data-name="${esc(p.nazwa)}"><img src="assets/partners/${encodeURIComponent(p.plik)}" alt="${esc(p.nazwa)}" loading="lazy" onerror="this.parentNode.textContent=this.parentNode.dataset.name"></span>`).join("");

  /* ---------- kontakt ---------- */
  $("#contactList").innerHTML = `
    <li><span class="contact__icon">${ico.mail}</span><div><small>E-mail</small><a href="mailto:${esc(D.liga.email)}">${esc(D.liga.email)}</a></div></li>
    <li><span class="contact__icon">${ico.fb}</span><div><small>Facebook</small><a href="${esc(D.liga.facebook)}" target="_blank" rel="noopener">Dzika Liga Socca</a></div></li>
    <li><span class="contact__icon">${ico.ig}</span><div><small>Instagram</small><a href="${esc(D.liga.instagram)}" target="_blank" rel="noopener">@dzikaligasocca</a></div></li>
    <li><span class="contact__icon">${ico.globe}</span><div><small>Strona</small><a href="${esc(D.liga.stronaOryginalna)}" target="_blank" rel="noopener">dzikaligasocca.pl</a></div></li>`;

  /* ---------- formularz (mailto — bez backendu) ---------- */
  $("#coopForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, st = $("#formStatus");
    if (!f.checkValidity()) { st.textContent = "Uzupełnij wymagane pola."; f.reportValidity(); return; }
    const v = Object.fromEntries(new FormData(f));
    const body = `Firma: ${v.firma}\nOsoba: ${v.osoba}\nE-mail: ${v.email}\n\n${v.wiadomosc || ""}`;
    window.location.href = `mailto:${D.liga.email}?subject=${encodeURIComponent("Współpraca: " + v.firma)}&body=${encodeURIComponent(body)}`;
    st.textContent = "Otwieramy Twój program pocztowy z zapytaniem. Dzięki!";
  });

  /* ---------- menu mobilne + aktywny link ---------- */
  const burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", () => { const o = links.classList.toggle("open"); burger.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); });
  links.addEventListener("click", e => { if (e.target.tagName === "A") { links.classList.remove("open"); burger.classList.remove("open"); } });
  const sections = $$("main section[id]"), navAnchors = $$("a", links);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(s => io.observe(s));
  }
})();
