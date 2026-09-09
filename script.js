/* =====================================================================
   KONFIGURACJA – UZUPEŁNIJ PRZED PUBLIKACJĄ
   ===================================================================== */
const CONFIG = {
  phone: '+48 000 000 000',
  email: 'kontakt@twojadomena.pl',

  // Kalendarz do rezerwacji konsultacji. Obsługiwane:
  //   Calendly:        https://calendly.com/twoja-nazwa/konsultacja-30-min
  //   Cal.com:         https://cal.com/twoja-nazwa/konsultacja-30-min
  //   Google Calendar: link z "Harmonogram spotkań" → Udostępnij
  // Puste = formularz zastępczy (imię, telefon, termin).
  bookingUrl: '',

  // Wysyłka formularzy (strona jest statyczna). Np. https://formspree.io/f/xxxxxxxx
  // Puste = otwiera program pocztowy z gotową treścią.
  formEndpoint: ''
};

/* Śledzenie konwersji – działa, gdy w <head> jest Meta Pixel / TikTok Pixel / GA4 */
function trackLead(source) {
  try {
    if (window.fbq) fbq('track', 'Lead', { content_name: source });
    if (window.ttq) ttq.track('SubmitForm', { content_name: source });
    if (window.gtag) gtag('event', 'generate_lead', { source });
  } catch (_) {}
}

/* ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtViews = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' mln' : n >= 1e3 ? Math.round(n / 1e3) + ' tys.' : String(n);
const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* Dane kontaktowe */
(function () {
  const tel = 'tel:' + CONFIG.phone.replace(/[^+\d]/g, '');
  $$('.js-phone').forEach(a => a.href = tel);
  $$('.js-phone-text span:last-child').forEach(s => s.textContent = CONFIG.phone);
  $$('.js-email').forEach(a => { a.href = 'mailto:' + CONFIG.email; const s = a.querySelector('span:last-child'); if (s) s.textContent = CONFIG.email; });
  $('#year').textContent = new Date().getFullYear();
})();

/* Nawigacja */
const nav = $('#nav'), burger = $('#burger'), navLinks = $('#navLinks');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 10), { passive: true });
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('lock', open);
});
$$('a', navLinks).forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('is-open'); burger.classList.remove('is-open'); document.body.classList.remove('lock');
}));

/* =====================================================================
   VIDEO – wspólny odtwarzacz (mp4, YouTube, Vimeo, Instagram, TikTok)
   ===================================================================== */
function embedFor(url, { autoplay = true } = {}) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const ap = autoplay ? 1 : 0;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname))
      return `<video src="${esc(url)}" controls playsinline ${autoplay ? 'autoplay' : ''}></video>`;
    if (host === 'youtube.com' || host === 'youtu.be') {
      const id = host === 'youtu.be' ? u.pathname.slice(1) : (u.pathname.match(/shorts\/([^/]+)/) || [])[1] || u.searchParams.get('v');
      if (id) return `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=${ap}&rel=0&modestbranding=1" allow="autoplay; fullscreen" allowfullscreen title="Video"></iframe>`;
    }
    if (host === 'vimeo.com') {
      const id = (u.pathname.match(/\/(\d+)/) || [])[1];
      if (id) return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=${ap}" allow="autoplay; fullscreen" allowfullscreen title="Video"></iframe>`;
    }
    if (host === 'instagram.com')
      return `<iframe src="https://www.instagram.com${u.pathname.replace(/\/$/, '')}/embed" allowfullscreen title="Instagram"></iframe>`;
    if (host === 'tiktok.com') {
      const id = (u.pathname.match(/video\/(\d+)/) || [])[1];
      if (id) return `<iframe src="https://www.tiktok.com/embed/v2/${id}" allowfullscreen title="TikTok"></iframe>`;
    }
  } catch (_) {}
  return null;
}

function placeholder(kind, text) {
  return `<div class="ph ph--${kind}">
    <span class="ph__slate mono">${esc(text)}</span>
    <span class="ph__play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
  </div>`;
}

