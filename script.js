/* =====================================================================
   KONFIGURACJA – UZUPEŁNIJ PRZED PUBLIKACJĄ STRONY
   ===================================================================== */
const CONFIG = {
  // Numer telefonu (podmienia wszystkie przyciski "Zadzwoń")
  phone: '+48 000 000 000',

  // Adres e-mail (podmienia link w sekcji Kontakt)
  email: 'kontakt@socialreach.pl',

  // MODUŁ REZERWACJI KONSULTACJI
  // Wklej link do swojego kalendarza. Obsługiwane:
  //   Calendly:  'https://calendly.com/twoja-nazwa/konsultacja-30-min'
  //   Cal.com:   'https://cal.com/twoja-nazwa/konsultacja-30-min'
  //   Google Calendar (Harmonogram spotkań → Udostępnij → link):
  //              'https://calendar.app.google/XXXX'  lub link z "Osadź"
  // Dopóki pole jest puste, w oknie pokazuje się formularz zastępczy.
  bookingUrl: '',

  // FORMULARZ KONTAKTOWY
  // Strona jest statyczna, więc do wysyłki potrzebna jest usługa formularzy.
  // Najprościej: https://formspree.io (darmowy plan) → wklej adres w stylu
  //   'https://formspree.io/f/xxxxxxxx'
  // Działa też Web3Forms, Getform, Basin. Dopóki pole jest puste,
  // formularz otwiera program pocztowy z gotową treścią (mailto).
  formEndpoint: ''
};

/* =====================================================================
   ŚLEDZENIE KONWERSJI (Meta Pixel, TikTok Pixel, GA4)
   Wywoływane po wysłaniu formularza i po otwarciu rezerwacji.
   ===================================================================== */
function trackLead(source) {
  try {
    if (window.fbq) fbq('track', 'Lead', { content_name: source });
    if (window.ttq) ttq.track('SubmitForm', { content_name: source });
    if (window.gtag) gtag('event', 'generate_lead', { source });
  } catch (_) { /* brak pixela – ignoruj */ }
}

/* =====================================================================
   POMOCNICZE
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function formatViews(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',').replace(',0', '') + ' mln';
  if (n >= 1000) return Math.round(n / 1000) + ' tys.';
  return String(n);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* =====================================================================
   DANE KONTAKTOWE Z CONFIG
   ===================================================================== */
