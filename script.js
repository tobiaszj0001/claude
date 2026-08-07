/* ============================================================
   KALENDARZ — święta państwowe, wydarzenia i zadania
   ============================================================ */

/* ---------- Constants & i18n ---------- */
const MONTHS = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
  'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const MONTHS_GEN = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'];
const DOW_SHORT = ['Pon','Wt','Śr','Czw','Pt','Sob','Nie'];      // Monday-first
const DOW_MINI = ['P','W','Ś','C','P','S','N'];
const DOW_LONG = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];

const COLORS = ['#7c5cff','#ff5c9d','#3cc7ff','#3ce88f','#ffb43c','#ff5c5c','#b45cff'];

/* ---------- Utilities ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
// JS getDay(): 0=Sun..6=Sat  ->  Monday-first index 0=Mon..6=Sun
const dowMon = d => (d.getDay() + 6) % 7;
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

/* ---------- Polish holidays (with movable feasts) ---------- */
// Meeus/Jones/Butcher algorithm for Easter Sunday (Gregorian).
function easter(year) {
  const a = year % 19, b = Math.floor(year/100), c = year % 100;
  const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25);
  const g = Math.floor((b-f+1)/3), h = (19*a+b-d-g+15) % 30;
  const i = Math.floor(c/4), k = c % 4, l = (32+2*e+2*i-h-k) % 7;
  const m = Math.floor((a+11*h+22*l)/451);
  const month = Math.floor((h+l-7*m+114)/31);
  const day = ((h+l-7*m+114) % 31) + 1;
  return new Date(year, month-1, day);
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d; }

// Cache of "YYYY-MM-DD" -> holiday name, per year
const holidayCache = {};
function holidaysForYear(year) {
  if (holidayCache[year]) return holidayCache[year];
  const map = {};
  const add = (d, name) => { map[iso(d)] = name; };

  // Fixed-date state holidays
  add(new Date(year,0,1),  'Nowy Rok');
  add(new Date(year,0,6),  'Trzech Króli');
  add(new Date(year,4,1),  'Święto Pracy');
  add(new Date(year,4,3),  'Święto Konstytucji 3 Maja');
  add(new Date(year,7,15), 'Wniebowzięcie NMP');
  add(new Date(year,10,1), 'Wszystkich Świętych');
  add(new Date(year,10,11),'Święto Niepodległości');
  add(new Date(year,11,25),'Boże Narodzenie');
  add(new Date(year,11,26),'Drugi dzień Bożego Narodzenia');

  // Movable feasts relative to Easter
  const e = easter(year);
  add(e,               'Wielkanoc');
  add(addDays(e, 1),   'Poniedziałek Wielkanocny');
  add(addDays(e, 49),  'Zielone Świątki');
  add(addDays(e, 60),  'Boże Ciało');

  holidayCache[year] = map;
  return map;
}
function holidayOn(date) {
  return holidaysForYear(date.getFullYear())[iso(date)] || null;
}

/* ---------- Storage ---------- */
const STORE_KEY = 'kalendarz.items.v1';
const THEME_KEY = 'kalendarz.theme';
let items = load();

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch {}
}
function uid() { return 'i' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }

function itemsOn(dateISO) {
  return items
    .filter(it => it.date === dateISO)
    .sort((a,b) => {
      if (!a.time && b.time) return -1;
      if (a.time && !b.time) return 1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
}

/* ---------- App state ---------- */
let view = 'month';                 // 'day' | 'month' | 'year'
let cursor = new Date();            // reference date for the current view
cursor.setHours(0,0,0,0);
const today = new Date(); today.setHours(0,0,0,0);

/* ---------- DOM refs ---------- */
const surface = document.getElementById('surface');
const periodTitle = document.getElementById('periodTitle');
const reminderText = document.getElementById('reminderText');
const reminderCountdown = document.getElementById('reminderCountdown');

/* ============================================================
   RENDERING
   ============================================================ */
function render() {
  if (view === 'day') renderDay();
  else if (view === 'month') renderMonth();
  else renderYear();
  updateReminder();
}

/* ---- MONTH ---- */
function renderMonth() {
  const y = cursor.getFullYear(), m = cursor.getMonth();
  periodTitle.textContent = `${MONTHS[m]} ${y}`;

  const first = new Date(y, m, 1);
  const startOffset = dowMon(first);               // blank cells before day 1
  const gridStart = addDays(first, -startOffset);

  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const inMonth = d.getMonth() === m;
    const dISO = iso(d);
    const wd = dowMon(d);
    const isWeekend = wd >= 5;
    const hol = holidayOn(d);
    const dayItems = itemsOn(dISO);

    let chips = '';
    const shown = dayItems.slice(0, 3);
    shown.forEach(it => {
      const done = it.type === 'task' && it.done;
      const inner = it.type === 'task'
        ? `<svg class="chip__check" viewBox="0 0 24 24" fill="none" stroke="${it.color}" stroke-width="3"><path d="M4 12.5l5 5 11-12"/></svg>`
        : `<span class="chip__dot"></span>`;
      chips += `<div class="chip ${it.type==='task'?'is-task':''} ${done?'done':''}" style="--chip:${it.color}">
        ${inner}<span>${it.time ? it.time+' ' : ''}${esc(it.title)}</span></div>`;
    });
    if (dayItems.length > 3) chips += `<span class="chip__more">+${dayItems.length-3} więcej</span>`;

    cells += `
      <div class="day-cell ${inMonth?'':'is-out'} ${isWeekend||hol?'is-weekend':''} ${sameDay(d,today)?'is-today':''}" data-date="${dISO}">
        <div class="day-cell__num">${d.getDate()}</div>
        ${hol ? `<div class="day-cell__holiday" title="${esc(hol)}">${esc(hol)}</div>` : ''}
        <div class="chips">${chips}</div>
      </div>`;
  }

  const weekdays = DOW_SHORT.map((w,i) =>
    `<span class="${i>=5?'we':''}">${w}</span>`).join('');

  surface.innerHTML = `
    <div class="month-grid">
      <div class="weekdays">${weekdays}</div>
      <div class="days">${cells}</div>
    </div>`;

  surface.querySelectorAll('.day-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      cursor = parseISO(cell.dataset.date);
      setView('day');
    });
  });
}

