// NAVI Partner — script.js

// ---------- Sticky nav ----------
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  toTop.classList.toggle('show', window.scrollY > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile menu ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const setMenu = (open) => {
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  nav.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.card, .step, .price, .quote, .faq__item, .benefit__icon, .stat, .city, .guide, .req__col, .compare__col');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  revealEls.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.min(idx, 5) * 90);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// ---------- Counters ----------
const fmtCount = (el, n) => (el.dataset.prefix || '') + (el.dataset.plain ? String(n) : n.toLocaleString('pl-PL')) + (el.dataset.suffix || '');
const counters = document.querySelectorAll('.stat__num[data-count]');
const runCounter = (el) => {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtCount(el, Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((el) => { el.textContent = fmtCount(el, Number(el.dataset.count)); });
} else {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => cio.observe(el));
}

// ---------- Kalkulator wypłaty ----------
// Stawki 2026 dla umowy zlecenie (orientacyjnie): społeczne 13,71%, zdrowotna 9%, PIT 12% po 20% kosztów.
const calc = {
  gross: document.getElementById('calcGross'),
  range: document.getElementById('calcRange'),
  form: document.getElementById('calcForm'),
  out: {
    gross: document.getElementById('rGross'), fee: document.getElementById('rFee'), social: document.getElementById('rSocial'),
    health: document.getElementById('rHealth'), pit: document.getElementById('rPit'), net: document.getElementById('rNet'),
    bar: document.getElementById('rBar'), note: document.getElementById('rNote'),
  },
};
const money = (n) => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
const NOTES = {
  full: 'Wyliczenie orientacyjne dla umowy zlecenie z pełnym ZUS: składki społeczne 13,71%, zdrowotna 9%, PIT 12% po kosztach 20%. Ostateczna kwota zależy od Twojej sytuacji podatkowej.',
  other: 'Wyliczenie orientacyjne dla osoby z innym tytułem do ubezpieczenia (np. etat): bez składek społecznych, składka zdrowotna 9%, PIT 12% po kosztach 20%.',
  student: 'Wyliczenie orientacyjne dla studenta do 26. roku życia: bez składek ZUS i bez PIT (ulga dla młodych do limitu rocznego).',
};
function recalc() {
  let g = Math.max(0, Number(calc.gross.value) || 0);
  const status = calc.form.elements.status.value;
  const fee = Number(calc.form.elements.plan.value);
  let social = 0, health = 0, pit = 0;
  if (status === 'full') {
    social = g * 0.1371;
    const base = g - social;
    health = base * 0.09;
    pit = Math.max(0, (base - base * 0.2) * 0.12);
  } else if (status === 'other') {
    health = g * 0.09;
    pit = Math.max(0, (g - g * 0.2) * 0.12);
  }
  const net = Math.max(0, g - fee - social - health - pit);
  calc.out.gross.textContent = money(g);
  calc.out.fee.textContent = '−' + money(fee);
  calc.out.social.textContent = '−' + money(social);
  calc.out.health.textContent = '−' + money(health);
  calc.out.pit.textContent = '−' + money(pit);
  calc.out.net.textContent = money(net);
  calc.out.bar.style.width = (g ? Math.round((net / g) * 100) : 0) + '%';
  calc.out.note.textContent = (window.NAVI_I18N && window.NAVI_I18N.t(NOTES[status])) || NOTES[status];
}
if (calc.form) {
  calc.gross.addEventListener('input', () => { calc.range.value = Math.min(10000, Math.max(500, Number(calc.gross.value) || 0)); recalc(); });
  calc.range.addEventListener('input', () => { calc.gross.value = calc.range.value; recalc(); });
  calc.form.addEventListener('change', recalc);
  calc.form.addEventListener('submit', (e) => e.preventDefault());
  recalc();
  document.addEventListener('navi:langchange', recalc);
}

// ---------- Lead form ----------
const form = document.getElementById('leadForm');
const status = document.getElementById('formStatus');
const MSG = {
  err: 'Uzupełnij wymagane pola i zaznacz zgodę.',
  sending: 'Wysyłanie…',
  ok: 'Dziękujemy! Oddzwonimy w ciągu kilku godzin roboczych.',
  btn: 'Wyślij zgłoszenie',
};
const t = (s) => (window.NAVI_I18N && window.NAVI_I18N.t(s)) || s;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll('[required]').forEach((field) => {
    const ok = field.type === 'checkbox' ? field.checked : field.value.trim().length > 0;
    field.classList.toggle('is-invalid', !ok);
    if (!ok) valid = false;
  });
  const phone = form.elements.phone;
  if (phone.value && !/^[+\d\s()-]{9,}$/.test(phone.value.trim())) {
    phone.classList.add('is-invalid');
    valid = false;
  }
  if (!valid) {
    status.className = 'form__status err';
    status.textContent = t(MSG.err);
    return;
  }
  // Tu podłącz własny backend / narzędzie do formularzy (np. Formspree, własne API).
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = t(MSG.sending);
  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.textContent = t(MSG.btn);
    status.className = 'form__status ok';
    status.textContent = t(MSG.ok);
  }, 900);
});
form.querySelectorAll('input, select, textarea').forEach((f) => {
  f.addEventListener('input', () => f.classList.remove('is-invalid'));
});

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