(function applyContactConfig() {
  const tel = 'tel:' + CONFIG.phone.replace(/[^+\d]/g, '');
  $$('.js-phone-link').forEach(a => { a.href = tel; });
  $$('.js-phone-text span').forEach(s => { s.textContent = CONFIG.phone; });
  $$('.js-email-link').forEach(a => {
    a.href = 'mailto:' + CONFIG.email;
    const span = a.querySelector('span');
    if (span) span.textContent = CONFIG.email;
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* =====================================================================
   NAWIGACJA
   ===================================================================== */
const nav = $('#nav');
const burger = $('#burger');
const navLinks = $('#navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
$$('a', navLinks).forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

/* =====================================================================
   PORTFOLIO
   ===================================================================== */
const PLATFORM_ICON = {
  Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  YouTube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 15l5-3-5-3z" fill="currentColor"/></svg>'
};

function reelCard(reel, client) {
  const thumb = reel.thumb
    ? `<img class="reelcard__thumb" src="${escapeHtml(reel.thumb)}" alt="" loading="lazy" />`
    : `<div class="reelcard__thumb reelcard__thumb--tone${reel.tone || 1}"></div>`;
  return `
    <button class="reelcard" type="button"
      data-video="${escapeHtml(reel.video || '')}"
      data-title="${escapeHtml(reel.title)}">
      ${thumb}
      <span class="reelcard__platform" title="${escapeHtml(reel.platform)}">${PLATFORM_ICON[reel.platform] || ''}</span>
      <span class="reelcard__play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
      <span class="reelcard__meta">
        <span class="reelcard__views">▶ ${formatViews(reel.views)}</span>
        <span class="reelcard__title">${escapeHtml(reel.title)}</span>
        <span class="reelcard__client">${escapeHtml(client.name)}</span>
      </span>
    </button>`;
}

function renderClients() {
  const root = $('#view-clients');
  root.innerHTML = PORTFOLIO.map(c => `
    <article class="client">
      <div class="client__info">
        <div class="client__top">
          <span class="client__avatar">${escapeHtml(c.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</span>
          <div>
            <h3>${escapeHtml(c.name)}</h3>
            <p class="client__industry">${escapeHtml(c.industry)} · ${escapeHtml(c.city)}</p>
          </div>
        </div>
        <p class="client__summary">${escapeHtml(c.summary)}</p>
        <div class="client__results">
          ${c.results.map(r => `<div><strong>${escapeHtml(r.value)}</strong><span>${escapeHtml(r.label)}</span></div>`).join('')}
        </div>
        <div class="client__tags">
          ${c.platforms.map(p => `<span>${PLATFORM_ICON[p] || ''}${escapeHtml(p)}</span>`).join('')}
          <span class="client__period">${escapeHtml(c.period)}</span>
        </div>
      </div>
      <div class="client__reels">
        ${c.reels.map(r => reelCard(r, c)).join('')}
      </div>
    </article>`).join('');
}

function renderReels(filter = 'all') {
  const grid = $('#reelGrid');
  const all = PORTFOLIO.flatMap(c => c.reels.map(r => ({ reel: r, client: c })));
  const list = all
    .filter(x => filter === 'all' || x.reel.platform === filter)
    .sort((a, b) => b.reel.views - a.reel.views);
  grid.innerHTML = list.map(x => reelCard(x.reel, x.client)).join('');
}

function renderReelFilters() {
  const platforms = Array.from(new Set(PORTFOLIO.flatMap(c => c.reels.map(r => r.platform))));
  const root = $('#reelFilters');
  root.innerHTML = ['all', ...platforms].map(p => `
    <button class="chip ${p === 'all' ? 'is-active' : ''}" type="button" data-filter="${p}">
      ${p === 'all' ? 'Wszystkie' : (PLATFORM_ICON[p] || '') + p}
    </button>`).join('');
  root.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    $$('.chip', root).forEach(c => c.classList.toggle('is-active', c === btn));
    renderReels(btn.dataset.filter);
  });
}

renderClients();
renderReelFilters();
renderReels();

$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => {
    const on = t === tab;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
  });
  $$('.portfolio__view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + tab.dataset.view));
}));

/* =====================================================================
   MODALE
   ===================================================================== */
let lastFocus = null;
function openModal(modal) {
  lastFocus = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const focusable = modal.querySelector('input, button:not(.modal__close), iframe');
  setTimeout(() => focusable && focusable.focus(), 50);
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (modal.id === 'videoModal') $('#videoFrame').innerHTML = '';
  if (lastFocus) lastFocus.focus();
}
$$('.modal').forEach(modal => {
  $$('[data-close]', modal).forEach(el => el.addEventListener('click', () => closeModal(modal)));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal.is-open').forEach(closeModal);
});

/* ---------- Rezerwacja konsultacji ---------- */
const bookingModal = $('#bookingModal');
const bookingEmbed = $('#bookingEmbed');
const bookingForm = $('#bookingForm');

function bookingEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('calendly.com')) {
      u.searchParams.set('hide_gdpr_banner', '1');
      u.searchParams.set('primary_color', '5b3df5');
      return u.toString();
    }
    if (u.hostname.includes('cal.com')) {
      u.searchParams.set('embed', 'true');
      u.searchParams.set('theme', 'light');
      return u.toString();
    }
    return u.toString();
  } catch (_) {
    return url;
  }
}

function setupBooking() {
  if (CONFIG.bookingUrl) {
    bookingEmbed.innerHTML = `<iframe src="${escapeHtml(bookingEmbedUrl(CONFIG.bookingUrl))}"
      title="Rezerwacja konsultacji" loading="lazy" allow="payment"></iframe>`;
    bookingForm.hidden = true;
  } else {
    bookingEmbed.innerHTML = '';
    bookingEmbed.hidden = true;
    bookingForm.hidden = false;
  }
}
setupBooking();

$$('.js-book').forEach(btn => btn.addEventListener('click', () => {
  const plan = btn.dataset.plan || '';
  const planInput = bookingForm.querySelector('[name=plan]');
  if (planInput) planInput.value = plan;
  openModal(bookingModal);
  trackLead('booking_open' + (plan ? ':' + plan : ''));
}));

