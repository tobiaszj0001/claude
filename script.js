// Sticky nav
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.card--service, .portfolio__card, .process__step, .stat'
).forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Form submit
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Wiadomość wysłana!';
  btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = 'Wyślij wiadomość <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
});

// Smooth counter animation
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat__num');
      nums[0] && animateCounter(nums[0], 100, 'K+');
      nums[1] && animateCounter(nums[1], 50, '+');
      nums[2] && animateCounter(nums[2], 3, 'x');
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) statsObserver.observe(heroStats);
