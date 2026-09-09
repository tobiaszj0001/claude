/* Only Pantslow Gang: Turniej
   Bokserska bijatyka patyczaków z głowami ekipy. Czysty canvas 2D, bez zależności. */
(() => {
'use strict';

// ============================================================
//  ROSTER — tu dodajesz nowe postacie (patrz README.md)
// ============================================================
const ROSTER = [
  { id: 'miska',      name: 'Miśka',      title: 'Słomkowa Śmierć',      glove: '#ff4fa3', speed: 1.15, power: 0.90, taunt: 'Najpierw dopiję, potem cię znokautuję.' },
  { id: 'bianka',     name: 'Bianka',     title: 'Neonowa Kobra',        glove: '#ffb020', speed: 1.10, power: 1.00, taunt: 'W tych okularach nie widzę twoich łez.' },
  { id: 'cypis',      name: 'Cypis',      title: 'Różowy Cień',          glove: '#ff6ec7', speed: 1.00, power: 1.05, taunt: 'Bytom pozdrawia.' },
  { id: 'diddy',      name: 'Diddy',      title: 'Kędzior Piorun',       glove: '#7c5cff', speed: 1.20, power: 0.85, taunt: 'Nie dotykaj fryzury.' },
  { id: 'gazdziol',   name: 'Gaździoł',   title: 'Garnitur z Salonu',    glove: '#2ec4b6', speed: 0.90, power: 1.15, taunt: 'Elegancko cię położę.' },
  { id: 'miszalinaq', name: 'Miszalinaq', title: 'Dziubek Zagłady',      glove: '#ff3b3b', speed: 1.05, power: 1.00, taunt: 'Cmok. To był twój ostatni.' },
  { id: 'piotszu',    name: 'Piotszu',    title: 'Okularnik z Bunkra',   glove: '#3b82f6', speed: 0.95, power: 1.10, taunt: 'Mam to policzone. Przegrasz.' },
  { id: 'rociu',      name: 'Rociu',      title: 'Rudy Wulkan',          glove: '#ff7a1a', speed: 1.10, power: 1.00, taunt: 'Najpierw dymek, potem lanie.' },
  { id: 'szon',       name: 'Szon',       title: 'Zmarszczona Brew',     glove: '#a3e635', speed: 1.05, power: 1.05, taunt: 'Co ty odwalasz?' },
  { id: 'zoska',      name: 'Zośka',      title: 'Pazurki Zagłady',      glove: '#40e0d0', speed: 1.20, power: 0.90, taunt: 'Peace. A teraz śpij.' },
  { id: 'king_pala',  name: 'Król Pała',  title: 'Władca Only Pantslow', glove: '#ffd700', speed: 1.00, power: 1.20, legendary: true, taunt: 'Klękaj przed koroną.' },
  { id: 'watol',      name: 'Watol Wszechwładny', title: 'Wszechwładny',  glove: '#9b5cff', speed: 1.00, power: 1.20, legendary: true, taunt: 'Wszechwładza nie pyta o zgodę.' },
];

const BASE_HP = 100;
const LEGEND_MULT = 10;          // legendy mają 10x HP
const W = 960, H = 540, FLOOR = 470;
const GRAVITY = 1700;
const RING_L = 90, RING_R = 870;
const HEAD_W = 84, HEAD_H = 100;

// ============================================================
//  Narzędzia
// ============================================================
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const easeIO = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const isTouchDevice = () => (navigator.maxTouchPoints > 0) || matchMedia('(pointer: coarse)').matches;

function shade(hex, f) { // f<0 ciemniej, f>0 jaśniej
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round(lerp(r, t, p)); g = Math.round(lerp(g, t, p)); b = Math.round(lerp(b, t, p));
  return `rgb(${r},${g},${b})`;
}

// ============================================================
//  Głowy
// ============================================================
const heads = {};
function makePlaceholderHead(ch) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 380;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 380);
  grad.addColorStop(0, '#3a2f6b'); grad.addColorStop(1, '#141024');
  g.fillStyle = grad;
  g.beginPath(); g.ellipse(160, 190, 154, 184, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = ch.glove; g.lineWidth = 8; g.stroke();
  g.fillStyle = ch.glove; g.font = 'bold 200px Impact, Arial Black, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 160, 200);
  g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText('WGRAJ ZDJĘCIE', 160, 330);
  return c;
}
function loadHeads() {
  return Promise.all(ROSTER.map((ch) => new Promise((res) => {
    const img = new Image();
    img.onload = () => { heads[ch.id] = img; res(); };
    img.onerror = () => { heads[ch.id] = makePlaceholderHead(ch); ch.placeholder = true; res(); };
    img.src = 'assets/heads/' + ch.id + '.png';
  })));
}
function headSrc(ch) { const h = heads[ch.id]; return h instanceof HTMLCanvasElement ? h.toDataURL() : h.src; }

// ============================================================
//  Dźwięk (syntezowany, bez plików)
// ============================================================
const SFX = {
  ctx: null, muted: false,
  ensure() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  noise(dur, freq, q, vol, type = 'lowpass') {
    if (!this.ctx || this.muted) return; const c = this.ctx; const n = c.sampleRate * dur;
    const buf = c.createBuffer(1, n, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(c.destination); src.start();
  },
  tone(freq, dur, vol, type = 'sine', slide = 1) {
    if (!this.ctx || this.muted) return; const c = this.ctx; const o = c.createOscillator(); const g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), c.currentTime + dur);
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
  },
  punch(heavy) { this.noise(heavy ? 0.16 : 0.09, heavy ? 320 : 520, 1, heavy ? 0.9 : 0.6); this.tone(heavy ? 90 : 140, heavy ? 0.22 : 0.12, 0.5, 'sine', 0.4); },
  block() { this.noise(0.06, 2200, 2, 0.4, 'highpass'); this.tone(420, 0.08, 0.25, 'square', 0.7); },
  whiff() { this.noise(0.12, 900, 0.7, 0.12, 'bandpass'); },
  jump() { this.tone(260, 0.12, 0.12, 'triangle', 1.6); },
  ko() { this.tone(110, 1.6, 0.6, 'sine', 0.5); this.tone(165, 1.4, 0.3, 'triangle', 0.5); this.noise(0.4, 200, 1, 0.6); },
  bell() { this.tone(1600, 0.7, 0.35, 'triangle', 0.98); this.tone(2400, 0.5, 0.15, 'sine', 0.98); },
  cheer() { this.noise(1.4, 1400, 0.4, 0.35, 'bandpass'); },
  hurt() { this.tone(300, 0.15, 0.2, 'sawtooth', 0.5); },
};