/* ---------- Odtwarzacz video ---------- */
const videoModal = $('#videoModal');
const videoFrame = $('#videoFrame');

function videoEmbed(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host === 'instagram.com') {
      const path = u.pathname.replace(/\/$/, '');
      return `<iframe src="https://www.instagram.com${path}/embed" allowfullscreen title="Instagram"></iframe>`;
    }
    if (host === 'tiktok.com') {
      const id = (u.pathname.match(/video\/(\d+)/) || [])[1];
      if (id) return `<iframe src="https://www.tiktok.com/embed/v2/${id}" allowfullscreen title="TikTok"></iframe>`;
    }
    if (host === 'youtube.com' || host === 'youtu.be') {
      const id = host === 'youtu.be'
        ? u.pathname.slice(1)
        : (u.pathname.match(/shorts\/([^/]+)/) || [])[1] || u.searchParams.get('v');
      if (id) return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen title="YouTube"></iframe>`;
    }
    if (/\.(mp4|webm)(\?|$)/i.test(u.pathname)) {
      return `<video src="${escapeHtml(url)}" controls autoplay playsinline></video>`;
    }
  } catch (_) { /* nieprawidłowy URL */ }
  return null;
}

document.addEventListener('click', e => {
  const card = e.target.closest('.reelcard');
  if (!card) return;
  const url = card.dataset.video;
  const embed = url ? videoEmbed(url) : null;
  videoFrame.innerHTML = embed || `
    <div class="video-placeholder">
      <strong>${escapeHtml(card.dataset.title)}</strong>
      <p>Tu pojawi się rolka. Dodaj link do video w pliku <code>portfolio-data.js</code>.</p>
    </div>`;
  openModal(videoModal);
});

/* =====================================================================
   FORMULARZE
   ===================================================================== */
function serialize(form) {
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  return data;
}

async function submitForm(form, source) {
  const status = form.querySelector('.form__status');
  const btn = form.querySelector('button[type=submit]');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = serialize(form);
  data._subject = 'Nowe zgłoszenie ze strony: ' + source;
  btn.disabled = true;
  status.textContent = 'Wysyłam…';
  status.className = 'form__status';

  try {
    if (CONFIG.formEndpoint) {
      const res = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } else {
      // Brak usługi formularzy: otwórz program pocztowy z gotową treścią
      const body = Object.entries(data)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => `${k}: ${v}`).join('\n');
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(body)}`;
    }
    status.textContent = source === 'booking'
      ? 'Dziękuję! Oddzwonię, żeby potwierdzić termin.'
      : 'Dziękuję! Odpowiem w ciągu 24 godzin.';
    status.classList.add('is-ok');
    form.reset();
    trackLead(source);
  } catch (err) {
    status.textContent = 'Nie udało się wysłać. Zadzwoń: ' + CONFIG.phone;
    status.classList.add('is-error');
  } finally {
    btn.disabled = false;
  }
}

$('#contactForm').addEventListener('submit', e => { e.preventDefault(); submitForm(e.target, 'contact'); });
bookingForm.addEventListener('submit', e => { e.preventDefault(); submitForm(e.target, 'booking'); });

/* =====================================================================
   ANIMACJE
   ===================================================================== */
const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.step, .audience__card, .client, .plan, .testimonial, .guarantee__item, .faq__item, .inline-cta').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 60 + 'ms';
  reveal.observe(el);
});

// Liczniki w hero
function animateCount(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const format = el.dataset.format;
  const duration = 1400;
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(eased * target);
    el.textContent = (format === 'short' ? formatViews(val) : val) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counters = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counters.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counters.observe(el));

// Pasek mobilny chowa się przy sekcji kontakt (żeby nie zasłaniać formularza)
const mobileBar = $('#mobileBar');
const contactSection = $('#kontakt');
if (mobileBar && contactSection) {
  new IntersectionObserver(entries => {
    entries.forEach(entry => mobileBar.classList.toggle('is-hidden', entry.isIntersecting));
  }, { threshold: 0.2 }).observe(contactSection);
}
