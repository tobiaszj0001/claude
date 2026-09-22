/* =====================================================================
   DZIKA LIGA SOCCA — LOGIKA STRONY
   Renderuje terminarz, tabelę, drużyny i strzelców z pliku data.js.
   ===================================================================== */
(function () {
  const D = window.DLS;
  const $ = (s, r = document) => r.querySelector(s);
  const teamById = Object.fromEntries(D.druzyny.map(t => [t.id, t]));
  const MIESIACE = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
  const DNI = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = iso => { const d = new Date(iso + "T12:00:00"); return `${DNI[d.getDay()]}, ${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtShort = iso => { const d = new Date(iso + "T12:00:00"); return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`; };

  /* ---------- herb SVG generowany z kolorów drużyny ---------- */
  function crest(t, cls = "crest") {
    return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 3 L58 12 V34 C58 48 46 58 32 62 C18 58 6 48 6 34 V12 Z" fill="${t.kolor}"/>
      <path d="M32 8 L53 15.5 V33.5 C53 44.5 43.5 53 32 56.5 C20.5 53 11 44.5 11 33.5 V15.5 Z" fill="${t.kolor2}"/>
      <text x="32" y="41" text-anchor="middle" fill="${t.kolor}">${esc(t.skrot)}</text>
    </svg>`;
  }

  /* ---------- tabela liczona z wyników ---------- */
  function computeStandings() {
    const S = {};
    D.druzyny.forEach(t => S[t.id] = { team: t, m: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] });
    D.kolejki.forEach(k => k.mecze.forEach(m => {
      if (!m.wynik) return;
      const [hg, ag] = m.wynik, H = S[m.gospodarz], A = S[m.gosc];
      H.m++; A.m++; H.gf += hg; H.ga += ag; A.gf += ag; A.ga += hg;
      if (hg > ag) { H.w++; A.l++; H.pts += 3; H.form.push("w"); A.form.push("l"); }
      else if (hg < ag) { A.w++; H.l++; A.pts += 3; A.form.push("w"); H.form.push("l"); }
      else { H.d++; A.d++; H.pts++; A.pts++; H.form.push("d"); A.form.push("d"); }
    }));
    return Object.values(S).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.team.nazwa.localeCompare(b.team.nazwa, "pl"));
  }

  function computeScorers() {
    const S = {};
    D.kolejki.forEach(k => k.mecze.forEach(m => (m.strzelcy || []).forEach(s => {
      const key = s.zawodnik + "|" + s.druzyna;
      S[key] = S[key] || { zawodnik: s.zawodnik, team: teamById[s.druzyna], gole: 0 };
      S[key].gole += s.gole;
    })));
    return Object.values(S).sort((a, b) => b.gole - a.gole || a.zawodnik.localeCompare(b.zawodnik, "pl"));
  }

  const standings = computeStandings();
  const scorers = computeScorers();
  const posById = Object.fromEntries(standings.map((s, i) => [s.team.id, i + 1]));
  const played = D.kolejki.filter(k => k.mecze.some(m => m.wynik));
  const nextRound = D.kolejki.find(k => k.mecze.some(m => !m.wynik)) || D.kolejki[D.kolejki.length - 1];
  const totalGoals = standings.reduce((a, s) => a + s.gf, 0);
  const totalMatches = standings.reduce((a, s) => a + s.m, 0) / 2;

  /* ---------- hero ---------- */
  $("#heroSezon").textContent = D.liga.sezon;
  document.querySelectorAll(".js-sezon").forEach(e => e.textContent = D.liga.sezon);
  $("#heroStats").innerHTML = [
    [D.druzyny.length, "drużyn"],
    [D.liga.liczbaKolejek, "kolejek"],
    [totalGoals, "bramek"],
    [totalMatches ? (totalGoals / totalMatches).toFixed(1) : "–", "goli / mecz"]
  ].map(([n, l]) => `<div class="stat"><span class="stat__num">${n}</span><span class="stat__label">${l}</span></div>`).join("");

  $("#heroNext").innerHTML = `<div class="next__inner">
    <span class="next__label">Kolejka ${nextRound.nr} · ${fmtDate(nextRound.data)}</span>
    <div class="next__matches">${nextRound.mecze.map(m => `<div class="next__match">${crest(teamById[m.gospodarz])}<span>${esc(teamById[m.gospodarz].skrot)}</span><small>vs</small><span>${esc(teamById[m.gosc].skrot)}</span>${crest(teamById[m.gosc])}<small>${m.godzina}</small></div>`).join("")}</div>
  </div>`;

  /* ---------- pasek ---------- */
  const lastPlayed = played[played.length - 1];
  const tickerItems = [];
  if (lastPlayed) lastPlayed.mecze.filter(m => m.wynik).forEach(m => tickerItems.push(`${teamById[m.gospodarz].nazwa} ${m.wynik[0]}:${m.wynik[1]} ${teamById[m.gosc].nazwa}`));
  tickerItems.push(`Następna kolejka: ${fmtDate(nextRound.data)} · ${D.liga.boisko}`);
  if (standings[0].m) tickerItems.push(`Lider: ${standings[0].team.nazwa} (${standings[0].pts} pkt)`);
  if (scorers[0]) tickerItems.push(`Król strzelców: ${scorers[0].zawodnik} — ${scorers[0].gole} goli`);
  $("#ticker").innerHTML = tickerItems.concat(tickerItems).map(t => `<span>${esc(t)}</span>`).join("");

  /* ---------- aktualności ---------- */
  const newsArt = {
    wyniki: `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice"><rect width="400" height="180" fill="#151920"/><path d="M40 20 L130 170 L105 170 L15 40Z M120 10 L210 170 L185 170 L95 30Z" fill="#c8ff00" opacity=".25"/><text x="380" y="140" text-anchor="end" font-family="Bebas Neue, Impact" font-size="110" fill="#c8ff00" opacity=".9">4:1</text></svg>`,
    start: `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice"><rect width="400" height="180" fill="#1a2a1f"/><circle cx="200" cy="90" r="60" fill="none" stroke="#c8ff00" stroke-width="3" opacity=".7"/><line x1="200" y1="0" x2="200" y2="180" stroke="#c8ff00" stroke-width="3" opacity=".7"/><text x="30" y="150" font-family="Bebas Neue, Impact" font-size="56" fill="#fff" opacity=".9">KICK OFF</text></svg>`,
    zapisy: `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice"><rect width="400" height="180" fill="#c8ff00"/><path d="M0 180 L400 40 L400 180Z" fill="#0b0d10" opacity=".15"/><text x="24" y="120" font-family="Bebas Neue, Impact" font-size="80" fill="#0b0d10">ZAPISY</text></svg>`
  };
  $("#news").innerHTML = D.aktualnosci.map(n => `<article class="news__card reveal">
    <div class="news__img">${newsArt[n.obraz] || newsArt.wyniki}</div>
    <div class="news__body">
      <div class="news__meta"><span class="tag">${esc(n.tag)}</span><span>${fmtShort(n.data)}.${n.data.slice(0, 4)}</span></div>
      <h3>${esc(n.tytul)}</h3><p>${esc(n.tekst)}</p>
    </div></article>`).join("");
  $("#fbLink").href = D.liga.facebook;

  /* ---------- terminarz ---------- */
  const roundsEl = $("#rounds"), fixturesEl = $("#fixtures");
  function renderRound(nr) {
    const k = D.kolejki.find(x => x.nr === nr);
    roundsEl.querySelectorAll("button").forEach(b => b.classList.toggle("active", +b.dataset.nr === nr));
    fixturesEl.innerHTML = `<div class="fixtures__date">Kolejka ${k.nr} · ${fmtDate(k.data)} · ${esc(D.liga.boisko)}</div>
      <div class="fixtures__list">${k.mecze.map(m => {
        const H = teamById[m.gospodarz], A = teamById[m.gosc];
        let score, cls = "match__score";
        if (m.wynik) { score = `${m.wynik[0]} : ${m.wynik[1]}`; cls += m.wynik[0] > m.wynik[1] ? " win-home" : m.wynik[0] < m.wynik[1] ? " win-away" : ""; }
        else { score = m.godzina; cls += " upcoming"; }
        const sc = (m.strzelcy || []).length ? `<div class="match__scorers">⚽ ${m.strzelcy.map(s => `<b>${esc(s.zawodnik)}</b>${s.gole > 1 ? " ×" + s.gole : ""} (${esc(teamById[s.druzyna].skrot)})`).join(", ")}</div>` : "";
        return `<div class="match">
          <div class="match__time">${m.godzina}<small>Boisko ${esc(m.boisko)}</small></div>
          <div class="match__team match__team--home"><span>${esc(H.nazwa)}</span>${crest(H)}</div>
          <div class="${cls}">${score}</div>
          <div class="match__team">${crest(A)}<span>${esc(A.nazwa)}</span></div>
          <div></div>${sc}
        </div>`;
      }).join("")}</div>`;
  }
  roundsEl.innerHTML = D.kolejki.map(k => `<button type="button" role="tab" data-nr="${k.nr}">Kol. ${k.nr}</button>`).join("");
  roundsEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) renderRound(+b.dataset.nr); });
  renderRound(nextRound.nr);

  /* ---------- tabela ---------- */
  $("#standings tbody").innerHTML = standings.map((s, i) => {
    const diff = s.gf - s.ga;
    const cls = i < 3 ? "top" : i === 3 ? "playoff" : "";
    return `<tr class="${cls}">
      <td class="c pos">${i + 1}</td>
      <td><div class="team-cell">${crest(s.team)}<span>${esc(s.team.nazwa)}</span></div></td>
      <td class="c">${s.m}</td><td class="c">${s.w}</td><td class="c">${s.d}</td><td class="c">${s.l}</td>
      <td class="c hide-sm">${s.gf}:${s.ga}</td>
      <td class="c ${diff > 0 ? "diff-pos" : diff < 0 ? "diff-neg" : ""}">${diff > 0 ? "+" : ""}${diff}</td>
      <td class="c hide-sm"><span class="form">${s.form.slice(-5).map(f => `<i class="${f}">${f.toUpperCase()}</i>`).join("") || "–"}</span></td>
      <td class="c pts">${s.pts}</td>
    </tr>`;
  }).join("");

  /* ---------- drużyny ---------- */
  $("#teams").innerHTML = D.druzyny.map(t => `<div class="team-card reveal" style="--team:${t.kolor}">
    ${crest(t, "crest crest--lg")}
    <h3>${esc(t.nazwa)}</h3>
    <span class="team-card__pos">${posById[t.id]}. miejsce</span>
    <p>Kapitan: ${esc(t.kapitan)}</p>
  </div>`).join("");

  /* ---------- strzelcy ---------- */
  const top3 = scorers.slice(0, 3), rest = scorers.slice(3, 13);
  $("#scorers").innerHTML = `<div class="scorers__top">${top3.map((s, i) => `<div class="scorer-hero reveal">
      <div class="scorer-hero__rank">#${i + 1}</div>
      <div class="scorer-hero__goals">${s.gole}</div>
      <div class="scorer-hero__name">${esc(s.zawodnik)}</div>
      <div class="scorer-hero__team">${crest(s.team)}${esc(s.team.nazwa)}</div>
    </div>`).join("")}</div>
    <div class="scorers__list">${rest.map((s, i) => `<div class="scorer-row">
      <span class="scorer-row__rank">${i + 4}</span>
      <span class="scorer-row__name">${esc(s.zawodnik)}<small>${esc(s.team.nazwa)}</small></span>
      <span class="scorer-row__goals">${s.gole}</span>
    </div>`).join("") || `<div class="scorer-row"><span></span><span class="scorer-row__name">Wkrótce więcej goli</span></div>`}</div>`;

  /* ---------- faq / zapisy / kontakt ---------- */
  $("#faq").innerHTML = D.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  $("#wpisowe").textContent = D.liga.wpisowe;
  $("#zapisyDo").textContent = D.liga.zapisyDo;
  $("#dzienMeczowy").textContent = D.liga.dzienMeczowy;
  $("#boisko").textContent = D.liga.boisko;
  $("#partners").innerHTML = D.partnerzy.map(p => `<span class="partner">${esc(p)}</span>`).join("");

  const ico = {
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    tel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`,
    fb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>`,
    ig: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    pin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`
  };
  $("#contactList").innerHTML = `
    <li><span class="contact__icon">${ico.mail}</span><div><small>E-mail</small><a href="mailto:${esc(D.liga.email)}">${esc(D.liga.email)}</a></div></li>
    <li><span class="contact__icon">${ico.tel}</span><div><small>Telefon</small><a href="tel:${esc(D.liga.telefon.replace(/\s/g, ""))}">${esc(D.liga.telefon)}</a></div></li>
    <li><span class="contact__icon">${ico.fb}</span><div><small>Facebook</small><a href="${esc(D.liga.facebook)}" target="_blank" rel="noopener">Dzika Liga Socca</a></div></li>
    <li><span class="contact__icon">${ico.pin}</span><div><small>Boisko</small><span>${esc(D.liga.boisko)}, ${esc(D.liga.miasto)}</span></div></li>`;
  $("#contactBoisko").textContent = `${D.liga.boisko}, ${D.liga.miasto}`;
  $("#contactCzas").textContent = D.liga.dzienMeczowy;
  $("#footerSocial").innerHTML = `<a href="${esc(D.liga.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ico.fb}</a><a href="${esc(D.liga.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ico.ig}</a><a href="mailto:${esc(D.liga.email)}" aria-label="E-mail">${ico.mail}</a>`;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- formularz (mailto — bez backendu) ---------- */
  $("#signupForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, st = $("#formStatus");
    if (!f.checkValidity()) { st.textContent = "Uzupełnij wymagane pola."; f.reportValidity(); return; }
    const v = Object.fromEntries(new FormData(f));
    const body = `Nazwa drużyny: ${v.druzyna}\nKapitan: ${v.kapitan}\nTelefon: ${v.telefon}\nE-mail: ${v.email}\n\n${v.wiadomosc || ""}`;
    window.location.href = `mailto:${D.liga.email}?subject=${encodeURIComponent("Zgłoszenie drużyny: " + v.druzyna)}&body=${encodeURIComponent(body)}`;
    st.textContent = "Otwieramy Twój program pocztowy ze zgłoszeniem. Dzięki!";
  });

  /* ---------- menu mobilne, aktywny link, reveal ---------- */
  const burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", () => { const o = links.classList.toggle("open"); burger.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); });
  links.addEventListener("click", e => { if (e.target.tagName === "A") { links.classList.remove("open"); burger.classList.remove("open"); } });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navAnchors = [...links.querySelectorAll("a:not(.btn)")];
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => io.observe(s));

  const ro = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => ro.observe(el));
  setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach(el => el.classList.add("in")), 2500);
})();