// ============================================================
//  Głosy postaci (nagrania z sounds/, lista w sounds/manifest.json)
//  Zdarzenia: intro, cios, obrywa, blok, ko, wygrana, wybor
// ============================================================
const VOICES = { data: {}, muted: false, last: {}, cache: {},
  load() {
    return fetch('sounds/manifest.json?v=' + Date.now()).then((r) => (r.ok ? r.json() : {})).then((d) => { this.data = d || {}; }).catch(() => {});
  },
  has(ch, ev) { const v = this.data[ch.id]; return !!(v && v[ev] && v[ev].length); },
  play(ch, ev, opts = {}) {
    if (this.muted || SFX.muted || !this.has(ch, ev)) return false;
    const key = ch.id + ':' + ev, now = performance.now();
    if (now - (this.last[key] || 0) < (opts.cooldown || 700)) return false;
    if (opts.chance !== undefined && Math.random() > opts.chance) return false;
    this.last[key] = now;
    const files = this.data[ch.id][ev]; const src = 'sounds/' + pick(files);
    try {
      const a = new Audio(src); a.volume = opts.volume === undefined ? 1 : opts.volume;
      const p = a.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
    return true;
  },
};

// ============================================================
//  Sterowanie
// ============================================================
const keysHeld = new Set();
const keyBuf = new Map(); // code -> timestamp naciśnięcia
const GAME_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyK', 'KeyL', 'Semicolon', 'ShiftLeft', 'ShiftRight', 'KeyP', 'Escape']);
let usingKeyboard = false;
window.addEventListener('keydown', (e) => {
  const inGame = App.screen === 's-game';
  if (inGame && GAME_KEYS.has(e.code)) e.preventDefault(); // żadnego przewijania, klikania przycisków spacją itp.
  if (e.repeat) return;
  if (inGame && document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  if (!usingKeyboard && GAME_KEYS.has(e.code)) { usingKeyboard = true; if (inGame) $('#touch').hidden = true; }
  keysHeld.add(e.code); keyBuf.set(e.code, performance.now());
  if ((e.code === 'Escape' || e.code === 'KeyP') && inGame) App.togglePause();
});
window.addEventListener('keyup', (e) => { keysHeld.delete(e.code); if (App.screen === 's-game' && GAME_KEYS.has(e.code)) e.preventDefault(); });
window.addEventListener('blur', () => { keysHeld.clear(); touchHeld.clear(); });
window.addEventListener('touchstart', () => { if (usingKeyboard) { usingKeyboard = false; if (App.screen === 's-game') $('#touch').hidden = false; } }, { passive: true });

const touchHeld = new Set();
const touchBuf = new Map();

// Telefony: żadnego przybliżania przez podwójne tapnięcie ani gest szczypania
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_STANDALONE = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
let lastTap = { t: 0, x: -999, y: -999 };
document.addEventListener('touchend', (e) => {
  const now = Date.now(); const t = e.changedTouches && e.changedTouches[0];
  const x = t ? t.clientX : 0, y = t ? t.clientY : 0;
  // podwójne tapnięcie w to samo miejsce = przeglądarka chce przybliżyć; nie pozwalamy
  if (now - lastTap.t < 350 && Math.hypot(x - lastTap.x, y - lastTap.y) < 60) e.preventDefault();
  lastTap = { t: now, x, y };
}, { passive: false });
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || App.screen === 's-game') e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

const KEYMAP = {
  p1: { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW'], dodge: ['KeyS'], punch: ['KeyF', 'Space'], heavy: ['KeyG'], block: ['KeyH', 'ShiftLeft'] },
  p2: { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp'], dodge: ['ArrowDown'], punch: ['KeyK'], heavy: ['KeyL'], block: ['Semicolon', 'ShiftRight'] },
};
KEYMAP.solo = {};
for (const a of Object.keys(KEYMAP.p1)) KEYMAP.solo[a] = KEYMAP.p1[a].concat(KEYMAP.p2[a]);

const BUFFER_MS = 180;
class KeyController {
  constructor(map, useTouch) { this.map = map; this.useTouch = useTouch; }
  held(a) { return this.map[a].some((c) => keysHeld.has(c)) || (this.useTouch && touchHeld.has(a)); }
  consume(a) { // zbuforowane naciśnięcie
    const now = performance.now(); let ok = false;
    for (const c of this.map[a]) { const t = keyBuf.get(c); if (t !== undefined && now - t < BUFFER_MS) { ok = true; keyBuf.delete(c); } }
    if (this.useTouch) { const t = touchBuf.get(a); if (t !== undefined && now - t < BUFFER_MS) { ok = true; touchBuf.delete(a); } }
    return ok;
  }
  reset() {}
}
class AIController {
  constructor(diff) { this.diff = diff; this.h = {}; this.buf = {}; this.timer = 0; }
  held(a) { return !!this.h[a]; }
  press(a) { this.buf[a] = performance.now(); }
  consume(a) { const t = this.buf[a]; if (t !== undefined && performance.now() - t < 400) { delete this.buf[a]; return true; } return false; }
  reset() { this.h = {}; this.buf = {}; }
}
class NullController { held() { return false; } consume() { return false; } reset() {} }

// ============================================================
//  Wojownik
// ============================================================
const TIMING = {
  punch: { dur: 0.34, a0: 0.08, a1: 0.18 },
  heavy: { dur: 0.64, a0: 0.23, a1: 0.36 },
  dodge: { dur: 0.42, inv: 0.30 },
};

class Fighter {
  constructor(ch, side, ctrl) {
    this.ch = ch; this.side = side; this.ctrl = ctrl;
    this.maxHp = BASE_HP * (ch.legendary ? LEGEND_MULT : 1); this.hp = this.maxHp;
    this.x = side === 0 ? 300 : 660; this.y = FLOOR; this.vx = 0; this.vy = 0;
    this.facing = side === 0 ? 1 : -1;
    this.state = 'idle'; this.stateT = 0; this.stateDur = 0; this.animT = Math.random() * 10;
    this.onGround = true; this.hitDone = false; this.combo = 0; this.invuln = 0; this.hurtFlash = 0;
    this.airPunched = false; this.pose = null; this.stunFlash = 0;
  }
  get attacking() { return this.state === 'punch' || this.state === 'heavy'; }
  get alive() { return this.state !== 'ko'; }
  setState(s, dur) { this.state = s; this.stateT = 0; this.stateDur = dur || 0; this.hitDone = false; }

  update(dt, opp, allowInput) {
    const c = allowInput ? this.ctrl : NULL_CTRL;
    this.stateT += dt; this.animT += dt;
    this.invuln = Math.max(0, this.invuln - dt); this.hurtFlash = Math.max(0, this.hurtFlash - dt);

    if (this.state !== 'ko' && this.state !== 'hit' && !this.attacking) this.facing = opp.x >= this.x ? 1 : -1;

    if (['punch', 'heavy', 'dodge', 'hit'].includes(this.state) && this.stateT >= this.stateDur) {
      this.setState(this.onGround ? 'idle' : 'jump');
    }

    if (this.state !== 'ko') {
      const canAct = ['idle', 'walk', 'jump', 'block'].includes(this.state);
      if (canAct) {
        if (c.held('block') && this.onGround) { if (this.state !== 'block') this.setState('block'); }
        else if (this.state === 'block') this.setState('idle');

        if (this.state !== 'block') {
          if (c.consume('punch') && (this.onGround || !this.airPunched)) {
            this.setState('punch', TIMING.punch.dur); if (!this.onGround) this.airPunched = true;
          } else if (this.onGround && c.consume('heavy')) {
            this.setState('heavy', TIMING.heavy.dur);
          } else if (this.onGround && c.consume('dodge')) {
            this.setState('dodge', TIMING.dodge.dur); this.invuln = TIMING.dodge.inv; this.vx = -this.facing * 300;
          } else if (this.onGround && c.consume('jump')) {
            this.vy = -640; this.onGround = false; this.airPunched = false; this.setState('jump'); SFX.jump();
          }
        }
        if (['idle', 'walk', 'jump'].includes(this.state)) {
          const mx = (c.held('right') ? 1 : 0) - (c.held('left') ? 1 : 0);
          const sp = 250 * this.ch.speed * (this.onGround ? 1 : 0.75);
          this.vx = mx * sp;
          if (this.onGround) {
            if (mx !== 0) { if (this.state !== 'walk') this.setState('walk'); }
            else if (this.state === 'walk') this.setState('idle');
          }
        } else if (this.state === 'block') { this.vx = 0; }
      } else if (this.state === 'punch') {
        this.vx = this.stateT < 0.12 ? this.facing * 140 : 0;
      } else if (this.state === 'heavy') {
        this.vx = (this.stateT > 0.2 && this.stateT < 0.36) ? this.facing * 200 : 0;
      } else {
        this.vx *= Math.pow(0.01, dt);
      }
    } else {
      this.vx *= Math.pow(0.02, dt);
    }

    // fizyka
    this.x += this.vx * dt;
    this.vy += GRAVITY * dt; this.y += this.vy * dt;
    if (this.y >= FLOOR) {
      this.y = FLOOR; this.vy = 0;
      if (!this.onGround) { this.onGround = true; if (this.state === 'jump') this.setState('idle'); }
    } else { this.onGround = false; }
    this.x = clamp(this.x, RING_L, RING_R);
    this.pose = computePose(this);
  }

  gloveWorld() { const P = this.pose; return { x: this.x + this.facing * P.fh.x, y: this.y + P.fh.y }; }
  attackActive() {
    if (!this.attacking || this.hitDone) return false;
    const t = TIMING[this.state]; return this.stateT >= t.a0 && this.stateT <= t.a1;
  }
}
const NULL_CTRL = new NullController();

// ------------------------------------------------------------
//  Pozy patyczaka (lokalnie, patrzy w prawo)
// ------------------------------------------------------------
function computePose(f) {
  const s = f.state, T = f.stateT, t = f.animT, D = f.stateDur || 1;
  const P = { lean: 0, hip: { x: 0, y: -95 }, sh: { x: 0, y: -165 }, head: { x: 0, y: -222, rot: 0 },
    fh: { x: 32, y: -150 }, bh: { x: 8, y: -136 }, ff: { x: 18, y: 0 }, bf: { x: -16, y: 0 }, rot: 0, trail: 0 };
  const bob = Math.sin(t * 5) * 3;
  switch (s) {
    case 'idle': P.fh.y += bob; P.bh.y += bob; P.head.y += bob * 0.5; P.sh.y += bob * 0.3; break;
    case 'walk': {
      const ph = t * 12, sn = Math.sin(ph);
      P.ff.x = 18 + sn * 16; P.ff.y = -Math.max(0, sn) * 10;
      P.bf.x = -16 - sn * 16; P.bf.y = -Math.max(0, -sn) * 10;
      P.head.y += Math.abs(sn) * 3; P.fh.y += Math.sin(ph * 2) * 2; break;
    }
    case 'jump': { const up = f.vy < 0; P.ff = { x: 16, y: up ? -34 : -18 }; P.bf = { x: -12, y: up ? -28 : -10 }; P.fh = { x: 36, y: -165 }; P.bh = { x: 6, y: -140 }; P.lean = 4; break; }
    case 'punch': {
      const p = Math.min(1, T / D); const e = p < 0.25 ? easeOut(p / 0.25) : 1 - easeIO((p - 0.25) / 0.75);
      P.fh = { x: 30 + e * 72, y: -158 }; P.bh = { x: 8 + e * 4, y: -140 }; P.lean = e * 10; P.head.x = e * 6; P.ff.x = 18 + e * 10; P.trail = e > 0.6 ? e : 0; break;
    }
    case 'heavy': {
      const p = Math.min(1, T / D); let gx, gy;
      if (p < 0.36) { const w = easeIO(p / 0.36); gx = 32 - 62 * w; gy = -150 + 14 * w; P.lean = -9 * w; P.head.x = -6 * w; P.head.rot = -0.1 * w; }
      else if (p < 0.56) { const q = easeOut((p - 0.36) / 0.2); gx = -30 + 118 * q; gy = -136 - Math.sin(q * Math.PI) * 30; P.lean = 15 * q; P.head.x = 10 * q; P.trail = q; P.head.rot = 0.12 * q; }
      else { const q = easeIO((p - 0.56) / 0.44); gx = 88 - 56 * q; gy = -150; P.lean = 15 * (1 - q); P.head.x = 10 * (1 - q); }
      P.fh = { x: gx, y: gy }; P.bh = { x: 6, y: -140 }; P.ff.x = 24; P.bf.x = -22; break;
    }
    case 'block': P.fh = { x: 24, y: -204 }; P.bh = { x: 8, y: -188 }; P.head.y += 8; P.lean = -2; P.ff.x = 16; P.bf.x = -18; break;
    case 'dodge': {
      const p = Math.min(1, T / D), c = Math.sin(p * Math.PI);
      P.hip.y = -95 + 36 * c; P.sh.y = -165 + 58 * c; P.head.y = -222 + 64 * c; P.head.x = -26 * c; P.head.rot = -0.28 * c;
      P.lean = -14 * c; P.fh = { x: 14 - 8 * c, y: -150 + 42 * c }; P.bh = { x: -4, y: -136 + 42 * c }; P.ff.x = 26; P.bf.x = -26; break;
    }
    case 'hit': {
      const p = Math.min(1, T / D), c = Math.sin(p * Math.PI);
      P.lean = -18 * c; P.head.x = -24 * c; P.head.y = -216; P.head.rot = -0.4 * c;
      P.fh = { x: 10 - 24 * c, y: -150 + 10 * c }; P.bh = { x: -10 - 12 * c, y: -128 }; P.ff.x = 14; P.bf.x = -22; break;
    }
    case 'ko': {
      const p = Math.min(1, T / 0.75), c = easeOut(p);
      P.rot = -Math.PI / 2 * c; P.head.rot = 0.35 * c; P.fh = { x: 24, y: -150 + 20 * c }; P.bh = { x: -12, y: -128 }; P.lean = -10 * c; P.ff.x = 12; P.bf.x = -16; break;
    }
  }
  P.sh.x += P.lean * 0.6; P.head.x += P.lean; P.fh.x += P.lean * 0.4; P.bh.x += P.lean * 0.4;
  return P;
}

function ik(a, b, l1, l2, bend) {
  let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.001;
  const maxd = l1 + l2 - 0.5;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  const ax = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - ax * ax));
  const ux = dx / d, uy = dy / d;
  return { mid: { x: a.x + ux * ax - uy * bend * h, y: a.y + uy * ax + ux * bend * h }, end: { x: a.x + dx, y: a.y + dy } };
}

// ============================================================
//  Rysowanie wojownika
// ============================================================
function drawFighter(ctx, f, tNow) {
  const P = f.pose || computePose(f);
  const ch = f.ch, glove = ch.glove, body = '#1b1a2e', skin = '#f1c9a5';
  ctx.save();
  ctx.translate(f.x, f.y);

  // cień
  const airH = FLOOR - f.y;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, airH + 4, 46 * (1 - airH / 900), 9, 0, 0, Math.PI * 2); ctx.fill();

  // aura legendy
  if (ch.legendary && f.alive) {
    const pulse = 0.5 + 0.5 * Math.sin(tNow * 4);
    const g = ctx.createRadialGradient(0, -110, 20, 0, -110, 150 + pulse * 20);
    g.addColorStop(0, `rgba(255,215,0,${0.22 + pulse * 0.1})`); g.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -110, 170, 0, Math.PI * 2); ctx.fill();
  }

  ctx.scale(f.facing, 1);
  ctx.rotate(P.rot);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  const hip = P.hip, sh = P.sh;
  const fLeg = ik(hip, P.ff, 50, 50, -1), bLeg = ik(hip, P.bf, 50, 50, -1);
  const fArm = ik({ x: sh.x + 6, y: sh.y + 4 }, P.fh, 48, 50, 1), bArm = ik({ x: sh.x - 6, y: sh.y + 4 }, P.bh, 48, 50, 1);

  const limb = (a, m, b, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(m.x, m.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  const shoe = (p, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(p.x + 4, p.y - 3, 14, 7, 0, 0, Math.PI * 2); ctx.fill(); };
  const drawGlove = (p, r, back) => {
    ctx.fillStyle = back ? shade(glove, -0.25) : glove;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(glove, -0.55); ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(p.x - r * 0.3, p.y - r * 0.35, r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(glove, -0.55); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.55, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  };

  // tylna noga i ręka
  limb(hip, bLeg.mid, bLeg.end, 9, shade(body, 0.18)); shoe(bLeg.end, shade(body, 0.1));
  limb({ x: sh.x - 6, y: sh.y + 4 }, bArm.mid, bArm.end, 8, shade(skin, -0.2));
  drawGlove(bArm.end, 15, true);

  // tułów + spodenki
  ctx.strokeStyle = body; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(hip.x, hip.y + 4); ctx.lineTo(sh.x, sh.y + 8); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(sh.x - 2, sh.y + 2); ctx.lineTo(P.head.x, P.head.y + HEAD_H * 0.42); ctx.stroke();
  ctx.fillStyle = glove;
  ctx.beginPath(); ctx.moveTo(hip.x - 15, hip.y - 12); ctx.lineTo(hip.x + 15, hip.y - 12); ctx.lineTo(hip.x + 20, hip.y + 24); ctx.lineTo(hip.x - 20, hip.y + 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(glove, -0.4); ctx.fillRect(hip.x - 15, hip.y - 14, 30, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(hip.x - 3, hip.y - 8, 4, 30);

  // przednia noga
  limb(hip, fLeg.mid, fLeg.end, 9, body); shoe(fLeg.end, shade(body, -0.3));

  // głowa
  ctx.save();
  ctx.translate(P.head.x, P.head.y);
  ctx.rotate(P.head.rot);
  ctx.scale(f.facing, 1); // twarz nie jest lustrzana
  const img = heads[ch.id];
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(2, 4, HEAD_W / 2 + 2, HEAD_H / 2 + 2, 0, 0, Math.PI * 2); ctx.fill();
  if (img) ctx.drawImage(img, -HEAD_W / 2, -HEAD_H / 2, HEAD_W, HEAD_H);
  if (f.hurtFlash > 0) { ctx.globalAlpha = f.hurtFlash * 2; ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.ellipse(0, 0, HEAD_W / 2, HEAD_H / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, HEAD_W / 2 - 1, HEAD_H / 2 - 1, 0, 0, Math.PI * 2); ctx.stroke();
  if (ch.legendary) drawCrown(ctx, 0, -HEAD_H / 2 + 6, 0.9);
  if (f.state === 'ko' && f.stateT > 0.5) {
    for (let i = 0; i < 3; i++) { const a = tNow * 4 + i * Math.PI * 2 / 3; drawStar(ctx, Math.cos(a) * 44, -HEAD_H / 2 - 4 + Math.sin(a) * 12, 9, '#ffe45c'); }
  }
  ctx.restore();

  // przednia ręka
  if (P.trail > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * P.trail})`; ctx.lineWidth = 26;
    ctx.beginPath(); ctx.moveTo(fArm.end.x - 50 * P.trail, fArm.end.y + 6); ctx.lineTo(fArm.end.x, fArm.end.y); ctx.stroke();
  }
  limb({ x: sh.x + 6, y: sh.y + 4 }, fArm.mid, fArm.end, 8, skin);
  drawGlove(fArm.end, 16, false);
  if (f.state === 'block') {
    ctx.strokeStyle = 'rgba(120,180,255,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(24, -190, 42, -Math.PI * 0.7, Math.PI * 0.55); ctx.stroke();
  }
  ctx.restore();
}
function drawCrown(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#a06d00'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-30, -26); ctx.lineTo(-14, -12); ctx.lineTo(0, -34); ctx.lineTo(14, -12); ctx.lineTo(30, -26); ctx.lineTo(26, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(0, -8, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(-15, -6, 3, 0, Math.PI * 2); ctx.arc(15, -6, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawStar(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

// ============================================================
//  AI
// ============================================================
function aiThink(f, opp, dt) {
  const ai = f.ctrl; ai.timer -= dt; if (ai.timer > 0) return;
  const d = ai.diff;
  ai.timer = 0.08 + Math.random() * (0.34 - 0.2 * d);
  ai.h = {};
  if (!f.alive || !opp.alive) return;
  const dist = Math.abs(opp.x - f.x), r = Math.random();
  const toward = opp.x > f.x ? 'right' : 'left', away = opp.x > f.x ? 'left' : 'right';
  const cornered = (f.x <= RING_L + 5 || f.x >= RING_R - 5);

  if (opp.state === 'hit' && dist < 120 && r < 0.75) { ai.press(r < 0.3 ? 'heavy' : 'punch'); ai.h[toward] = true; return; }
  if (opp.attacking && dist < 160 && opp.stateT < TIMING[opp.state].a1) {
    if (r < 0.5 * d) { ai.h.block = true; ai.timer = 0.25; return; }
    if (r < 0.5 * d + 0.28 * d) { ai.press('dodge'); return; }
  }
  if (opp.state === 'block' && dist < 110 && r < 0.4 * d) { ai.press('heavy'); return; }
  if (dist < 105) {
    if (r < 0.32 + 0.35 * d) ai.press('punch');
    else if (r < 0.32 + 0.35 * d + 0.16 * d) ai.press('heavy');
    else if (r < 0.9 && !cornered) ai.h[away] = true;
    else { ai.h.block = true; ai.timer = 0.3; }
  } else if (dist < 175) {
    if (r < 0.45) ai.h[toward] = true;
    else if (r < 0.55 + 0.2 * d) { ai.h[toward] = true; ai.press('heavy'); }
    else if (r < 0.85) { ai.h[toward] = true; ai.press('punch'); }
    else ai.press('jump');
  } else {
    ai.h[toward] = true;
    if (r < 0.05 + 0.1 * d) ai.press('jump');
  }
}

// ============================================================
//  Arena / tłum
// ============================================================
let crowd = null;
function buildCrowd(exclude) {
  crowd = [];
  const others = ROSTER.filter((c) => !exclude.includes(c.id));
  const rows = [{ y: 318, r: 11, n: 34 }, { y: 350, r: 13, n: 30 }, { y: 386, r: 15, n: 26 }];
  const cols = ['#2d2a4a', '#3a2f5c', '#24344d', '#4a2a3a', '#2a4038', '#3d3d3d', '#5a3a2a'];
  let k = 0;
  rows.forEach((row) => {
    for (let i = 0; i < row.n; i++) {
      const x = 20 + (i + Math.random() * 0.6) * (W - 40) / row.n;
      const head = (k % 5 === 2 && others.length) ? others[Math.floor(k / 5) % others.length] : null;
      crowd.push({ x, y: row.y + rand(-4, 4), r: row.r, col: pick(cols), ph: Math.random() * 7, head, sp: rand(2.2, 3.6) });
      k++;
    }
  });
}
function drawArena(ctx, t, excite) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a0a16'); g.addColorStop(0.6, '#1a1030'); g.addColorStop(1, '#0b0b14');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // reflektory
  for (const [sx, col] of [[200, 'rgba(255,79,163,0.14)'], [760, 'rgba(124,92,255,0.16)'], [480, 'rgba(255,215,0,0.10)']]) {
    const sway = Math.sin(t * 0.7 + sx) * 40;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx, -10); ctx.lineTo(sx + sway - 170, FLOOR + 20); ctx.lineTo(sx + sway + 170, FLOOR + 20); ctx.closePath(); ctx.fill();
  }
  // baner
  ctx.save(); ctx.font = '900 92px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,215,0,0.09)';
  ctx.fillText('ONLY PANTSLOW GANG', W / 2, 150); ctx.restore();
  ctx.save(); ctx.font = '600 20px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillText('TURNIEJ O KORONĘ • BEZ ZASAD • BEZ LITOŚCI', W / 2, 190); ctx.restore();

  // tłum
  if (crowd) {
    for (const c of crowd) {
      const bob = Math.sin(t * c.sp + c.ph) * (2 + excite * 6) - (excite > 0.5 ? Math.abs(Math.sin(t * 9 + c.ph)) * 8 : 0);
      ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(c.x, c.y + 22 + bob, c.r * 1.5, c.r * 1.3, 0, Math.PI, 0); ctx.fill();
      if (c.head && heads[c.head.id]) { const w = c.r * 2.4, h = w * HEAD_H / HEAD_W; ctx.drawImage(heads[c.head.id], c.x - w / 2, c.y - h / 2 + bob - 4, w, h); }
      else { ctx.fillStyle = shade(c.col, 0.35); ctx.beginPath(); ctx.arc(c.x, c.y + bob, c.r, 0, Math.PI * 2); ctx.fill(); }
      if (excite > 0.5 && c.ph % 1 < 0.5) { ctx.strokeStyle = shade(c.col, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(c.x - c.r, c.y + 14 + bob); ctx.lineTo(c.x - c.r * 1.8, c.y - 10 + bob * 2); ctx.stroke(); }
    }
  }
  ctx.fillStyle = 'rgba(11,11,20,0.55)'; ctx.fillRect(0, 395, W, 45);

  // ring
  const postL = RING_L - 50, postR = RING_R + 50;
  ctx.fillStyle = '#1e1e2f'; ctx.fillRect(postL - 8, FLOOR - 190, 16, 190); ctx.fillRect(postR - 8, FLOOR - 190, 16, 190);
  [['#e53935', FLOOR - 165], ['#f5f5f5', FLOOR - 120], ['#3b82f6', FLOOR - 75]].forEach(([col, y]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(postL, y); ctx.quadraticCurveTo(W / 2, y + 10, postR, y); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(postL, y + 3); ctx.quadraticCurveTo(W / 2, y + 13, postR, y + 3); ctx.stroke();
  });
  ctx.fillStyle = '#ffd700'; ctx.fillRect(postL - 10, FLOOR - 200, 20, 14); ctx.fillRect(postR - 10, FLOOR - 200, 20, 14);

  const fg = ctx.createLinearGradient(0, FLOOR, 0, H);
  fg.addColorStop(0, '#e6e1d3'); fg.addColorStop(1, '#b9b2a0');
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR, W, H - FLOOR);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, FLOOR, W, 4);
  ctx.save(); ctx.font = '900 40px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillText('OPG', W / 2, FLOOR + 52); ctx.restore();
  ctx.fillStyle = '#2b2540'; ctx.fillRect(0, H - 22, W, 22);
  ctx.fillStyle = '#ffd700'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, H - 22, 30, 4);
}

// ============================================================
//  Walka
// ============================================================
class Match {
  constructor(opts) {
    this.opts = opts; // { p1: ch, p2: ch, mode: 'campaign'|'versus', diff, onEnd(winnerSide) }
    const touch = isTouchDevice();
    const c1 = new KeyController(opts.mode === 'versus' ? KEYMAP.p1 : KEYMAP.solo, true);
    const c2 = opts.mode === 'versus' ? new KeyController(KEYMAP.p2, false) : new AIController(opts.diff);
    this.f = [new Fighter(opts.p1, 0, c1), new Fighter(opts.p2, 1, c2)];
    this.phase = 'intro'; this.t = 0; this.phaseT = 0;
    this.particles = []; this.popups = []; this.shake = 0; this.freeze = 0; this.excite = 0; this.slow = 1;
    this.winner = null; this.ended = false;
    buildCrowd([opts.p1.id, opts.p2.id]);
    SFX.bell();
    setTimeout(() => VOICES.play(opts.p1, 'intro'), 300);
    setTimeout(() => VOICES.play(opts.p2, 'intro'), 1300);
  }
  update(dtRaw) {
    dtRaw = Math.min(dtRaw, 1 / 30);
    this.t += dtRaw;
    if (this.freeze > 0) { this.freeze -= dtRaw; this.updateFx(dtRaw); return; }
    const dt = dtRaw * this.slow;
    this.phaseT += dtRaw;
    const [a, b] = this.f;
    const fighting = this.phase === 'fight';

    if (this.phase === 'intro' && this.phaseT > 2.3) { this.phase = 'fight'; this.phaseT = 0; }

    if (fighting) {
      if (a.ctrl instanceof AIController) aiThink(a, b, dt);
      if (b.ctrl instanceof AIController) aiThink(b, a, dt);
    }
    a.update(dt, b, fighting); b.update(dt, a, fighting);

    // rozpychanie
    if (a.alive && b.alive) {
      const dx = b.x - a.x, min = 58;
      if (Math.abs(dx) < min) { const push = (min - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1; a.x = clamp(a.x - push * s, RING_L, RING_R); b.x = clamp(b.x + push * s, RING_L, RING_R); }
    }
    if (fighting) { this.resolveHit(a, b); this.resolveHit(b, a); }

    if (this.phase === 'ko') {
      this.slow = this.phaseT < 0.9 ? 0.3 : 1;
      if (this.phaseT > 3.2 && !this.ended) { this.ended = true; this.opts.onEnd(this.winner); }
    }
    this.excite = Math.max(0, this.excite - dt * 0.5);
    this.updateFx(dt);
  }
  updateFx(dt) {
    this.shake = Math.max(0, this.shake - dt * 30);
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.life -= dt; }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.popups) { p.y += p.vy * dt; p.life -= dt; p.vy *= 0.95; }
    this.popups = this.popups.filter((p) => p.life > 0);
  }
  resolveHit(att, def) {
    if (!att.attackActive() || !def.alive) return;
    const G = att.gloveWorld();
    const heavy = att.state === 'heavy';
    const top = def.state === 'dodge' ? def.y - 150 : def.y - 228;
    const inBox = G.x > def.x - 36 && G.x < def.x + 36 && G.y > top && G.y < def.y;
    if (!inBox) return;
    att.hitDone = true;
    if (def.invuln > 0) { this.popup(def.x, def.y - 240, 'UNIK!', '#7cff9b', 26); SFX.whiff(); return; }

    const facingAtt = (att.x - def.x) * def.facing > 0;
    let dmg = (heavy ? 15 : 6) * att.ch.power * rand(0.9, 1.15);
    const mult = 1 + Math.min(att.combo, 10) * 0.1;
    dmg *= mult;
    const dir = att.facing;

    if (def.state === 'block' && facingAtt) {
      dmg *= 0.15;
      def.hp -= dmg; def.vx = dir * 160;
      SFX.block();
      this.spark(G.x, G.y, '#9ecbff', 6);
      if (heavy) { def.setState('hit', 0.24); this.popup(def.x, def.y - 240, 'PRZEŁAMANY!', '#ffb020', 24); this.shake = 6; VOICES.play(def.ch, 'obrywa', { chance: 0.6 }); }
      else { this.popup(G.x, G.y - 30, 'BLOK', '#9ecbff', 20); VOICES.play(def.ch, 'blok', { chance: 0.35, cooldown: 1500 }); }
    } else {
      def.hp -= dmg; def.combo = 0; att.combo++;
      def.setState('hit', heavy ? 0.42 : 0.26); def.hurtFlash = 0.25;
      def.vx = dir * (heavy ? 460 : 220); if (heavy) { def.vy = -240; def.onGround = false; }
      SFX.punch(heavy);
      const said = VOICES.play(def.ch, 'obrywa', { chance: heavy ? 0.8 : 0.4, cooldown: 900 });
      if (!said && Math.random() < 0.4) SFX.hurt();
      VOICES.play(att.ch, 'cios', { chance: heavy ? 0.7 : 0.3, cooldown: 1200 });
      this.spark(G.x, G.y, att.ch.glove, heavy ? 18 : 9);
      this.spark(G.x, G.y, '#ffffff', 4);
      this.popup(G.x + dir * 10, G.y - 40, pick(heavy ? ['ŁOMOT!', 'KABOOM!', 'BUM!'] : ['ŁUP!', 'BACH!', 'PRASK!', 'TRZASK!', 'PAC!']), heavy ? '#ffb020' : '#fff', heavy ? 40 : 28);
      this.popup(def.x, def.y - 250, '-' + Math.round(dmg), '#ff5c5c', 22);
      if (att.combo >= 3) this.popup(att.x, att.y - 260, att.combo + 'x COMBO', att.ch.glove, 20);
      this.shake = heavy ? 12 : 5; this.freeze = heavy ? 0.08 : 0.03; this.excite = Math.min(1, this.excite + (heavy ? 0.5 : 0.2));
    }
    def.hp = Math.max(0, def.hp);
    if (def.hp <= 0) this.knockout(att, def);
  }
  knockout(att, def) {
    def.setState('ko'); def.vx = att.facing * 380; def.vy = -300; def.onGround = false;
    this.phase = 'ko'; this.phaseT = 0; this.winner = att.side; this.shake = 18; this.freeze = 0.18; this.excite = 1;
    SFX.ko(); setTimeout(() => SFX.cheer(), 400);
    VOICES.play(def.ch, 'ko', { cooldown: 0 });
    setTimeout(() => VOICES.play(att.ch, 'wygrana', { cooldown: 0 }), 1400);
    this.spark(def.x, def.y - 150, '#ffd700', 30);
  }
  spark(x, y, col, n) { for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), s = rand(120, 460); this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 100, life: rand(0.25, 0.6), col, r: rand(2, 5) }); } }
  popup(x, y, text, col, size) { this.popups.push({ x, y, text, col, size, life: 0.9, vy: -70 }); }

  draw(ctx) {
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
    drawArena(ctx, this.t, this.excite);
    const [a, b] = this.f;
    const order = (a.state === 'hit' || a.state === 'ko') ? [a, b] : [b, a];
    for (const f of order) drawFighter(ctx, f, this.t);

    for (const p of this.particles) { ctx.globalAlpha = Math.min(1, p.life * 3); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const p of this.popups) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.font = `${p.size}px Bangers, Impact, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y); ctx.restore();
    }
    ctx.restore();
    this.drawHUD(ctx);
  }
  drawHUD(ctx) {
    const [a, b] = this.f;
    const bar = (f, right) => {
      const x0 = right ? W - 40 - 380 : 40, w = 380, y = 26, h = 22;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x0 - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#3a0d0d'; ctx.fillRect(x0, y, w, h);
      const frac = f.hp / f.maxHp;
      const grad = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      if (f.ch.legendary) { grad.addColorStop(0, '#ffd700'); grad.addColorStop(1, '#ff8c00'); }
      else { grad.addColorStop(0, '#2ec4b6'); grad.addColorStop(0.6, '#7cff9b'); grad.addColorStop(1, '#ffe45c'); }
      ctx.fillStyle = frac < 0.25 && !f.ch.legendary ? '#ff3b3b' : grad;
      const fw = w * frac;
      if (right) ctx.fillRect(x0 + w - fw, y, fw, h); else ctx.fillRect(x0, y, fw, h);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; if (right) ctx.fillRect(x0 + w - fw, y, fw, 6); else ctx.fillRect(x0, y, fw, 6);
      if (f.ch.legendary) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 1; i < LEGEND_MULT; i++) ctx.fillRect(x0 + (w / LEGEND_MULT) * i - 1, y, 2, h); }
      // głowa i nazwa
      const hw = 58, hh = hw * HEAD_H / HEAD_W, hx = right ? W - 40 + 8 - hw + 2 : 40 - 8 - 2, hy = y - 14;
      const img = heads[f.ch.id];
      ctx.save(); ctx.translate(right ? W - 8 : 8, hy); if (img) ctx.drawImage(img, right ? -hw : 0, 0, hw, hh); ctx.restore();
      ctx.font = '26px Bangers, Impact, sans-serif'; ctx.textAlign = right ? 'right' : 'left';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; const nm = f.ch.name.toUpperCase() + (f.ch.legendary ? ' ★' : '');
      const nx = right ? x0 + w : x0; ctx.strokeText(nm, nx, y + h + 26); ctx.fillStyle = f.ch.legendary ? '#ffd700' : '#fff'; ctx.fillText(nm, nx, y + h + 26);
      ctx.font = '600 12px Rubik, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`${Math.ceil(f.hp)} / ${f.maxHp} HP`, nx, y + h + 44);
      if (f.combo >= 2) { ctx.font = '20px Bangers, Impact, sans-serif'; ctx.fillStyle = f.ch.glove; ctx.strokeText(f.combo + 'x COMBO', nx, y + h + 68); ctx.fillText(f.combo + 'x COMBO', nx, y + h + 68); }
      void hx;
    };
    bar(a, false); bar(b, true);
    ctx.font = '34px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff4fa3'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText('VS', W / 2, 52); ctx.fillText('VS', W / 2, 52);
    if (this.opts.label) { ctx.font = '600 13px Rubik, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(this.opts.label, W / 2, 74); }

    const big = (text, y, col, size, sub) => {
      ctx.save(); ctx.textAlign = 'center'; ctx.font = `${size}px Bangers, Impact, sans-serif`; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(text, W / 2, y); ctx.fillStyle = col; ctx.fillText(text, W / 2, y);
      if (sub) { ctx.font = '600 18px Rubik, sans-serif'; ctx.lineWidth = 4; ctx.strokeText(sub, W / 2, y + 34); ctx.fillStyle = '#fff'; ctx.fillText(sub, W / 2, y + 34); }
      ctx.restore();
    };
    if (this.phase === 'intro') {
      const t = this.phaseT;
      if (t < 1.5) {
        const s = 1 + Math.max(0, 0.4 - t) * 3;
        ctx.save(); ctx.translate(W / 2, 250); ctx.scale(s, s); ctx.translate(-W / 2, -250);
        big(`${a.ch.name.toUpperCase()}  vs  ${b.ch.name.toUpperCase()}`, 250, '#ffd700', 56, `„${b.ch.taunt}”`);
        ctx.restore();
      } else { const s = 1 + Math.max(0, 1.8 - t) * 2; ctx.save(); ctx.translate(W / 2, 260); ctx.scale(s, s); ctx.translate(-W / 2, -260); big('WALCZ!', 260, '#ff4fa3', 96); ctx.restore(); }
    }
    if (this.phase === 'ko') {
      const t = this.phaseT; const s = 1 + Math.max(0, 0.5 - t) * 4;
      ctx.save(); ctx.translate(W / 2, 250); ctx.scale(s, s); ctx.translate(-W / 2, -250);
      big('K.O.!', 250, '#ff3b3b', 110, t > 1 ? `${this.f[this.winner].ch.name.toUpperCase()} WYGRYWA` : '');
      ctx.restore();
    }
  }
}