/* Video właściciela w hero */
(function () {
  const f = CONTENT.founder;
  const media = $('#founderMedia');
  const chapters = $('#founderChapters');
  $('#founderDuration').textContent = '00:00 / ' + (f.duration.length === 4 ? '0' + f.duration : f.duration);

  const poster = f.poster ? `<img src="${esc(f.poster)}" alt="" />` : '';
  media.innerHTML = poster + placeholder('wide', f.video ? 'Odtwórz' : 'Tu Twoje video · 60–90 s do kamery');
  media.classList.toggle('has-poster', !!f.poster);

  const start = (seek = 0) => {
    if (!f.video) return;
    const html = embedFor(f.video);
    if (!html) return;
    media.innerHTML = html;
    media.classList.add('is-playing');
    const v = media.querySelector('video');
    if (v) {
      v.currentTime = seek;
      v.play().catch(() => {});
      v.addEventListener('timeupdate', () => {
        $('#founderDuration').textContent = fmtTime(Math.floor(v.currentTime)) + ' / ' + fmtTime(Math.floor(v.duration || 0));
        $$('.chapters li').forEach(li => li.classList.toggle('is-on', +li.dataset.t <= v.currentTime && (!li.nextElementSibling || +li.nextElementSibling.dataset.t > v.currentTime)));
      });
    }
  };
  media.addEventListener('click', () => start(0));

  chapters.innerHTML = f.chapters.map(c => `
    <li data-t="${c.t}"><button type="button"><span class="mono">${fmtTime(c.t)}</span>${esc(c.label)}</button></li>`).join('');
  chapters.addEventListener('click', e => {
    const li = e.target.closest('li'); if (!li) return;
    const v = media.querySelector('video');
    if (v) { v.currentTime = +li.dataset.t; v.play(); } else start(+li.dataset.t);
    media.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

/* Opinie video */
(function () {
  const root = $('#testimonials');
  root.dataset.count = CONTENT.testimonials.length;
  root.innerHTML = CONTENT.testimonials.map((t, i) => `
    <article class="tcard">
      <button class="tcard__video js-play" type="button" data-video="${esc(t.video)}" data-title="${esc(t.name)}" data-ratio="tall">
        ${t.poster ? `<img src="${esc(t.poster)}" alt="" loading="lazy" />` : ''}
        ${placeholder('tall', t.video ? 'Odtwórz' : 'Opinia ' + (i + 1) + ' · video 9:16')}
      </button>
      <div class="tcard__body">
        <p class="tcard__quote">„${esc(t.quote)}”</p>
        <p class="tcard__who"><b>${esc(t.name)}</b><span>${esc(t.business)} · ${esc(t.city)}</span></p>
        <p class="tcard__result mono">${esc(t.result)}</p>
      </div>
    </article>`).join('');
})();

/* Realizacje */
const ICON = {
  Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  YouTube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 15l5-3-5-3z" fill="currentColor"/></svg>'
};
function reelCard(r, c) {
  return `<button class="reel js-play" type="button" data-video="${esc(r.video)}" data-title="${esc(r.title)}" data-ratio="tall">
    ${r.poster ? `<img class="reel__img" src="${esc(r.poster)}" alt="" loading="lazy" />` : `<span class="reel__img reel__img--t${r.tone || 1}"></span>`}
    <span class="reel__pl">${ICON[r.platform] || ''}</span>
    <span class="reel__meta"><b>▶ ${fmtViews(r.views)}</b><span>${esc(r.title)}</span><em>${esc(c.name)}</em></span>
  </button>`;
}
(function () {
  $('#view-cases').innerHTML = CONTENT.cases.map(c => `
    <article class="case">
      <div class="case__info">
        <p class="mono label">${esc(c.industry)} · ${esc(c.city)} · ${c.months} mies. współpracy</p>
        <h3>${esc(c.name)}</h3>
        <dl class="case__stats">${c.results.map(r => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('')}</dl>
        <p class="case__pl">${c.platforms.map(p => `<span>${ICON[p] || ''}${esc(p)}</span>`).join('')}</p>
      </div>
      <div class="case__reels">${c.reels.map(r => reelCard(r, c)).join('')}</div>
    </article>`).join('');

  const all = CONTENT.cases.flatMap(c => c.reels.map(r => ({ r, c })));
  const platforms = [...new Set(all.map(x => x.r.platform))];
  const chips = $('#reelChips');
  chips.innerHTML = ['all', ...platforms].map(p => `<button class="chip ${p === 'all' ? 'is-on' : ''}" data-f="${p}" type="button">${p === 'all' ? 'Wszystkie' : (ICON[p] || '') + p}</button>`).join('');
  const render = f => { $('#reelGrid').innerHTML = all.filter(x => f === 'all' || x.r.platform === f).sort((a, b) => b.r.views - a.r.views).map(x => reelCard(x.r, x.c)).join(''); };
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; $$('.chip', chips).forEach(c => c.classList.toggle('is-on', c === b)); render(b.dataset.f); });
  render('all');

  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => { x.classList.toggle('is-on', x === t); x.setAttribute('aria-selected', String(x === t)); });
    $$('.view').forEach(v => v.classList.toggle('is-on', v.id === 'view-' + t.dataset.view));
  }));
})();