/* ---- DAY ---- */
function renderDay() {
  const d = cursor;
  const dISO = iso(d);
  periodTitle.textContent = `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;

  const hol = holidayOn(d);
  const dayItems = itemsOn(dISO);

  let list;
  if (dayItems.length === 0) {
    list = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>
      <p>Brak wydarzeń i zadań tego dnia.</p>
      <button class="btn btn--primary" id="dayAdd">Dodaj coś</button>
    </div>`;
  } else {
    list = dayItems.map(it => {
      const done = it.type === 'task' && it.done;
      const time = it.time
        ? `<div class="day-item__time">${it.time}</div>`
        : `<div class="day-item__time allday">Cały<br>dzień</div>`;
      const check = it.type === 'task'
        ? `<button class="day-item__check" data-check="${it.id}" aria-label="Oznacz jako wykonane">
             <svg viewBox="0 0 24 24" fill="none" stroke-width="3"><path d="M4 12.5l5 5 11-12"/></svg></button>`
        : '';
      return `<div class="day-item ${done?'done':''}" style="--chip:${it.color}" data-edit="${it.id}">
        ${time}
        <div class="day-item__body">
          <div class="day-item__type">${it.type==='task'?'Zadanie':'Wydarzenie'}</div>
          <div class="day-item__title">${esc(it.title)}</div>
          ${it.note ? `<div class="day-item__note">${esc(it.note)}</div>` : ''}
        </div>
        ${check}
      </div>`;
    }).join('');
    list = `<div class="day-list">${list}</div>`;
  }

  surface.innerHTML = `
    <div class="day-view">
      <div class="day-view__head">
        <span class="day-view__dow">${DOW_LONG[dowMon(d)]}</span>
        <span class="day-view__full">${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}</span>
        ${hol ? `<span class="day-view__holiday">${esc(hol)}</span>` : ''}
      </div>
      ${list}
    </div>`;

  const dayAdd = document.getElementById('dayAdd');
  if (dayAdd) dayAdd.addEventListener('click', () => openModal(null, dISO));

  surface.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('[data-check]')) return;
      openModal(el.dataset.edit);
    });
  });
  surface.querySelectorAll('[data-check]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleTask(btn.dataset.check);
    });
  });
}