// ============================================================
//  Aplikacja (ekrany, kampania, pętla)
// ============================================================
const App = {
  screen: 's-title', match: null, paused: false, raf: 0, last: 0,
  mode: 'campaign', p1: null, p2: null, campaign: null, canvas: null, ctx: null,

  init() {
    this.canvas = $('#c'); this.ctx = this.canvas.getContext('2d');
    this.fitCanvas(); window.addEventListener('resize', () => this.fitCanvas());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitCanvas(), 300));

    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => { SFX.ensure(); this.mode = b.dataset.mode; this.openSelect(); }));
    $('#btn-help').addEventListener('click', () => { $('#help').hidden = false; });
    const sndBtn = $('#btn-sound');
    const applySound = () => { sndBtn.textContent = SFX.muted ? '🔇 DŹWIĘK: WYŁ' : '🔊 DŹWIĘK: WŁ'; };
    try { SFX.muted = localStorage.getItem('opg_mute') === '1'; } catch (e) {}
    applySound();
    sndBtn.addEventListener('click', () => { SFX.muted = !SFX.muted; try { localStorage.setItem('opg_mute', SFX.muted ? '1' : '0'); } catch (e) {} applySound(); if (!SFX.muted) { SFX.ensure(); SFX.bell(); } });
    $('#btn-help-close').addEventListener('click', () => { $('#help').hidden = true; });
    $('#btn-fs').addEventListener('click', () => this.fullscreen());
    $('#btn-back').addEventListener('click', () => this.show('s-title'));
    $('#btn-fight').addEventListener('click', () => this.confirmSelect());
    $('#btn-pause').addEventListener('click', () => this.togglePause());
    $('#btn-resume').addEventListener('click', () => this.togglePause(false));
    $('#btn-quit').addEventListener('click', () => { this.paused = false; $('#pause').hidden = true; this.match = null; this.show('s-title'); });
    $('#btn-result-menu').addEventListener('click', () => this.show('s-title'));
    $('#btn-champ-menu').addEventListener('click', () => this.show('s-title'));
    this.setupTouch();
    if (IS_IOS && !IS_STANDALONE) $('#btn-fs').textContent = 'PEŁNY EKRAN (iPHONE)';
    if (IS_STANDALONE) $('#btn-fs').hidden = true;
    $('#btn-ios-close').addEventListener('click', () => { $('#ios-help').hidden = true; });
    $$('button').forEach((b) => b.addEventListener('click', () => b.blur()));
    if (isTouchDevice() && !IS_STANDALONE) $('#s-game').addEventListener('pointerdown', () => { if (!IS_IOS && !document.fullscreenElement && !this._fsTried) { this._fsTried = true; this.fullscreen(); } }, { once: true });
    this.renderTitle();
    this.loop(0);
    if (isTouchDevice()) $('#rotate-hint').classList.add('show');
  },
  show(id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    this.screen = id;
    if (id === 's-title') this.renderTitle();
    if (id === 's-game') { this.fitCanvas(); $('#touch').hidden = !isTouchDevice() || usingKeyboard; }
    else $('#touch').hidden = true;
  },
  fullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
    if (IS_STANDALONE) { this.lockLandscape(); return; }
    if (IS_IOS || !req) { $('#ios-help').hidden = false; return; }
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      let p; try { p = req.call(el); } catch (e) { p = null; }
      const after = () => { this.lockLandscape(); setTimeout(() => this.fitCanvas(), 250); };
      if (p && p.then) p.then(after).catch(() => { $('#ios-help').hidden = false; }); else setTimeout(after, 300);
    } else { (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document); }
  },
  lockLandscape() { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} },
  fitCanvas() {
    const area = $('#s-game').getBoundingClientRect();
    const vw = area.width || innerWidth, vh = area.height || innerHeight;
    const s = Math.min(vw / W, vh / H);
    this.canvas.style.width = Math.floor(W * s) + 'px'; this.canvas.style.height = Math.floor(H * s) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },
  setupTouch() {
    $$('.tbtn').forEach((btn) => {
      const act = btn.dataset.act;
      const down = (e) => { e.preventDefault(); SFX.ensure(); btn.classList.add('on'); touchHeld.add(act); touchBuf.set(act, performance.now()); try { btn.setPointerCapture(e.pointerId); } catch (_) {} };
      const up = (e) => { e.preventDefault(); btn.classList.remove('on'); touchHeld.delete(act); };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('pointerleave', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
      btn.addEventListener('click', (e) => e.preventDefault());
    });
  },

  // ---------- Tytuł ----------
  renderTitle() {
    const faces = $('#title-faces'); faces.innerHTML = '';
    ROSTER.forEach((ch) => { const img = document.createElement('img'); img.src = headSrc(ch); img.alt = ch.name; faces.appendChild(img); });
    const hall = this.loadHall(); const el = $('#hall');
    const entries = Object.entries(hall).filter(([id]) => ROSTER.find((c) => c.id === id)).sort((a, b) => b[1] - a[1]);
    el.innerHTML = entries.length
      ? 'Królowie Only Pantslow Gang: ' + entries.map(([id, n]) => `<b>${ROSTER.find((c) => c.id === id).name}</b> (${n}x)`).join(', ')
      : 'Nikt jeszcze nie zdobył korony. Będziesz pierwszy?';
  },
  loadHall() { try { return JSON.parse(localStorage.getItem('opg_hall') || '{}'); } catch (e) { return {}; } },
  saveHall(id) { const h = this.loadHall(); h[id] = (h[id] || 0) + 1; try { localStorage.setItem('opg_hall', JSON.stringify(h)); } catch (e) {} },

  // ---------- Wybór ----------
  openSelect() {
    this.p1 = null; this.p2 = null; this.pickingP2 = false;
    this.renderGrid(); this.show('s-select');
  },
  renderGrid() {
    const grid = $('#grid'); grid.innerHTML = '';
    $('#select-title').textContent = this.mode === 'versus' ? (this.pickingP2 ? 'Gracz 2: wybierz wojownika' : 'Gracz 1: wybierz wojownika') : 'Wybierz wojownika';
    $('#btn-fight').textContent = this.mode === 'versus' && !this.pickingP2 ? 'DALEJ' : 'WALCZ!';
    ROSTER.forEach((ch) => {
      const card = document.createElement('div'); card.className = 'card' + (ch.legendary ? ' legendary' : '');
      const hp = BASE_HP * (ch.legendary ? LEGEND_MULT : 1);
      card.innerHTML = `
        <img src="${headSrc(ch)}" alt="${ch.name}" />
        <div class="name"><span class="glove" style="background:${ch.glove}"></span>${ch.name}</div>
        <div class="title">${ch.title}</div>
        <div class="stats">
          <div class="stat"><span>Szybk.</span><i><b style="width:${Math.round((ch.speed - 0.7) / 0.6 * 100)}%"></b></i></div>
          <div class="stat"><span>Siła</span><i><b style="width:${Math.round((ch.power - 0.7) / 0.6 * 100)}%"></b></i></div>
          <div class="stat hp"><span>HP</span><i><b style="width:${ch.legendary ? 100 : 10}%"></b></i></div>
        </div>`;
      if (this.pickingP2 && this.p1 && this.p1.id === ch.id) card.classList.add('taken');
      card.addEventListener('click', () => this.pickCard(ch, card, hp));
      grid.appendChild(card);
    });
    $('#btn-fight').disabled = true;
    $('#sel-info').innerHTML = this.mode === 'versus' ? 'Gracz 1 wybiera na WASD, Gracz 2 na strzałkach.' : 'Pokonaj całą ekipę i zdobądź koronę. Legendy mają 10x HP.';
  },
  pickCard(ch, card, hp) {
    SFX.ensure(); SFX.jump();
    if (!VOICES.play(ch, 'wybor', { cooldown: 300 })) VOICES.play(ch, 'intro', { cooldown: 300 });
    $$('.card').forEach((c) => c.classList.remove('selected', 'selected-p2'));
    card.classList.add(this.pickingP2 ? 'selected-p2' : 'selected');
    if (this.pickingP2) this.p2 = ch; else this.p1 = ch;
    $('#sel-info').innerHTML = `<b>${ch.name}</b> „${ch.title}” • ${hp} HP • szybkość ${ch.speed.toFixed(2)} • siła ${ch.power.toFixed(2)}${ch.legendary ? ' • <em>★ LEGENDA</em>' : ''}<br><i>„${ch.taunt}”</i>`;
    $('#btn-fight').disabled = false;
  },
  confirmSelect() {
    if (this.mode === 'versus') {
      if (!this.pickingP2) { this.pickingP2 = true; this.renderGrid(); return; }
      this.startMatch({ p1: this.p1, p2: this.p2, mode: 'versus', label: 'GRACZ 1 vs GRACZ 2' });
    } else {
      const normals = shuffle(ROSTER.filter((c) => !c.legendary && c.id !== this.p1.id));
      const legends = ROSTER.filter((c) => c.legendary && c.id !== this.p1.id);
      this.campaign = { player: this.p1, order: normals.concat(legends), idx: 0 };
      this.startCampaignFight();
    }
  },

  // ---------- Kampania ----------
  startCampaignFight() {
    const c = this.campaign, opp = c.order[c.idx], n = c.order.length;
    const diff = opp.legendary ? 1.0 : 0.35 + 0.55 * (c.idx / Math.max(1, n - 1));
    this.startMatch({ p1: c.player, p2: opp, mode: 'campaign', diff, label: `WALKA ${c.idx + 1} / ${n}${opp.legendary ? ' • LEGENDA' : ''}` });
  },
  startMatch(opts) {
    opts.onEnd = (winner) => this.onMatchEnd(winner);
    this.match = new Match(opts); this.paused = false; $('#pause').hidden = true;
    this.show('s-game');
  },
  onMatchEnd(winner) {
    const m = this.match; const wf = m.f[winner], lf = m.f[1 - winner];
    this.match = null;
    const faces = $('#result-faces');
    faces.innerHTML = `<img src="${headSrc(wf.ch)}" alt=""><span class="vs">pokonuje</span><img class="loser" src="${headSrc(lf.ch)}" alt="">`;
    const title = $('#result-title'); title.classList.remove('lose');
    $('#result-progress').innerHTML = '';

    if (this.mode === 'versus') {
      $('#result-kicker').textContent = 'KONIEC WALKI';
      title.textContent = `${wf.ch.name.toUpperCase()} WYGRYWA!`;
      $('#result-text').textContent = `Gracz ${winner + 1} rozłożył ${lf.ch.name}. Rewanż?`;
      $('#btn-next').textContent = 'REWANŻ';
      $('#btn-next').onclick = () => this.startMatch({ p1: this.p1, p2: this.p2, mode: 'versus', label: 'GRACZ 1 vs GRACZ 2' });
      this.show('s-result'); return;
    }

    const c = this.campaign;
    const prog = $('#result-progress');
    c.order.forEach((ch, i) => { const img = document.createElement('img'); img.src = headSrc(ch); img.className = i < c.idx + (winner === 0 ? 1 : 0) ? 'done' : (i === c.idx + (winner === 0 ? 1 : 0) ? 'now' : ''); prog.appendChild(img); });

    if (winner === 0) {
      c.idx++;
      if (c.idx >= c.order.length) { this.showChampion(c.player); return; }
      const next = c.order[c.idx];
      $('#result-kicker').textContent = `WALKA ${c.idx} / ${c.order.length} WYGRANA`;
      title.textContent = lf.ch.legendary ? 'LEGENDA UPADŁA!' : 'ZWYCIĘSTWO!';
      $('#result-text').textContent = `${lf.ch.name} leży. Następny w kolejce: ${next.name} „${next.title}”${next.legendary ? ' — LEGENDA z 10x HP!' : ''}.`;
      $('#btn-next').textContent = `DALEJ: ${next.name.toUpperCase()}`;
      $('#btn-next').onclick = () => this.startCampaignFight();
    } else {
      $('#result-kicker').textContent = 'NOKAUT';
      title.textContent = 'PRZEGRANA'; title.classList.add('lose');
      $('#result-text').textContent = `${wf.ch.name} rozłożył cię na deski. Korona czeka, wstawaj.`;
      $('#btn-next').textContent = 'REWANŻ';
      $('#btn-next').onclick = () => this.startCampaignFight();
    }
    this.show('s-result');
  },
  showChampion(ch) {
    this.saveHall(ch.id);
    $('#champ-img').src = headSrc(ch);
    $('#champ-name').textContent = ch.name;
    $('#champ-text').textContent = `${ch.name} „${ch.title}” pokonał całą ekipę, w tym legendy. Korona jest Twoja, do następnego turnieju.`;
    const conf = $('#confetti'); conf.innerHTML = '';
    const cols = ['#ffd700', '#ff4fa3', '#7c5cff', '#2ec4b6', '#ff3b3b', '#fff'];
    for (let i = 0; i < 90; i++) { const s = document.createElement('span'); s.style.left = Math.random() * 100 + '%'; s.style.background = pick(cols); s.style.animationDuration = rand(2.5, 6) + 's'; s.style.animationDelay = -rand(0, 6) + 's'; s.style.transform = `rotate(${rand(0, 360)}deg)`; conf.appendChild(s); }
    SFX.cheer(); SFX.bell();
    this.show('s-champion');
  },

  // ---------- Pauza / pętla ----------
  togglePause(force) {
    if (!this.match) return;
    this.paused = force === undefined ? !this.paused : force;
    $('#pause').hidden = !this.paused;
  },
  loop(ts) {
    const dt = Math.min(0.1, (ts - this.last) / 1000 || 0); this.last = ts;
    if (this.screen === 's-game' && this.match) {
      if (!this.paused) this.match.update(dt);
      if (this.match) this.match.draw(this.ctx); // update mógł zakończyć walkę
    }
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },
};

window.OPG = App;
Promise.all([loadHeads(), VOICES.load()]).then(() => App.init());
})();