/* =====================================================================
   MODALE
   ===================================================================== */
let lastFocus = null;
function openModal(m) {
  lastFocus = document.activeElement;
  m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  setTimeout(() => { const f = m.querySelector('input, iframe, video, button:not(.modal__x)'); f && f.focus(); }, 60);
}
function closeModal(m) {
  m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
  if (m.id === 'videoModal') $('#videoPlayer').innerHTML = '';
  lastFocus && lastFocus.focus();
}
$$('.modal').forEach(m => $$('[data-close]', m).forEach(el => el.addEventListener('click', () => closeModal(m))));
addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.is-open').forEach(closeModal); });

/* Rezerwacja: inline w sekcji kontakt + modal z przycisków */
function bookingSrc(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('calendly.com')) { u.searchParams.set('hide_gdpr_banner', '1'); u.searchParams.set('background_color', '1c1917'); u.searchParams.set('text_color', 'f3ece1'); u.searchParams.set('primary_color', 'f2a93b'); }
    if (u.hostname.includes('cal.com')) { u.searchParams.set('embed', 'true'); u.searchParams.set('theme', 'dark'); }
    return u.toString();
  } catch (_) { return url; }
}
const bookingModal = $('#bookingModal'), bookingForm = $('#bookingForm');
(function () {
  const inline = $('#bookingInline'), modalEmbed = $('#bookingModalEmbed');
  if (CONFIG.bookingUrl) {
    const src = esc(bookingSrc(CONFIG.bookingUrl));
    inline.innerHTML = `<iframe src="${src}" title="Rezerwacja konsultacji" loading="lazy"></iframe>`;
    modalEmbed.innerHTML = `<iframe src="${src}" title="Rezerwacja konsultacji" loading="lazy"></iframe>`;
    $('#contactForm').classList.add('form--secondary');
  } else {
    inline.hidden = true; modalEmbed.hidden = true; bookingForm.hidden = false;
  }
})();
$$('.js-book').forEach(b => b.addEventListener('click', () => {
  const plan = b.dataset.plan || '';
  $$('input[name=plan]').forEach(i => i.value = plan);
  openModal(bookingModal);
  trackLead('booking_open' + (plan ? ':' + plan : ''));
}));

/* Odtwarzacz w modalu (opinie, rolki) */
document.addEventListener('click', e => {
  const b = e.target.closest('.js-play'); if (!b) return;
  const player = $('#videoPlayer');
  const box = $('.modal__box--video');
  box.dataset.ratio = b.dataset.ratio || 'tall';
  player.innerHTML = (b.dataset.video && embedFor(b.dataset.video)) || `
    <div class="ph ph--empty"><span class="mono">${esc(b.dataset.title)}</span><p>Dodaj link do video w pliku <code>content.js</code>.</p></div>`;
  openModal($('#videoModal'));
});

/* =====================================================================
   FORMULARZE
   ===================================================================== */
async function submitForm(form, source) {
  const status = form.querySelector('.form__status'), btn = form.querySelector('button[type=submit]');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = {}; new FormData(form).forEach((v, k) => data[k] = v);
  data._subject = 'Zgłoszenie ze strony: ' + source;
  btn.disabled = true; status.textContent = 'Wysyłam…'; status.className = 'form__status';
  try {
    if (CONFIG.formEndpoint) {
      const res = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(res.status);
    } else {
      const body = Object.entries(data).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`).join('\n');
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(body)}`;
    }
    status.textContent = 'Dziękuję. Oddzwonię, żeby potwierdzić termin.'; status.classList.add('is-ok');
    form.reset(); trackLead(source);
  } catch (_) {
    status.textContent = 'Nie udało się wysłać. Zadzwoń: ' + CONFIG.phone; status.classList.add('is-err');
  } finally { btn.disabled = false; }
}
$('#contactForm').addEventListener('submit', e => { e.preventDefault(); submitForm(e.target, 'contact'); });
bookingForm.addEventListener('submit', e => { e.preventDefault(); submitForm(e.target, 'booking'); });

/* Pasek mobilny chowa się przy sekcji rezerwacji */
new IntersectionObserver(en => en.forEach(x => $('#bar').classList.toggle('is-hidden', x.isIntersecting)), { threshold: 0.15 }).observe($('#kontakt'));
