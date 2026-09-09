// NAVI partner — script.js

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
  burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.card, .step, .price, .quote, .faq__item, .benefit__icon, .stat');
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
const counters = document.querySelectorAll('.stat__num[data-count]');
const runCounter = (el) => {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString('pl-PL') + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((el) => { el.textContent = (el.dataset.prefix || '') + Number(el.dataset.count).toLocaleString('pl-PL') + (el.dataset.suffix || ''); });
} else {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => cio.observe(el));
}

// ---------- Lead form ----------
const form = document.getElementById('leadForm');
const status = document.getElementById('formStatus');
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
    status.textContent = 'Uzupełnij wymagane pola i zaznacz zgodę.';
    return;
  }
  // Tu podłącz własny backend / narzędzie do formularzy (np. Formspree, własne API).
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Wysyłanie…';
  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Wyślij zgłoszenie';
    status.className = 'form__status ok';
    status.textContent = 'Dziękujemy! Oddzwonimy w ciągu kilku godzin roboczych.';
  }, 900);
});
form.querySelectorAll('input, select, textarea').forEach((f) => {
  f.addEventListener('input', () => f.classList.remove('is-invalid'));
});

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