/* ---- YEAR ---- */
function renderYear() {
  const y = cursor.getFullYear();
  periodTitle.textContent = `${y}`;

  // set of dates (this year) that have items, for quick lookup
  const hasItem = new Set(items.filter(it => it.date.startsWith(y+'-')).map(it => it.date));

  let minis = '';
  for (let m = 0; m < 12; m++) {
    const first = new Date(y, m, 1);
    const startOffset = dowMon(first);
    const daysInMonth = new Date(y, m+1, 0).getDate();

    let cells = DOW_MINI.map((w,i) => `<span class="mini__dow">${w}</span>`).join('');
    for (let i = 0; i < startOffset; i++) cells += `<span class="mini__day"></span>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day);
      const dISO = iso(d);
      const wd = dowMon(d);
      const hol = holidayOn(d);
      const cls = ['mini__day'];
      if (wd >= 5 || hol) cls.push('we');
      if (hol) cls.push('holiday');
      if (hasItem.has(dISO)) cls.push('has');
      if (sameDay(d, today)) cls.push('today');
      cells += `<span class="${cls.join(' ')}" title="${hol?esc(hol):''}">${day}</span>`;
    }

    minis += `<div class="mini" data-month="${m}">
      <div class="mini__name">${MONTHS[m]}</div>
      <div class="mini__grid">${cells}</div>
    </div>`;
  }

  surface.innerHTML = `<div class="year-grid">${minis}</div>`;

  surface.querySelectorAll('.mini').forEach(el => {
    el.addEventListener('click', () => {
      cursor = new Date(y, Number(el.dataset.month), 1);
      setView('month');
    });
  });
}

/* ============================================================
   REMINDER — nearest upcoming event/task (incl. holidays)
   ============================================================ */
function updateReminder() {
  const now = new Date();
  let best = null; // { when: Date, label: string }

  // user items in the future (next ~2 years worth is plenty; scan all)
  items.forEach(it => {
    if (it.type === 'task' && it.done) return;
    const when = parseISO(it.date);
    if (it.time) {
      const [h, mi] = it.time.split(':').map(Number);
      when.setHours(h, mi, 0, 0);
    } else {
      when.setHours(23, 59, 59, 0); // all-day counts until end of day
    }
    if (when >= now) {
      const label = `${it.title}`;
      if (!best || when < best.when) best = { when, label, allday: !it.time };
    }
  });

  // upcoming holidays (scan this + next year)
  const yr = now.getFullYear();
  [yr, yr+1].forEach(yy => {
    const map = holidaysForYear(yy);
    for (const dISO in map) {
      const when = parseISO(dISO); when.setHours(23,59,59,0);
      if (when >= now) {
        if (!best || when < best.when) best = { when, label: map[dISO], allday: true, holiday: true };
      }
    }
  });

  if (!best) {
    reminderText.textContent = 'Brak nadchodzących wydarzeń';
    reminderCountdown.textContent = '';
    return;
  }

  const prefix = best.holiday ? '🎉 ' : '';
  reminderText.textContent = prefix + best.label;
  reminderCountdown.textContent = countdownLabel(best.when, best.allday);
}

function countdownLabel(when, allday) {
  const now = new Date();
  const ms = when - now;
  const dayStart = new Date(); dayStart.setHours(0,0,0,0);
  const whenStart = new Date(when); whenStart.setHours(0,0,0,0);
  const dayDiff = Math.round((whenStart - dayStart) / 86400000);

  if (dayDiff === 0) {
    if (allday) return 'Dziś';
    const h = Math.floor(ms/3600000);
    const mi = Math.floor((ms%3600000)/60000);
    if (h > 0) return `za ${h}h ${mi}min`;
    if (mi > 0) return `za ${mi} min`;
    return 'teraz';
  }
  if (dayDiff === 1) return 'Jutro';
  if (dayDiff === 2) return 'Pojutrze';
  if (dayDiff < 7) return `za ${dayDiff} dni`;
  if (dayDiff < 14) return 'za tydzień';
  if (dayDiff < 31) return `za ${Math.round(dayDiff/7)} tyg.`;
  const months = Math.round(dayDiff/30);
  return `za ${months} ${months===1?'miesiąc':(months<5?'miesiące':'miesięcy')}`;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function setView(v) {
  view = v;
  document.querySelectorAll('.view-switch__btn').forEach(b =>
    b.classList.toggle('is-active', b.dataset.view === v));
  positionPill();
  render();
}
function positionPill() {
  const active = document.querySelector('.view-switch__btn.is-active');
  const pill = document.getElementById('viewPill');
  if (active && pill) {
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = `translateX(${active.offsetLeft - 5}px)`;
  }
}
function step(dir) {
  if (view === 'day') cursor = addDays(cursor, dir);
  else if (view === 'month') cursor = new Date(cursor.getFullYear(), cursor.getMonth()+dir, 1);
  else cursor = new Date(cursor.getFullYear()+dir, cursor.getMonth(), 1);
  render();
}

/* ============================================================
   MODAL — add / edit
   ============================================================ */
const modal = document.getElementById('modal');
const form = document.getElementById('itemForm');
const fTitle = document.getElementById('fTitle');
const fDate = document.getElementById('fDate');
const fTime = document.getElementById('fTime');
const fNote = document.getElementById('fNote');
const timeField = document.getElementById('timeField');
const deleteBtn = document.getElementById('deleteBtn');
const modalTitle = document.getElementById('modalTitle');
const colorPicker = document.getElementById('colorPicker');

let editingId = null;
let curType = 'event';
let curColor = COLORS[0];

// build color dots
COLORS.forEach(c => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'color-dot';
  dot.style.background = c;
  dot.style.setProperty('--chip', c);
  dot.dataset.color = c;
  dot.addEventListener('click', () => selectColor(c));
  colorPicker.appendChild(dot);
});
function selectColor(c) {
  curColor = c;
  colorPicker.querySelectorAll('.color-dot').forEach(d => {
    d.classList.toggle('is-active', d.dataset.color === c);
    d.style.setProperty('--chip', d.dataset.color);
  });
}

// type toggle
document.getElementById('typeToggle').addEventListener('click', e => {
  const btn = e.target.closest('.type-toggle__btn');
  if (!btn) return;
  curType = btn.dataset.type;
  document.querySelectorAll('.type-toggle__btn').forEach(b =>
    b.classList.toggle('is-active', b === btn));
});

function openModal(id, presetDate) {
  editingId = id;
  if (id) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    modalTitle.textContent = 'Edytuj';
    curType = it.type;
    fTitle.value = it.title;
    fDate.value = it.date;
    fTime.value = it.time || '';
    fNote.value = it.note || '';
    selectColor(it.color);
    deleteBtn.hidden = false;
  } else {
    modalTitle.textContent = 'Nowy wpis';
    curType = 'event';
    form.reset();
    fDate.value = presetDate || iso(cursor);
    selectColor(COLORS[0]);
    deleteBtn.hidden = true;
  }
  document.querySelectorAll('.type-toggle__btn').forEach(b =>
    b.classList.toggle('is-active', b.dataset.type === curType));
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => fTitle.focus(), 60);
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  editingId = null;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    title: fTitle.value.trim(),
    date: fDate.value,
    time: fTime.value || '',
    note: fNote.value.trim(),
    type: curType,
    color: curColor,
  };
  if (!data.title || !data.date) return;

  if (editingId) {
    const it = items.find(x => x.id === editingId);
    Object.assign(it, data);
  } else {
    items.push({ id: uid(), done: false, ...data });
  }
  save();
  closeModal();
  render();
});

deleteBtn.addEventListener('click', () => {
  if (!editingId) return;
  items = items.filter(x => x.id !== editingId);
  save();
  closeModal();
  render();
});

function toggleTask(id) {
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.done = !it.done;
  save();
  render();
}

modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

/* ============================================================
   EVENT WIRING
   ============================================================ */
document.getElementById('prevBtn').addEventListener('click', () => step(-1));
document.getElementById('nextBtn').addEventListener('click', () => step(1));
document.getElementById('todayBtn').addEventListener('click', () => { cursor = new Date(today); render(); });
document.getElementById('addBtn').addEventListener('click', () => openModal(null));
document.querySelectorAll('.view-switch__btn').forEach(b =>
  b.addEventListener('click', () => setView(b.dataset.view)));

// keyboard
document.addEventListener('keydown', e => {
  if (modal.classList.contains('open')) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'd') setView('day');
  else if (e.key === 'm') setView('month');
  else if (e.key === 'y') setView('year');
  else if (e.key === 't') { cursor = new Date(today); render(); }
  else if (e.key === 'n') openModal(null);
});

/* ---- Theme ---- */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t) {
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
}
let theme = localStorage.getItem(THEME_KEY) || 'dark';
applyTheme(theme);
themeToggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
});

/* ---- Live clock ---- */
const clock = document.getElementById('clock');
function tick() {
  const n = new Date();
  clock.textContent = `${DOW_LONG[dowMon(n)]}, ${n.getDate()} ${MONTHS_GEN[n.getMonth()]} • ${pad(n.getHours())}:${pad(n.getMinutes())}`;
}
tick();
setInterval(tick, 30000);
// refresh reminder countdown every minute
setInterval(updateReminder, 60000);

/* ---- Helpers ---- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---- Seed sample data on first run ---- */
if (items.length === 0 && !localStorage.getItem('kalendarz.seeded')) {
  const t = new Date();
  const dISO = n => iso(addDays(t, n));
  items = [
    { id: uid(), type:'event', title:'Spotkanie zespołu', date:dISO(0), time:'10:00', note:'Cotygodniowy sync', color:COLORS[0], done:false },
    { id: uid(), type:'task',  title:'Wysłać raport',      date:dISO(1), time:'',      note:'', color:COLORS[3], done:false },
    { id: uid(), type:'event', title:'Lunch z klientem',   date:dISO(2), time:'13:30', note:'Restauracja w centrum', color:COLORS[1], done:false },
    { id: uid(), type:'task',  title:'Przygotować prezentację', date:dISO(4), time:'', note:'', color:COLORS[4], done:false },
  ];
  save();
  try { localStorage.setItem('kalendarz.seeded', '1'); } catch {}
}

/* ---- Boot ---- */
positionPill();
render();
window.addEventListener('resize', positionPill);
