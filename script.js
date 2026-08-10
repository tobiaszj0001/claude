/* ===== Odliczanie aż Kubica pójdzie na emeryturę ===== */

// Łączny czas odliczania: milion lat (przybliżone, z latami przestępnymi).
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR   = 60 * MS_PER_MINUTE;
const MS_PER_DAY    = 24 * MS_PER_HOUR;
const MS_PER_YEAR   = 365.25 * MS_PER_DAY;
const TOTAL_MS      = 1_000_000 * MS_PER_YEAR;

// Moment startu odliczania zapisujemy w localStorage,
// żeby licznik płynnie kontynuował przy każdym odświeżeniu.
const STORAGE_KEY = "kubica-countdown-start";
let startTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);
if (!Number.isFinite(startTime)) {
  startTime = Date.now();
  localStorage.setItem(STORAGE_KEY, String(startTime));
}

const els = {
  years:   document.getElementById("years"),
  days:    document.getElementById("days"),
  hours:   document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  bar:     document.getElementById("progressBar"),
  text:    document.getElementById("progressText"),
};

function pad(value, size) {
  return String(value).padStart(size, "0");
}

function render() {
  const elapsed   = Date.now() - startTime;
  const remaining = Math.max(0, TOTAL_MS - elapsed);

  let rest = remaining;
  const years = Math.floor(rest / MS_PER_YEAR);   rest -= years * MS_PER_YEAR;
  const days  = Math.floor(rest / MS_PER_DAY);    rest -= days * MS_PER_DAY;
  const hours = Math.floor(rest / MS_PER_HOUR);   rest -= hours * MS_PER_HOUR;
  const mins  = Math.floor(rest / MS_PER_MINUTE); rest -= mins * MS_PER_MINUTE;
  const secs  = Math.floor(rest / MS_PER_SECOND);

  els.years.textContent   = pad(years, 6);
  els.days.textContent    = pad(days, 3);
  els.hours.textContent   = pad(hours, 2);
  els.minutes.textContent = pad(mins, 2);
  els.seconds.textContent = pad(secs, 2);

  const percent = (elapsed / TOTAL_MS) * 100;
  els.bar.style.width = Math.min(100, percent) + "%";
  els.text.textContent = percent.toLocaleString("pl-PL", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }) + "% ukończono";
}

render();
setInterval(render, 1000);

/* ===== Dekoracyjne linie prędkości w tle ===== */
(function speedLines() {
  const container = document.getElementById("speedLines");
  if (!container) return;
  const count = 14;
  for (let i = 0; i < count; i++) {
    const line = document.createElement("span");
    const width = 60 + Math.random() * 160;
    line.style.width = width + "px";
    line.style.top = Math.random() * 100 + "%";
    line.style.animationDuration = 2 + Math.random() * 4 + "s";
    line.style.animationDelay = -Math.random() * 6 + "s";
    container.appendChild(line);
  }
})();
