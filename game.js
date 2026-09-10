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
  { id: 'gazdziol',   name: 'Gazdziol',   title: 'Garnitur z Salonu',    glove: '#2ec4b6', speed: 0.90, power: 1.15, taunt: 'Elegancko cię położę.' },
  { id: 'miszalinaq', name: 'Miszalinaq', title: 'Dziubek Zagłady',      glove: '#ff3b3b', speed: 1.05, power: 1.00, taunt: 'Cmok. To był twój ostatni.' },
  { id: 'piotszu',    name: 'Piotszu',    title: 'Okularnik z Bunkra',   glove: '#3b82f6', speed: 0.95, power: 1.10, taunt: 'Mam to policzone. Przegrasz.' },
  { id: 'rociu',      name: 'Rociu',      title: 'Rudy Wulkan',          glove: '#ff7a1a', speed: 1.10, power: 1.00, taunt: 'Najpierw dymek, potem lanie.' },
  { id: 'szon',       name: 'Szon',       title: 'Zmarszczona Brew',     glove: '#a3e635', speed: 1.05, power: 1.05, taunt: 'Co ty odwalasz?' },
  { id: 'zoska',      name: 'Zośka',      title: 'Pazurki Zagłady',      glove: '#40e0d0', speed: 1.20, power: 0.90, taunt: 'Peace. A teraz śpij.' },
  { id: 'wiczka',     name: 'Wiczka',     title: 'Uśmiech Zagłady',      glove: '#00d4ff', speed: 1.15, power: 0.95, taunt: 'Uśmiecham się, bo zaraz będzie po tobie.' },
  { id: 'king_pala',  name: 'Król Pała',  title: 'Władca Only Pantslow', glove: '#ffd700', speed: 1.00, power: 1.50, legendary: true, taunt: 'Klękaj przed koroną.' },
  { id: 'watol',      name: 'Watol Wszechwładny', title: 'Wszechwładny',  glove: '#9b5cff', speed: 1.00, power: 1.50, legendary: true, taunt: 'Wszechwładza nie pyta o zgodę.' },
];

const VERSION = 'v19';
const BASE_HP = 100;
const METER_MAX = 100;

// ============================================================
//  SUPERMOCE — każda postać ma jedną. Pasek MOCY ładuje się
//  od zadawania i przyjmowania ciosów (i powoli sam z siebie).
// ============================================================
const SPECIALS = {
  miska: { up3n: 'Głębokie Mrożenie', up3: 'Zamrożenie trwa 2,5 s zamiast 1,5 s', name: 'Słomkowa Zamrażarka', icon: '🥤', desc: 'Rzuca lodowym napojem. Trafiony zamarza na 1,5 s i traci 12 HP.', dur: 0.5,
    cast(m, f, o) { m.projectile({ owner: f, x: f.x + f.facing * 40, y: f.y - 175, vx: f.facing * 540, vy: -80, g: 520, r: 18, life: 2, kind: 'cup', col: f.ch.glove,
      onHit: (t) => { m.status(t, 'frozen', f.upg >= 3 ? 2.5 : 1.5); m.damage(f, t, 12, { text: 'ZAMROŻONY!', col: '#9ecbff', knock: 60 }); } }); } },
  bianka: { up3n: 'Długi Błysk', up3: 'Pomylone kierunki przez 5 s zamiast 3 s', name: 'Neonowy Błysk', icon: '🕶️', desc: 'Błysk z okularów: przeciwnik przez 3 s ma pomylone kierunki i traci 8 HP.', dur: 0.6,
    cast(m, f, o) { m.flash = 0.7; m.status(o, 'confused', f.upg >= 3 ? 5 : 3); m.damage(f, o, 8, { text: 'OŚLEPIONY!', col: '#ffb020', knock: 120, ignoreBlock: true }); } },
  cypis: { up3n: 'Cios z Mroku', up3: 'Cios zza pleców zadaje 30 HP zamiast 22', name: 'Cień z Bytomia', icon: '🌫️', desc: 'Znika i wyskakuje zza pleców przeciwnika z ciosem za 22 HP.', dur: 0.5,
    cast(m, f, o) { f.ghost = 0.5; m.spark(f.x, f.y - 120, '#ff6ec7', 18);
      m.after(0.25, () => { const side = o.facing; f.x = clamp(o.x + side * 70, RING_L, RING_R); f.facing = -side; m.spark(f.x, f.y - 120, '#ff6ec7', 18);
        m.damage(f, o, f.upg >= 3 ? 30 : 22, { text: 'Z CIENIA!', col: '#ff6ec7', knock: 380, ignoreBlock: true, pop: true }); }); } },
  diddy: { up3n: 'Podwójny Piorun', up3: 'Po pierwszym piorunie uderza drugi', name: 'Piorun z Fryzury', icon: '⚡', desc: 'Po 0,6 s w miejsce przeciwnika wali piorun za 26 HP. Da się odskoczyć.', dur: 0.5,
    cast(m, f, o) { const x = o.x; m.zone({ x, kind: 'target', life: 0.6, col: '#7c5cff' });
      m.after(0.6, () => { m.zone({ x, kind: 'bolt', life: 0.35, col: '#7c5cff' }); m.shake = 14; m.flash = 0.25; SFX.punch(true);
        if (Math.abs(o.x - x) < 65) m.damage(f, o, 26, { text: 'PIORUN!', col: '#7c5cff', knock: 300, pop: true, ignoreBlock: true }); });
      if (f.upg >= 3) m.after(1.1, () => { const x2 = o.x; m.zone({ x: x2, kind: 'target', life: 0.5, col: '#7c5cff' }); m.after(0.5, () => { m.zone({ x: x2, kind: 'bolt', life: 0.35, col: '#7c5cff' }); m.shake = 14; SFX.punch(true); if (Math.abs(o.x - x2) < 65) m.damage(f, o, 20, { text: 'DRUGI!', col: '#7c5cff', knock: 300, pop: true, ignoreBlock: true }); }); }); } },
  gazdziol: { up3n: 'Garnitur z Tytanu', up3: 'Pancerz trwa 9 s zamiast 6 s', name: 'Garnitur Pancerny', icon: '🛡️', desc: 'Przez 6 s przyjmuje tylko 30% obrażeń, a jego ciosy odrzucają dwa razy mocniej.', dur: 0.5,
    cast(m, f, o) { m.status(f, 'armor', f.upg >= 3 ? 9 : 6); m.popup(f.x, f.y - 265, 'PANCERZ!', '#2ec4b6', 30); m.spark(f.x, f.y - 120, '#2ec4b6', 14); } },
  miszalinaq: { up3n: 'Buziak z Języczkiem', up3: 'Leczy 30 HP zamiast 18', name: 'Buziak Zagłady', icon: '💋', desc: 'Posyła całusa: trafiony traci 14 HP i stoi ogłuszony 1 s, a ona leczy 18 HP.', dur: 0.5,
    cast(m, f, o) { m.projectile({ owner: f, x: f.x + f.facing * 40, y: f.y - 200, vx: f.facing * 430, vy: 0, g: 0, r: 16, life: 2.2, kind: 'heart', col: '#ff3b3b',
      onHit: (t) => { m.status(t, 'stun', 1); m.damage(f, t, 14, { text: 'CMOK!', col: '#ff6ec7', knock: 80 }); m.heal(f, f.upg >= 3 ? 30 : 18); } }); } },
  piotszu: { up3n: 'Laser Przemysłowy', up3: 'Laser zadaje 28 HP zamiast 20', name: 'Laser z Okularów', icon: '🔴', desc: 'Laser przez cały ring na wysokości głowy za 20 HP. Unik (kucnięcie) go omija.', dur: 0.75,
    cast(m, f, o) { m.after(0.3, () => { m.zone({ x: f.x, dir: f.facing, y: f.y - 205, kind: 'laser', life: 0.4, col: '#ff3b3b' }); SFX.tone(1800, 0.45, 0.3, 'sawtooth', 0.3);
      if ((o.x - f.x) * f.facing > 0 && o.state !== 'dodge') m.damage(f, o, f.upg >= 3 ? 28 : 20, { text: 'LASER!', col: '#ff3b3b', knock: 200 }); }); } },
  rociu: { up3n: 'Superwulkan', up3: 'Cztery fale ognia zamiast trzech', name: 'Rudy Wulkan', icon: '🌋', desc: 'Wybuch ognia wokół niego: 3 fale po 7 HP, a przeciwnik płonie jeszcze 3 s.', dur: 1.0,
    cast(m, f, o) { const nw = f.upg >= 3 ? 4 : 3; for (let i = 0; i < nw; i++) m.after(0.15 + i * 0.3, () => { m.zone({ x: f.x, kind: 'fire', life: 0.4, col: '#ff7a1a', r: 150 }); m.spark(f.x, f.y - 100, '#ff7a1a', 16); m.shake = 6; SFX.punch(i === 2);
      if (Math.abs(o.x - f.x) < 165) { m.damage(f, o, 7, { text: i === nw - 1 ? 'ERUPCJA!' : '', col: '#ff7a1a', knock: 260, ignoreBlock: true }); m.status(o, 'burn', 3); } }); } },
  szon: { up3n: 'Dłuższa Cierpliwość', up3: 'Kontra czeka 2,5 s zamiast 1,5 s', name: 'Co Ty Odwalasz?', icon: '🤨', desc: 'Przez 1,5 s czeka na cios. Kto go trafi, dostaje 2,5x tyle z powrotem i jest ogłuszony.', dur: 1.5,
    cast(m, f, o) { m.status(f, 'counter', f.upg >= 3 ? 2.5 : 1.5); m.popup(f.x, f.y - 265, 'NO DAWAJ.', '#a3e635', 26); } },
  zoska: { up3n: 'Manicure Zagłady', up3: 'Siedem drapnięć zamiast pięciu', name: 'Pazurki Zagłady', icon: '💅', desc: 'Seria pięciu błyskawicznych drapnięć po 5 HP, ostatnie odrzuca.', dur: 1.1,
    cast(m, f, o) { const nh = f.upg >= 3 ? 7 : 5; for (let i = 0; i < nh; i++) m.after(0.1 + i * 0.18, () => { if (Math.abs(o.x - f.x) < 135) { m.spark(o.x, o.y - 160, '#40e0d0', 6);
      m.damage(f, o, 5, { text: i === nh - 1 ? 'PAZURKI!' : '', col: '#40e0d0', knock: i === nh - 1 ? 420 : 30, stunLock: true, ignoreBlock: true }); } }); } },
  wiczka: { up3n: 'Uśmiech Hipnotyczny', up3: 'Zauroczenie trwa 4,5 s zamiast 3 s', name: 'Uśmiech Rozbrajający', icon: '😊', desc: 'Przeciwnik przez 3 s nie może atakować i idzie do niej jak zaczarowany.', dur: 0.6,
    cast(m, f, o) { m.status(o, 'charm', f.upg >= 3 ? 4.5 : 3); m.popup(o.x, o.y - 265, 'ZAUROCZONY!', '#00d4ff', 28); for (let i = 0; i < 8; i++) m.after(i * 0.35, () => m.spark(o.x, o.y - 225, '#ff6ec7', 3)); } },
  king_pala: { up3n: 'Dekret Ostateczny', up3: 'Korona zadaje 40 HP zamiast 30', name: 'Dekret Królewski', icon: '👑', desc: 'Korona spada na głowę przeciwnika: 30 HP i ogłuszenie 1,2 s. Król leczy 15 HP.', dur: 0.8,
    cast(m, f, o) { const x = o.x; m.zone({ x, kind: 'crown', life: 0.7, col: '#ffd700' });
      m.after(0.7, () => { m.shake = 12; if (Math.abs(o.x - x) < 90) { m.damage(f, o, f.upg >= 3 ? 40 : 30, { text: 'DEKRET!', col: '#ffd700', knock: 200, ignoreBlock: true }); m.status(o, 'stun', 1.2); } m.heal(f, 15); }); } },
  watol: { up3n: 'Wieczność', up3: 'Spowolnienie trwa 6 s zamiast 4 s', name: 'Wszechwładza', icon: '⏳', desc: 'Zatrzymuje przeciwnikowi czas: przez 4 s porusza się jak w smole.', dur: 0.7,
    cast(m, f, o) { m.status(o, 'slow', f.upg >= 3 ? 6 : 4); m.flash = 0.35; m.popup(o.x, o.y - 265, 'CZAS STANĄŁ', '#9b5cff', 28); } },
};
// ============================================================
//  ŻETONY, SKRZYNKI, PRZEDMIOTY (kosmetyki)
// ============================================================
const RARITY = { common: { name: 'Zwykły', col: '#b8b8c8', refund: 30, price: 80 }, rare: { name: 'Rzadki', col: '#3b82f6', refund: 60, price: 220 }, epic: { name: 'Epicki', col: '#9b5cff', refund: 140, price: 500 }, legendary: { name: 'Legendarny', col: '#ffd700', refund: 350, price: 1300 } };
const ITEM_TYPES = { gloves: 'Rękawice', shorts: 'Gacie', hat: 'Na głowę', ko: 'Efekt K.O.', taunt: 'Tekst przed walką' };
const ITEMS = [
  { id: 'g_neon', type: 'gloves', name: 'Neonowe Rękawice', rarity: 'common', style: { color: '#39ff14' } },
  { id: 'g_pink', type: 'gloves', name: 'Różowe Futrzaki', rarity: 'common', style: { color: '#ff9de2', pattern: 'fur' } },
  { id: 'g_black', type: 'gloves', name: 'Czarne jak Noc', rarity: 'common', style: { color: '#222' } },
  { id: 'g_lava', type: 'gloves', name: 'Rękawice z Lawy', rarity: 'rare', style: { color: '#ff4500', pattern: 'lava' } },
  { id: 'g_melon', type: 'gloves', name: 'Arbuzy', rarity: 'rare', style: { color: '#2e8b57', pattern: 'melon' } },
  { id: 'g_duck', type: 'gloves', name: 'Kaczuszki', rarity: 'rare', style: { color: '#ffe135', emoji: '🐤' } },
  { id: 'g_flip', type: 'gloves', name: 'Klapki Kubota', rarity: 'rare', style: { emoji: '🩴' } },
  { id: 'g_sausage', type: 'gloves', name: 'Krupnioki', rarity: 'epic', style: { emoji: '🌭' } },
  { id: 'g_fish', type: 'gloves', name: 'Śledzie', rarity: 'epic', style: { emoji: '🐟' } },
  { id: 'g_brick', type: 'gloves', name: 'Cegły', rarity: 'epic', style: { color: '#b22222', pattern: 'brick' } },
  { id: 'g_rainbow', type: 'gloves', name: 'Tęczowe', rarity: 'epic', style: { rainbow: true } },
  { id: 'g_gold', type: 'gloves', name: 'Złote Rękawice', rarity: 'legendary', style: { color: '#ffd700', shine: true } },
  { id: 'g_diamond', type: 'gloves', name: 'Diamentowe', rarity: 'legendary', style: { color: '#b9f2ff', shine: true, sparkle: true } },
  { id: 'g_toilet', type: 'gloves', name: 'Deski Klozetowe', rarity: 'legendary', style: { emoji: '🚽' } },
  { id: 's_hearts', type: 'shorts', name: 'Majtki w Serduszka', rarity: 'common', style: { color: '#fff', pattern: 'hearts' } },
  { id: 's_camo', type: 'shorts', name: 'Moro', rarity: 'common', style: { color: '#556b2f', pattern: 'camo' } },
  { id: 's_flag', type: 'shorts', name: 'Biało-Czerwone', rarity: 'common', style: { color: '#fff', pattern: 'flag' } },
  { id: 's_grandpa', type: 'shorts', name: 'Gacie Dziadka', rarity: 'rare', style: { color: '#d9c9a5', pattern: 'stripes', long: true } },
  { id: 's_leopard', type: 'shorts', name: 'Panterka', rarity: 'rare', style: { color: '#e0a848', pattern: 'leopard' } },
  { id: 's_sequins', type: 'shorts', name: 'Cekiny Disco', rarity: 'rare', style: { color: '#c0c0ff', sparkle: true } },
  { id: 's_pampers', type: 'shorts', name: 'Pampers XXL', rarity: 'epic', style: { color: '#f5f5f5', pattern: 'diaper', long: true } },
  { id: 's_gold', type: 'shorts', name: 'Złote Gacie', rarity: 'epic', style: { color: '#ffd700', shine: true } },
  { id: 's_thong', type: 'shorts', name: 'Stringi Dziadka', rarity: 'legendary', style: { color: '#ff1493', pattern: 'thong' } },
  { id: 'h_helmet', type: 'hat', name: 'Kask Budowlany', rarity: 'common', emoji: '⛑️' },
  { id: 'h_cap', type: 'hat', name: 'Czapka z Daszkiem', rarity: 'common', emoji: '🧢' },
  { id: 'h_grad', type: 'hat', name: 'Biret Magistra', rarity: 'common', emoji: '🎓' },
  { id: 'h_tophat', type: 'hat', name: 'Cylinder', rarity: 'rare', emoji: '🎩' },
  { id: 'h_halo', type: 'hat', name: 'Aureola', rarity: 'rare', draw: 'halo' },
  { id: 'h_bucket', type: 'hat', name: 'Wiadro', rarity: 'rare', emoji: '🪣' },
  { id: 'h_pan', type: 'hat', name: 'Patelnia', rarity: 'rare', emoji: '🍳' },
  { id: 'h_horns', type: 'hat', name: 'Rogi Diabła', rarity: 'epic', draw: 'horns' },
  { id: 'h_briefs', type: 'hat', name: 'Gacie na Głowie', rarity: 'epic', emoji: '🩲' },
  { id: 'h_fire', type: 'hat', name: 'Płonąca Fryzura', rarity: 'epic', emoji: '🔥' },
  { id: 'h_pumpkin', type: 'hat', name: 'Dynia', rarity: 'epic', emoji: '🎃' },
  { id: 'h_poop', type: 'hat', name: 'Kupa na Głowie', rarity: 'legendary', emoji: '💩' },
  { id: 'h_ufo', type: 'hat', name: 'UFO', rarity: 'legendary', emoji: '🛸' },
  { id: 'h_chicken', type: 'hat', name: 'Żywy Kurczak', rarity: 'legendary', emoji: '🐔' },
  { id: 'k_confetti', type: 'ko', name: 'Konfetti', rarity: 'common', fx: 'confetti' },
  { id: 'k_ducks', type: 'ko', name: 'Deszcz Kaczuszek', rarity: 'rare', fx: 'rain', emoji: '🐤' },
  { id: 'k_poop', type: 'ko', name: 'Deszcz Kup', rarity: 'rare', fx: 'rain', emoji: '💩' },
  { id: 'k_sausage', type: 'ko', name: 'Deszcz Krupnioków', rarity: 'epic', fx: 'rain', emoji: '🌭' },
  { id: 'k_fire', type: 'ko', name: 'Fajerwerki', rarity: 'epic', fx: 'fireworks' },
  { id: 'k_money', type: 'ko', name: 'Deszcz Żetonów', rarity: 'legendary', fx: 'rain', emoji: '🪙' },
  { id: 't_1', type: 'taunt', name: '„Mama mówiła, żebym nie bił słabszych. Sorry, mamo.”', rarity: 'common' },
  { id: 't_2', type: 'taunt', name: '„Wybacz, ale mam autobus za pięć minut.”', rarity: 'common' },
  { id: 't_3', type: 'taunt', name: '„Zaraz będziesz płakać jak na koncercie sanah.”', rarity: 'common' },
  { id: 't_4', type: 'taunt', name: '„Nie bój się, to boli tylko przez pierwszych dziesięć lat.”', rarity: 'rare' },
  { id: 't_5', type: 'taunt', name: '„Zadzwoń po mamę. Będzie potrzebna.”', rarity: 'rare' },
  { id: 't_6', type: 'taunt', name: '„Pozdrawiam Świętochłowice i twoją babcię.”', rarity: 'rare' },
  { id: 't_7', type: 'taunt', name: '„Rozwalę cię jak Kubica Ferrari.”', rarity: 'epic' },
  { id: 't_8', type: 'taunt', name: '„Jestem przed śniadaniem, więc będzie krótko.”', rarity: 'epic' },
  { id: 't_9', type: 'taunt', name: '„Mój tata by cię pobił, ale ja też umiem.”', rarity: 'legendary' },
];
const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const CRATES = { basic: { name: 'Zwykła Skrzynka', icon: '📦', price: 150, odds: { common: 60, rare: 30, epic: 9, legendary: 1 } }, gold: { name: 'Złota Skrzynka', icon: '🎁', price: 450, odds: { common: 0, rare: 50, epic: 38, legendary: 12 } } };
const LOGIN_LADDER = [20, 30, 40, 60, 80, 100, 200];

// ============================================================
//  LOSOWE WYDARZENIA W WALCE I PRZEDMIOTY NA RINGU
// ============================================================
const PICKUPS = [
  { id: 'pizza', emoji: '🍕', name: 'Pizza', desc: '+25 HP', w: 3, use(m, f) { m.heal(f, 25); } },
  { id: 'chicken', emoji: '🐔', name: 'Gumowy Kurczak', desc: 'broń: ciosy x1.6 przez 8 s', w: 3, use(m, f) { f.weapon = { emoji: '🐔', t: 8, mult: 1.6, sfx: 'squeak' }; } },
  { id: 'plunger', emoji: '🪠', name: 'Przepychacz', desc: 'broń: 3 ciosy ogłuszają', w: 2, use(m, f) { f.weapon = { emoji: '🪠', hits: 3, mult: 1.2, stun: 0.9 }; } },
  { id: 'chair', emoji: '🪑', name: 'Krzesło', desc: 'broń: 3 ciosy x2 z wielkim odrzutem', w: 2, use(m, f) { f.weapon = { emoji: '🪑', hits: 3, mult: 2, knock: 2 }; } },
  { id: 'fish', emoji: '🐟', name: 'Mokra Ryba', desc: 'broń: ciosy spowalniają przez 6 s', w: 2, use(m, f) { f.weapon = { emoji: '🐟', t: 6, mult: 1.1, slow: 2 }; } },
  { id: 'paper', emoji: '🧻', name: 'Papier Toaletowy', desc: 'broń: ciosy mylą kierunki przez 5 s', w: 2, use(m, f) { f.weapon = { emoji: '🧻', t: 5, mult: 1, confuse: 2 }; } },
  { id: 'sausage', emoji: '🌭', name: 'Krupniok', desc: '+50 MOCY', w: 3, use(m, f) { f.meter = Math.min(METER_MAX, f.meter + 50); m.popup(f.x, f.y - 260, '+50 MOCY', f.ch.glove, 24); } },
  { id: 'banana', emoji: '🍌', name: 'Banan', desc: 'rzuca skórkę przed siebie: kto nadepnie, ślizga się', w: 2, use(m, f) { m.hazards.push({ kind: 'peel', emoji: '🍌', x: clamp(f.x + f.facing * 130, RING_L, RING_R), life: 20, owner: f }); m.popup(f.x, f.y - 260, 'SKÓRKA!', '#ffe135', 22); } },
  { id: 'briefs', emoji: '🩲', name: 'Gacie', desc: 'rzuca w przeciwnika: zauroczenie 2 s', w: 2, use(m, f) { const o = m.other(f); m.projectile({ owner: f, x: f.x + f.facing * 40, y: f.y - 190, vx: f.facing * 380, vy: -60, g: 300, r: 16, life: 2, kind: 'emoji', emoji: '🩲', col: '#ff6ec7', onHit: (t) => { m.status(t, 'charm', 2); m.damage(f, t, 5, { text: 'GACIE W TWARZ!', col: '#ff6ec7', knock: 100 }); } }); } },
  { id: 'energy', emoji: '🥤', name: 'Energetyk', desc: 'szybkość x1.5 przez 8 s', w: 2, use(m, f) { m.status(f, 'haste', 8); } },
  { id: 'kebab', emoji: '🥙', name: 'Kebab z Bytomia', desc: '+40 HP, ale spowalnia na 3 s', w: 1, use(m, f) { m.heal(f, 40); m.status(f, 'slow', 3); } },
];
const RING_EVENTS = [
  { id: 'drop', w: 6 }, { id: 'bottle', w: 3 }, { id: 'quake', w: 2 }, { id: 'double', w: 2 }, { id: 'bomb', w: 2 }, { id: 'rain', w: 1 },
];
function weightedPick(arr) { const tot = arr.reduce((a, x) => a + x.w, 0); let r = Math.random() * tot; for (const x of arr) { if (r < x.w) return x; r -= x.w; } return arr[arr.length - 1]; }

// ============================================================
//  BOSS TYGODNIA
// ============================================================
const BOSS_MODS = [
  { id: 'gigant', name: 'GIGANT', desc: 'Dwa razy większy, 250 HP, bije mocniej', hp: 250, scale: 1.35, power: 1.3 },
  { id: 'blyskawica', name: 'BŁYSKAWICA', desc: 'Porusza się 1,7x szybciej, 150 HP', hp: 150, speed: 1.7 },
  { id: 'pancerny', name: 'PANCERNY', desc: 'Stały pancerz: przyjmuje 30% obrażeń, 160 HP', hp: 160, armor: true },
  { id: 'wampir', name: 'WAMPIR', desc: 'Leczy się połową zadanych obrażeń, 180 HP', hp: 180, vamp: 0.5 },
  { id: 'mocarz', name: 'MOCARZ', desc: 'Pasek MOCY ładuje mu się 3x szybciej, 170 HP', hp: 170, meter: 3 },
  { id: 'ksiezyc', name: 'KSIĘŻYCOWY', desc: 'Niska grawitacja dla obu, 200 HP', hp: 200, gravity: 0.45 },
  { id: 'chaos', name: 'CHAOS', desc: 'Wydarzenia na ringu co 4 sekundy, 180 HP', hp: 180, chaos: true },
];
function weeklyBoss() {
  const SHIFT = 3 * 86400000; // epoka zaczęła się w czwartek; przesuwamy, żeby tydzień zaczynał się w poniedziałek
  const week = Math.floor((Date.now() + SHIFT) / 604800000);
  const ch = ROSTER[(week * 5 + 3) % ROSTER.length], mod = BOSS_MODS[(week * 3 + 1) % BOSS_MODS.length];
  const key = 'w' + week, left = (week + 1) * 604800000 - SHIFT - Date.now();
  return { week, ch, mod, key, left, done: !!(PROFILE.d && PROFILE.d.bosses[key]) };
}
function fmtLeft(ms) { const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000); return d > 0 ? `${d} d ${h} h` : `${h} h`; }

const STATUS_INFO = { haste: ['TURBO', '#ffe135'], double: ['PODWÓJNE OBRAŻENIA', '#ff3b3b'], frozen: ['ZAMROŻONY', '#9ecbff'], stun: ['OGŁUSZONY', '#ffe45c'], confused: ['POMYLONY', '#ffb020'], burn: ['PŁONIE', '#ff7a1a'], armor: ['PANCERZ', '#2ec4b6'], charm: ['ZAUROCZONY', '#ff6ec7'], slow: ['SPOWOLNIONY', '#9b5cff'], counter: ['KONTRA', '#a3e635'] };
const LEGEND_MULT = 1;           // mnożnik HP legend (było 10, ekipa chciała równo)
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
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx && !this.unlocked) { // iPhone: pierwszy dźwięk musi wyjść z gestu użytkownika
      this.unlocked = true;
      try { const b = this.ctx.createBuffer(1, 1, 22050); const s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.ctx.destination); s.start(0); } catch (e) {}
      VOICES.preload();
    }
  },
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
const VOICES = { data: {}, muted: false, last: {}, buffers: {}, pending: {},
  load() {
    return fetch('sounds/manifest.json?v=' + Date.now()).then((r) => (r.ok ? r.json() : {})).then((d) => { this.data = d || {}; }).catch(() => {});
  },
  files() { const out = []; for (const id in this.data) for (const ev in this.data[id]) for (const f of this.data[id][ev]) out.push(f); return out; },
  preload() { // dekodujemy nagrania do Web Audio; działa też na iPhonie po odblokowaniu dźwięku
    if (!SFX.ctx) return;
    for (const f of this.files()) {
      if (this.buffers[f] || this.pending[f]) continue;
      this.pending[f] = true;
      fetch('sounds/' + f).then((r) => r.arrayBuffer()).then((ab) => new Promise((res, rej) => {
        const p = SFX.ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej);
      })).then((buf) => { this.buffers[f] = buf; }).catch(() => { delete this.pending[f]; });
    }
  },
  has(ch, ev) { const v = this.data[ch.id]; return !!(v && v[ev] && v[ev].length); },
  any(ch) { const v = this.data[ch.id]; return !!v && Object.keys(v).some((ev) => v[ev] && v[ev].length); },
  play(ch, ev, opts = {}) {
    if (this.muted || SFX.muted || !this.has(ch, ev)) return false;
    const key = ch.id + ':' + ev, now = performance.now();
    if (now - (this.last[key] || 0) < (opts.cooldown || 700)) return false;
    if (opts.chance !== undefined && Math.random() > opts.chance) return false;
    this.last[key] = now;
    const file = pick(this.data[ch.id][ev]); const vol = opts.volume === undefined ? 1 : opts.volume;
    SFX.ensure();
    const buf = this.buffers[file];
    if (SFX.ctx && buf) {
      try {
        const src = SFX.ctx.createBufferSource(); src.buffer = buf;
        const g = SFX.ctx.createGain(); g.gain.value = vol; src.connect(g); g.connect(SFX.ctx.destination); src.start();
        return true;
      } catch (e) {}
    }
    this.preload();
    try { const a = new Audio('sounds/' + file); a.volume = vol; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    return true;
  },
};

// ============================================================
//  Sterowanie
// ============================================================
const keysHeld = new Set();
const keyBuf = new Map(); // code -> timestamp naciśnięcia
const GAME_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyK', 'KeyL', 'Semicolon', 'ShiftLeft', 'ShiftRight', 'KeyP', 'Escape', 'KeyE', 'KeyQ', 'KeyO', 'KeyI', 'Enter']);
let usingKeyboard = false;
window.addEventListener('keydown', (e) => {
  const inGame = App.screen === 's-game';
  if (inGame && GAME_KEYS.has(e.code)) e.preventDefault(); // żadnego przewijania, klikania przycisków spacją itp.
  if (e.repeat) return;
  if (inGame && document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  if (!usingKeyboard && GAME_KEYS.has(e.code)) { usingKeyboard = true; if (inGame) $('#touch').hidden = true; }
  keysHeld.add(e.code); keyBuf.set(e.code, performance.now());
  if (inGame && App.match && App.match.phase === 'replay') { App.match.replay.skip = true; return; }
  if (typeof TUTORIAL !== 'undefined' && TUTORIAL.isOpen()) { if (TUTORIAL.key(e.code)) e.preventDefault(); return; }
  if ((e.code === 'Space' || e.code === 'Enter') && !['INPUT', 'SELECT', 'TEXTAREA'].includes((document.activeElement || {}).tagName)) {
    const primary = { 's-result': '#btn-next', 's-champion': '#btn-champ-menu', 's-select': '#btn-fight' }[App.screen];
    if (primary) { const b = $(primary); if (b && !b.disabled && !b.hidden) { e.preventDefault(); b.click(); return; } }
  }
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
  // przyciski i pola do klikania mają touch-action: manipulation, więc zoom im nie grozi, a szybkie dwa tapnięcia (Dalej, Dalej) muszą działać
  const onControl = e.target && e.target.closest && e.target.closest('button, .card, .cell, .chip, .tab, .racer, .seat, .tut-dots, [data-bet], input, select');
  if (!onControl && now - lastTap.t < 350 && Math.hypot(x - lastTap.x, y - lastTap.y) < 60) e.preventDefault();
  lastTap = { t: now, x, y };
}, { passive: false });
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || App.screen === 's-game') e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

const KEYMAP = {
  p1: { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW'], dodge: ['KeyS'], punch: ['KeyF', 'Space'], heavy: ['KeyG'], block: ['KeyH', 'ShiftLeft'], special: ['KeyE', 'KeyQ'] },
  p2: { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp'], dodge: ['ArrowDown'], punch: ['KeyK'], heavy: ['KeyL'], block: ['Semicolon', 'ShiftRight'], special: ['KeyO', 'KeyI'] },
};
KEYMAP.solo = {};
for (const a of Object.keys(KEYMAP.p1)) KEYMAP.solo[a] = KEYMAP.p1[a].concat(KEYMAP.p2[a]);
KEYMAP.solo.special.push('Enter');

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
class ConfusedController { constructor(inner) { this.inner = inner; } held(a) { return this.inner.held(a === 'left' ? 'right' : a === 'right' ? 'left' : a); } consume(a) { return this.inner.consume(a); } }
class CharmController { constructor(f, opp) { this.f = f; this.opp = opp; } held(a) { const toward = this.opp.x > this.f.x ? 'right' : 'left'; return a === toward && Math.abs(this.opp.x - this.f.x) > 70; } consume() { return false; } }

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
    this.meter = 0; this.ghost = 0; this.burnTick = 0; this.match = null;
    this.st = { frozen: 0, stun: 0, confused: 0, burn: 0, armor: 0, charm: 0, slow: 0, counter: 0, haste: 0, double: 0 };
    this.scale = 1; this.speedMul = 1; this.powerMul = 1; this.meterMul = 1; this.vamp = 0; this.permArmor = false;
    this.stats = { hits: 0, blocks: 0, dodges: 0, maxCombo: 0, specials: 0, dmgDealt: 0, dmgTaken: 0 };
    this.cos = { gloves: null, shorts: null, hat: null, ko: null }; this.upg = 0; this.weapon = null; this.bigHead = false;
  }
  get locked() { return this.st.frozen > 0 || this.st.stun > 0; }
  castSpecial(opp) {
    const sp = SPECIALS[this.ch.id]; if (!sp || !this.match) return;
    this.meter = 0; this.stats.specials++;
    this.setState('special', sp.dur);
    this.match.announceSpecial(this, sp);
    sp.cast(this.match, this, opp);
  }
  get attacking() { return this.state === 'punch' || this.state === 'heavy'; }
  get alive() { return this.state !== 'ko'; }
  setState(s, dur) { this.state = s; this.stateT = 0; this.stateDur = dur || 0; this.hitDone = false; }

  update(dt, opp, allowInput) {
    for (const k in this.st) this.st[k] = Math.max(0, this.st[k] - dt);
    this.ghost = Math.max(0, this.ghost - dt);
    let c = (allowInput && !this.locked) ? this.ctrl : NULL_CTRL;
    if (c !== NULL_CTRL && this.st.charm > 0) c = new CharmController(this, opp);
    else if (c !== NULL_CTRL && this.st.confused > 0) c = new ConfusedController(c);
    if (allowInput && this.alive) this.meter = Math.min(METER_MAX, this.meter + dt * 4 * this.meterMul * (this.upg >= 1 ? 1.25 : 1));
    if (this.weapon && this.weapon.t !== undefined) { this.weapon.t -= dt; if (this.weapon.t <= 0) this.weapon = null; }
    if (this.permArmor) this.st.armor = 1;
    this.stateT += dt; this.animT += dt;
    this.invuln = Math.max(0, this.invuln - dt); this.hurtFlash = Math.max(0, this.hurtFlash - dt);

    if (this.state !== 'ko' && this.state !== 'hit' && !this.attacking) this.facing = opp.x >= this.x ? 1 : -1;

    if (['punch', 'heavy', 'dodge', 'hit', 'special'].includes(this.state) && this.stateT >= this.stateDur) {
      this.setState(this.onGround ? 'idle' : 'jump');
    }
    if (this.locked && (this.attacking || this.state === 'block' || this.state === 'walk')) this.setState('idle');

    if (this.state !== 'ko') {
      const canAct = ['idle', 'walk', 'jump', 'block'].includes(this.state);
      if (canAct) {
        if (c.held('block') && this.onGround) { if (this.state !== 'block') this.setState('block'); }
        else if (this.state === 'block') this.setState('idle');

        if (this.state !== 'block') {
          if (this.onGround && this.meter >= METER_MAX && this.st.charm <= 0 && c.consume('special')) {
            this.castSpecial(opp);
          } else if (c.consume('punch') && (this.onGround || !this.airPunched)) {
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
          const sp = 250 * this.ch.speed * this.speedMul * (this.onGround ? 1 : 0.75) * (this.st.slow > 0 ? 0.35 : 1) * (this.st.charm > 0 ? 0.55 : 1) * (this.st.haste > 0 ? 1.5 : 1);
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
      } else if (this.st.frozen > 0) {
        this.vx = 0;
      } else {
        this.vx *= Math.pow(0.01, dt);
      }
    } else {
      this.vx *= Math.pow(0.02, dt);
    }

    // fizyka
    this.x += this.vx * dt;
    this.vy += GRAVITY * (this.match ? this.match.gravityMul : 1) * dt; this.y += this.vy * dt;
    if (this.y >= FLOOR) {
      this.y = FLOOR; this.vy = 0;
      if (!this.onGround) { this.onGround = true; if (this.state === 'jump') this.setState('idle'); }
    } else { this.onGround = false; }
    this.x = clamp(this.x, RING_L, RING_R);
    this.pose = computePose(this);
  }

  gloveWorld() { const P = this.pose; return { x: this.x + this.facing * P.fh.x * this.scale, y: this.y + P.fh.y * this.scale }; }
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
    case 'special': {
      const p = Math.min(1, T / D), c = Math.sin(Math.min(1, p * 2) * Math.PI / 2);
      P.fh = { x: 30, y: -150 - 80 * c }; P.bh = { x: -4, y: -136 - 88 * c }; P.lean = -5 * c; P.head.y -= 6 * c; P.ff.x = 22; P.bf.x = -22; break;
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
  if (f.ghost > 0) ctx.globalAlpha = 0.25;

  // cień
  const airH = FLOOR - f.y;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, airH + 4, 46 * (1 - airH / 900), 9, 0, 0, Math.PI * 2); ctx.fill();

  if (f.isBoss && f.alive) { const pulse = 0.5 + 0.5 * Math.sin(tNow * 6); const g = ctx.createRadialGradient(0, -110 * f.scale, 20, 0, -110 * f.scale, (150 + pulse * 25) * f.scale); g.addColorStop(0, `rgba(255,59,59,${0.25 + pulse * 0.12})`); g.addColorStop(1, 'rgba(255,59,59,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -110 * f.scale, 180 * f.scale, 0, Math.PI * 2); ctx.fill(); }
  // aura legendy
  if (ch.legendary && f.alive) {
    const pulse = 0.5 + 0.5 * Math.sin(tNow * 4);
    const g = ctx.createRadialGradient(0, -110, 20, 0, -110, 150 + pulse * 20);
    g.addColorStop(0, `rgba(255,215,0,${0.22 + pulse * 0.1})`); g.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -110, 170, 0, Math.PI * 2); ctx.fill();
  }

  if (f.st.armor > 0) { ctx.strokeStyle = `rgba(46,196,182,${0.5 + 0.3 * Math.sin(tNow * 8)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -115, 62, 135, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (f.st.counter > 0) { ctx.strokeStyle = `rgba(163,230,53,${0.5 + 0.4 * Math.sin(tNow * 16)})`; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.ellipse(0, -115, 66, 140, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  if (f.st.slow > 0) { const g = ctx.createRadialGradient(0, -110, 10, 0, -110, 140); g.addColorStop(0, 'rgba(155,92,255,0.35)'); g.addColorStop(1, 'rgba(155,92,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -110, 140, 0, Math.PI * 2); ctx.fill(); }

  ctx.scale(f.facing * f.scale, f.scale);
  ctx.rotate(P.rot);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  const hip = P.hip, sh = P.sh;
  const fLeg = ik(hip, P.ff, 50, 50, -1), bLeg = ik(hip, P.bf, 50, 50, -1);
  const fArm = ik({ x: sh.x + 6, y: sh.y + 4 }, P.fh, 48, 50, 1), bArm = ik({ x: sh.x - 6, y: sh.y + 4 }, P.bh, 48, 50, 1);

  const limb = (a, m, b, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(m.x, m.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  const shoe = (p, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(p.x + 4, p.y - 3, 14, 7, 0, 0, Math.PI * 2); ctx.fill(); };
  const gs = f.cos.gloves ? f.cos.gloves.style : null;
  const drawGlove = (p, r, back) => {
    if (gs && gs.emoji) { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(f.facing, 1); ctx.font = `${r * 2.6}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(gs.emoji, 0, 2); ctx.restore(); return; }
    let col = gs && gs.color ? gs.color : glove;
    if (gs && gs.rainbow) col = `hsl(${(tNow * 120 + (back ? 180 : 0)) % 360},100%,55%)`;
    ctx.fillStyle = back ? shade(col, -0.25) : col;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    if (gs && gs.pattern) drawPattern(ctx, gs.pattern, p.x, p.y, r, col);
    ctx.strokeStyle = shade(col, -0.55); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = gs && gs.shine ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(p.x - r * 0.3, p.y - r * 0.35, r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(col, -0.55); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.55, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    if (gs && gs.sparkle && Math.sin(tNow * 9 + p.x) > 0.6) drawStar(ctx, p.x + r * 0.5, p.y - r * 0.6, 5, '#fff');
  };

  // tylna noga i ręka
  limb(hip, bLeg.mid, bLeg.end, 9, shade(body, 0.18)); shoe(bLeg.end, shade(body, 0.1));
  limb({ x: sh.x - 6, y: sh.y + 4 }, bArm.mid, bArm.end, 8, shade(skin, -0.2));
  drawGlove(bArm.end, 15, true);

  // tułów + spodenki
  ctx.strokeStyle = body; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(hip.x, hip.y + 4); ctx.lineTo(sh.x, sh.y + 8); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(sh.x - 2, sh.y + 2); ctx.lineTo(P.head.x, P.head.y + HEAD_H * 0.42); ctx.stroke();
  const ss = f.cos.shorts ? f.cos.shorts.style : null;
  const scol = ss && ss.color ? ss.color : glove; const sh2 = ss && ss.long ? 40 : 24;
  ctx.fillStyle = scol;
  if (ss && ss.pattern === 'thong') { ctx.beginPath(); ctx.moveTo(hip.x - 16, hip.y - 12); ctx.lineTo(hip.x + 16, hip.y - 12); ctx.lineTo(hip.x + 3, hip.y + 12); ctx.lineTo(hip.x - 3, hip.y + 12); ctx.closePath(); ctx.fill(); ctx.strokeStyle = scol; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hip.x - 16, hip.y - 12); ctx.lineTo(hip.x + 16, hip.y - 12); ctx.stroke(); }
  else {
    ctx.beginPath(); ctx.moveTo(hip.x - 15, hip.y - 12); ctx.lineTo(hip.x + 15, hip.y - 12); ctx.lineTo(hip.x + 20, hip.y + sh2); ctx.lineTo(hip.x - 20, hip.y + sh2); ctx.closePath(); ctx.fill();
    if (ss && ss.pattern) { ctx.save(); ctx.beginPath(); ctx.moveTo(hip.x - 15, hip.y - 12); ctx.lineTo(hip.x + 15, hip.y - 12); ctx.lineTo(hip.x + 20, hip.y + sh2); ctx.lineTo(hip.x - 20, hip.y + sh2); ctx.closePath(); ctx.clip(); drawShortsPattern(ctx, ss.pattern, hip.x, hip.y, sh2, scol); ctx.restore(); }
    if (ss && ss.sparkle) for (let i = 0; i < 4; i++) if (Math.sin(tNow * 7 + i * 2) > 0.5) drawStar(ctx, hip.x - 12 + i * 8, hip.y + 2 + (i % 2) * 12, 3, '#fff');
    ctx.fillStyle = shade(scol, -0.4); ctx.fillRect(hip.x - 15, hip.y - 14, 30, 5);
    if (!ss || !ss.pattern) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(hip.x - 3, hip.y - 8, 4, 30); }
  }

  // przednia noga
  limb(hip, fLeg.mid, fLeg.end, 9, body); shoe(fLeg.end, shade(body, -0.3));

  // głowa
  ctx.save();
  ctx.translate(P.head.x, P.head.y);
  ctx.rotate(P.head.rot);
  ctx.scale(f.facing, 1); // twarz nie jest lustrzana
  if (f.bigHead) ctx.scale(1.8, 1.8);
  const img = heads[ch.id];
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(2, 4, HEAD_W / 2 + 2, HEAD_H / 2 + 2, 0, 0, Math.PI * 2); ctx.fill();
  if (img) ctx.drawImage(img, -HEAD_W / 2, -HEAD_H / 2, HEAD_W, HEAD_H);
  if (f.hurtFlash > 0) { ctx.globalAlpha = f.hurtFlash * 2; ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.ellipse(0, 0, HEAD_W / 2, HEAD_H / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, HEAD_W / 2 - 1, HEAD_H / 2 - 1, 0, 0, Math.PI * 2); ctx.stroke();
  if (ch.legendary) drawCrown(ctx, 0, -HEAD_H / 2 + 6, 0.9);
  if (f.cos.hat) drawHat(ctx, f.cos.hat, tNow);
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
  if (f.weapon) { ctx.save(); ctx.translate(fArm.end.x + 8, fArm.end.y - 8); ctx.scale(f.facing, 1); ctx.rotate(-0.5 * f.facing); ctx.font = '44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.weapon.emoji, 0, 0); ctx.restore(); }
  if (f.state === 'block') {
    ctx.strokeStyle = 'rgba(120,180,255,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(24, -190, 42, -Math.PI * 0.7, Math.PI * 0.55); ctx.stroke();
  }
  ctx.restore();
  drawStatusFx(ctx, f, tNow);
}
function drawStatusFx(ctx, f, t) {
  ctx.save(); ctx.translate(f.x, f.y);
  if (f.st.frozen > 0) { // bryła lodu
    ctx.fillStyle = 'rgba(158,203,255,0.45)'; ctx.strokeStyle = 'rgba(220,240,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-60, -120); ctx.lineTo(-30, -250); ctx.lineTo(30, -262); ctx.lineTo(62, -130); ctx.lineTo(48, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -220); ctx.lineTo(0, -160); ctx.lineTo(-12, -90); ctx.stroke();
  }
  if (f.st.stun > 0 && f.alive) for (let i = 0; i < 3; i++) { const a = t * 5 + i * Math.PI * 2 / 3; drawStar(ctx, Math.cos(a) * 40, -262 + Math.sin(a) * 10, 9, '#ffe45c'); }
  if (f.st.charm > 0) for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; const x = Math.cos(a) * 46, y = -250 + Math.sin(a * 1.3) * 14; drawHeart(ctx, x, y, 8, '#ff6ec7'); }
  if (f.st.confused > 0) { ctx.font = '30px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffb020'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4; const y = -270 + Math.sin(t * 6) * 6; ctx.strokeText('?', -30, y); ctx.fillText('?', -30, y); ctx.strokeText('?', 30, y + 6); ctx.fillText('?', 30, y + 6); }
  if (f.st.slow > 0) { ctx.strokeStyle = '#9b5cff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -275, 14, 0, Math.PI * 2); ctx.moveTo(0, -275); ctx.lineTo(0, -286); ctx.moveTo(0, -275); ctx.lineTo(Math.cos(t * 2) * 9, -275 + Math.sin(t * 2) * 9); ctx.stroke(); }
  if (f.state === 'special') { const g = ctx.createRadialGradient(0, -120, 10, 0, -120, 160); g.addColorStop(0, f.ch.glove + 'aa'); g.addColorStop(1, f.ch.glove + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -120, 160, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function drawHeart(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y + r);
  ctx.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.6, y - r * 1.2, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.2, x + r * 1.4, y - r * 0.2, x, y + r); ctx.fill();
}
function drawZone(ctx, z, t) {
  const p = 1 - z.life / z.max;
  ctx.save();
  if (z.kind === 'target') { ctx.strokeStyle = z.col; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 20); ctx.beginPath(); ctx.ellipse(z.x, FLOOR, 60, 14, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.font = '26px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = z.col; ctx.fillText('⚡', z.x, FLOOR - 10); }
  if (z.kind === 'bolt') { ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.shadowColor = z.col; ctx.shadowBlur = 30; ctx.beginPath(); let x = z.x, y = -10; ctx.moveTo(x, y); while (y < FLOOR - 20) { y += 40; x = z.x + rand(-30, 30); ctx.lineTo(x, y); } ctx.lineTo(z.x, FLOOR); ctx.stroke(); ctx.strokeStyle = z.col; ctx.lineWidth = 16; ctx.globalAlpha = (1 - p) * 0.5; ctx.stroke(); }
  if (z.kind === 'laser') { ctx.globalAlpha = 1 - p; const x1 = z.dir > 0 ? W + 20 : -20; ctx.strokeStyle = z.col; ctx.lineWidth = 14; ctx.shadowColor = z.col; ctx.shadowBlur = 25; ctx.beginPath(); ctx.moveTo(z.x + z.dir * 30, z.y); ctx.lineTo(x1, z.y); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); }
  if (z.kind === 'fire') { ctx.globalAlpha = 1 - p; const r = z.r * (0.4 + 0.6 * p); const g = ctx.createRadialGradient(z.x, FLOOR - 40, 10, z.x, FLOOR - 40, r); g.addColorStop(0, 'rgba(255,240,150,0.9)'); g.addColorStop(0.5, 'rgba(255,122,26,0.7)'); g.addColorStop(1, 'rgba(255,59,59,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(z.x, FLOOR - 40, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill(); }
  if (z.kind === 'crown') { const y = -60 + (FLOOR - 250 + 60) * easeIO(Math.min(1, p * 1.1)); ctx.globalAlpha = 1; drawCrown(ctx, z.x, y, 2.2); ctx.globalAlpha = 0.3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(z.x, FLOOR + 2, 40 * p + 10, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function drawProjectile(ctx, pr) {
  ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.rot * (pr.vx > 0 ? 1 : -1));
  if (pr.kind === 'cup') {
    ctx.fillStyle = 'rgba(230,240,255,0.9)'; ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(14, -18); ctx.lineTo(10, 18); ctx.lineTo(-10, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6b3a1e'; ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(11, -4); ctx.lineTo(9, 16); ctx.lineTo(-9, 16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pr.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(4, -18); ctx.lineTo(10, -36); ctx.stroke();
    ctx.fillStyle = '#9ecbff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-8 + i * 8, -10, 3, 0, Math.PI * 2); ctx.fill(); }
  } else if (pr.kind === 'heart') { drawHeart(ctx, 0, 0, 18, pr.col); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-6, -8, 4, 0, Math.PI * 2); ctx.fill(); }
  else if (pr.kind === 'emoji') { ctx.font = '38px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pr.emoji, 0, 0); }
  ctx.restore();
}
function drawPattern(ctx, kind, x, y, r, col) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  if (kind === 'lava') { ctx.fillStyle = '#ffd200'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 1.7) * r * 0.5, y + Math.sin(i * 1.7) * r * 0.5, r * 0.22, 0, Math.PI * 2); ctx.fill(); } }
  if (kind === 'melon') { ctx.strokeStyle = '#145a32'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * r * 0.5, y - r); ctx.quadraticCurveTo(x + i * r * 0.5 + 6, y, x + i * r * 0.5, y + r); ctx.stroke(); } }
  if (kind === 'fur') { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; for (let i = 0; i < 14; i++) { const a = i * 0.45; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7); ctx.lineTo(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1); ctx.stroke(); } }
  if (kind === 'brick') { ctx.strokeStyle = '#f4e4d4'; ctx.lineWidth = 2; for (let yy = -r; yy < r; yy += r * 0.5) { ctx.beginPath(); ctx.moveTo(x - r, y + yy); ctx.lineTo(x + r, y + yy); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); }
  ctx.restore();
}
function drawShortsPattern(ctx, kind, x, y, h, col) {
  if (kind === 'hearts') { ctx.fillStyle = '#ff3b6b'; for (let i = 0; i < 6; i++) drawHeart(ctx, x - 14 + (i % 3) * 14, y - 4 + Math.floor(i / 3) * 14, 4, '#ff3b6b'); }
  if (kind === 'camo') { for (const [dx, dy, c] of [[-10, -4, '#3b4a1f'], [8, 2, '#8a7a4a'], [-2, 12, '#2b3a17'], [12, 16, '#6b7a3a']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + dx, y + dy, 9, 6, 0.5, 0, Math.PI * 2); ctx.fill(); } }
  if (kind === 'flag') { ctx.fillStyle = '#e53935'; ctx.fillRect(x - 25, y + 6, 50, h); }
  if (kind === 'stripes') { ctx.fillStyle = 'rgba(70,90,160,0.6)'; for (let yy = -10; yy < h; yy += 8) ctx.fillRect(x - 25, y + yy, 50, 3); }
  if (kind === 'leopard') { ctx.fillStyle = '#4a2c0a'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(x - 14 + (i % 4) * 9.5, y - 4 + Math.floor(i / 4) * 14 + (i % 2) * 4, 3, 0, Math.PI * 2); ctx.fill(); } }
  if (kind === 'diaper') { ctx.fillStyle = '#9ecbff'; ctx.fillRect(x - 25, y - 12, 50, 6); ctx.fillStyle = '#ffb6c1'; ctx.beginPath(); ctx.arc(x, y + 14, 5, 0, Math.PI * 2); ctx.fill(); }
}
function drawHat(ctx, hat, t) {
  const top = -HEAD_H / 2;
  if (hat.draw === 'halo') { ctx.strokeStyle = '#ffe45c'; ctx.lineWidth = 5; ctx.shadowColor = '#ffe45c'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.ellipse(0, top - 14 + Math.sin(t * 3) * 3, 34, 9, 0, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0; return; }
  if (hat.draw === 'horns') { ctx.fillStyle = '#c0392b'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 22, top + 10); ctx.quadraticCurveTo(s * 40, top - 10, s * 30, top - 32); ctx.quadraticCurveTo(s * 32, top - 6, s * 12, top + 4); ctx.closePath(); ctx.fill(); } return; }
  if (hat.emoji) { ctx.font = '52px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(hat.emoji, 0, top - 8); }
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
  const m = f.match;
  if (m && m.pickups.length && r < 0.5) { const pk = m.pickups[0]; if (Math.abs(pk.x - f.x) < 260 && pk.y >= FLOOR - 40) { ai.h[pk.x > f.x ? 'right' : 'left'] = true; ai.timer = 0.2; return; } }
  if (m && m.hazards.some((h) => (h.kind === 'bomb' && Math.abs(h.x - f.x) < 150) || (h.kind === 'bottle' && Math.abs(h.x - f.x) < 50)) && r < 0.7) { const h = m.hazards.find((h) => h.kind === 'bomb' || h.kind === 'bottle'); ai.h[h.x > f.x ? 'left' : 'right'] = true; ai.timer = 0.25; return; }

  if (f.meter >= METER_MAX && f.onGround && f.state !== 'special') {
    const ranged = ['miska', 'miszalinaq', 'diddy', 'piotszu', 'watol', 'bianka', 'wiczka', 'gazdziol', 'king_pala'].includes(f.ch.id);
    const counter = f.ch.id === 'szon';
    const want = counter ? (opp.attacking || (dist < 120 && r < 0.3)) : (ranged ? r < 0.35 + 0.4 * d : (dist < 170 && r < 0.45 + 0.4 * d));
    if (want) { ai.press('special'); ai.timer = 0.4; return; }
  }
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
    const human2 = opts.mode === 'versus' || opts.human2;
    const c1 = new KeyController(human2 ? KEYMAP.p1 : KEYMAP.solo, true);
    const c2 = human2 ? new KeyController(KEYMAP.p2, false) : new AIController(opts.diff || 0.6);
    this.f = [new Fighter(opts.p1, 0, c1), new Fighter(opts.p2, 1, c2)];
    this.f[0].match = this; this.f[1].match = this;
    const eq = PROFILE.equipped(); this.f[0].cos = { gloves: eq.gloves, shorts: eq.shorts, hat: eq.hat, ko: eq.ko };
    this.f[0].upg = PROFILE.d.upgrades[opts.p1.id] || 0;
    if (opts.mode !== 'versus' && Math.random() < 0.3) this.f[1].cos.hat = pick(ITEMS.filter((i) => i.type === 'hat'));
    if (PROFILE.d.bigHeads) { this.f[0].bigHead = true; this.f[1].bigHead = true; }
    this.p1Taunt = eq.taunt ? eq.taunt.name : null;
    if (opts.boss) {
      const b = this.f[1], mod = opts.boss;
      b.maxHp = mod.hp; b.hp = mod.hp; if (mod.scale) b.scale = mod.scale; if (mod.speed) b.speedMul = mod.speed; if (mod.power) b.powerMul = mod.power;
      if (mod.armor) b.permArmor = true; if (mod.vamp) b.vamp = mod.vamp; if (mod.meter) b.meterMul = mod.meter; b.isBoss = true;
      this.bossMod = mod;
    }
    if (opts.p1Hp) { this.f[0].hp = Math.min(this.f[0].maxHp, opts.p1Hp); }
    if (opts.p1Meter) this.f[0].meter = opts.p1Meter;
    this.phase = 'intro'; this.t = 0; this.phaseT = 0; this.fightTime = 0;
    this.particles = []; this.popups = []; this.shake = 0; this.freeze = 0; this.excite = 0; this.slow = 1;
    this.projectiles = []; this.zones = []; this.timers = []; this.flash = 0; this.announce = null;
    this.pickups = []; this.hazards = []; this.nextEvent = rand(7, 12); this.eventBanner = null; this.gravityMul = 1; this.crack = null; this.firstBlood = null; this.perfect = false;
    this.eventsOn = opts.events !== false;
    this.hist = []; this.histT = 0; this.replay = null; this.recorder = null; this.recChunks = [];
    if (opts.boss && opts.boss.gravity) this.gravityMul = opts.boss.gravity;
    if (opts.boss && opts.boss.chaos) this.nextEvent = 3;
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
      this.fightTime += dt;
      if (a.ctrl instanceof AIController) aiThink(a, b, dt);
      if (b.ctrl instanceof AIController) aiThink(b, a, dt);
    }
    a.update(dt, b, fighting); b.update(dt, a, fighting);

    if (this.phase !== 'intro') {
      // opóźnione efekty supermocy
      for (const t of this.timers) t.t -= dt;
      const due = this.timers.filter((t) => t.t <= 0); this.timers = this.timers.filter((t) => t.t > 0);
      for (const t of due) t.fn();
      // pociski
      for (const pr of this.projectiles) {
        pr.x += pr.vx * dt; pr.vy += pr.g * dt; pr.y += pr.vy * dt; pr.life -= dt; pr.rot = (pr.rot || 0) + dt * 8;
        const tgt = pr.owner === a ? b : a;
        if (tgt.alive && Math.abs(pr.x - tgt.x) < 40 + pr.r && pr.y > tgt.y - 235 && pr.y < tgt.y + 10) { pr.life = 0; this.spark(pr.x, pr.y, pr.col, 12); pr.onHit(tgt); }
        else if (pr.y > FLOOR || pr.x < 0 || pr.x > W) { pr.life = 0; this.spark(pr.x, Math.min(pr.y, FLOOR), pr.col, 8); }
      }
      this.projectiles = this.projectiles.filter((pr) => pr.life > 0);
      for (const z of this.zones) z.life -= dt;
      this.zones = this.zones.filter((z) => z.life > 0);
      // płonięcie
      for (const f of this.f) {
        if (f.st.burn > 0 && f.alive) {
          f.burnTick += dt;
          if (Math.random() < dt * 25) this.particles.push({ x: f.x + rand(-25, 25), y: f.y - rand(20, 200), vx: rand(-30, 30), vy: -rand(120, 260), life: rand(0.3, 0.6), col: pick(['#ff7a1a', '#ffb020', '#ff3b3b']), r: rand(3, 7), float: true });
          if (f.burnTick >= 0.5) { f.burnTick = 0; const other = f === a ? b : a; this.damage(other, f, 2, { text: '', silent: true, knock: 0, ignoreBlock: true, noStun: true }); }
        }
      }
    }
    if (this.announce) { this.announce.t -= dtRaw; if (this.announce.t <= 0) this.announce = null; }
    if (this.eventBanner) { this.eventBanner.t -= dtRaw; if (this.eventBanner.t <= 0) this.eventBanner = null; }
    if (this.crack) { this.crack.t -= dtRaw; if (this.crack.t <= 0) this.crack = null; }
    if (fighting && this.eventsOn) {
      if (this.fightTime >= this.nextEvent) { this.nextEvent = this.fightTime + (this.bossMod && this.bossMod.chaos ? 4 : rand(9, 15)); this.ringEvent(); }
      for (const pk of this.pickups) {
        pk.life -= dt; if (pk.y < FLOOR - 18) { pk.y += 140 * dt; } else pk.y = FLOOR - 18;
        for (const f of this.f) if (f.alive && f.onGround && pk.y >= FLOOR - 30 && Math.abs(f.x - pk.x) < 34) { pk.life = 0; f.stats.pickups = (f.stats.pickups || 0) + 1; this.popup(f.x, f.y - 265, pk.def.name.toUpperCase(), '#ffe135', 22); this.spark(pk.x, pk.y, '#ffe135', 10); SFX.jump(); pk.def.use(this, f); break; }
      }
      this.pickups = this.pickups.filter((pk) => pk.life > 0);
      for (const hz of this.hazards) {
        hz.life -= dt;
        if (hz.kind === 'peel') for (const f of this.f) if (f.alive && f.onGround && Math.abs(f.vx) > 20 && Math.abs(f.x - hz.x) < 24 && hz.life > 0) { hz.life = 0; this.status(f, 'stun', 1); f.setState('hit', 1); f.vx = (f.vx > 0 ? 1 : -1) * 260; f.vy = -200; f.onGround = false; this.popup(f.x, f.y - 265, 'ŚLIZG!', '#ffe135', 28); SFX.whiff(); }
        if (hz.kind === 'bomb' && hz.life <= 0) { this.zone({ x: hz.x, kind: 'fire', life: 0.45, col: '#ff3b3b', r: 170 }); this.shake = 16; this.flash = 0.3; SFX.punch(true); SFX.noise(0.4, 200, 1, 0.8); for (const f of this.f) if (f.alive && Math.abs(f.x - hz.x) < 150) this.damage(this.other(f), f, 15, { text: 'BUM!', col: '#ff3b3b', knock: 420, pop: true, ignoreBlock: true, noMeter: true }); }
        if (hz.kind === 'bottle') { hz.y += hz.vy * dt; hz.vy += 1400 * dt; if (hz.y >= FLOOR - 10) { hz.life = 0; this.spark(hz.x, FLOOR - 10, '#9ecbff', 14); SFX.block(); for (const f of this.f) if (f.alive && Math.abs(f.x - hz.x) < 45 && f.onGround) this.damage(this.other(f), f, 8, { text: 'BUTELKA!', col: '#9ecbff', knock: 150, ignoreBlock: true }); } }
      }
      this.hazards = this.hazards.filter((hz) => hz.life > 0 || hz.kind === 'bottle' && hz.y < FLOOR - 10);
    }
    this.flash = Math.max(0, this.flash - dtRaw * 1.6);

    // rozpychanie
    if (a.alive && b.alive) {
      const dx = b.x - a.x, min = 58;
      if (Math.abs(dx) < min) { const push = (min - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1; a.x = clamp(a.x - push * s, RING_L, RING_R); b.x = clamp(b.x + push * s, RING_L, RING_R); }
    }
    if (fighting) { this.resolveHit(a, b); this.resolveHit(b, a); }

    if (this.phase === 'fight' || (this.phase === 'ko' && this.phaseT < 1.2)) {
      this.histT += dtRaw;
      if (this.histT >= 1 / 30) { this.histT = 0; this.hist.push(this.snapshot()); if (this.hist.length > 80) this.hist.shift(); }
    }
    if (this.phase === 'ko') {
      this.slow = this.phaseT < 0.9 ? 0.3 : 1;
      if (this.phaseT > 3.0 && !this.ended && this.hist.length > 20 && this.opts.replay !== false) { this.startReplay(); }
      else if (this.phaseT > 3.2 && !this.ended) { this.ended = true; this.opts.onEnd(this.winner); }
    }
    if (this.phase === 'replay') {
      this.replay.idx += dtRaw * 30 * 0.5; this.replay.t += dtRaw;
      if (this.replay.idx >= this.hist.length - 1 || this.replay.skip) this.endReplay();
    }
    this.excite = Math.max(0, this.excite - dt * 0.5);
    this.updateFx(dt);
  }
  updateFx(dt) {
    this.shake = Math.max(0, this.shake - dt * 30);
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.float ? -200 : 900) * dt; p.life -= dt; if (p.spin) p.rot = (p.rot || 0) + p.spin * dt; }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.popups) { p.y += p.vy * dt; p.life -= dt; p.vy *= 0.95; }
    this.popups = this.popups.filter((p) => p.life > 0);
  }
  resolveHit(att, def) {
    if (!att.attackActive() || !def.alive) return;
    const G = att.gloveWorld(); const heavy = att.state === 'heavy';
    const top = def.y - (def.state === 'dodge' ? 150 : 228) * def.scale, hw = 36 * def.scale;
    if (!(G.x > def.x - hw && G.x < def.x + hw && G.y > top && G.y < def.y)) return;
    att.hitDone = true;
    let base = (heavy ? 15 : 6) * att.ch.power * att.powerMul * rand(0.9, 1.15) * (1 + Math.min(att.combo, 10) * 0.1);
    const o = { heavy, punch: true, at: G };
    if (att.weapon) {
      const wpn = att.weapon; base *= wpn.mult || 1; o.text = pick(['ŁUBUDU!', 'PRASK!', 'BĘC!']); o.col = '#ffe135'; if (wpn.knock) o.knock = (heavy ? 460 : 220) * wpn.knock;
      o.onHit = () => { if (wpn.stun) this.status(def, 'stun', wpn.stun); if (wpn.slow) this.status(def, 'slow', wpn.slow); if (wpn.confuse) this.status(def, 'confused', wpn.confuse); };
      if (wpn.sfx === 'squeak') SFX.tone(900, 0.15, 0.3, 'square', 1.6);
      if (wpn.hits !== undefined) { wpn.hits--; if (wpn.hits <= 0) { att.weapon = null; this.popup(att.x, att.y - 270, 'BROŃ ZNISZCZONA', '#aaa', 18); } }
    }
    this.damage(att, def, base, o);
  }
  // Jedno miejsce od obrażeń: ciosy, supermoce, ogień. Zwraca zadane obrażenia.
  damage(att, def, base, o = {}) {
    if (!def.alive || base <= 0) return 0;
    const G = o.at || { x: def.x, y: def.y - 170 };
    if (def.invuln > 0 && !o.pop && !o.silent) { this.popup(def.x, def.y - 240, 'UNIK!', '#7cff9b', 26); SFX.whiff(); def.stats.dodges++; return 0; }
    if (def.st.counter > 0 && !o.isCounter && !o.silent) {
      def.st.counter = 0; this.popup(def.x, def.y - 275, 'CO TY ODWALASZ?!', '#a3e635', 34); this.shake = 10; this.freeze = 0.1; SFX.block();
      if (att.attacking || att.state === 'special') att.setState('idle');
      this.status(att, 'stun', 1.2);
      this.damage(def, att, base * 2.5, { isCounter: true, text: 'KONTRA!', col: '#a3e635', knock: 420, ignoreBlock: true, pop: true });
      return 0;
    }
    let dmg = base; const dir = def.x >= att.x ? 1 : -1;
    const facingAtt = (att.x - def.x) * def.facing > 0;
    const blocked = def.state === 'block' && facingAtt && !o.ignoreBlock;
    if (def.st.armor > 0) dmg *= 0.3;
    if (att.st.double > 0) dmg *= 2;
    if (!o.punch && !o.silent && !o.isCounter && att.upg >= 2) dmg *= 1.3;
    let crit = false;
    if (o.punch && !blocked && Math.random() < 0.08) { crit = true; dmg *= 1.6; att.stats.crits = (att.stats.crits || 0) + 1; o.text = 'KRYTYK!'; o.col = '#ff3b3b'; this.crack = { x: G.x, y: G.y, t: 0.5 }; this.freeze = Math.max(this.freeze, 0.1); this.shake = Math.max(this.shake, 10); }
    const heavy = !!o.heavy || crit;
    if (blocked) {
      dmg *= 0.15; def.vx = dir * 160; def.stats.blocks++; SFX.block(); this.spark(G.x, G.y, '#9ecbff', 6);
      if (heavy) { def.setState('hit', 0.24); this.popup(def.x, def.y - 240, 'PRZEŁAMANY!', '#ffb020', 24); this.shake = 6; VOICES.play(def.ch, 'obrywa', { chance: 0.6 }); }
      else { this.popup(G.x, G.y - 30, 'BLOK', '#9ecbff', 20); VOICES.play(def.ch, 'blok', { chance: 0.35, cooldown: 1500 }); }
    } else if (o.silent) {
      this.popup(def.x + rand(-20, 20), def.y - 230, '-' + Math.round(dmg), '#ff7a1a', 16);
    } else {
      def.combo = 0; att.stats.hits++;
      if (o.punch) { att.combo++; att.stats.maxCombo = Math.max(att.stats.maxCombo, att.combo); }
      if (!o.noStun && !(o.stunLock && def.state === 'hit')) def.setState('hit', o.stunDur || (heavy ? 0.42 : 0.26));
      def.hurtFlash = 0.25;
      const knock = o.knock !== undefined ? o.knock : (heavy ? 460 : 220);
      def.vx = dir * knock * (att.st.armor > 0 ? 2 : 1); if (heavy || o.pop) { def.vy = -240; def.onGround = false; }
      if (def.st.frozen > 0 && !o.text) def.st.frozen = 0;
      SFX.punch(heavy || !o.punch);
      const said = VOICES.play(def.ch, 'obrywa', { chance: heavy ? 0.8 : 0.4, cooldown: 900 });
      if (!said && Math.random() < 0.4) SFX.hurt();
      if (o.punch) VOICES.play(att.ch, 'cios', { chance: heavy ? 0.7 : 0.3, cooldown: 1200 });
      this.spark(G.x, G.y, o.col || att.ch.glove, heavy ? 18 : 9); this.spark(G.x, G.y, '#ffffff', 4);
      const txt = o.text !== undefined ? o.text : pick(heavy ? ['ŁOMOT!', 'KABOOM!', 'BUM!'] : ['ŁUP!', 'BACH!', 'PRASK!', 'TRZASK!', 'PAC!']);
      if (txt) this.popup(G.x + dir * 10, G.y - 40, txt, o.col || (heavy ? '#ffb020' : '#fff'), (heavy || !o.punch) ? 40 : 28);
      this.popup(def.x, def.y - 250, '-' + Math.round(dmg), '#ff5c5c', 22);
      if (o.punch && att.combo >= 3) this.popup(att.x, att.y - 260, att.combo + 'x COMBO' + (att.combo >= 10 ? ' BOSKIE!' : att.combo >= 8 ? ' MASAKRA!' : att.combo >= 5 ? ' SZALEŃSTWO!' : ''), att.ch.glove, att.combo >= 5 ? 26 : 20);
      if (!this.firstBlood) { this.firstBlood = att; this.popup(W / 2, 150, 'PIERWSZA KREW!', '#ff3b3b', 36); }
      if (o.onHit) o.onHit();
      this.shake = Math.max(this.shake, heavy ? 12 : 5); this.freeze = Math.max(this.freeze, heavy ? 0.08 : 0.03); this.excite = Math.min(1, this.excite + (heavy ? 0.5 : 0.2));
    }
    if (!o.silent) {
      att.meter = Math.min(METER_MAX, att.meter + (o.isCounter ? 0 : (blocked ? 4 : (heavy ? 14 : 9))) * att.meterMul * (att.upg >= 1 ? 1.25 : 1));
      def.meter = Math.min(METER_MAX, def.meter + (blocked ? 3 : 7) * def.meterMul);
    }
    def.hp = Math.max(0, def.hp - dmg); att.stats.dmgDealt += dmg; def.stats.dmgTaken += dmg;
    if (att.vamp && dmg > 0 && att.alive) { att.hp = Math.min(att.maxHp, att.hp + dmg * att.vamp); }
    if (def.hp <= 0) this.knockout(att, def);
    return dmg;
  }
  other(f) { return f === this.f[0] ? this.f[1] : this.f[0]; }
  snapshot() {
    const fs = this.f.map((f) => ({ x: f.x, y: f.y, vy: f.vy, facing: f.facing, state: f.state, stateT: f.stateT, stateDur: f.stateDur, animT: f.animT, hp: f.hp, ghost: f.ghost, hurtFlash: f.hurtFlash, st: Object.assign({}, f.st), weapon: f.weapon, scale: f.scale, bigHead: f.bigHead, isBoss: f.isBoss, cos: f.cos, ch: f.ch, upg: f.upg, meter: f.meter }));
    return { fs, particles: this.particles.map((p) => ({ x: p.x, y: p.y, r: p.r, col: p.col, emoji: p.emoji, rot: p.rot, life: p.life })), zones: this.zones.map((z) => Object.assign({}, z)), projectiles: this.projectiles.map((p) => Object.assign({}, p)), pickups: this.pickups.map((p) => Object.assign({}, p)), hazards: this.hazards.map((h) => Object.assign({}, h)), popups: this.popups.map((p) => Object.assign({}, p)) };
  }
  startReplay() {
    this.phase = 'replay'; this.replay = { idx: 0, t: 0, skip: false };
    const last = this.hist[this.hist.length - 1]; this.replay.cx = (last.fs[0].x + last.fs[1].x) / 2; this.replay.cy = 330;
    try {
      const cv = $('#c'); if (window.MediaRecorder && cv.captureStream) {
        const mime = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((m) => MediaRecorder.isTypeSupported(m));
        this.recChunks = []; this.recorder = new MediaRecorder(cv.captureStream(30), mime ? { mimeType: mime } : undefined);
        this.recorder.ondataavailable = (e) => { if (e.data && e.data.size) this.recChunks.push(e.data); };
        this.recorder.start(250);
      }
    } catch (e) { this.recorder = null; }
  }
  endReplay() {
    if (this.ended) return; this.ended = true;
    const finish = () => this.opts.onEnd(this.winner);
    if (this.recorder && this.recorder.state !== 'inactive') {
      const rec = this.recorder; rec.onstop = () => { try { const blob = new Blob(this.recChunks, { type: rec.mimeType || 'video/webm' }); if (blob.size > 1000) App.lastReplay = { blob, type: rec.mimeType || 'video/webm', name: `opg-ko-${Date.now()}.${/mp4/.test(rec.mimeType || '') ? 'mp4' : 'webm'}` }; } catch (e) {} finish(); };
      try { rec.stop(); } catch (e) { finish(); }
    } else finish();
  }
  drawReplay(ctx) {
    const i = Math.min(this.hist.length - 1, Math.floor(this.replay.idx)), snap = this.hist[i];
    const zoom = 1.55, cx = clamp(this.replay.cx, W / (2 * zoom) + 0, W - W / (2 * zoom)), cy = clamp(this.replay.cy, H / (2 * zoom), H - H / (2 * zoom));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
    drawArena(ctx, this.t, 1);
    for (const z of snap.zones) if (z.kind === 'target' || z.kind === 'fire') drawZone(ctx, z, this.t);
    const proxies = snap.fs.map((sf, k) => { const pr = Object.assign(Object.create(Fighter.prototype), this.f[k], sf); pr.pose = computePose(pr); return pr; });
    const order = (proxies[0].state === 'hit' || proxies[0].state === 'ko') ? [proxies[0], proxies[1]] : [proxies[1], proxies[0]];
    for (const f of order) drawFighter(ctx, f, this.t);
    for (const z of snap.zones) if (z.kind !== 'target' && z.kind !== 'fire') drawZone(ctx, z, this.t);
    for (const pr of snap.projectiles) drawProjectile(ctx, pr);
    ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const pk of snap.pickups) ctx.fillText(pk.def.emoji, pk.x, pk.y);
    for (const hz of snap.hazards) if (hz.kind === 'peel') ctx.fillText('🍌', hz.x, FLOOR - 8); else if (hz.kind === 'bomb') ctx.fillText('💣', hz.x, FLOOR - 22);
    ctx.textBaseline = 'alphabetic';
    for (const p of snap.particles) { ctx.globalAlpha = Math.min(1, p.life * 3); if (p.emoji) { ctx.font = `${p.r * 6}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(p.emoji, p.x, p.y); } else { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } }
    ctx.globalAlpha = 1;
    for (const p of snap.popups) { ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.font = `${p.size}px Bangers, Impact, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y); ctx.restore(); }
    ctx.restore();
    // pasy kinowe + napis
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 46); ctx.fillRect(0, H - 46, W, 46);
    ctx.save(); ctx.textAlign = 'left'; ctx.font = '26px Bangers, Impact, sans-serif'; ctx.fillStyle = '#ff3b3b'; ctx.fillText('● POWTÓRKA', 24, 32);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 13px Rubik, sans-serif'; ctx.fillText('ZWOLNIONE TEMPO • dotknij / wciśnij klawisz, żeby pominąć', W - 24, 30);
    ctx.textAlign = 'center'; ctx.font = '22px Bangers, Impact, sans-serif'; ctx.fillStyle = '#ffd700'; ctx.fillText(`${this.f[this.winner].ch.name.toUpperCase()} • K.O.`, W / 2, H - 16);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; for (let y = 50; y < H - 46; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }
  banner(text, col, sub) { this.eventBanner = { text, col, sub, t: 2 }; SFX.bell(); }
  ringEvent() {
    const ev = weightedPick(RING_EVENTS);
    if (ev.id === 'drop') { const def = weightedPick(PICKUPS); this.pickups.push({ def, x: rand(RING_L + 40, RING_R - 40), y: -40, life: 12 }); this.banner(`${def.emoji} ${def.name.toUpperCase()}!`, '#ffe135', def.desc); }
    if (ev.id === 'bottle') { const tgt = pick(this.f); const x = clamp(tgt.x + rand(-30, 30), RING_L, RING_R); this.zone({ x, kind: 'target', life: 0.8, col: '#9ecbff' }); this.banner('🍾 KTOŚ Z WIDOWNI RZUCA BUTELKĄ!', '#9ecbff', 'uciekaj spod znaku'); this.after(0.8, () => this.hazards.push({ kind: 'bottle', emoji: '🍾', x, y: -30, vy: 300, life: 3 })); }
    if (ev.id === 'quake') { this.banner('🌍 TRZĘSIENIE RINGU!', '#ff7a1a', 'obaj tracą równowagę'); this.shake = 20; for (const f of this.f) { this.status(f, 'stun', 0.7); f.vy = -250; f.onGround = false; } }
    if (ev.id === 'double') { this.banner('💥 PODWÓJNE OBRAŻENIA!', '#ff3b3b', 'przez 8 sekund, dla obu'); for (const f of this.f) f.st.double = 8; }
    if (ev.id === 'bomb') { const x = rand(RING_L + 60, RING_R - 60); this.hazards.push({ kind: 'bomb', emoji: '💣', x, life: 3 }); this.banner('💣 BOMBA NA RINGU!', '#ff3b3b', 'wybuchnie za 3 sekundy'); }
    if (ev.id === 'rain') { this.banner('🍕 DESZCZ JEDZENIA!', '#ffe135', 'zbieraj, ile zdążysz'); for (let i = 0; i < 4; i++) this.after(i * 0.4, () => { const def = pick(PICKUPS.filter((p) => ['pizza', 'sausage', 'energy', 'kebab'].includes(p.id))); this.pickups.push({ def, x: rand(RING_L + 40, RING_R - 40), y: -40, life: 10 }); }); }
  }
  heal(f, n) { if (!f.alive) return; const before = f.hp; f.hp = Math.min(f.maxHp, f.hp + n); this.popup(f.x, f.y - 250, '+' + Math.round(f.hp - before), '#7cff9b', 24); this.spark(f.x, f.y - 140, '#7cff9b', 10); }
  status(f, k, dur) {
    if (!f.alive) return; f.st[k] = Math.max(f.st[k], dur);
    if (k === 'frozen' || k === 'stun') { if (f.attacking || f.state === 'block' || f.state === 'walk') f.setState('idle'); f.vx = 0; }
    const info = STATUS_INFO[k]; if (info && f.st[k] === dur) this.popup(f.x, f.y - 285, info[0], info[1], 20);
  }
  after(t, fn) { this.timers.push({ t, fn }); }
  projectile(pr) { pr.rot = 0; this.projectiles.push(pr); }
  zone(z) { z.max = z.life; this.zones.push(z); }
  announceSpecial(f, sp) {
    this.announce = { f, sp, t: 1.5 }; this.flash = Math.max(this.flash, 0.3); this.freeze = Math.max(this.freeze, 0.12); this.shake = Math.max(this.shake, 6);
    SFX.tone(220, 0.5, 0.35, 'sawtooth', 3); SFX.noise(0.3, 900, 0.8, 0.3, 'bandpass');
    if (!VOICES.play(f.ch, 'moc', { cooldown: 0 })) VOICES.play(f.ch, 'cios', { cooldown: 0 });
    this.spark(f.x, f.y - 140, f.ch.glove, 24); this.excite = 1;
  }
  knockout(att, def) {
    def.setState('ko'); def.vx = att.facing * 380; def.vy = -300; def.onGround = false;
    this.phase = 'ko'; this.phaseT = 0; this.winner = att.side; this.shake = 18; this.freeze = 0.18; this.excite = 1;
    this.perfect = att.stats.dmgTaken <= 0;
    SFX.ko(); setTimeout(() => SFX.cheer(), 400);
    VOICES.play(def.ch, 'ko', { cooldown: 0 });
    setTimeout(() => VOICES.play(att.ch, 'wygrana', { cooldown: 0 }), 1400);
    this.spark(def.x, def.y - 150, '#ffd700', 30);
    const kofx = att.cos.ko;
    if (kofx) {
      if (kofx.fx === 'rain') for (let i = 0; i < 40; i++) this.particles.push({ x: rand(60, W - 60), y: rand(-400, -20), vx: rand(-20, 20), vy: rand(50, 200), life: rand(2, 3.4), r: rand(4, 7), emoji: kofx.emoji, spin: rand(-4, 4) });
      if (kofx.fx === 'confetti') for (let i = 0; i < 90; i++) this.particles.push({ x: rand(0, W), y: rand(-300, -10), vx: rand(-40, 40), vy: rand(60, 220), life: rand(2, 3.4), r: rand(2, 4), col: pick(['#ffd700', '#ff4fa3', '#7c5cff', '#2ec4b6', '#ff3b3b', '#fff']) });
      if (kofx.fx === 'fireworks') for (let k = 0; k < 5; k++) this.after(0.3 + k * 0.4, () => { const x = rand(120, W - 120), y = rand(80, 260), col = pick(['#ffd700', '#ff4fa3', '#7c5cff', '#2ec4b6', '#fff']); for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, sp = rand(140, 260); this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.8, 1.4), r: 3, col, float: true }); } SFX.punch(true); });
    }
  }
  spark(x, y, col, n) { for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), s = rand(120, 460); this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 100, life: rand(0.25, 0.6), col, r: rand(2, 5) }); } }
  popup(x, y, text, col, size) { this.popups.push({ x, y, text, col, size, life: 0.9, vy: -70 }); }

  draw(ctx) {
    if (this.phase === 'replay') { this.drawReplay(ctx); return; }
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
    drawArena(ctx, this.t, this.excite);
    const [a, b] = this.f;
    const order = (a.state === 'hit' || a.state === 'ko') ? [a, b] : [b, a];
    for (const z of this.zones) if (z.kind === 'target' || z.kind === 'fire') drawZone(ctx, z, this.t);
    for (const f of order) drawFighter(ctx, f, this.t);
    for (const z of this.zones) if (z.kind !== 'target' && z.kind !== 'fire') drawZone(ctx, z, this.t);
    for (const pr of this.projectiles) drawProjectile(ctx, pr);
    ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const pk of this.pickups) { const bob = pk.y >= FLOOR - 18 ? Math.sin(this.t * 5) * 4 : 0; if (pk.y < FLOOR - 18) { ctx.font = '36px sans-serif'; ctx.fillText('🪂', pk.x, pk.y - 40); ctx.font = '40px sans-serif'; } ctx.globalAlpha = pk.life < 2 ? (Math.sin(this.t * 14) > 0 ? 1 : 0.3) : 1; ctx.fillText(pk.def.emoji, pk.x, pk.y + bob); ctx.globalAlpha = 1; }
    for (const hz of this.hazards) { if (hz.kind === 'peel') { ctx.font = '34px sans-serif'; ctx.fillText('🍌', hz.x, FLOOR - 8); } if (hz.kind === 'bomb') { ctx.font = (hz.life < 1 && Math.sin(this.t * 30) > 0) ? '54px sans-serif' : '44px sans-serif'; ctx.fillText('💣', hz.x, FLOOR - 22); } if (hz.kind === 'bottle') { ctx.save(); ctx.translate(hz.x, hz.y); ctx.rotate(this.t * 10); ctx.font = '36px sans-serif'; ctx.fillText('🍾', 0, 0); ctx.restore(); } }
    ctx.textBaseline = 'alphabetic';

    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 3);
      if (p.emoji) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.font = `${p.r * 6}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.emoji, 0, 0); ctx.restore(); }
      else { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (const p of this.popups) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.font = `${p.size}px Bangers, Impact, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y); ctx.restore();
    }
    ctx.restore();
    if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, this.flash)})`; ctx.fillRect(0, 0, W, H); }
    if (this.crack) { ctx.save(); ctx.globalAlpha = Math.min(1, this.crack.t * 3); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3; ctx.beginPath(); ctx.moveTo(this.crack.x, this.crack.y); let x = this.crack.x, y = this.crack.y; for (let k = 0; k < 4; k++) { x += Math.cos(a + (k % 2 ? 0.3 : -0.3)) * 60; y += Math.sin(a + (k % 2 ? 0.3 : -0.3)) * 60; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
    this.drawHUD(ctx);
    if (this.eventBanner) {
      const eb = this.eventBanner, p = 1 - eb.t / 2, a = p < 0.1 ? p * 10 : p > 0.8 ? (1 - p) * 5 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 118, W, 54);
      ctx.textAlign = 'center'; ctx.font = '30px Bangers, Impact, sans-serif'; ctx.fillStyle = eb.col; ctx.fillText(eb.text, W / 2, 146);
      ctx.font = '600 13px Rubik, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(eb.sub || '', W / 2, 164); ctx.restore();
    }
    if (this.announce) {
      const an = this.announce, p = 1 - an.t / 1.5, sc = 1 + Math.max(0, 0.25 - p) * 5;
      ctx.save(); ctx.globalAlpha = p > 0.8 ? (1 - p) * 5 : 1;
      ctx.translate(W / 2, 200); ctx.scale(sc, sc);
      ctx.textAlign = 'center'; ctx.font = '64px Bangers, Impact, sans-serif'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      const txt = an.sp.icon + ' ' + an.sp.name.toUpperCase();
      const tw = ctx.measureText(txt).width; if (tw > W - 80) ctx.font = Math.floor(64 * (W - 80) / tw) + 'px Bangers, Impact, sans-serif';
      ctx.strokeText(txt, 0, 0); ctx.fillStyle = an.f.ch.glove; ctx.fillText(txt, 0, 0);
      ctx.font = '600 20px Rubik, sans-serif'; ctx.lineWidth = 4; ctx.strokeText(an.f.ch.name.toUpperCase() + ' UŻYWA SUPERMOCY', 0, 34); ctx.fillStyle = '#fff'; ctx.fillText(an.f.ch.name.toUpperCase() + ' UŻYWA SUPERMOCY', 0, 34);
      ctx.restore();
    }
  }
  drawHUD(ctx) {
    const [a, b] = this.f;
    const bar = (f, right) => {
      const x0 = right ? W - 40 - 380 : 40, w = 380, y = 26, h = 22;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x0 - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#3a0d0d'; ctx.fillRect(x0, y, w, h);
      const frac = f.hp / f.maxHp;
      const grad = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      if (f.isBoss) { grad.addColorStop(0, '#ff3b3b'); grad.addColorStop(1, '#7a0e0e'); }
      else if (f.ch.legendary) { grad.addColorStop(0, '#ffd700'); grad.addColorStop(1, '#ff8c00'); }
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
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; const nm = (f.isBoss ? '👹 ' : '') + f.ch.name.toUpperCase() + (f.ch.legendary ? ' ★' : '') + (f.isBoss && this.bossMod ? ' ' + this.bossMod.name : '');
      const nx = right ? x0 + w : x0; ctx.strokeText(nm, nx, y + h + 26); ctx.fillStyle = f.ch.legendary ? '#ffd700' : '#fff'; ctx.fillText(nm, nx, y + h + 26);
      ctx.font = '600 12px Rubik, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`${Math.ceil(f.hp)} / ${f.maxHp} HP`, nx, y + h + 44);
      // pasek MOCY
      const my = y + h + 52, mw = 240, mh = 9, mx0 = right ? x0 + w - mw : x0, ready = f.meter >= METER_MAX;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(mx0 - 2, my - 2, mw + 4, mh + 4);
      ctx.fillStyle = '#1e1e33'; ctx.fillRect(mx0, my, mw, mh);
      const mf = mw * (f.meter / METER_MAX);
      ctx.fillStyle = ready ? (Math.sin(this.t * 12) > 0 ? '#fff' : f.ch.glove) : f.ch.glove;
      if (right) ctx.fillRect(mx0 + mw - mf, my, mf, mh); else ctx.fillRect(mx0, my, mf, mh);
      const sp = SPECIALS[f.ch.id];
      ctx.font = ready ? '18px Bangers, Impact, sans-serif' : '600 11px Rubik, sans-serif'; ctx.fillStyle = ready ? f.ch.glove : 'rgba(255,255,255,0.6)';
      const keyHint = f.ctrl instanceof AIController ? '' : (this.opts.mode === 'versus' ? (f.side === 0 ? ' [E]' : ' [O]') : (isTouchDevice() && !usingKeyboard ? ' [MOC]' : ' [E]'));
      const mtxt = ready ? `${sp ? sp.icon + ' ' : ''}MOC GOTOWA!${keyHint}` : `MOC: ${sp ? sp.name : ''}`;
      if (ready) { ctx.lineWidth = 4; ctx.strokeText(mtxt, nx, my + mh + 20); }
      ctx.fillText(mtxt, nx, my + mh + 20);
      if (f.combo >= 2) { ctx.font = '20px Bangers, Impact, sans-serif'; ctx.fillStyle = f.ch.glove; ctx.lineWidth = 4; ctx.strokeText(f.combo + 'x COMBO', nx, my + mh + 46); ctx.fillText(f.combo + 'x COMBO', nx, my + mh + 46); }
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
        big(`${a.ch.name.toUpperCase()}  vs  ${b.ch.name.toUpperCase()}`, 250, '#ffd700', 56, this.p1Taunt && t > 0.75 ? this.p1Taunt : `„${b.ch.taunt}”`);
        ctx.restore();
      } else { const s = 1 + Math.max(0, 1.8 - t) * 2; ctx.save(); ctx.translate(W / 2, 260); ctx.scale(s, s); ctx.translate(-W / 2, -260); big('WALCZ!', 260, '#ff4fa3', 96); ctx.restore(); }
    }
    if (this.phase === 'ko') {
      const t = this.phaseT; const s = 1 + Math.max(0, 0.5 - t) * 4;
      ctx.save(); ctx.translate(W / 2, 250); ctx.scale(s, s); ctx.translate(-W / 2, -250);
      big('K.O.!', 250, '#ff3b3b', 110, t > 1 ? `${this.f[this.winner].ch.name.toUpperCase()} WYGRYWA${this.perfect ? ' • PERFECT!' : ''}` : '');
      ctx.restore();
    }
  }
}

// ============================================================
//  Aplikacja (ekrany, kampania, pętla)
// ============================================================
// ============================================================
//  RANKING ONLINE (Supabase, konfiguracja w online-config.js)
// ============================================================
const ONLINE = {
  cfg: window.OPG_ONLINE || null, nick: '', pin: '', board: [], busy: false, lastSync: 0,
  enabled() { return !!(this.cfg && this.cfg.url && this.cfg.key); },
  loadSession() { try { const s = JSON.parse(localStorage.getItem('opg_online') || 'null'); if (s) { this.nick = s.nick; this.pin = s.pin; } } catch (e) {} },
  saveSession() { try { localStorage.setItem('opg_online', JSON.stringify({ nick: this.nick, pin: this.pin })); } catch (e) {} },
  logout() { this.nick = ''; this.pin = ''; try { localStorage.removeItem('opg_online'); } catch (e) {} },
  async rpc(name, params) {
    const r = await fetch(this.cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: this.cfg.key, Authorization: 'Bearer ' + this.cfg.key, 'Content-Type': 'application/json' }, body: JSON.stringify(params || {}) });
    if (!r.ok) { let msg = r.statusText; try { msg = (await r.json()).message || msg; } catch (e) {} throw new Error(msg); }
    return r.json();
  },
  summary() { const p = PROFILE.d; return { xp: p.xp, level: PROFILE.level(), wins: p.wins, fights: p.fights, best_streak: p.bestStreak, max_combo: p.maxCombo, survival_best: p.survivalBest, crowns: Object.values(p.crowns).reduce((a, b) => a + b, 0), trophies: Object.keys(p.trophies).length, fastest_win: p.fastestWin || null, chips: p.chips, bosses: Object.keys(p.bosses).length, casino_win: p.casinoBiggestWin, casino_loss: p.casinoBiggestLoss, casino_net: p.casinoWon - p.casinoLostTotal, jackpots: p.slotsJackpots }; },
  async login(nick, pin) {
    const res = await this.rpc('opg_login', { p_nick: nick, p_pin: pin });
    if (!res || !res.ok) throw new Error(res && res.error ? res.error : 'Błąd logowania');
    this.nick = nick; this.pin = pin; this.saveSession();
    if (res.profile && res.profile.fights > PROFILE.d.fights) { PROFILE.d = Object.assign(PROFILE.defaults(), res.profile); PROFILE.save(); return 'pulled'; }
    await this.sync(true); return 'pushed';
  },
  async sync(force) {
    if (!this.enabled() || !this.nick || this.busy) return; if (!force && Date.now() - this.lastSync < 15000) return;
    this.busy = true; try { await this.rpc('opg_save', { p_nick: this.nick, p_pin: this.pin, p_summary: this.summary(), p_profile: PROFILE.d }); this.lastSync = Date.now(); } catch (e) { console.warn('sync', e.message); } finally { this.busy = false; }
  },
  async fetchBoard() { this.board = await this.rpc('opg_board', {}); return this.board; },
};

// ============================================================
//  KASYNO U GAZDZIOLA: ruletka, blackjack, pojedynek z krupierem
// ============================================================
const ROULETTE_WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const ROULETTE_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const DEALER_SAY = {
  loan: ['Pożyczka? Proszę bardzo. Watol lubi odwiedzać dłużników.', 'Sześćset za trzy dni. Zegar tyka.'],
  vip: ['Witamy w VIP roomie. Tu przegrywa się z klasą.', 'Wysokie stawki, wysokie loty. Albo upadki.'],
  hello: ['Siadaj. Żetony na stół.', 'Dom zawsze wygrywa. Ale spróbuj.', 'Elegancko cię ogram.', 'Garnitur mam z twoich przegranych.'],
  win: ['Szczęście początkującego.', 'Trzymaj, zanim się rozmyślę.', 'Hm. Nie przyzwyczajaj się.', 'Dobra, tym razem twoje.'],
  lose: ['Dziękuję, bardzo dziękuję.', 'Może jeszcze jeden zakład? Dla odkucia.', 'Tak to jest, jak się nie umie.', 'Krupier nigdy nie płacze.', 'To były ładne żetony.'],
  big: ['NIE. To niemożliwe.', 'Kto ci to pozwolił?!', 'Sprawdzam stół... czysto. Cholera.'],
  bj: ['Blackjack. Ugh. Elegancko.', 'Dwadzieścia jeden. Zapamiętam cię.'],
  duel: ['Chcesz odkuć? To wychodź na ring.', 'Zdejmuję marynarkę. Nie oszczędzę cię.'],
};
const CASINO = {
  tab: 'roulette', chip: 50, bets: {}, spinning: false, history: [], angle: 0, ballAngle: 0, anim: null,
  bj: null,
  say(kind) { const el = $('#dealer-say'); if (el) el.textContent = pick(DEALER_SAY[kind]); },
  chips() { return PROFILE.d.chips; },
  pay(n) { PROFILE.d.chips = Math.max(0, Math.round(PROFILE.d.chips + n)); PROFILE.save(); this.refresh(); },
  track(delta, wagered) {
    const p = PROFILE.d; p.casinoRounds++; if (wagered) p.casinoWagered += wagered;
    if (delta < 0) { p.casinoLost += -delta; p.casinoLostTotal += -delta; p.jackpot += Math.round(-delta * 0.05); p.casinoBiggestLoss = Math.max(p.casinoBiggestLoss, -delta); }
    else if (delta > 0) { p.casinoWon += delta; p.casinoBiggestWin = Math.max(p.casinoBiggestWin, delta); }
    if (!p.vip && p.casinoWagered >= 10000) { p.vip = true; setTimeout(() => toast('👑', 'VIP ROOM odblokowany!', 'Wysokie stawki i złoty stół'), 500); }
    PROFILE.save();
  },
  chipSet() { return this.vipOn && PROFILE.d.vip ? [500, 1000, 2000, 5000, 10000] : [10, 50, 100, 500, 1000]; },
  refresh() {
    $('#chips-casino').textContent = '🪙 ' + this.chips(); $('#chips-title').textContent = this.chips();
    const p = PROFILE.d;
    $('#casino-stats').innerHTML = `Rundy: <b>${p.casinoRounds}</b> • Obrót: <b>${p.casinoWagered}</b><br>Wygrane: <b>${p.casinoWon}</b> • Przegrane: <b>${p.casinoLostTotal}</b><br>Do odkucia: <b>${p.casinoLost}</b><br>Rekord: <b>+${p.casinoBiggestWin}</b> / <b>-${p.casinoBiggestLoss}</b>`;
    $('#jackpot-box').innerHTML = `💰 JACKPOT <b>${p.jackpot}</b><small>rośnie z każdej przegranej • pojedynczy numer w ruletce albo 3x Król Pała na bandycie</small>`;
    const vb = $('#btn-vip'); vb.hidden = !p.vip; vb.textContent = this.vipOn ? '👑 VIP: WŁ' : '👑 VIP: WYŁ'; $('#s-casino').classList.toggle('vip', !!this.vipOn && p.vip);
    $('.dealer-hat').textContent = this.vipOn && p.vip ? '👑' : '🎩';
    const dbt = $('#debt-box');
    if (p.debt > 0) { const left = p.debtDue - Date.now(); dbt.hidden = false; dbt.innerHTML = `<b>💸 Dług: ${p.debt} żetonów</b><span>${left > 0 ? 'Spłata za ' + fmtLeft(left) + ', inaczej Gazdziol wysyła Watola.' : '<span style="color:#ff5c5c">TERMIN MINĄŁ. Watol już idzie.</span>'}</span><button class="btn btn-sm btn-primary" id="btn-repay" ${p.chips >= p.debt ? '' : 'disabled'}>SPŁAĆ ${p.debt}</button>`; $('#btn-repay').onclick = () => { if (p.chips >= p.debt) { this.pay(-p.debt); p.debt = 0; p.debtDue = 0; PROFILE.save(); toast('💸', 'Dług spłacony', 'Gazdziol kiwa głową z uznaniem'); this.refresh(); } }; }
    else if (p.chips < 100) { dbt.hidden = false; dbt.innerHTML = `<b>💸 Pusto w kieszeni?</b><span class="d">Gazdziol pożyczy 500 żetonów. Oddajesz 600 w 3 dni. Nie oddasz, przyjdzie Watol.</span><button class="btn btn-sm" id="btn-borrow">POŻYCZ 500</button>`; $('#btn-borrow').onclick = () => { p.debt = 600; p.debtDue = Date.now() + 3 * 86400000; p.debtCount++; this.pay(500); toast('💸', '+500 żetonów pożyczki', 'Oddajesz 600 do ' + new Date(p.debtDue).toLocaleDateString('pl-PL')); this.say('loan'); this.refresh(); }; }
    else dbt.hidden = true;
    const db = $('#duel-box'); db.hidden = p.casinoLost <= 0;
    if (p.casinoLost > 0) { db.innerHTML = `<b>Przegrałeś ${p.casinoLost} żetonów</b><span class="d">Wyzwij krupiera na pojedynek. Wygrasz, odzyskasz wszystko. Przegrasz, licznik się zeruje i żetony przepadają.</span><button class="btn btn-sm btn-primary" id="btn-duel">🥊 WYZWIJ GAZDZIOLA</button>`; $('#btn-duel').onclick = () => App.casinoDuel(); }
  },
  render() {
    $('#dealer-img').src = headSrc(ROSTER.find((c) => c.id === 'gazdziol') || ROSTER[0]);
    $$('[data-ctab]').forEach((b) => { b.classList.toggle('on', b.dataset.ctab === this.tab); b.onclick = () => { if (this.spinning || (this.bj && this.bj.phase === 'play') || this.slotSpinning || this.racing || (this.pk && this.pk.active)) { toast('✋', 'Chwila', this.pk && this.pk.active ? 'Dokończ rozdanie pokera' : this.bj && this.bj.phase === 'play' ? 'Dokończ rozdanie blackjacka' : 'Poczekaj na koniec gry'); return; } this.tab = b.dataset.ctab; this.render(); }; });
    this.refresh();
    const vb = $('#btn-vip'); vb.onclick = () => { this.vipOn = !this.vipOn; if (this.vipOn) this.say('vip'); this.render(); };
    if (this.tab === 'roulette') this.renderRoulette(); else if (this.tab === 'blackjack') this.renderBlackjack(); else if (this.tab === 'slots') this.renderSlots(); else if (this.tab === 'quick') this.renderQuick(); else if (this.tab === 'race') this.renderRace(); else if (this.tab === 'poker') this.renderPoker();
  },
  // ---------- JEDNORĘKI BANDYTA ----------
  renderSlots() {
    const g = $('#casino-game'); this.slotBet = this.slotBet || this.chipSet()[0];
    const syms = this.slotSyms();
    g.innerHTML = `<div class="slots"><div class="slot-title">🎰 JEDNORĘKI BANDYTA</div>
      <div class="reels">${[0, 1, 2].map((i) => `<div class="reel" id="reel${i}"><img src="${headSrc(this.slotState ? this.slotState[i] : syms[i % syms.length])}" alt=""></div>`).join('')}</div>
      <div class="slot-msg" id="slot-msg">${this.slotMsg || 'Trzy takie same głowy wygrywają. Trzy Króle Pały = JACKPOT.'}</div>
      <div>Stawka: <b style="color:var(--gold)">${this.slotBet}</b></div>${this.chipBar()}
      <div class="bj-ctrl"><button class="btn btn-primary btn-lg" id="slot-pull" ${this.chips() < this.slotBet || this.slotSpinning ? 'disabled' : ''}>🎰 CIĄGNIJ (${this.slotBet})</button></div>
      <div class="t-hint">Wypłaty: 3x Król Pała = JACKPOT (${PROFILE.d.jackpot}) • 3x legenda 40x • 3x ta sama głowa 15x • 2x ta sama + Król 5x • 2x ta sama 2x • jeden Król 1x (zwrot).</div></div>`;
    this.bindChips(); $$('[data-chip]').forEach((x) => x.addEventListener('click', () => { this.slotBet = this.chip; this.renderSlots(); }));
    $('#slot-pull').onclick = () => this.slotPull();
  },
  slotSyms() { return ROSTER; },
  slotPull() {
    if (this.slotSpinning || this.chips() < this.slotBet) return;
    const bet = this.slotBet; this.pay(-bet); this.slotSpinning = true; PROFILE.d.slotsSpins++;
    const syms = this.slotSyms(); const king = syms.find((c) => c.id === 'king_pala') || syms[0];
    // losowanie z lekką wagą na Króla (jackpot rzadki, ale realny)
    const roll = () => { const r = Math.random(); if (r < 0.09) return king; return pick(syms); };
    const res = [roll(), roll(), roll()];
    $('#slot-pull').disabled = true; SFX.ensure();
    const reels = [0, 1, 2].map((i) => $('#reel' + i));
    let tick = 0; const iv = setInterval(() => { tick++; reels.forEach((r, i) => { if (tick < 14 + i * 9) { r.querySelector('img').src = headSrc(pick(syms)); r.classList.add('spin'); } else { r.querySelector('img').src = headSrc(res[i]); r.classList.remove('spin'); } }); if (tick % 2 === 0) SFX.tone(500 + tick * 10, 0.03, 0.08, 'square', 1); if (tick >= 14 + 2 * 9) { clearInterval(iv); this.slotSettle(res, bet); } }, 70);
  },
  slotSettle(res, bet) {
    const p = PROFILE.d; const ids = res.map((c) => c.id); const king = ids.filter((i) => i === 'king_pala').length;
    let win = 0, msg = '';
    const allSame = ids[0] === ids[1] && ids[1] === ids[2];
    if (king === 3) { win = p.jackpot; msg = `💰 JACKPOT! ${win} żetonów!`; p.slotsJackpots++; p.jackpot = 1000; SFX.cheer(); SFX.bell(); this.say('big'); }
    else if (allSame && res[0].legendary) { win = bet * 40; msg = `3x ${res[0].name}! 40x stawki`; SFX.cheer(); this.say('big'); }
    else if (allSame) { win = bet * 15; msg = `3x ${res[0].name}! 15x stawki`; SFX.bell(); this.say('win'); }
    else { const counts = {}; ids.forEach((i) => counts[i] = (counts[i] || 0) + 1); const pair = Object.entries(counts).find(([, n]) => n === 2);
      if (pair && king === 1 && pair[0] !== 'king_pala') { win = bet * 5; msg = `Para + Król: 5x`; SFX.bell(); this.say('win'); }
      else if (pair) { win = bet * 2; msg = `Para ${ROSTER.find((c) => c.id === pair[0]).name}: 2x`; SFX.jump(); }
      else if (king >= 1) { win = bet; msg = 'Król Pała ratuje stawkę'; }
      else { msg = pick(['Nic. Głowy się nie zgadzają.', 'Pudło.', 'Gazdziol chowa żetony.']); this.say('lose'); SFX.hurt(); } }
    this.slotSpinning = false; this.slotState = res; this.slotMsg = msg;
    if (win) this.pay(win); this.track(win - bet, bet); this.checkTrophies(); this.renderSlots();
    if (win > bet) toast('🎰', msg, `+${win - bet} netto`);
  },
  // ---------- WYŚCIGI EKIPY ----------
  renderRace() {
    const g = $('#casino-game'); this.raceBet = this.raceBet || this.chipSet()[0];
    if (!this.race) this.newRace();
    const r = this.race;
    g.innerHTML = `<div class="race ${r.done ? 'done' : this.racing ? 'run' : 'bet'}"><canvas id="race-canvas" width="760" height="230"></canvas>
      <div class="race-comment" id="race-comment">${r.comment || 'Obstaw, kto pierwszy dobiegnie do liny. Kursy według formy.'}</div>
      <div class="racers">${r.runners.map((ru, i) => `<div class="racer ${r.pick === i ? 'on' : ''}" data-race="${i}"><img src="${headSrc(ru.ch)}" alt=""><div><div class="n">${ru.ch.name}</div><div class="f">${ru.formTxt}</div></div><div class="odds">${ru.odds.toFixed(1)}x</div></div>`).join('')}</div>
      <div class="stake">Stawka: <b style="color:var(--gold)">${this.raceBet}</b>${r.pick !== null ? ` na <b>${r.runners[r.pick].ch.name}</b> • wygrana <b style="color:var(--gold)">${Math.round(this.raceBet * r.runners[r.pick].odds)}</b>` : ''}</div>${this.chipBar()}
      <div class="bj-ctrl">${r.done ? `<button class="btn btn-primary" id="race-new">NOWY WYŚCIG</button>` : `<button class="btn btn-primary btn-lg" id="race-go" ${r.pick === null || this.chips() < this.raceBet || this.racing ? 'disabled' : ''}>🏁 START (${this.raceBet})</button>`}</div></div>`;
    this.bindChips(); $$('[data-chip]').forEach((x) => x.addEventListener('click', () => { this.raceBet = this.chip; this.renderRace(); }));
    $$('[data-race]').forEach((el) => el.onclick = () => { if (this.racing || r.done) return; r.pick = +el.dataset.race; this.renderRace(); });
    const go = $('#race-go'); if (go) go.onclick = () => this.startRace();
    const nw = $('#race-new'); if (nw) nw.onclick = () => { this.race = null; this.renderRace(); };
    this.drawRace();
  },
  newRace() {
    const runners = shuffle(ROSTER.filter((c) => c.id !== 'gazdziol')).slice(0, 4).map((ch) => { const form = rand(0.7, 1.3); return { ch, form, x: 0, v: 0, stun: 0, boost: 0, finished: 0, lane: 0 }; });
    const tot = runners.reduce((a, r) => a + Math.pow(r.form, 3), 0);
    runners.forEach((r, i) => { r.lane = i; const prob = Math.pow(r.form, 3) / tot; r.odds = Math.max(1.3, Math.round((0.88 / prob) * 10) / 10); r.formTxt = r.form > 1.15 ? '🔥 w formie' : r.form > 0.95 ? '👌 normalnie' : r.form > 0.8 ? '😴 zaspany' : '🤕 po wczorajszym'; });
    this.race = { runners, pick: null, done: false, t: 0, comment: '', order: [] };
  },
  drawRace() {
    const cv = $('#race-canvas'); if (!cv) return; const ctx = cv.getContext('2d'); const r = this.race; const Wr = 760, Hr = 230, x0 = 60, x1 = 700;
    ctx.clearRect(0, 0, Wr, Hr);
    ctx.fillStyle = '#3a3358'; ctx.fillRect(0, 0, Wr, Hr);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#8a5a2b' : '#7a4f24'; ctx.fillRect(0, 20 + i * 50, Wr, 48); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(0, 20 + i * 50 + 48); ctx.lineTo(Wr, 20 + i * 50 + 48); ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = '#fff'; ctx.fillRect(x0 - 2, 20, 3, 200); ctx.fillStyle = '#ffd700'; ctx.fillRect(x1, 20, 6, 200);
    ctx.fillStyle = '#000'; for (let y = 20; y < 220; y += 12) ctx.fillRect(x1, y, 6, 6);
    ctx.font = '600 11px Rubik, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('META', x1 - 4, 14);
    for (const ru of r.runners) {
      const px = x0 + ru.x * (x1 - x0), py = 20 + ru.lane * 50 + 44;
      ctx.save(); ctx.translate(px, py); ctx.scale(0.2, 0.2);
      const f = { x: 0, y: 0, facing: 1, state: ru.stun > 0 ? 'hit' : (this.racing && !ru.finished ? 'walk' : 'idle'), stateT: 0.2, stateDur: 1, animT: r.t * (ru.boost > 0 ? 2 : 1.4) + ru.lane, vy: 0, ch: ru.ch, cos: { gloves: null, shorts: null, hat: null, ko: null }, st: { frozen: 0, stun: 0, confused: 0, burn: 0, armor: 0, charm: 0, slow: 0, counter: 0, haste: 0, double: 0 }, ghost: 0, hurtFlash: 0, weapon: null, scale: 1, bigHead: false, isBoss: false, alive: true, upg: 0, meter: 0 };
      f.pose = computePose(f); drawFighter(ctx, f, r.t);
      ctx.restore();
      if (ru.boost > 0) { ctx.font = '18px sans-serif'; ctx.fillText('💨', px - 34, py - 20); }
      if (ru.stun > 0) { ctx.font = '18px sans-serif'; ctx.fillText('💫', px - 6, py - 58); }
      if (ru.finished) { ctx.font = '16px Bangers, Impact, sans-serif'; ctx.fillStyle = '#ffd700'; ctx.fillText(['🥇', '🥈', '🥉', '4.'][ru.finished - 1], px + 14, py - 30); }
      if (r.pick === ru.lane) { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(px - 6, py - 62); ctx.lineTo(px + 6, py - 62); ctx.lineTo(px, py - 52); ctx.closePath(); ctx.fill(); }
    }
  },
  startRace() {
    const r = this.race; if (this.racing || r.pick === null || this.chips() < this.raceBet) return;
    const bet = this.raceBet; this.pay(-bet); this.racing = true; $('#race-go').disabled = true; SFX.ensure(); SFX.bell();
    const rc = $('.race'); if (rc) { rc.classList.remove('bet'); rc.classList.add('run'); }
    const LINES = ['{n} potyka się o własne sznurówki!', '{n} znalazł energetyka!', '{n} zatrzymał się na kebaba!', '{n} sprintuje jak po ostatni autobus!', '{n} ogląda się za kimś z widowni!', '{n} dostał wiatr w plecy!'];
    let last = performance.now(), place = 0;
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; r.t += dt;
      for (const ru of r.runners) {
        if (ru.finished) continue;
        ru.stun = Math.max(0, ru.stun - dt); ru.boost = Math.max(0, ru.boost - dt);
        if (Math.random() < dt * 0.25) { if (Math.random() < 0.5) { ru.stun = 0.9; this.raceSay(pick(LINES.filter((l) => /potyka|kebab|ogląda/.test(l))).replace('{n}', ru.ch.name)); } else { ru.boost = 1.2; this.raceSay(pick(LINES.filter((l) => /energetyk|sprint|wiatr/.test(l))).replace('{n}', ru.ch.name)); } }
        const speed = ru.stun > 0 ? 0 : (0.16 * ru.form * (ru.boost > 0 ? 1.8 : 1) * rand(0.7, 1.3));
        ru.x = Math.min(1, ru.x + speed * dt);
        if (ru.x >= 1) { ru.finished = ++place; r.order.push(ru); if (place === 1) { this.raceSay(`🏁 ${ru.ch.name.toUpperCase()} NA MECIE!`); SFX.cheer(); } }
      }
      this.drawRace();
      if (place < 4 && r.t < 40) requestAnimationFrame(step); else this.raceSettle(bet);
    };
    requestAnimationFrame(step);
  },
  raceSay(t) { this.race.comment = t; const el = $('#race-comment'); if (el) el.textContent = t; },
  raceSettle(bet) {
    const r = this.race; this.racing = false; r.done = true;
    const winner = r.order[0] || r.runners.slice().sort((a, b) => b.x - a.x)[0]; const mine = r.runners[r.pick];
    if (winner === mine) { const w = Math.round(bet * mine.odds); this.pay(w); this.track(w - bet, bet); PROFILE.d.raceWins++; this.raceSay(`🏆 ${mine.ch.name} wygrywa! +${w - bet} żetonów`); this.say(mine.odds >= 4 ? 'big' : 'win'); toast('🏁', `${mine.ch.name} pierwszy!`, `+${w - bet} netto (kurs ${mine.odds.toFixed(1)}x)`); SFX.bell(); }
    else { this.track(-bet, bet); this.raceSay(`${winner.ch.name} wygrywa. ${mine.ch.name} przybiega ${mine.finished || 4}. -${bet} żetonów.`); this.say('lose'); SFX.hurt(); }
    this.checkTrophies(); this.renderRace();
  },
  // ---------- POKER (Texas hold'em) ----------
  handRank(cards) { // najlepsze 5 z 5-7 kart -> [kategoria, ...tiebreak]
    const RV = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const combos = []; const n = cards.length;
    if (n < 5) return [0, ...cards.map((c) => RV[c.r]).sort((a, b) => b - a)]; // przed riverem (np. wszyscy spasowali): tylko wysoka karta
    const rec = (start, pickd) => { if (pickd.length === 5) { combos.push(pickd); return; } for (let i = start; i < n; i++) rec(i + 1, pickd.concat([cards[i]])); };
    rec(0, []);
    let best = null;
    for (const c5 of combos) {
      const vals = c5.map((c) => RV[c.r]).sort((a, b) => b - a); const suits = c5.map((c) => c.su);
      const flush = suits.every((su) => su === suits[0]);
      const uniq = [...new Set(vals)]; let straight = 0;
      if (uniq.length === 5 && uniq[0] - uniq[4] === 4) straight = uniq[0]; else if (uniq.join() === '14,5,4,3,2') straight = 5;
      const counts = {}; vals.forEach((v) => counts[v] = (counts[v] || 0) + 1);
      const groups = Object.entries(counts).map(([v, c]) => [c, +v]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
      let score;
      if (straight && flush) score = [8, straight];
      else if (groups[0][0] === 4) score = [7, groups[0][1], groups[1][1]];
      else if (groups[0][0] === 3 && groups[1][0] === 2) score = [6, groups[0][1], groups[1][1]];
      else if (flush) score = [5, ...vals];
      else if (straight) score = [4, straight];
      else if (groups[0][0] === 3) score = [3, groups[0][1], ...groups.slice(1).map((g) => g[1])];
      else if (groups[0][0] === 2 && groups[1][0] === 2) score = [2, groups[0][1], groups[1][1], groups[2][1]];
      else if (groups[0][0] === 2) score = [1, groups[0][1], ...groups.slice(1).map((g) => g[1])];
      else score = [0, ...vals];
      if (!best || this.cmpRank(score, best) > 0) best = score;
    }
    return best;
  },
  cmpRank(a, b) { a = a || [0]; b = b || [0]; for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; },
  rankName(sc) { return ['wysoka karta', 'para', 'dwie pary', 'trójka', 'strit', 'kolor', 'full', 'kareta', 'poker'][sc[0]]; },
  // Stół budowany raz, potem aktualizowany w miejscu (karty nie skaczą przy każdym ruchu)
  renderPoker() {
    const g = $('#casino-game'); const pk = this.pk;
    if (!pk) {
      const opts = [200, 500, 1000, 2000].filter((v) => v <= Math.max(200, this.chips()));
      g.innerHTML = `<div class="poker"><div class="slot-title">♠️ TEXAS HOLD'EM</div><div class="t-hint">Grasz z trzema osobami z ekipy. Każda ma swój styl: jedna blefuje, jedna pasuje przy byle czym, jedna wchodzi all-in. Wybierz wpisowe (buy-in). Wychodząc od stołu, zabierasz cały stack.</div>
        <div class="bj-ctrl">${opts.map((v) => `<button class="btn ${v === 500 ? 'btn-primary' : ''}" data-buyin="${v}" ${this.chips() < v ? 'disabled' : ''}>BUY-IN ${v}</button>`).join('')}</div>
        <div class="t-hint">Zasady: blindy, potem flop (3 karty), turn, river. Wygrywa najlepszy układ z 5 kart (własne 2 + wspólne). Podbicie = o pół puli.</div></div>`;
      $$('[data-buyin]').forEach((b) => b.onclick = () => this.pokerStart(+b.dataset.buyin));
      return;
    }
    if (!pk.dom || !document.getElementById('pk-table')) this.pokerBuild();
    this.pokerUpdate();
  },
  pokerBuild() {
    const g = $('#casino-game'), pk = this.pk;
    const seat = (i) => { const pl = pk.players[i]; return `<div class="seat ${i === 0 ? 'me' : ''}" id="pk-seat-${i}">
      <div class="marker" id="pk-mark-${i}"></div><div class="act" id="pk-act-${i}" hidden></div>
      <div class="seat-top"><img src="${headSrc(pl.ch)}" alt=""><div><div class="n">${i === 0 ? 'TY' : pl.ch.name}<small>${pl.style}</small></div><div class="stack" id="pk-stack-${i}"></div></div></div>
      <div class="cards" id="pk-cards-${i}"></div><div class="hand-name" id="pk-rank-${i}"></div>
      <div class="bet-stack" id="pk-bet-${i}"></div></div>`; };
    g.innerHTML = `<div class="poker" id="pk-table">
      <div class="pk-banner" id="pk-banner"></div>
      <div class="pk-layout">
        <div class="poker-table">
          <div class="pk-row">${seat(1)}${seat(2)}${seat(3)}</div>
          <div class="community"><div class="street" id="pk-street"></div><div class="pot" id="pk-pot"></div><div class="cards" id="pk-board"></div></div>
          <div class="pk-row me-row">${seat(0)}</div>
        </div>
        <div class="pk-log"><div class="pk-log-title">Przebieg rozdania</div><div id="pk-log"></div></div>
      </div>
      <div class="poker-msg" id="pk-msg"></div>
      <div class="pk-hint" id="pk-hint"></div>
      <div class="bj-ctrl" id="pk-ctrl"></div></div>`;
    pk.dom = true;
  },
  cardHtml(c) { return `<div>${c.r}${c.su}</div><div class="s">${c.su}</div><div class="b">${c.r}${c.su}</div>`; },
  syncCards(el, cards, hidden) {
    if (el.children.length > cards.length) el.innerHTML = '';
    cards.forEach((c, i) => {
      let d = el.children[i];
      if (!d) { d = document.createElement('div'); d.className = 'card-p ' + (hidden ? 'back' : (['♥', '♦'].includes(c.su) ? 'red' : '')); if (!hidden) d.innerHTML = this.cardHtml(c); el.appendChild(d); }
      else if (d.classList.contains('back') && !hidden) { d.className = 'card-p flip ' + (['♥', '♦'].includes(c.su) ? 'red' : ''); d.innerHTML = this.cardHtml(c); }
    });
  },
  pokerUpdate() {
    const pk = this.pk; if (!pk || !document.getElementById('pk-table')) return;
    const me = pk.players[0], showdown = pk.phase === 'over' && pk.showdown;
    const maxBet = Math.max(...pk.players.map((p) => p.bet));
    pk.players.forEach((pl, i) => {
      const seat = $('#pk-seat-' + i);
      seat.classList.toggle('turn', pk.active && pk.turn === i); seat.classList.toggle('folded', pl.folded && pl.inHand); seat.classList.toggle('out', !pl.inHand && pl.stack <= 0);
      seat.classList.toggle('winner', !!(pk.winners && pk.winners.has(pl)));
      $('#pk-stack-' + i).innerHTML = `🪙 ${pl.stack}${pl.allin && pl.inHand ? ' <span class="allin-tag">ALL-IN</span>' : ''}`;
      const act = $('#pk-act-' + i); act.hidden = !pl.action; act.textContent = pl.action || ''; act.className = 'act ' + (pl.actKind || '');
      const mk = $('#pk-mark-' + i); mk.innerHTML = (pk.dealer === i ? '<span class="mk d">D</span>' : '') + (pk.sbI === i ? '<span class="mk sb">SB</span>' : '') + (pk.bbI === i ? '<span class="mk bb">BB</span>' : '');
      const bet = $('#pk-bet-' + i); bet.innerHTML = pl.bet ? `<span class="chipstack">${'●'.repeat(Math.min(5, Math.ceil(pl.bet / Math.max(1, pk.bb))))}</span> ${pl.bet}` : ''; bet.classList.toggle('max', pl.bet > 0 && pl.bet === maxBet);
      const hidden = i !== 0 && !showdown; const cardsEl = $('#pk-cards-' + i);
      if (pl.folded && i !== 0) cardsEl.classList.add('dim'); else cardsEl.classList.remove('dim');
      this.syncCards(cardsEl, pl.cards, hidden && !pl.folded ? true : (pl.folded && i !== 0 ? true : false));
      $('#pk-rank-' + i).textContent = (showdown && !pl.folded && pl.rank) ? this.rankName(pl.rank).toUpperCase() : '';
    });
    this.syncCards($('#pk-board'), pk.board, false);
    $('#pk-pot').innerHTML = `PULA <b>${pk.pot}</b>${maxBet ? ` <small>+ na stole ${pk.players.reduce((a, p) => a + p.bet, 0)}</small>` : ''}`;
    $('#pk-street').textContent = ['PRE-FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'][pk.street] || '';
    const banner = $('#pk-banner');
    if (pk.phase === 'over') { banner.textContent = 'ROZDANIE ZAKOŃCZONE'; banner.className = 'pk-banner over'; }
    else if (pk.active && pk.turn === 0) { banner.textContent = `TWÓJ RUCH${pk.toCall(0) ? ' • do sprawdzenia ' + Math.min(pk.toCall(0), me.stack) : ' • możesz czekać'}`; banner.className = 'pk-banner mine'; }
    else if (pk.active) { const t = pk.players[pk.turn]; banner.textContent = `RUCH: ${t ? t.ch.name.toUpperCase() : ''} myśli...`; banner.className = 'pk-banner theirs'; }
    else { banner.textContent = pk.msg || ''; banner.className = 'pk-banner'; }
    const msg = $('#pk-msg'); msg.textContent = pk.msg || ''; msg.className = 'poker-msg ' + (pk.msgWin ? 'win' : '');
    const hint = $('#pk-hint');
    if (me.cards.length === 2 && !me.folded && pk.phase !== 'over') { const r = pk.board.length >= 3 ? this.handRank(me.cards.concat(pk.board)) : null; hint.textContent = r ? `Masz teraz: ${this.rankName(r)}` : `Twoje karty: ${me.cards.map((c) => c.r + c.su).join(' ')}`; } else hint.textContent = '';
    const ctrl = $('#pk-ctrl');
    if (pk.phase === 'over') ctrl.innerHTML = `<button class="btn btn-primary btn-lg" id="pk-next">NASTĘPNE ROZDANIE</button><button class="btn btn-ghost" id="pk-leave">Wstań od stołu (${me.stack})</button>`;
    else if (pk.turn === 0 && pk.active) { const tc = Math.min(pk.toCall(0), me.stack); ctrl.innerHTML = `<button class="btn btn-fold" id="pk-fold">PAS</button><button class="btn btn-primary" id="pk-call">${tc === 0 ? 'CZEKAM' : 'SPRAWDZAM ' + tc}</button>${me.stack > pk.toCall(0) ? `<button class="btn" id="pk-raise">PODBIJAM DO ${me.bet + pk.raiseAmt(0)}</button>` : ''}<button class="btn btn-allin" id="pk-allin">ALL-IN ${me.stack}</button>`; }
    else ctrl.innerHTML = `<span class="t-hint">${pk.active ? 'Czekaj na swój ruch.' : ''}</span>`;
    const b = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    b('#pk-next', () => this.pokerNewHand()); b('#pk-leave', () => this.pokerLeave());
    b('#pk-fold', () => this.pokerAct(0, 'fold')); b('#pk-call', () => this.pokerAct(0, 'call')); b('#pk-raise', () => this.pokerAct(0, 'raise')); b('#pk-allin', () => this.pokerAct(0, 'allin'));
    const log = $('#pk-log'); if (log && pk.log) { log.innerHTML = pk.log.slice(-40).map((l) => `<div class="${l.cls || ''}">${l.t}</div>`).join(''); log.scrollTop = log.scrollHeight; }
  },
  pokerLog(t, cls) { const pk = this.pk; if (!pk) return; pk.log = pk.log || []; pk.log.push({ t, cls }); if (pk.log.length > 200) pk.log.shift(); },
  pokerStart(buyin) {
    if (this.chips() < buyin) return; this.pay(-buyin);
    const others = shuffle(ROSTER.filter((c) => c.id !== 'gazdziol')).slice(0, 3);
    const styles = [['blefiarz', 'bluff'], ['pasiwo', 'tight'], ['all-in', 'maniac']];
    const players = [{ ch: this.previewChar || ROSTER[0], stack: buyin, style: 'ty', ai: null }].concat(others.map((ch, i) => ({ ch, stack: buyin, style: styles[i][0], ai: styles[i][1] })));
    players.forEach((p) => { p.cards = []; p.bet = 0; p.folded = false; p.inHand = false; p.action = ''; p.allin = false; p.total = 0; });
    this.pk = { players, buyin, dealer: 0, sb: Math.max(5, Math.round(buyin / 100)), bb: Math.max(10, Math.round(buyin / 50)), board: [], pot: 0, street: 0, turn: -1, phase: 'over', msg: 'Siadasz do stołu. Kliknij „Następne rozdanie”.', active: false, log: [], handNo: 0,
      toCall: (i) => Math.max(0, Math.max(...this.pk.players.map((p) => p.bet)) - this.pk.players[i].bet),
      raiseAmt: (i) => { const pk = this.pk; const potNow = pk.pot + pk.players.reduce((a, p) => a + p.bet, 0); const raise = Math.max(pk.lastRaise || pk.bb, Math.round(potNow / 2 / 5) * 5); return Math.min(pk.players[i].stack, pk.toCall(i) + raise); } };
    this.pokerLog(`Stół: ${others.map((c) => c.name).join(', ')}. Buy-in ${buyin}, blindy ${this.pk.sb}/${this.pk.bb}.`, 'sys');
    this.pk.msg = 'Siadasz do stołu. Gazdziol tasuje…';
    this.renderPoker();
    const pk = this.pk; setTimeout(() => { if (this.pk === pk && !pk.active && pk.handNo === 0) this.pokerNewHand(); }, 1200); // pierwsze rozdanie samo rusza
  },
  pokerLeave() { const pk = this.pk; if (!pk || pk.active) return; clearTimeout(this.pkWatchdog); const me = pk.players[0]; this.pay(me.stack); this.track(me.stack - pk.buyin, pk.buyin); PROFILE.d.pokerWon += Math.max(0, me.stack - pk.buyin); if (me.stack > pk.buyin) this.say('win'); else if (me.stack < pk.buyin) this.say('lose'); this.pk = null; this.checkTrophies(); this.renderPoker(); },
  async pokerNewHand() {
    const pk = this.pk; if (!pk || pk.active) return;
    pk.players.forEach((p) => { p.cards = []; p.bet = 0; p.total = 0; p.folded = p.stack <= 0; p.inHand = p.stack > 0; p.action = ''; p.actKind = ''; p.allin = false; p.rank = null; });
    pk.winners = null; pk.showdown = false;
    const live = pk.players.filter((p) => p.inHand);
    if (!pk.players[0].inHand) { pk.msg = 'Zero żetonów. Wstajesz od stołu.'; this.renderPoker(); this.pokerLeave(); return; }
    if (live.length < 2) { pk.msg = 'Ograłeś wszystkich! Stół się rozchodzi.'; pk.phase = 'over'; this.renderPoker(); this.pokerLeave(); return; }
    pk.deck = this.newDeck(); pk.board = []; pk.pot = 0; pk.street = 0; pk.phase = 'play'; pk.active = true; pk.msg = ''; pk.msgWin = false; pk.lastRaise = pk.bb; pk.handNo++;
    do { pk.dealer = (pk.dealer + 1) % 4; } while (!pk.players[pk.dealer].inHand);
    const nextLive = (i) => { let j = i; do { j = (j + 1) % 4; } while (!pk.players[j].inHand); return j; };
    pk.sbI = nextLive(pk.dealer); pk.bbI = nextLive(pk.sbI);
    this.pokerLog(`— Rozdanie ${pk.handNo} — dealer: ${pk.dealer === 0 ? 'ty' : pk.players[pk.dealer].ch.name}`, 'sys');
    this.pokerPost(pk.sbI, pk.sb); this.pokerPost(pk.bbI, pk.bb);
    pk.players[pk.sbI].action = 'SB ' + pk.sb; pk.players[pk.bbI].action = 'BB ' + pk.bb;
    PROFILE.d.pokerHands++;
    this.renderPoker(); await this.wait(500);
    for (let k = 0; k < 2; k++) for (const p of pk.players) if (p.inHand) { p.cards.push(pk.deck.pop()); this.flip(); this.pokerUpdate(); await this.wait(180); }
    pk.turn = nextLive(pk.bbI); pk.acted = new Set();
    this.pokerUpdate(); this.pokerLoop();
  },
  pokerPost(i, amt) { const p = this.pk.players[i]; const a = Math.min(amt, p.stack); p.stack -= a; p.bet += a; p.total += a; if (p.stack === 0) p.allin = true; },
  async pokerLoop() {
    const pk = this.pk; if (!pk || !pk.active) return;
    try { await this.pokerLoopInner(pk); }
    catch (e) { console.error('poker loop', e); this.pokerRecover(pk, e); }
  },
  // stróż: jeśli stół stoi bez ruchu (ruch AI, który nigdy nie nadszedł), popycha rozdanie dalej
  pokerWatch(pk) {
    clearTimeout(this.pkWatchdog);
    this.pkWatchdog = setTimeout(() => {
      if (this.pk !== pk || !pk.active || pk.phase === 'over') return;
      if (pk.turn === 0) return; // czekamy na gracza, to nie zawieszenie
      const tick = pk.tick;
      pk.stuck = (pk.stuck || 0) + 1;
      this.pokerLog('Gazdziol: „Halo, gramy!” (popycham stół)', 'sys');
      if (pk.stuck > 3) { this.pokerRecover(pk, new Error('stół stanął')); return; }
      this.pokerLoop();
      if (pk.tick === tick) this.pokerWatch(pk);
    }, 6000);
  },
  async pokerLoopInner(pk) {
    pk.tick = (pk.tick || 0) + 1; this.pokerWatch(pk);
    const live = pk.players.filter((p) => p.inHand && !p.folded);
    if (live.length === 1) { await this.wait(700); this.pokerShowdown(); return; }
    const canAct = pk.players.filter((p) => p.inHand && !p.folded && !p.allin);
    const maxBet = Math.max(...pk.players.map((p) => p.bet));
    const roundDone = canAct.every((p) => pk.acted.has(p) && p.bet === maxBet) || canAct.length === 0;
    if (roundDone) { await this.wait(650); await this.pokerNextStreet(); return; }
    let guard = 0; while (!(pk.players[pk.turn].inHand && !pk.players[pk.turn].folded && !pk.players[pk.turn].allin)) { pk.turn = (pk.turn + 1) % 4; if (++guard > 8) { await this.pokerNextStreet(); return; } }
    this.pokerUpdate();
    if (pk.turn !== 0) { const t = pk.turn, tick = pk.tick; await this.wait(rand(1100, 1700)); if (this.pk === pk && pk.active && pk.turn === t && pk.tick === tick) this.pokerAI(t); }
  },
  pokerAct(i, act) {
    const pk = this.pk, p = pk.players[i]; if (!pk.active || pk.turn !== i) return;
    const toCall = pk.toCall(i); const who = i === 0 ? 'Ty' : p.ch.name;
    if (act === 'fold') { p.folded = true; p.action = 'PAS'; p.actKind = 'fold'; this.pokerLog(`${who}: pas`, 'fold'); }
    else if (act === 'call') { const a = Math.min(toCall, p.stack); this.pokerPost(i, a); p.action = a === 0 ? 'CZEKA' : (p.allin ? 'ALL-IN ' + p.bet : 'SPRAWDZA ' + a); p.actKind = a === 0 ? 'check' : (p.allin ? 'allin' : 'call'); this.pokerLog(a === 0 ? `${who}: czeka` : `${who}: sprawdza ${a}${p.allin ? ' (all-in)' : ''}`, p.actKind); }
    else if (act === 'raise' || act === 'allin') {
      const amt = act === 'allin' ? p.stack : pk.raiseAmt(i); const prevMax = Math.max(...pk.players.map((q) => q.bet));
      this.pokerPost(i, amt); const newMax = p.bet; if (newMax > prevMax) { pk.lastRaise = Math.max(pk.bb, newMax - prevMax); pk.acted = new Set(); }
      p.action = p.allin ? 'ALL-IN ' + p.bet : (prevMax === 0 ? 'STAWIA ' + p.bet : 'PODBIJA DO ' + p.bet); p.actKind = p.allin ? 'allin' : 'raise';
      this.pokerLog(p.allin ? `${who}: ALL-IN za ${p.bet}!` : (prevMax === 0 ? `${who}: stawia ${p.bet}` : `${who}: podbija do ${p.bet}`), p.actKind);
      if (p.allin || newMax >= prevMax * 2) SFX.tone(500, 0.12, 0.2, 'square', 1.4); 
    }
    pk.acted.add(p); this.flip(); pk.tick = (pk.tick || 0) + 1; pk.stuck = 0;
    pk.turn = (pk.turn + 1) % 4; this.pokerUpdate(); this.pokerLoop();
  },
  pokerStrength(i) {
    const pk = this.pk, p = pk.players[i]; const cards = p.cards.concat(pk.board);
    if (pk.board.length === 0) { const RV = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }; const a = RV[p.cards[0].r], b = RV[p.cards[1].r]; let s = (a + b) / 28; if (a === b) s += 0.35 + a / 60; if (p.cards[0].su === p.cards[1].su) s += 0.06; if (Math.abs(a - b) <= 2) s += 0.04; if (Math.max(a, b) >= 13) s += 0.08; return clamp(s, 0.05, 1); }
    const r = this.handRank(cards); const cat = r[0]; const boardOnly = this.handRank(pk.board.length >= 5 ? pk.board : pk.board.concat([{ r: '2', su: '♠' }, { r: '3', su: '♦' }].slice(0, 5 - pk.board.length)));
    let s = [0.15, 0.4, 0.6, 0.75, 0.85, 0.9, 0.96, 0.99, 1][cat]; if (cat === 1 && r[1] >= 11) s += 0.08; if (boardOnly && boardOnly[0] === cat && cat > 0) s -= 0.2; if (cat === 0 && r[1] === 14) s += 0.08;
    const suits = {}; cards.forEach((c) => suits[c.su] = (suits[c.su] || 0) + 1); if (pk.board.length < 5 && Object.values(suits).some((n) => n === 4)) s += 0.15;
    return clamp(s, 0.05, 1);
  },
  pokerAI(i) {
    const pk = this.pk, p = pk.players[i]; if (!pk.active || pk.turn !== i) return;
    const st = this.pokerStrength(i), toCall = pk.toCall(i), potNow = pk.pot + pk.players.reduce((a, q) => a + q.bet, 0);
    const costRatio = toCall / Math.max(1, potNow + toCall); const r = Math.random();
    let act = 'fold';
    if (p.ai === 'tight') { if (st > 0.75 && r < 0.6) act = 'raise'; else if (st > 0.55 || toCall === 0) act = 'call'; else if (st > 0.4 && costRatio < 0.15) act = 'call'; else act = toCall === 0 ? 'call' : 'fold'; }
    else if (p.ai === 'bluff') { if (r < 0.3 && toCall < p.stack * 0.4) act = 'raise'; else if (st > 0.6 && r < 0.6) act = 'raise'; else if (st > 0.3 || toCall === 0 || costRatio < 0.2) act = 'call'; else act = 'fold'; }
    else { if (st > 0.55 && r < 0.5) act = 'allin'; else if (st > 0.65 || (r < 0.15 && pk.street === 0)) act = 'allin'; else if (st > 0.35 || toCall === 0 || costRatio < 0.25) act = 'call'; else act = 'fold'; }
    if (act === 'raise' && p.stack <= toCall) act = 'call';
    if (act === 'fold' && toCall === 0) act = 'call';
    this.pokerAct(i, act);
  },
  async pokerNextStreet() {
    const pk = this.pk; if (!pk || !pk.active) return;
    try { await this.pokerNextStreetInner(pk); }
    catch (e) { console.error('poker street', e); this.pokerRecover(pk, e); }
  },
  async pokerNextStreetInner(pk) {
    pk.tick = (pk.tick || 0) + 1; this.pokerWatch(pk);
    for (const p of pk.players) { pk.pot += p.bet; p.bet = 0; if (!p.folded) { p.action = ''; p.actKind = ''; } }
    pk.acted = new Set(); pk.lastRaise = pk.bb;
    const live = pk.players.filter((p) => p.inHand && !p.folded), canAct = live.filter((p) => !p.allin);
    if (pk.street >= 3) { this.pokerShowdown(); return; }
    pk.street++; this.pokerUpdate();
    const n = pk.street === 1 ? 3 : 1; const names = ['', 'Flop', 'Turn', 'River'];
    await this.wait(400);
    const dealt = []; for (let k = 0; k < n; k++) { const c = pk.deck.pop(); pk.board.push(c); dealt.push(c.r + c.su); this.flip(); this.pokerUpdate(); await this.wait(520); }
    this.pokerLog(`${names[pk.street]}: ${dealt.join(' ')}`, 'sys');
    if (canAct.length <= 1) { await this.wait(700); this.pokerNextStreet(); return; }
    let t = pk.dealer; do { t = (t + 1) % 4; } while (!(pk.players[t].inHand && !pk.players[t].folded && !pk.players[t].allin)); pk.turn = t;
    this.pokerLoop();
  },
  async pokerShowdown() {
    const pk = this.pk; if (!pk || pk.phase === 'over') return;
    try { await this.pokerShowdownInner(pk); }
    catch (e) { console.error('poker showdown', e); this.pokerRecover(pk, e); }
    clearTimeout(this.pkWatchdog);
  },
  // awaryjne zamknięcie rozdania, żeby stół nigdy nie został „zawieszony” w stanie bez ruchu
  pokerRecover(pk, e) {
    if (!pk || pk.phase === 'over') return;
    for (const p of pk.players) { pk.pot += p.bet; p.bet = 0; }
    const live = pk.players.filter((p) => p.inHand && !p.folded);
    const n = Math.max(1, live.length); const share = Math.floor(pk.pot / n); for (const p of live) p.stack += share; if (live.length) live[0].stack += pk.pot - share * n;
    pk.pot = 0; pk.active = false; pk.turn = -1; pk.phase = 'over'; pk.showdown = live.length > 1; pk.winners = new Set(live);
    pk.msg = 'Krupier przerwał rozdanie i podzielił pulę' + (live.length ? ': ' + live.map((p) => p.ch.name).join(', ') : '') + '.'; pk.msgWin = live.includes(pk.players[0]);
    this.pokerLog(pk.msg + (e ? ' (' + (e.message || e) + ')' : ''), 'sys');
    this.pokerUpdate();
  },
  async pokerShowdownInner(pk) {
    for (const p of pk.players) { pk.pot += p.bet; p.bet = 0; }
    const live = pk.players.filter((p) => p.inHand && !p.folded);
    pk.active = false; pk.turn = -1;
    if (live.length > 1) { pk.showdown = true; pk.street = 4; this.pokerUpdate(); await this.wait(600);
      while (pk.board.length < 5) { pk.board.push(pk.deck.pop()); this.flip(); this.pokerUpdate(); await this.wait(520); } }
    for (const p of live) p.rank = live.length > 1 ? this.handRank(p.cards.concat(pk.board)) : null;
    const contrib = pk.players.map((p) => p.total); const levels = [...new Set(contrib.filter((c) => c > 0))].sort((a, b) => a - b);
    let prev = 0; const wins = {}; const msg = []; pk.winners = new Set();
    if (live.length === 1) { const w = live[0]; w.stack += pk.pot; wins[w.ch.id] = pk.pot; pk.winners.add(w); levels.length = 0; } // wszyscy spasowali: cała pula dla ostatniego
    for (const lv of levels) {
      const potPart = pk.players.reduce((a, p) => a + Math.max(0, Math.min(p.total, lv) - prev), 0);
      const elig = live.filter((p) => p.total >= lv);
      if (elig.length && potPart > 0) { let best = elig[0]; for (const p of elig) if (this.cmpRank(p.rank, best.rank) > 0) best = p; const winners = elig.filter((p) => this.cmpRank(p.rank, best.rank) === 0); const share = Math.floor(potPart / winners.length); for (const w of winners) { w.stack += share; wins[w.ch.id] = (wins[w.ch.id] || 0) + share; pk.winners.add(w); } }
      prev = lv;
    }
    const remainder = pk.pot - Object.values(wins).reduce((a, b) => a + b, 0); if (remainder > 0) live[0].stack += remainder;
    pk.pot = 0; pk.phase = 'over';
    const me = pk.players[0];
    if (live.length === 1) msg.push(`${live[0] === me ? 'Wszyscy spasowali, bierzesz pulę' : live[0].ch.name + ' zgarnia pulę, reszta spasowała'}: +${wins[live[0].ch.id] || 0}`);
    else for (const [id, amt] of Object.entries(wins)) { const p = pk.players.find((q) => q.ch.id === id); msg.push(`${p === me ? 'TY' : p.ch.name} wygrywa ${amt} (${this.rankName(p.rank)})`); }
    pk.msg = msg.join(' • '); pk.msgWin = !!wins[me.ch.id];
    for (const w of pk.winners) w.action = 'WYGRYWA'; for (const w of pk.winners) w.actKind = 'win';
    this.pokerLog(pk.msg, pk.msgWin ? 'win' : 'sys');
    if (wins[me.ch.id]) { SFX.bell(); this.say('win'); } else if (!me.folded) { SFX.hurt(); this.say('lose'); }
    this.pokerUpdate();
  },
  // ---------- SZYBKIE GRY ----------
  renderQuick() {
    const g = $('#casino-game'); this.quickBet = this.quickBet || this.chipSet()[0]; const hl = this.hl;
    g.innerHTML = `<div class="quick">
      <div class="quick-card"><h3>🎲 KOŚCI Z KRUPIEREM</h3><div class="dice" id="dice">${this.diceState ? this.diceState : '🎲 🎲 <span class="vs">vs</span> 🎲 🎲'}</div><div id="dice-msg" class="bj-msg" style="font-size:1.2rem">${this.diceMsg || 'Wyższa suma wygrywa 1:1. Remis bierze krupier.'}</div>
        <div class="bj-ctrl"><button class="btn btn-primary" id="dice-roll" ${this.chips() < this.quickBet ? 'disabled' : ''}>RZUĆ (${this.quickBet})</button></div></div>
      <div class="quick-card"><h3>🃏 WYŻEJ CZY NIŻEJ</h3>
        ${hl ? `<div class="cards"><div class="card-p ${['♥', '♦'].includes(hl.card.su) ? 'red' : ''}"><div>${hl.card.r}${hl.card.su}</div><div class="s">${hl.card.su}</div><div class="b">${hl.card.r}${hl.card.su}</div></div></div><div>Seria: <b>${hl.streak}</b> • Mnożnik <b style="color:var(--gold)">x${hl.mult.toFixed(2)}</b> • Do wypłaty: <b style="color:var(--gold)">${Math.round(hl.bet * hl.mult)}</b></div>
          <div class="bj-ctrl"><button class="btn" id="hl-hi">⬆ WYŻEJ</button><button class="btn" id="hl-lo">⬇ NIŻEJ</button><button class="btn btn-primary" id="hl-cash" ${hl.streak === 0 ? 'disabled' : ''}>WYPŁAĆ</button></div>` :
          `<div class="bj-msg" style="font-size:1.1rem">${this.hlMsg || 'Zgadnij, czy następna karta będzie wyżej czy niżej. Każde trafienie x1.5. As najwyższy, remis przegrywa.'}</div><div class="bj-ctrl"><button class="btn btn-primary" id="hl-start" ${this.chips() < this.quickBet ? 'disabled' : ''}>START (${this.quickBet})</button></div>`}</div>
      <div style="grid-column:1/-1"><div>Stawka: <b style="color:var(--gold)">${this.quickBet}</b></div>${this.chipBar()}</div></div>`;
    this.bindChips(); $$('[data-chip]').forEach((x) => x.addEventListener('click', () => { this.quickBet = this.chip; this.renderQuick(); }));
    $('#dice-roll').onclick = () => this.diceRoll();
    const st = $('#hl-start'); if (st) st.onclick = () => { if (this.chips() < this.quickBet) return; this.pay(-this.quickBet); this.hlDeck = this.newDeck(); this.hl = { card: this.hlDeck.pop(), bet: this.quickBet, mult: 1, streak: 0 }; this.renderQuick(); };
    const hi = $('#hl-hi'); if (hi) { hi.onclick = () => this.hlGuess(1); $('#hl-lo').onclick = () => this.hlGuess(-1); $('#hl-cash').onclick = () => { const w = Math.round(this.hl.bet * this.hl.mult); this.pay(w); this.track(w - this.hl.bet, this.hl.bet); this.hlMsg = `Wypłata ${w} żetonów (+${w - this.hl.bet})`; toast('🃏', 'Wypłata', `+${w - this.hl.bet} netto`); this.say('win'); this.hl = null; this.checkTrophies(); this.renderQuick(); }; }
  },
  cardRank(c) { return ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].indexOf(c.r); },
  hlGuess(dir) {
    const hl = this.hl; if (this.hlDeck.length < 5) this.hlDeck = this.newDeck(); const next = this.hlDeck.pop();
    const a = this.cardRank(hl.card), b = this.cardRank(next); const ok = dir > 0 ? b > a : b < a;
    SFX.ensure(); SFX.tone(700, 0.05, 0.1, 'triangle', 0.8);
    if (ok) { hl.card = next; hl.streak++; hl.mult *= 1.5; if (hl.streak % 3 === 0) SFX.bell(); this.renderQuick(); }
    else { this.track(-hl.bet, hl.bet); this.hlMsg = `${next.r}${next.su}. Pudło po serii ${hl.streak}. -${hl.bet} żetonów.`; this.say('lose'); SFX.hurt(); this.hl = null; this.renderQuick(); }
  },
  diceRoll() {
    if (this.chips() < this.quickBet) return; const bet = this.quickBet; this.pay(-bet); SFX.ensure();
    const d = () => 1 + Math.floor(Math.random() * 6); const me = [d(), d()], dl = [d(), d()]; const face = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    let t = 0; const iv = setInterval(() => { t++; $('#dice').innerHTML = `${face[d()]} ${face[d()]} <span class="vs">vs</span> ${face[d()]} ${face[d()]}`; SFX.tone(300 + t * 30, 0.03, 0.08, 'square', 1); if (t >= 10) { clearInterval(iv);
      const ms = me[0] + me[1], ds = dl[0] + dl[1]; this.diceState = `${face[me[0]]} ${face[me[1]]} <span class="vs">vs</span> ${face[dl[0]]} ${face[dl[1]]}`;
      if (ms > ds) { this.pay(bet * 2); this.track(bet, bet); this.diceMsg = `${ms} vs ${ds}. Wygrywasz +${bet}!`; this.say('win'); SFX.bell(); } else { this.track(-bet, bet); this.diceMsg = ms === ds ? `${ms} vs ${ds}. Remis, bierze krupier.` : `${ms} vs ${ds}. Krupier wyżej.`; this.say('lose'); SFX.hurt(); }
      this.checkTrophies(); this.renderQuick(); } }, 60);
  },
  chipBar() { const set = this.chipSet(); if (!set.includes(this.chip)) this.chip = set[0]; return `<div class="chip-select">${set.map((v) => `<button class="chip c${v} ${this.chip === v ? 'on' : ''}" data-chip="${v}">${v >= 1000 ? (v / 1000) + 'K' : v}</button>`).join('')}</div>`; },
  bindChips() { $$('[data-chip]').forEach((b) => b.onclick = () => { this.chip = +b.dataset.chip; $$('[data-chip]').forEach((x) => x.classList.toggle('on', +x.dataset.chip === this.chip)); }); },
  // ---------- RULETKA ----------
  betTotal() { return Object.values(this.bets).reduce((a, b) => a + b, 0); },
  renderRoulette() {
    const g = $('#casino-game');
    const cell = (key, label, cls) => `<div class="cell ${cls}" data-bet="${key}">${label}${this.bets[key] ? `<span class="bet">${this.bets[key]}</span>` : ''}</div>`;
    let grid = cell('n0', '0', 'green');
    for (let col = 0; col < 12; col++) for (let row = 0; row < 3; row++) { /* placeholder, budujemy niżej */ }
    // siatka: 3 rzędy x 12 kolumn (górny rząd 3,6,9..., dolny 1,4,7...)
    let cells = '';
    for (let row = 2; row >= 0; row--) { for (let col = 0; col < 12; col++) { const n = col * 3 + row + 1; cells += cell('n' + n, n, ROULETTE_RED.has(n) ? 'red' : 'black'); } cells += cell('col' + (row + 1), '2:1', 'out col'); }
    const dozens = `<div class="dozens">${cell('d1', '1-12', 'out')}${cell('d2', '13-24', 'out')}${cell('d3', '25-36', 'out')}</div>`;
    const outs = `<div class="outs">${cell('low', '1-18', 'out')}${cell('even', 'PARZ.', 'out')}${cell('red', '🔴', 'out')}${cell('black', '⚫', 'out')}${cell('odd', 'NIEP.', 'out')}${cell('high', '19-36', 'out')}</div>`;
    g.innerHTML = `<div class="roulette"><canvas id="wheel" width="240" height="240"></canvas><div><div class="table">${grid}${cells}${dozens}${outs}</div></div></div>
      ${this.chipBar()}
      <div class="roulette-ctrl"><span>Na stole: <b style="color:var(--gold)">${this.betTotal()}</b></span><button class="btn btn-sm btn-ghost" id="rl-clear">Zdejmij</button><button class="btn btn-sm btn-ghost" id="rl-repeat" ${this.lastBets ? '' : 'disabled'}>Powtórz</button><button class="btn btn-primary" id="rl-spin" ${this.betTotal() ? '' : 'disabled'}>🎡 KRĘĆ</button></div>
      <div class="history">${this.history.slice(-14).map((n) => `<span style="background:${n === 0 ? '#1e8449' : ROULETTE_RED.has(n) ? '#c0392b' : '#1a1a1a'}">${n}</span>`).join('')}</div>
      <div class="t-hint">Numer 35:1 • kolumna i tuzin 2:1 • kolor, parzyste, połówki 1:1. Kliknij pole, żeby postawić wybrany żeton.</div>`;
    this.bindChips();
    $$('[data-bet]').forEach((c) => c.onclick = () => { if (this.spinning) return; if (this.chips() - this.betTotal() < this.chip) { this.say('lose'); $('#dealer-say').textContent = 'Nie stać cię. Wygraj coś w ringu.'; return; } const k = c.dataset.bet; this.bets[k] = (this.bets[k] || 0) + this.chip; SFX.ensure(); SFX.tone(1400, 0.05, 0.15, 'square', 0.9); this.renderRoulette(); });
    $('#rl-clear').onclick = () => { if (!this.spinning) { this.bets = {}; this.renderRoulette(); } };
    $('#rl-repeat').onclick = () => { if (!this.spinning && this.lastBets) { const tot = Object.values(this.lastBets).reduce((a, b) => a + b, 0); if (tot <= this.chips()) { this.bets = Object.assign({}, this.lastBets); this.renderRoulette(); } } };
    $('#rl-spin').onclick = () => this.spin();
    this.drawWheel();
  },
  drawWheel(highlight) {
    const cv = $('#wheel'); if (!cv) return; const ctx = cv.getContext('2d'); const R = 112, cx = 120, cy = 120, n = ROULETTE_WHEEL.length;
    ctx.clearRect(0, 0, 240, 240);
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = '#5a3a1e'; ctx.beginPath(); ctx.arc(0, 0, R + 8, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(this.angle);
    for (let i = 0; i < n; i++) {
      const num = ROULETTE_WHEEL[i], a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
      ctx.fillStyle = num === 0 ? '#1e8449' : ROULETTE_RED.has(num) ? '#c0392b' : '#1a1a1a';
      if (highlight === num) ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.rotate((a0 + a1) / 2); ctx.fillStyle = highlight === num ? '#000' : '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(num, R - 14, 4); ctx.restore();
    }
    ctx.fillStyle = '#2b2540'; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd700'; ctx.font = '22px Bangers, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('OPG', 0, 8);
    ctx.restore();
    // kulka
    const br = R - 10; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + Math.cos(this.ballAngle) * br, cy + Math.sin(this.ballAngle) * br, 6, 0, Math.PI * 2); ctx.fill();
    // wskaźnik
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(cx - 8, 2); ctx.lineTo(cx + 8, 2); ctx.lineTo(cx, 18); ctx.closePath(); ctx.fill();
  },
  spin() {
    if (this.spinning || !this.betTotal()) return;
    const total = this.betTotal(); if (total > this.chips()) return;
    this.spinning = true; this.lastBets = Object.assign({}, this.bets);
    this.pay(-total);
    $('#rl-spin').disabled = true; $('#dealer-say').textContent = 'Kulka w ruchu. Zakłady zamknięte.';
    const result = ROULETTE_WHEEL[Math.floor(Math.random() * ROULETTE_WHEEL.length)];
    const idx = ROULETTE_WHEEL.indexOf(result), n = ROULETTE_WHEEL.length;
    // docelowy kąt: sektor wyniku pod wskaźnikiem (góra = -PI/2)
    const target = -Math.PI / 2 - (idx + 0.5) / n * Math.PI * 2;
    const start = this.angle % (Math.PI * 2), turns = 5 + Math.floor(Math.random() * 3);
    const end = target - turns * Math.PI * 2 - Math.floor((start - target) / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2 * 0;
    const dur = 4200, t0 = performance.now();
    SFX.ensure();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      this.angle = start + (end - start) * e;
      this.ballAngle = -this.angle * 2.2 + p * 3;
      if (p >= 1) this.ballAngle = -Math.PI / 2;
      if (Math.floor(p * 40) !== Math.floor((p - 0.01) * 40) && p < 0.9) SFX.tone(600 + p * 200, 0.02, 0.06, 'square', 1);
      this.drawWheel(p >= 1 ? result : undefined);
      if (p < 1) this.anim = requestAnimationFrame(step); else this.settle(result, total);
    };
    this.anim = requestAnimationFrame(step);
  },
  settle(result, total) {
    let win = 0;
    for (const [k, amt] of Object.entries(this.bets)) {
      if (k === 'n' + result) win += amt * 36;
      else if (result !== 0) {
        if (k === 'red' && ROULETTE_RED.has(result)) win += amt * 2;
        if (k === 'black' && !ROULETTE_RED.has(result)) win += amt * 2;
        if (k === 'even' && result % 2 === 0) win += amt * 2;
        if (k === 'odd' && result % 2 === 1) win += amt * 2;
        if (k === 'low' && result <= 18) win += amt * 2;
        if (k === 'high' && result >= 19) win += amt * 2;
        if (k === 'd1' && result <= 12) win += amt * 3; if (k === 'd2' && result >= 13 && result <= 24) win += amt * 3; if (k === 'd3' && result >= 25) win += amt * 3;
        if (k.startsWith('col') && (result - 1) % 3 + 1 === +k.slice(3)) win += amt * 3;
      }
    }
    this.history.push(result); this.spinning = false;
    const delta = win - total; this.track(delta, total);
    if (this.bets['n' + result]) { PROFILE.d.casinoStraight++; const jp = PROFILE.d.jackpot; win += jp; PROFILE.d.jackpot = 1000; setTimeout(() => { toast('💰', `JACKPOT ${jp}!`, 'Pojedynczy numer w ruletce'); SFX.cheer(); }, 400); }
    if (win > 0) this.pay(win);
    const col = result === 0 ? 'zielone' : ROULETTE_RED.has(result) ? 'czerwone' : 'czarne';
    if (delta > 0) { this.say(delta >= total * 10 ? 'big' : 'win'); toast('🎡', `Wypadło ${result} (${col})`, `+${delta} żetonów netto`); SFX.bell(); if (delta >= total * 10) SFX.cheer(); }
    else if (delta === 0) { $('#dealer-say').textContent = `${result}. Wychodzisz na zero. Nudno.`; }
    else { this.say('lose'); toast('🎡', `Wypadło ${result} (${col})`, `-${-delta} żetonów`); SFX.hurt(); }
    this.bets = {};
    this.checkTrophies();
    setTimeout(() => { this.renderRoulette(); $$('.cell').forEach((c) => c.classList.toggle('hit', c.dataset.bet === 'n' + result)); }, 300);
  },
  // ---------- BLACKJACK ----------
  newDeck() { const d = []; for (let k = 0; k < 4; k++) for (const su of ['♠', '♥', '♦', '♣']) for (const r of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) d.push({ r, su }); return shuffle(d); },
  val(hand) { let t = 0, aces = 0; for (const c of hand) { if (c.r === 'A') { aces++; t += 11; } else if (['J', 'Q', 'K'].includes(c.r)) t += 10; else t += +c.r; } while (t > 21 && aces) { t -= 10; aces--; } return t; },
  isBJ(h) { return h.length === 2 && this.val(h) === 21; },
  draw() { if (!this.deck || this.deck.length < 20) this.deck = this.newDeck(); return this.deck.pop(); },
  renderBlackjack() {
    const g = $('#casino-game'); const b = this.bj;
    const card = (c, hidden) => hidden ? '<div class="card-p back"></div>' : `<div class="card-p ${['♥', '♦'].includes(c.su) ? 'red' : ''}"><div>${c.r}${c.su}</div><div class="s">${c.su}</div><div class="b">${c.r}${c.su}</div></div>`;
    if (!b || b.phase === 'bet') {
      this.bjBet = this.bjBet || 50;
      g.innerHTML = `<div class="bj"><div class="bj-msg">${b && b.msg ? b.msg : 'BLACKJACK'}</div><div class="hand"><div class="hand-label">KRUPIER</div><div class="cards">${b ? b.dealer.map((c) => card(c)).join('') : ''}</div></div>
        ${b ? b.hands.map((h, i) => `<div class="hand"><div class="hand-label">TY${b.hands.length > 1 ? ' ' + (i + 1) : ''}<b>${this.val(h.cards)}</b></div><div class="cards">${h.cards.map((c) => card(c)).join('')}</div></div>`).join('') : '<div class="hand"><div class="hand-label">TY</div><div class="cards"></div></div>'}
        <div>Stawka: <b style="color:var(--gold)">${this.bjBet}</b></div>${this.chipBar()}
        <div class="bj-ctrl"><button class="btn btn-sm btn-ghost" id="bj-minus">−</button><button class="btn btn-sm btn-ghost" id="bj-plus">+</button><button class="btn btn-primary" id="bj-deal" ${this.chips() < this.bjBet ? 'disabled' : ''}>🃏 ROZDAJ (${this.bjBet})</button></div>
        <div class="t-hint">Blackjack płaci 3:2. Krupier dobiera do 16, stoi na 17. Podwojenie na dwóch kartach, split par.</div></div>`;
      this.bindChips();
      $$('[data-chip]').forEach((x) => x.addEventListener('click', () => { this.bjBet = this.chip; this.renderBlackjack(); }));
      $('#bj-minus').onclick = () => { this.bjBet = Math.max(10, this.bjBet - this.chip); this.renderBlackjack(); };
      $('#bj-plus').onclick = () => { this.bjBet = Math.min(this.chips(), this.bjBet + this.chip); this.renderBlackjack(); };
      $('#bj-deal').onclick = () => this.bjDeal();
      return;
    }
    const cur = b.hands[b.cur]; const done = b.phase === 'done';
    g.innerHTML = `<div class="bj"><div class="bj-msg ${b.msgLose ? 'lose' : ''}">${b.msg || ''}</div>
      <div class="hand"><div class="hand-label">KRUPIER${done || b.reveal ? `<b>${this.val(b.dealer)}</b>` : ''}</div><div class="cards">${b.dealer.map((c, i) => card(c, i === 1 && !b.reveal && !done)).join('')}</div></div>
      ${b.hands.map((h, i) => `<div class="hand ${!done && i === b.cur ? 'active' : ''}"><div class="hand-label">TY${b.hands.length > 1 ? ' ' + (i + 1) : ''} • ${h.bet}<b>${this.val(h.cards)}${h.result ? ' • ' + h.result : ''}</b></div><div class="cards">${h.cards.map((c) => card(c)).join('')}</div></div>`).join('')}
      <div class="bj-ctrl">${done ? `<button class="btn btn-primary" id="bj-again">JESZCZE RAZ</button><button class="btn btn-ghost" id="bj-new">Zmień stawkę</button>` : b.dealing ? '<span class="t-hint">Krupier wykłada karty...</span>' : `<button class="btn btn-primary" id="bj-hit">DOBIERZ</button><button class="btn" id="bj-stand">STÓJ</button>${cur.cards.length === 2 && this.chips() >= cur.bet ? `<button class="btn" id="bj-double">PODWÓJ</button>` : ''}${cur.cards.length === 2 && b.hands.length === 1 && this.rank(cur.cards[0]) === this.rank(cur.cards[1]) && this.chips() >= cur.bet ? `<button class="btn" id="bj-split">SPLIT</button>` : ''}`}</div></div>`;
    if (done) { $('#bj-again').onclick = () => { if (this.chips() >= this.bjBet) this.bjDeal(); else { this.bj = { phase: 'bet', dealer: [], hands: [], msg: 'Brak żetonów na tę stawkę' }; this.renderBlackjack(); } }; $('#bj-new').onclick = () => { this.bj = null; this.renderBlackjack(); }; return; }
    if (b.dealing) return;
    $('#bj-hit').onclick = () => this.bjHit(); $('#bj-stand').onclick = () => this.bjStand();
    const d = $('#bj-double'); if (d) d.onclick = () => this.bjDouble();
    const sp = $('#bj-split'); if (sp) sp.onclick = () => this.bjSplit();
  },
  rank(c) { return ['J', 'Q', 'K', '10'].includes(c.r) ? 10 : c.r; },
  wait(ms) { return new Promise((r) => setTimeout(r, ms)); },
  flip() { SFX.ensure(); SFX.noise(0.05, 3000, 1, 0.12, 'highpass'); SFX.tone(900, 0.04, 0.08, 'triangle', 0.7); },
  async bjDeal() {
    const bet = this.bjBet; if (this.chips() < bet || (this.bj && this.bj.dealing)) return;
    this.pay(-bet);
    this.bj = { phase: 'play', dealer: [], hands: [{ cards: [], bet, result: null }], cur: 0, reveal: false, msg: '', dealing: true };
    const b = this.bj;
    for (const who of ['p', 'd', 'p', 'd']) { (who === 'p' ? b.hands[0].cards : b.dealer).push(this.draw()); this.flip(); this.renderBlackjack(); await this.wait(380); }
    b.dealing = false;
    if (this.isBJ(b.hands[0].cards) || this.isBJ(b.dealer)) { this.bjFinish(); return; }
    this.renderBlackjack();
  },
  async bjHit() { const b = this.bj, h = b.hands[b.cur]; if (b.dealing) return; h.cards.push(this.draw()); this.flip(); this.renderBlackjack(); if (this.val(h.cards) > 21) { h.result = 'FURA'; b.dealing = true; await this.wait(500); b.dealing = false; this.bjNext(); } else if (this.val(h.cards) === 21) { b.dealing = true; await this.wait(400); b.dealing = false; this.bjNext(); } },
  bjStand() { if (this.bj.dealing) return; this.bjNext(); },
  async bjDouble() { const b = this.bj, h = b.hands[b.cur]; if (b.dealing || this.chips() < h.bet) return; this.pay(-h.bet); h.bet *= 2; h.cards.push(this.draw()); this.flip(); if (this.val(h.cards) > 21) h.result = 'FURA'; b.dealing = true; this.renderBlackjack(); await this.wait(500); b.dealing = false; this.bjNext(); },
  async bjSplit() { const b = this.bj, h = b.hands[0]; if (b.dealing || this.chips() < h.bet) return; this.pay(-h.bet); const c2 = h.cards.pop(); b.hands.push({ cards: [c2], bet: h.bet, result: null }); b.dealing = true; this.renderBlackjack(); await this.wait(300); h.cards.push(this.draw()); this.flip(); this.renderBlackjack(); await this.wait(350); b.hands[1].cards.push(this.draw()); this.flip(); b.dealing = false; this.renderBlackjack(); },
  bjNext() { const b = this.bj; b.cur++; if (b.cur >= b.hands.length) this.bjFinish(); else this.renderBlackjack(); },
  async bjFinish() {
    const b = this.bj; b.dealing = true;
    const anyLive = b.hands.some((h) => h.result !== 'FURA');
    const playerBJ = b.hands.length === 1 && this.isBJ(b.hands[0].cards);
    await this.wait(300); b.reveal = true; this.flip(); this.renderBlackjack(); await this.wait(650);
    if (anyLive && !playerBJ) { while (this.val(b.dealer) < 17) { b.dealer.push(this.draw()); this.flip(); this.renderBlackjack(); await this.wait(650); } }
    b.dealing = false;
    const dv = this.val(b.dealer), dbj = this.isBJ(b.dealer); let net = 0; const parts = [];
    for (const h of b.hands) {
      const v = this.val(h.cards), pbj = this.isBJ(h.cards) && b.hands.length === 1;
      let ret = 0;
      if (h.result === 'FURA') { ret = 0; }
      else if (pbj && !dbj) { ret = h.bet * 2.5; h.result = 'BLACKJACK!'; PROFILE.d.casinoBJ++; }
      else if (dbj && !pbj) { ret = 0; h.result = 'krupier ma BJ'; }
      else if (dv > 21) { ret = h.bet * 2; h.result = 'KRUPIER FURA'; }
      else if (v > dv) { ret = h.bet * 2; h.result = 'WYGRANA'; }
      else if (v === dv) { ret = h.bet; h.result = 'REMIS'; }
      else { ret = 0; h.result = 'PRZEGRANA'; }
      net += ret - h.bet; if (ret) this.pay(ret); parts.push(h.result);
    }
    b.phase = 'done'; this.track(net, b.hands.reduce((a, h) => a + h.bet, 0));
    b.msgLose = net < 0; b.msg = net > 0 ? `+${Math.round(net)} żetonów` : net < 0 ? `-${Math.round(-net)} żetonów` : 'Remis, stawka wraca';
    if (b.hands.some((h) => h.result === 'BLACKJACK!')) { this.say('bj'); SFX.cheer(); } else if (net > 0) { this.say('win'); SFX.bell(); } else if (net < 0) { this.say('lose'); SFX.hurt(); }
    this.checkTrophies(); this.renderBlackjack();
  },
  checkTrophies() { const p = PROFILE.d; const nt = TROPHIES.filter((t) => !p.trophies[t.id] && t.check(p, null)); nt.forEach((t, i) => { p.trophies[t.id] = Date.now(); setTimeout(() => toast(t.icon, 'Pucharek: ' + t.name, t.desc), 400 + i * 900); }); PROFILE.save(); },
};

// ============================================================
//  Profil gracza: XP, poziomy, pucharki, seria, wyzwanie dnia
// ============================================================
const PROFILE = {
  d: null,
  defaults() { return { xp: 0, fights: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, maxCombo: 0, specials: 0, blocks: 0, dodges: 0, versusFights: 0, charWins: {}, charPlays: {}, crowns: {}, trophies: {}, survivalBest: 0, fastestWin: 0, dailyDone: '', dailies: 0, lostTo: {}, wonAfterLoss: 0, kos: 0,
    chips: 0, items: {}, equipped: { gloves: null, shorts: null, hat: null, ko: null, taunt: null }, crates: { basic: 0, gold: 0 }, cratesOpened: 0, lastLogin: '', loginStreak: 0, codes: {}, upgrades: {}, bigHeads: false, bosses: {}, winsSinceCrate: 0, crits: 0, pickups: 0, tourneyWins: 0, nick: '', casinoRounds: 0, casinoWon: 0, casinoLost: 0, casinoLostTotal: 0, casinoStraight: 0, casinoBJ: 0, casinoDuels: 0, jackpot: 1000, casinoWagered: 0, casinoBiggestWin: 0, casinoBiggestLoss: 0, slotsSpins: 0, slotsJackpots: 0, debt: 0, debtDue: 0, debtCount: 0, raceWins: 0, pokerHands: 0, pokerWon: 0, vip: false }; },
  addChips(n) { this.d.chips = Math.max(0, Math.round(this.d.chips + n)); this.save(); },
  owns(id) { return !!this.d.items[id]; },
  giveItem(id) { const it = ITEM_BY_ID[id]; if (!it) return { dup: true, refund: 0 }; if (this.d.items[id]) { const r = RARITY[it.rarity].refund; this.d.chips += r; this.save(); return { dup: true, refund: r }; } this.d.items[id] = Date.now(); this.save(); return { dup: false }; },
  rollCrate(tier) {
    const odds = CRATES[tier].odds; let r = Math.random() * 100, rarity = 'common';
    for (const k of ['legendary', 'epic', 'rare', 'common']) { if (r < odds[k]) { rarity = k; break; } r -= odds[k]; }
    const pool = ITEMS.filter((i) => i.rarity === rarity); const fresh = pool.filter((i) => !this.d.items[i.id]);
    return pick(fresh.length ? fresh : pool);
  },
  equipped() { const e = this.d.equipped; return { gloves: e.gloves ? ITEM_BY_ID[e.gloves] : null, shorts: e.shorts ? ITEM_BY_ID[e.shorts] : null, hat: e.hat ? ITEM_BY_ID[e.hat] : null, ko: e.ko ? ITEM_BY_ID[e.ko] : null, taunt: e.taunt ? ITEM_BY_ID[e.taunt] : null }; },
  dailyOffer() { const day = Math.floor(Date.now() / 86400000); const arr = ITEMS.filter((i) => i.type !== 'taunt'); const out = []; let seed = day * 7919; for (let k = 0; k < 3 && out.length < 3; k++) { seed = (seed * 1103515245 + 12345) % 2147483648; const it = arr[seed % arr.length]; if (!out.includes(it)) out.push(it); } return out; },
  checkLogin() {
    const today = this.todayKey(); if (this.d.lastLogin === today) return null;
    const y = new Date(); y.setDate(y.getDate() - 1); const yKey = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    this.d.loginStreak = this.d.lastLogin === yKey ? this.d.loginStreak + 1 : 1; this.d.lastLogin = today;
    const day = Math.min(this.d.loginStreak, LOGIN_LADDER.length); const chips = LOGIN_LADDER[day - 1];
    this.d.chips += chips; if (day === 7) this.d.crates.gold++; this.save();
    return { day, chips, gold: day === 7 };
  },
  useCode(raw) {
    const code = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
    const CODES = { 'PANTSLOW': { chips: 500 }, 'GANG': { crate: 'basic' }, 'KRUPNIOK': { item: 'g_sausage' }, 'WIELKIEGLOWY': { toggle: 'bigHeads' }, 'SWIETOCHLOWICE': { item: 'h_poop' }, 'DZIADEK': { item: 's_thong' }, 'KACZKA': { item: 'k_ducks' }, 'KORONA': { crate: 'gold' }, 'BYTOM': { chips: 250, item: 't_6' }, 'BABCIASHOP': { chips: 2500 } };
    const c = CODES[code]; if (!c) return { ok: false, msg: 'Nieznany kod.' };
    if (c.toggle) { this.d[c.toggle] = !this.d[c.toggle]; this.save(); return { ok: true, msg: c.toggle === 'bigHeads' ? (this.d.bigHeads ? 'Tryb WIELKICH GŁÓW włączony!' : 'Wielkie głowy wyłączone.') : 'OK' }; }
    if (this.d.codes[code]) return { ok: false, msg: 'Ten kod już był użyty.' };
    this.d.codes[code] = Date.now(); const parts = [];
    if (c.chips) { this.d.chips += c.chips; parts.push('+' + c.chips + ' żetonów'); }
    if (c.crate) { this.d.crates[c.crate]++; parts.push(CRATES[c.crate].name.toLowerCase()); }
    if (c.item) { const r = this.giveItem(c.item); parts.push(r.dup ? 'duplikat, +' + r.refund + ' żetonów' : ITEM_BY_ID[c.item].name); }
    this.save(); return { ok: true, msg: 'Kod przyjęty: ' + parts.join(', ') + '!' };
  },
  load() {
    try { this.d = Object.assign(this.defaults(), JSON.parse(localStorage.getItem('opg_profile') || '{}')); } catch (e) { this.d = this.defaults(); }
    try { const hall = JSON.parse(localStorage.getItem('opg_hall') || '{}'); for (const id in hall) if (!this.d.crowns[id]) this.d.crowns[id] = hall[id]; } catch (e) {}
  },
  save() { try { localStorage.setItem('opg_profile', JSON.stringify(this.d)); } catch (e) {} },
  level(xp) { return Math.floor(Math.sqrt((xp === undefined ? this.d.xp : xp) / 120)) + 1; },
  xpFor(l) { return (l - 1) * (l - 1) * 120; },
  rank(l) { const R = [[1, 'Świeżak'], [3, 'Zadymiarz'], [5, 'Bokser z Osiedla'], [8, 'Postrach Bytomia'], [12, 'Mistrz Ringu'], [16, 'Legenda Gangu'], [20, 'Bóg Pięści']]; let r = R[0][1]; for (const [n, t] of R) if (l >= n) r = t; return r; },
  todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
  daily() { const day = Math.floor(Date.now() / 86400000); const ch = ROSTER[day % ROSTER.length]; const kinds = ['win', 'nohit', 'special', 'fast']; const kind = kinds[Math.floor(day / 7) % kinds.length]; return { ch, kind, done: this.d.dailyDone === this.todayKey() }; },
  dailyText(dl) {
    const n = dl.ch.name;
    return { win: `Wygraj walkę jako <b>${n}</b>`, nohit: `Wygraj jako <b>${n}</b> tracąc mniej niż 30 HP`, special: `Użyj supermocy jako <b>${n}</b> i wygraj`, fast: `Wygraj jako <b>${n}</b> w mniej niż 30 s` }[dl.kind];
  },
  dailyMet(dl, sum) {
    if (!sum.won || sum.player.id !== dl.ch.id) return false;
    return { win: true, nohit: sum.dmgTaken < 30, special: sum.specials > 0, fast: sum.time < 30 }[dl.kind];
  },
};
const TROPHIES = [
  { id: 'first', icon: '🥊', name: 'Pierwsza krew', desc: 'Wygraj pierwszą walkę', check: (p) => p.wins >= 1 },
  { id: 'clean', icon: '✨', name: 'Bez draśnięcia', desc: 'Wygraj walkę nie tracąc ani punktu HP', check: (p, s) => !!s && s.won && s.dmgTaken <= 0 },
  { id: 'combo5', icon: '🔥', name: 'Piątka', desc: 'Zrób combo 5x', check: (p) => p.maxCombo >= 5, prog: (p) => [p.maxCombo, 5] },
  { id: 'combo10', icon: '💥', name: 'Dyszka', desc: 'Zrób combo 10x', check: (p) => p.maxCombo >= 10, prog: (p) => [p.maxCombo, 10] },
  { id: 'wall', icon: '🧱', name: 'Ściana', desc: 'Zablokuj łącznie 30 ciosów', check: (p) => p.blocks >= 30, prog: (p) => [p.blocks, 30] },
  { id: 'ghost', icon: '👻', name: 'Nieuchwytny', desc: 'Zrób 20 udanych uników', check: (p) => p.dodges >= 20, prog: (p) => [p.dodges, 20] },
  { id: 'super1', icon: '⚡', name: 'Pierwsza moc', desc: 'Użyj supermocy', check: (p) => p.specials >= 1 },
  { id: 'super25', icon: '🌩️', name: 'Supermocny', desc: 'Użyj supermocy 25 razy', check: (p) => p.specials >= 25, prog: (p) => [p.specials, 25] },
  { id: 'fast', icon: '⏱️', name: 'Błyskawica', desc: 'Wygraj walkę w mniej niż 20 sekund', check: (p, s) => !!s && s.won && s.time < 20 },
  { id: 'comeback', icon: '💓', name: 'Comeback', desc: 'Wygraj mając mniej niż 10 HP', check: (p, s) => !!s && s.won && s.hpEnd < 10 },
  { id: 'legend', icon: '👑', name: 'Pogromca legend', desc: 'Pokonaj legendę', check: (p, s) => !!s && s.won && s.oppLegendary },
  { id: 'king', icon: '🏆', name: 'Król', desc: 'Ukończ kampanię', check: (p) => Object.keys(p.crowns).length >= 1 },
  { id: 'king3', icon: '🏆', name: 'Kolekcjoner koron', desc: 'Ukończ kampanię trzema różnymi postaciami', check: (p) => Object.keys(p.crowns).length >= 3, prog: (p) => [Object.keys(p.crowns).length, 3] },
  { id: 'kingall', icon: '🌟', name: 'Władca absolutny', desc: 'Ukończ kampanię każdą postacią', check: (p) => Object.keys(p.crowns).length >= ROSTER.length, prog: (p) => [Object.keys(p.crowns).length, ROSTER.length] },
  { id: 'streak5', icon: '🎯', name: 'Seria', desc: 'Wygraj 5 walk z rzędu', check: (p) => p.bestStreak >= 5, prog: (p) => [p.bestStreak, 5] },
  { id: 'streak15', icon: '🚀', name: 'Nie do zatrzymania', desc: 'Wygraj 15 walk z rzędu', check: (p) => p.bestStreak >= 15, prog: (p) => [p.bestStreak, 15] },
  { id: 'vet', icon: '🎖️', name: 'Weteran', desc: 'Stocz 50 walk', check: (p) => p.fights >= 50, prog: (p) => [p.fights, 50] },
  { id: 'wins100', icon: '💯', name: 'Setka', desc: 'Wygraj 100 walk', check: (p) => p.wins >= 100, prog: (p) => [p.wins, 100] },
  { id: 'revenge', icon: '😤', name: 'Rewanż', desc: 'Pokonaj kogoś, kto cię wcześniej znokautował', check: (p) => p.wonAfterLoss >= 1 },
  { id: 'allchars', icon: '🎭', name: 'Cała ekipa', desc: 'Zagraj każdą postacią', check: (p) => Object.keys(p.charPlays).length >= ROSTER.length, prog: (p) => [Object.keys(p.charPlays).length, ROSTER.length] },
  { id: 'versus', icon: '🤝', name: 'Na rękę', desc: 'Stocz 10 walk w trybie 2 graczy', check: (p) => p.versusFights >= 10, prog: (p) => [p.versusFights, 10] },
  { id: 'survive5', icon: '🛡️', name: 'Twardziel', desc: 'Pokonaj 5 przeciwników z rzędu w Przetrwaniu', check: (p) => p.survivalBest >= 5, prog: (p) => [p.survivalBest, 5] },
  { id: 'surviveall', icon: '🏰', name: 'Ostatni na nogach', desc: 'Pokonaj całą ekipę w Przetrwaniu', check: (p) => p.survivalBest >= ROSTER.length - 1, prog: (p) => [p.survivalBest, ROSTER.length - 1] },
  { id: 'daily', icon: '📅', name: 'Codzienny', desc: 'Ukończ wyzwanie dnia', check: (p) => p.dailies >= 1 },
  { id: 'lvl10', icon: '🔟', name: 'Dziesiątka', desc: 'Osiągnij 10. poziom', check: (p) => PROFILE.level(p.xp) >= 10, prog: (p) => [PROFILE.level(p.xp), 10] },
  { id: 'boss', icon: '👹', name: 'Pogromca bossa', desc: 'Pokonaj bossa tygodnia', check: (p) => Object.keys(p.bosses).length >= 1 },
  { id: 'boss5', icon: '🐲', name: 'Łowca bossów', desc: 'Pokonaj bossów z 5 różnych tygodni', check: (p) => Object.keys(p.bosses).length >= 5, prog: (p) => [Object.keys(p.bosses).length, 5] },
  { id: 'tourney', icon: '🏟️', name: 'Organizator', desc: 'Rozegraj turniej do końca', check: (p) => p.tourneyWins >= 1 },
  { id: 'crit10', icon: '💢', name: 'Szczęściarz', desc: 'Zadaj 10 ciosów krytycznych', check: (p) => p.crits >= 10, prog: (p) => [p.crits, 10] },
  { id: 'pickup10', icon: '🍕', name: 'Zbieracz', desc: 'Podnieś 10 przedmiotów z ringu', check: (p) => p.pickups >= 10, prog: (p) => [p.pickups, 10] },
  { id: 'crates10', icon: '📦', name: 'Rozpakowywacz', desc: 'Otwórz 10 skrzynek', check: (p) => p.cratesOpened >= 10, prog: (p) => [p.cratesOpened, 10] },
  { id: 'rich', icon: '💰', name: 'Bogacz', desc: 'Miej 2000 żetonów naraz', check: (p) => p.chips >= 2000, prog: (p) => [Math.min(p.chips, 2000), 2000] },
  { id: 'items10', icon: '👕', name: 'Szafiarz', desc: 'Zdobądź 10 przedmiotów', check: (p) => Object.keys(p.items).length >= 10, prog: (p) => [Object.keys(p.items).length, 10] },
  { id: 'legendary', icon: '💎', name: 'Legendarny drop', desc: 'Zdobądź przedmiot legendarny', check: (p) => Object.keys(p.items).some((id) => ITEM_BY_ID[id] && ITEM_BY_ID[id].rarity === 'legendary') },
  { id: 'upg3', icon: '⬆️', name: 'Maksymalny rozwój', desc: 'Rozwiń postać do 3. poziomu', check: (p) => Object.values(p.upgrades).some((v) => v >= 3) },
  { id: 'casino10', icon: '🎰', name: 'Hazardzista', desc: 'Zagraj 10 rund w kasynie', check: (p) => p.casinoRounds >= 10, prog: (p) => [p.casinoRounds, 10] },
  { id: 'casino_bj', icon: '🃏', name: 'Dwadzieścia jeden', desc: 'Trafić blackjacka', check: (p) => p.casinoBJ >= 1 },
  { id: 'casino_35', icon: '🎡', name: 'Numer!', desc: 'Trafić pojedynczy numer w ruletce', check: (p) => p.casinoStraight >= 1 },
  { id: 'slots_jp', icon: '💰', name: 'Trzy Króle', desc: 'Trafić jackpot na jednorękim bandycie', check: (p) => p.slotsJackpots >= 1 },
  { id: 'race5', icon: '🏁', name: 'Bukmacher', desc: 'Wygraj 5 wyścigów ekipy', check: (p) => p.raceWins >= 5, prog: (p) => [p.raceWins, 5] },
  { id: 'poker20', icon: '♠️', name: 'Pokerzysta', desc: 'Rozegraj 20 rozdań pokera', check: (p) => p.pokerHands >= 20, prog: (p) => [p.pokerHands, 20] },
  { id: 'vip', icon: '👑', name: 'VIP', desc: 'Odblokuj VIP room (obrót 10 000 w kasynie)', check: (p) => !!p.vip, prog: (p) => [Math.min(p.casinoWagered, 10000), 10000] },
  { id: 'bigwin', icon: '🤑', name: 'Gruba ryba', desc: 'Wygraj 2000 żetonów w jednej rundzie', check: (p) => p.casinoBiggestWin >= 2000 },
  { id: 'debtfree', icon: '💸', name: 'Dłużnik', desc: 'Weź pożyczkę u Gazdziola', check: (p) => p.debtCount >= 1 },
  { id: 'casino_duel', icon: '🥊', name: 'Odkuty', desc: 'Odzyskaj żetony w pojedynku z krupierem', check: (p) => p.casinoDuels >= 1 },
  { id: 'login7', icon: '📆', name: 'Stały bywalec', desc: 'Wejdź do gry 7 dni z rzędu', check: (p) => p.loginStreak >= 7, prog: (p) => [Math.min(p.loginStreak, 7), 7] },
];
function masteryStars(id) { const w = (PROFILE.d.charWins[id] || 0); return w >= 25 ? 3 : w >= 10 ? 2 : w >= 3 ? 1 : 0; }
// ---------- Samouczek dla nowych ----------
const TUTORIAL = {
  i: 0,
  steps() {
    const touch = isTouchDevice();
    const item = (i, b, t, cls = '') => `<div class="tut-item ${cls}"><div class="i">${i}</div><div><b>${b}</b><span>${t}</span></div></div>`;
    const keys = `<div class="tut-keys">
      <div><span>Ruch</span><span><kbd>A</kbd> <kbd>D</kbd> lub <kbd>←</kbd> <kbd>→</kbd></span></div>
      <div><span>Skok</span><span><kbd>W</kbd> lub <kbd>↑</kbd></span></div>
      <div><span>Unik</span><span><kbd>S</kbd> lub <kbd>↓</kbd></span></div>
      <div><span>Cios</span><span><kbd>Spacja</kbd> lub <kbd>F</kbd></span></div>
      <div><span>Mocny cios</span><span><kbd>G</kbd></span></div>
      <div><span>Blok</span><span><kbd>Shift</kbd> lub <kbd>H</kbd></span></div>
      <div><span>Supermoc</span><span><kbd>E</kbd> / <kbd>Q</kbd> / <kbd>Enter</kbd></span></div>
      <div><span>Pauza</span><span><kbd>Esc</kbd> lub <kbd>P</kbd></span></div>
    </div>`;
    const touchBtns = `<div class="tut-touch">
      <div class="tb"><i>◀ ▶</i>ruch</div><div class="tb"><i>▲</i>skok</div><div class="tb"><i>▼</i>unik</div>
      <div class="tb"><i>CIOS</i>szybki</div><div class="tb"><i class="p">MOC. CIOS</i>przełamuje blok</div><div class="tb"><i>BLOK</i>trzymaj</div><div class="tb"><i class="g">MOC</i>gdy pasek pełny</div>
    </div>`;
    return [
      { icon: '🥊', title: 'Witaj w Only Pantslow Gang', body: `
        <p class="lead">Bijatyka bokserska z całą ekipą w rolach głównych. Patyczaki, prawdziwe głowy i jeden cel: <b>zostać Królem Only Pantslow Gang</b>.</p>
        <div class="tut-grid">
          ${item('👑', 'Cel gry', 'Pokonaj po kolei całą ekipę w Kampanii. Na końcu czekają dwie legendy: Król Pała i Watol Wszechwładny.')}
          ${item('🧍', 'Wybierz postać', 'Każda ma inną szybkość, siłę i własną supermoc. Zaczynasz od kliknięcia KAMPANIA w menu.')}
          ${item('📱', 'Telefon czy komputer', touch ? 'Grasz na dotyk: przyciski pojawiają się na ekranie. Trzymaj telefon poziomo.' : 'Grasz na klawiaturze. Na telefonie ta sama gra ma przyciski na ekranie.')}
          ${item('💾', 'Wszystko się zapisuje', 'Postępy, żetony i pucharki zostają w tej przeglądarce. Z kontem online masz je też na innych urządzeniach.')}
        </div>` },
      { icon: '🎮', title: 'Sterowanie', body: touch
        ? `<p class="lead">Na ekranie masz przyciski. Lewa strona to ruch, prawa to akcje.</p>${touchBtns}<p class="muted">Przycisk BLOK trzymasz, dopóki chcesz się osłaniać. Unik daje chwilę nietykalności, więc wciskaj go, gdy leci mocny cios. Na komputerze działa klawiatura:</p>${keys}`
        : `<p class="lead">Gracz 1 (albo solo) gra na WASD i klawiszach obok. W trybie 2 graczy drugi gra strzałkami i K, L, ; oraz O.</p>${keys}<p class="muted">W menu Spacja albo Enter klika główny przycisk (Walcz, Dalej, Rewanż), więc nie musisz sięgać po mysz. Na telefonie są przyciski na ekranie:</p>${touchBtns}` },
      { icon: '👊', title: 'Jak się bić', body: `
        <div class="tut-grid">
          ${item('👊', 'Cios', 'Szybki, mało obrażeń, buduje combo. Kolejne trafienia bez oberwania podbijają mnożnik aż do 2x.')}
          ${item('💥', 'Mocny cios', 'Wolniejszy, ale boli i przełamuje blok. Idealny, gdy rywal stoi w bloku.')}
          ${item('🛡️', 'Blok', 'Zmniejsza obrażenia do 15%. Nie pomaga na mocny cios i nie działa wiecznie.')}
          ${item('💨', 'Unik', 'Krótka nietykalność. Wciśnij, gdy widzisz zamach. Pozwala wejść za plecy.')}
          ${item('🦘', 'Skok', 'Przeskakujesz fale ognia, pioruny i laser, kombinujesz z ciosem z góry.')}
          ${item('⚡', 'Krytyki i PERFECT', '8% ciosów to krytyk (1,6x, pęka ekran). Wygraj bez obrażeń, dostaniesz PERFECT i bonus XP.')}
        </div>
        <p class="muted">Pasek HP na górze, pod nim pasek MOCY. Po nokaucie zobaczysz powtórkę w zwolnionym tempie.</p>` },
      { icon: '🌟', title: 'Supermoce', body: `
        <p class="lead">Każda postać ma jedną supermoc. Pasek <b>MOCY</b> pod HP ładuje się od zadawania i przyjmowania ciosów. Gdy jest pełny, wciśnij ${touch ? 'przycisk <b>MOC</b>' : '<kbd>E</kbd> (gracz 2: <kbd>O</kbd>)'}.</p>
        <div class="tut-grid">
          ${item('🧊', 'Miśka: Słomkowa Zamrażarka', 'Rzut napojem, trafiony zamarza na 1,5 s.')}
          ${item('👤', 'Cypis: Cień z Bytomia', 'Teleport za plecy i cios za 22 HP.')}
          ${item('🔥', 'Rociu: Rudy Wulkan', 'Trzy fale ognia i podpalenie. Przeskocz je!')}
          ${item('👑', 'Król Pała: Dekret Królewski', 'Korona spada na głowę, ogłuszenie i leczenie Króla.')}
        </div>
        <p class="muted">Pełną listę znajdziesz w menu wyboru postaci (opis pod każdą kartą). Rozwój postaci na 3. poziomie wzmacnia jej moc.</p>` },
      { icon: '🪂', title: 'Wydarzenia na ringu', body: `
        <p class="lead">Co kilkanaście sekund coś się dzieje. Bądź czujny, bo publiczność nie śpi.</p>
        <div class="tut-grid">
          ${item('🍕', 'Przedmioty na spadochronie', 'Pizza, gumowy kurczak, przepychacz, krzesło, mokra ryba, kebab… Podejdź, żeby podnieść. Bronie zmieniają ciosy, jedzenie leczy.')}
          ${item('🍾', 'Butelka z widowni', 'Ktoś rzuca. Uskocz albo zablokuj.')}
          ${item('💣', 'Bomba', 'Odsuń się od niej, zanim wybuchnie. Może być też deszcz jedzenia.')}
          ${item('⚡', 'Podwójne obrażenia i trzęsienie', 'Chwilowy chaos dla obu stron. Wykorzystaj albo przeczekaj w bloku.')}
        </div>` },
      { icon: '🏆', title: 'Tryby gry', body: `
        <div class="tut-grid">
          ${item('👑', 'Kampania', 'Cała ekipa po kolei, legendy na końcu. Wygrasz, dostajesz tytuł Króla i koronę przy postaci.', 'gold')}
          ${item('💀', 'Przetrwanie', 'Losowa kolejka rywali, między walkami odzyskujesz tylko 30 HP. Liczy się, ilu pokonasz.')}
          ${item('⚡', 'Szybki mecz', 'Wybierasz swoją postać i przeciwnika, jeden mecz z AI, normalne nagrody.')}
          ${item('👥', '2 graczy', touch ? 'Na telefonie „na punkty”: każdy po kolei walczy z AI jako postać rywala, lepszy wynik wygrywa. Podajcie sobie telefon.' : 'Jedna klawiatura: WASD kontra strzałki. Najlepsze na imprezie.')}
          ${item('👹', 'Boss tygodnia', 'Co poniedziałek inna postać z modyfikatorem (Gigant, Wampir, Chaos…). Pierwsza wygrana w tygodniu: 500 żetonów i Złota Skrzynka.')}
          ${item('🏟️', 'Turniej', '4 lub 8 osób na jednym urządzeniu, drabinka. Na telefonie gracie „na punkty” podając telefon z ręki do ręki.')}
          ${item('📅', 'Wyzwanie dnia', 'Codziennie inna postać i warunek do spełnienia. 300 XP.')}
        </div>` },
      { icon: '🪙', title: 'Żetony, skrzynki, szatnia', body: `
        <p class="lead">Za każdą walkę dostajesz <b>żetony</b> i XP. Żetony wydajesz w Sklepie i w Kasynie.</p>
        <div class="tut-grid">
          ${item('📦', 'Skrzynki', 'Wypadają po wygranych (co trzecia gwarantowana) i są w Sklepie. W środku rękawice, gacie, czapki, efekty K.O. i teksty. Duplikat zwraca żetony.')}
          ${item('🛒', 'Sklep', 'Skrzynki, oferta dnia (zmienia się o północy) i pole na tajne kody. Spróbuj kodu <b>PANTSLOW</b>.')}
          ${item('👕', 'Szatnia', 'Zakładasz zdobyte rzeczy, widać je na Twojej postaci w walce.')}
          ${item('📈', 'Rozwój postaci', 'Trzy poziomy na postać za żetony i wygrane nią. Poziom 3 wzmacnia supermoc.')}
          ${item('🗓️', 'Codzienne wejście', 'Siedmiodniowa drabinka nagród. Siódmy dzień daje Złotą Skrzynkę.')}
          ${item('🔑', 'Tajne kody', 'Ekipa podrzuca je między sobą. Wpisujesz w Sklepie.')}
        </div>` },
      { icon: '🎰', title: 'Kasyno u Gazdziola', body: `
        <p class="lead">Grasz własnymi żetonami, krupierem jest Gazdziol. Sześć gier w zakładkach na górze.</p>
        <div class="tut-grid">
          ${item('🎡', 'Ruletka', 'Wybierz żeton, kliknij pole na stole, KRĘĆ. Numer płaci 35:1, kolor 1:1.')}
          ${item('🃏', 'Blackjack', 'Dobieraj do 21. Krupier stoi na 17, blackjack płaci 3:2. Jest podwojenie i split.')}
          ${item('🎰', 'Bandyta', 'Trzy bębny z głowami ekipy. Trzy razy Król Pała = jackpot progresywny.')}
          ${item('♠️', 'Poker', 'Texas hold’em z trzema AI o różnych stylach. Baner na górze mówi, czyj ruch.')}
          ${item('🏁', 'Wyścigi i szybkie gry', 'Obstaw, kto dobiegnie do liny. Do tego kości i wyżej/niżej z rosnącym mnożnikiem.')}
          ${item('💸', 'Dług i pojedynek', 'Przegrane liczą się „do odkucia”: możesz wyzwać Gazdziola na ring i odzyskać wszystko. Pusta kieszeń? Gazdziol pożyczy, ale po terminie przychodzi Watol windykator.')}
        </div>
        <p class="muted">Dom zawsze wygrywa. Ale spróbuj.</p>` },
      { icon: '⭐', title: 'XP, pucharki, ranking', body: `
        <div class="tut-grid">
          ${item('⬆️', 'Poziomy i rangi', 'XP za K.O., zostałe HP, combo, supermoce, szybkość i serie zwycięstw. Od Świeżaka do Boga Pięści.')}
          ${item('🏆', 'Pucharki', 'Kilkadziesiąt osiągnięć z paskami postępu i odznakami bossów. Ekran PUCHARKI w menu.')}
          ${item('☁️', 'Ranking online', 'Konto to ksywka i PIN. Wspólna tabela ekipy, profil synchronizuje się między urządzeniami.')}
          ${item('📹', 'Powtórki K.O.', 'Po nokaucie gra nagrywa wideo. Na ekranie wyniku jest „Udostępnij powtórkę”, wysyłasz ją prosto na grupę.')}
          ${item('⭐', 'Gwiazdki i korony', 'Przy postaci widać gwiazdki za wygrane (3 / 10 / 25) i koronę za kampanię.')}
        </div>` },
      { icon: '💡', title: 'Porady na start', body: `
        <div class="tut-grid">
          ${item('📱', 'Telefon poziomo', 'Wtedy ring jest duży, a przyciski nie zasłaniają walki. „Pełny ekran” w menu, na iPhonie dodaj grę do ekranu początkowego.')}
          ${item('🔊', 'Dźwięk', 'Postacie mają własne nagrania. Włączasz i wyłączasz przyciskiem DŹWIĘK w menu.')}
          ${item('🛡️', 'Nie stój w bloku', 'Mocny cios go przełamuje. Blokuj serie, potem unik i kontra.')}
          ${item('🌟', 'Trzymaj moc na dobry moment', 'Rywal ogłuszony albo przy linach? Wtedy odpalaj supermoc.')}
          ${item('📖', 'Wróć tu kiedy chcesz', 'Samouczek jest w menu pod przyciskiem SAMOUCZEK, a lista klawiszy pod STEROWANIE.')}
        </div>
        <p class="lead" style="text-align:center">Powodzenia. Korona czeka. 👑</p>` },
    ];
  },
  isOpen() { const t = $('#tutorial'); return t && !t.hidden; },
  open(i = 0) { this._steps = this.steps(); this.i = clamp(i, 0, this._steps.length - 1); $('#tutorial').hidden = false; document.body.classList.add('tut-open'); this.render(0); },
  close() { $('#tutorial').hidden = true; document.body.classList.remove('tut-open'); if (!PROFILE.d.tutSeen) { PROFILE.d.tutSeen = true; PROFILE.save(); } },
  go(d) { const n = this.i + d; if (n < 0) return; if (n >= this._steps.length) { this.close(); return; } this.i = n; this.render(d); },
  key(code) {
    if (code === 'ArrowRight' || code === 'Enter' || code === 'Space' || code === 'KeyD') { this.go(1); return true; }
    if (code === 'ArrowLeft' || code === 'KeyA') { this.go(-1); return true; }
    if (code === 'Escape') { this.close(); return true; }
    return false;
  },
  render(dir) {
    const st = this._steps[this.i], n = this._steps.length;
    $('#tut-icon').textContent = st.icon; $('#tut-title').textContent = st.title; $('#tut-step').textContent = `Krok ${this.i + 1} z ${n}`;
    $('#tut-dots').innerHTML = this._steps.map((_, k) => `<i class="${k === this.i ? 'on' : k < this.i ? 'done' : ''}" data-k="${k}"></i>`).join('');
    $$('#tut-dots i').forEach((d) => d.onclick = () => { const k = +d.dataset.k; const dd = Math.sign(k - this.i); this.i = k; this.render(dd); });
    const body = $('#tut-body'); body.className = 'tut-body ' + (dir > 0 ? 'slide-l' : dir < 0 ? 'slide-r' : ''); body.innerHTML = st.body; body.scrollTop = 0;
    $('#tut-prev').disabled = this.i === 0; $('#tut-prev').style.visibility = this.i === 0 ? 'hidden' : '';
    $('#tut-next').textContent = this.i === n - 1 ? 'Zaczynamy! 🥊' : 'Dalej →';
  },
  init() {
    $('#btn-tutorial').addEventListener('click', () => { SFX.ensure(); this.open(0); });
    $('#tut-prev').addEventListener('click', () => this.go(-1));
    $('#tut-next').addEventListener('click', () => this.go(1));
    $('#tut-skip').addEventListener('click', () => this.close());
    $('#tutorial').addEventListener('click', (e) => { if (e.target.id === 'tutorial') this.close(); });
    let sx = 0, sy = 0, sw = false;
    const box = $('.tut-box');
    box.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; sw = true; }, { passive: true });
    box.addEventListener('touchend', (e) => { if (!sw) return; sw = false; const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = t.clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1); }, { passive: true });
  },
};

function toast(icon, title, text) {
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<span class="ic">${icon}</span><span><b>${title}</b>${text}</span>`;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 4500);
  SFX.ensure(); SFX.bell();
}
// Podsumowanie walki -> statystyki, XP, pucharki. Zwraca {xp, rows, newTrophies, levelUp}
function settleFight(sum) {
  const p = PROFILE.d, before = p.xp, lvlBefore = PROFILE.level();
  p.fights++;
  p.charPlays[sum.player.id] = (p.charPlays[sum.player.id] || 0) + 1;
  p.maxCombo = Math.max(p.maxCombo, sum.maxCombo); p.specials += sum.specials; p.blocks += sum.blocks; p.dodges += sum.dodges; p.crits += sum.crits || 0; p.pickups += sum.pickups || 0;
  if (sum.mode === 'versus') p.versusFights++;
  const rows = [];
  if (sum.won) {
    p.wins++; p.kos++; p.streak++; p.bestStreak = Math.max(p.bestStreak, p.streak);
    p.charWins[sum.player.id] = (p.charWins[sum.player.id] || 0) + 1;
    if (p.lostTo[sum.opp.id]) { p.wonAfterLoss++; delete p.lostTo[sum.opp.id]; }
    if (!p.fastestWin || sum.time < p.fastestWin) p.fastestWin = sum.time;
    rows.push(['Zwycięstwo przez K.O.', 100]);
    rows.push(['Zostało ' + Math.ceil(sum.hpEnd) + ' HP', Math.round(sum.hpEnd / sum.hpMax * 50)]);
    if (sum.maxCombo >= 3) rows.push(['Najdłuższe combo ' + sum.maxCombo + 'x', sum.maxCombo * 5]);
    if (sum.specials) rows.push(['Supermoce x' + sum.specials, sum.specials * 10]);
    if (sum.time < 20) rows.push(['Błyskawiczna walka', 30]);
    if (sum.oppLegendary) rows.push(['Pokonana legenda', 60]);
    if (sum.perfect) rows.push(['PERFECT: bez obrażeń', 80]);
    if (sum.crits) rows.push(['Krytyki x' + sum.crits, sum.crits * 8]);
    if (sum.pickups) rows.push(['Przedmioty z ringu x' + sum.pickups, sum.pickups * 6]);
    if (sum.wave) rows.push(['Przetrwanie: fala ' + sum.wave, sum.wave * 15]);
    if (p.streak >= 2) rows.push(['Seria ' + p.streak + ' zwycięstw', Math.min(p.streak, 10) * 10]);
  } else {
    p.losses++; p.streak = 0; p.lostTo[sum.opp.id] = true;
    rows.push(['Walka stoczona', 25]);
    if (sum.maxCombo >= 3) rows.push(['Najdłuższe combo ' + sum.maxCombo + 'x', sum.maxCombo * 3]);
    if (sum.specials) rows.push(['Supermoce x' + sum.specials, sum.specials * 5]);
  }
  const dl = PROFILE.daily();
  let dailyHit = false;
  if (!dl.done && PROFILE.dailyMet(dl, sum)) { p.dailyDone = PROFILE.todayKey(); p.dailies++; rows.push(['Wyzwanie dnia ukończone!', 300]); dailyHit = true; }
  if (sum.mode === 'versus') rows.length = 0;
  const xp = rows.reduce((a, r) => a + r[1], 0);
  p.xp += xp;
  // żetony i skrzynki
  let chips = 0, crate = null;
  if (sum.mode !== 'versus') {
    chips = sum.won ? 40 + Math.round(sum.hpEnd / sum.hpMax * 20) + Math.min(p.streak, 10) * 3 + (sum.oppLegendary ? 30 : 0) + (sum.wave ? sum.wave * 5 : 0) : 10;
    if (sum.crits) chips += sum.crits * 3;
    p.chips += chips;
    if (sum.won) {
      p.winsSinceCrate++;
      if (sum.oppLegendary || sum.boss) crate = 'gold';
      else if (p.winsSinceCrate >= 3 || Math.random() < 0.45) crate = 'basic';
      if (crate) { p.crates[crate]++; p.winsSinceCrate = 0; }
    } else if (Math.random() < 0.15) { crate = 'basic'; p.crates.basic++; }
  }
  const newTrophies = TROPHIES.filter((t) => !p.trophies[t.id] && t.check(p, sum));
  for (const t of newTrophies) p.trophies[t.id] = Date.now();
  PROFILE.save(); ONLINE.sync();
  const lvlAfter = PROFILE.level();
  if (dailyHit) toast('📅', 'Wyzwanie dnia!', '+300 XP');
  newTrophies.forEach((t, i) => setTimeout(() => toast(t.icon, 'Pucharek: ' + t.name, t.desc), 600 + i * 900));
  if (lvlAfter > lvlBefore) setTimeout(() => toast('⬆️', 'Poziom ' + lvlAfter + '!', PROFILE.rank(lvlAfter)), 300);
  return { xp, rows, newTrophies, levelUp: lvlAfter > lvlBefore, lvl: lvlAfter, before, after: p.xp, chips, crate };
}

function itemIcon(it, big) {
  if (it.type === 'gloves') { const st = it.style; if (st.emoji) return st.emoji; if (st.rainbow) return `<span class="sw" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)"></span>`; return `<span class="sw" style="background:${st.color}"></span>`; }
  if (it.type === 'shorts') { const st = it.style; return `<span class="sw" style="background:${st.color};border-radius:8px${st.pattern === 'hearts' ? ';background-image:radial-gradient(#ff3b6b 3px,transparent 4px);background-size:12px 12px' : ''}${st.pattern === 'camo' ? ';background-image:radial-gradient(#3b4a1f 6px,transparent 7px);background-size:16px 14px' : ''}${st.pattern === 'leopard' ? ';background-image:radial-gradient(#4a2c0a 3px,transparent 4px);background-size:10px 10px' : ''}${st.pattern === 'flag' ? ';background:linear-gradient(#fff 50%,#e53935 50%)' : ''}${st.pattern === 'stripes' ? ';background-image:repeating-linear-gradient(0deg,transparent 0 6px,#465aa0 6px 9px)' : ''}"></span>`; }
  if (it.type === 'hat') return it.emoji || (it.draw === 'halo' ? '😇' : '😈');
  if (it.type === 'ko') return it.emoji || (it.fx === 'fireworks' ? '🎆' : '🎊');
  if (it.type === 'taunt') return '💬';
  return '🎁';
}

function statsHtml(ch) {
  const bar = (label, pct, cls) => `<div class="stat ${cls || ''}"><span>${label}</span><i><b style="width:${pct}%"></b></i></div>`;
  return `<div class="stats">
    ${bar('Szybkość', Math.round((ch.speed - 0.7) / 0.6 * 100))}
    ${bar('Siła', Math.round(clamp((ch.power - 0.7) / 0.9, 0, 1) * 100))}
    ${bar('HP', Math.round(100 * (ch.legendary ? LEGEND_MULT : 1) / LEGEND_MULT), 'hp')}
  </div>`;
}

const App = {
  screen: 's-title', match: null, paused: false, raf: 0, last: 0,
  mode: 'campaign', p1: null, p2: null, campaign: null, canvas: null, ctx: null,

  init() {
    this.canvas = $('#c'); this.ctx = this.canvas.getContext('2d');
    this.fitCanvas(); window.addEventListener('resize', () => this.fitCanvas());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitCanvas(), 300));

    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => { SFX.ensure(); this.mode = b.dataset.mode; this.openSelect(); }));
    $('#btn-help').addEventListener('click', () => { $('#help').hidden = false; });
    TUTORIAL.init();
    if (!PROFILE.d.tutSeen) setTimeout(() => { if (App.screen === 's-title' && $('#debt-modal').hidden) TUTORIAL.open(0); }, 700);
    $('#btn-trophies').addEventListener('click', () => { this.renderTrophies(); this.show('s-trophies'); });
    $('#btn-shop').addEventListener('click', () => { this.renderShop(); this.show('s-shop'); });
    $('#btn-boss').addEventListener('click', () => { SFX.ensure(); this.mode = 'boss'; this.openSelect(); });
    $('#btn-tourney').addEventListener('click', () => { SFX.ensure(); this.tourney = null; this.renderTourney(); this.show('s-tourney'); });
    $('#btn-tourney-back').addEventListener('click', () => this.show('s-title'));
    $('#btn-online').addEventListener('click', () => { ONLINE.loadSession(); this.renderOnline(); this.show('s-online'); });
    $('#btn-casino').addEventListener('click', () => { SFX.ensure(); if (this.checkDebt()) return; CASINO.render(); CASINO.say('hello'); this.show('s-casino'); });
    $('#btn-casino-back').addEventListener('click', () => { if (CASINO.spinning) return; this.show('s-title'); });
    $('#btn-online-back').addEventListener('click', () => this.show('s-title'));
    $('#replay-close').addEventListener('click', () => { $('#replay-modal').hidden = true; const v = $('#replay-video'); v.pause(); });
    ONLINE.loadSession();
    $('#btn-shop-back').addEventListener('click', () => this.show('s-title'));
    $('#btn-wardrobe').addEventListener('click', () => { this.wardrobeTab = this.wardrobeTab || 'gloves'; this.renderWardrobe(); this.show('s-wardrobe'); });
    $('#btn-wardrobe-back').addEventListener('click', () => this.show('s-title'));
    $('#btn-code').addEventListener('click', () => { const r = PROFILE.useCode($('#code-input').value); $('#code-msg').textContent = r.msg; $('#code-msg').style.color = r.ok ? 'var(--gold)' : '#ff5c5c'; if (r.ok) { SFX.ensure(); SFX.bell(); $('#code-input').value = ''; this.renderShop(); } });
    $('#code-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-code').click(); e.stopPropagation(); });
    const login = PROFILE.checkLogin();
    if (login) setTimeout(() => toast('🪙', `Dzień ${login.day} z rzędu: +${login.chips} żetonów`, login.gold ? 'Bonus: Złota Skrzynka za 7 dni!' : (login.day < 7 ? `Jutro: +${LOGIN_LADDER[login.day]}` : 'Tak trzymaj!')), 800);
    $('#btn-trophies-back').addEventListener('click', () => this.show('s-title'));
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
    for (const ev of ['pointerdown', 'touchend', 'keydown']) document.addEventListener(ev, () => SFX.ensure(), { passive: true });
    $('#s-game').addEventListener('pointerdown', () => { if (this.match && this.match.phase === 'replay') this.match.replay.skip = true; });
    if (IS_IOS && !IS_STANDALONE) $('#btn-fs').textContent = 'PEŁNY EKRAN (iPHONE)';
    if (IS_STANDALONE) $('#btn-fs').hidden = true;
    $('#btn-ios-close').addEventListener('click', () => { $('#ios-help').hidden = true; });
    $$('button').forEach((b) => b.addEventListener('click', () => b.blur()));
    if (isTouchDevice() && !IS_STANDALONE) $('#s-game').addEventListener('pointerdown', () => { if (!IS_IOS && !document.fullscreenElement && !this._fsTried) { this._fsTried = true; this.fullscreen(); } }, { once: true });
    $('#ver').textContent = VERSION;
    this.renderTitle();
    setTimeout(() => this.checkDebt(), 1200);
    this.loop(0);
    if (isTouchDevice()) $('#rotate-hint').classList.add('show');
  },
  show(id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    this.screen = id;
    const scr = document.getElementById(id); if (scr) scr.scrollTop = 0; // nowy ekran zawsze od góry
    if (id === 's-title') { this.renderTitle(); setTimeout(() => this.checkDebt(), 400); }
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
    const vb = $('#btn-versus'); if (vb) vb.textContent = this.touchVersus() ? '🤝 2 GRACZY: NA PUNKTY' : '2 GRACZY';
    const faces = $('#title-faces'); faces.innerHTML = '';
    ROSTER.forEach((ch) => { const img = document.createElement('img'); img.src = headSrc(ch); img.alt = ch.name; faces.appendChild(img); });
    const p = PROFILE.d, lvl = PROFILE.level(), cur = p.xp - PROFILE.xpFor(lvl), need = PROFILE.xpFor(lvl + 1) - PROFILE.xpFor(lvl);
    $('#chips-title').textContent = p.chips;
    $('#profile').innerHTML = `<div class="lvl">POZIOM <b>${lvl}</b> <span style="color:var(--gold);margin-left:10px">🪙 ${p.chips}</span></div><div class="rank">${PROFILE.rank(lvl)}</div>
      <div class="xpbar"><b style="width:${Math.round(cur / need * 100)}%"></b></div>
      <div class="xptxt">${cur} / ${need} XP do następnego poziomu • ${p.wins} wygranych • ${Object.keys(p.trophies).length}/${TROPHIES.length} pucharków${p.survivalBest ? ' • Przetrwanie: ' + p.survivalBest : ''}</div>
      ${p.streak >= 2 ? `<div class="streak">🔥 Seria ${p.streak} zwycięstw</div>` : ''}`;
    const wb = weeklyBoss();
    $('#btn-boss').innerHTML = `👹 BOSS TYGODNIA: ${wb.ch.name.toUpperCase()} <small style="font-family:var(--font-body);font-size:0.65em;opacity:0.8">${wb.mod.name} • ${wb.done ? '✅ pokonany' : 'zostało ' + fmtLeft(wb.left)}</small>`;
    const dl = PROFILE.daily(); const dEl = $('#daily'); dEl.classList.toggle('done', dl.done);
    dEl.innerHTML = `📅 Wyzwanie dnia: <img src="${headSrc(dl.ch)}" alt="">${PROFILE.dailyText(dl)} ${dl.done ? '✅ zrobione' : '<b>+300 XP</b>'}`;
    const hall = p.crowns; const el = $('#hall');
    const entries = Object.entries(hall).filter(([id]) => ROSTER.find((c) => c.id === id)).sort((a, b) => b[1] - a[1]);
    el.innerHTML = entries.length
      ? 'Królowie Only Pantslow Gang: ' + entries.map(([id, n]) => `<b>${ROSTER.find((c) => c.id === id).name}</b> (${n}x)`).join(', ')
      : 'Nikt jeszcze nie zdobył korony. Będziesz pierwszy?';
  },
  loadHall() { try { return JSON.parse(localStorage.getItem('opg_hall') || '{}'); } catch (e) { return {}; } },
  checkDebt() {
    const p = PROFILE.d; if (!(p.debt > 0 && Date.now() > p.debtDue)) return false;
    const watol = ROSTER.find((c) => c.id === 'watol') || ROSTER[ROSTER.length - 1];
    const ov = $('#debt-modal'); ov.hidden = false;
    $('#debt-modal-text').innerHTML = `Gazdziol wysłał <b>Watola Wszechwładnego</b> po dług: <b style="color:#ffb020">${p.debt} żetonów</b>.<br>Masz ${p.chips}. ${p.chips >= p.debt ? 'Możesz spłacić od ręki albo' : 'Nie stać cię, więc'} walczysz.<br><small>Wygrasz: dług anulowany. Przegrasz: Watol zabiera wszystkie żetony, a jeśli to za mało, jeden przedmiot z szatni.</small>`;
    $('#debt-pay').hidden = p.chips < p.debt;
    $('#debt-pay').onclick = () => { p.chips -= p.debt; p.debt = 0; p.debtDue = 0; PROFILE.save(); ov.hidden = true; toast('💸', 'Dług spłacony', 'Watol odchodzi bez słowa'); this.renderTitle(); };
    $('#debt-fight').onclick = () => { ov.hidden = true; this.p1 = (this.p1 && this.p1.id !== watol.id) ? this.p1 : ROSTER[0]; this.mode = 'debt'; this.startMatch({ p1: this.p1, p2: watol, mode: 'debt', diff: 0.9, boss: { id: 'windykator', name: 'WINDYKATOR', desc: 'Przyszedł po dług', hp: 160, power: 1.3 }, label: `WINDYKACJA • DŁUG ${p.debt} 🪙` }); };
    return true;
  },
  casinoDuel() {
    const dealer = ROSTER.find((c) => c.id === 'gazdziol') || ROSTER[0];
    this.p1 = this.p1 && this.p1.id !== dealer.id ? this.p1 : ROSTER.find((c) => c.id !== dealer.id);
    this.mode = 'casino'; CASINO.say('duel');
    this.casinoStake = PROFILE.d.casinoLost;
    this.openSelect();
  },
  // ---------- Ranking online ----------
  async renderOnline() {
    const box = $('#online-body');
    if (!ONLINE.enabled()) {
      box.innerHTML = `<div class="online-setup"><h3>Ranking jeszcze niepodłączony</h3>
        <p>Żeby cała ekipa widziała nawzajem swoje wyniki, potrzebna jest darmowa baza. Instrukcja krok po kroku jest w pliku <b>online/README.md</b> w repo (5 minut: konto na supabase.com, wklejenie jednego pliku SQL i dwóch wartości do <b>online-config.js</b>).</p>
        <p>Po podłączeniu każdy z ekipy zakłada tu konto (ksywka + PIN), a wyniki zapisują się w chmurze. Można wtedy grać na telefonie i komputerze z tym samym profilem.</p></div>`;
      return;
    }
    if (!ONLINE.nick) {
      box.innerHTML = `<div class="online-login"><h3>Zaloguj się albo załóż konto</h3>
        <input id="on-nick" type="text" maxlength="16" placeholder="ksywka" autocomplete="off" value="${PROFILE.d.nick || ''}">
        <input id="on-pin" type="password" inputmode="numeric" maxlength="8" placeholder="PIN (4-8 cyfr)" autocomplete="off">
        <div class="menu"><button class="btn btn-primary" id="on-login">WCHODZĘ</button></div>
        <div id="on-msg" class="code-msg"></div>
        <p class="t-hint">Nowa ksywka = nowe konto z tym PIN-em. Jeśli grałeś już na tym urządzeniu, twój postęp wjeżdża na konto. Na innym urządzeniu zaloguj się tą samą ksywką i PIN-em, a profil się zsynchronizuje.</p></div>`;
      $$('#on-nick, #on-pin').forEach((i) => i.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') $('#on-login').click(); }));
      $('#on-login').onclick = async () => {
        const nick = $('#on-nick').value.trim(), pin = $('#on-pin').value.trim(); const msg = $('#on-msg');
        if (nick.length < 2) { msg.textContent = 'Ksywka za krótka.'; return; } if (!/^\d{4,8}$/.test(pin)) { msg.textContent = 'PIN to 4-8 cyfr.'; return; }
        msg.textContent = 'Łączę...'; $('#on-login').disabled = true;
        try { const how = await ONLINE.login(nick, pin); PROFILE.d.nick = nick; PROFILE.save(); toast('☁️', 'Zalogowano: ' + nick, how === 'pulled' ? 'Wczytano profil z chmury' : 'Profil zapisany w chmurze'); this.renderOnline(); this.renderTitle(); }
        catch (e) { msg.textContent = 'Nie udało się: ' + e.message; $('#on-login').disabled = false; }
      };
      return;
    }
    box.innerHTML = `<div class="online-top"><div>Zalogowany jako <b>${ONLINE.nick}</b></div><div class="menu"><button class="btn btn-sm" id="on-sync">🔄 Synchronizuj</button><button class="btn btn-sm btn-ghost" id="on-logout">Wyloguj</button></div></div><div id="on-board" class="board">Ładuję ranking...</div>`;
    $('#on-logout').onclick = () => { ONLINE.logout(); this.renderOnline(); };
    $('#on-sync').onclick = async () => { await ONLINE.sync(true); this.renderOnline(); };
    try {
      const rows = await ONLINE.fetchBoard(); const sortKey = this.boardSort || 'xp';
      const cols = [['xp', 'XP'], ['wins', 'Wygrane'], ['best_streak', 'Seria'], ['max_combo', 'Combo'], ['survival_best', 'Przetrwanie'], ['crowns', 'Korony'], ['trophies', 'Pucharki'], ['bosses', 'Bossy'], ['chips', 'Żetony'], ['casino_win', '🎰 Rekord'], ['casino_net', '🎰 Bilans'], ['jackpots', 'Jackpoty']];
      rows.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
      $('#on-board').innerHTML = `<div class="tabs">${cols.map(([k, n]) => `<button class="tab ${sortKey === k ? 'on' : ''}" data-bs="${k}">${n}</button>`).join('')}</div>
        <table class="board-table"><thead><tr><th>#</th><th>Ksywka</th><th>Poziom</th>${cols.map(([k, n]) => `<th class="${sortKey === k ? 'on' : ''}">${n}</th>`).join('')}</tr></thead><tbody>
        ${rows.map((r, i) => `<tr class="${(r.nick || '').toLowerCase() === ONLINE.nick.toLowerCase() ? 'me' : ''}"><td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td><td>${r.nick}</td><td>${r.level || 1}</td>${cols.map(([k]) => `<td class="${sortKey === k ? 'on' : ''}">${r[k] || 0}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <p class="t-hint">${rows.length} ${rows.length === 1 ? 'gracz' : 'graczy'} w rankingu. Wyniki aktualizują się po każdej walce.</p>`;
      $$('[data-bs]').forEach((b) => b.onclick = () => { this.boardSort = b.dataset.bs; this.renderOnline(); });
    } catch (e) { $('#on-board').innerHTML = `<div class="code-msg" style="color:#ff5c5c">Nie mogę pobrać rankingu: ${e.message}</div>`; }
  },
  // ---------- Turniej ----------
  renderTourney() {
    const box = $('#tourney-body');
    if (!this.tourney) {
      const n = this.tourneySize || 4;
      box.innerHTML = `<div class="t-setup"><div class="t-size">${[4, 8].map((k) => `<button class="tab ${n === k ? 'on' : ''}" data-tsize="${k}">${k} graczy</button>`).join('')}</div>
        <div class="t-slots">${Array.from({ length: n }, (_, i) => { const prev = (this.tourneySlots || [])[i] || {}; return `<div class="t-slot"><span class="t-num">${i + 1}</span><input type="text" maxlength="14" placeholder="Gracz ${i + 1}" value="${prev.name || ''}" data-tname="${i}"><select data-tch="${i}">${ROSTER.map((c) => `<option value="${c.id}" ${prev.ch === c.id || (!prev.ch && ROSTER[i % ROSTER.length].id === c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>`; }).join('')}</div>
        <p class="t-hint">${isTouchDevice() && !usingKeyboard ? 'Na telefonie każdy pojedynek to walka na punkty: obaj gracze po kolei walczą z AI (postacią rywala), lepszy wynik wygrywa. Podawajcie telefon z ręki do ręki.' : 'Na klawiaturze każdy pojedynek to walka 1 na 1: gracz po lewej WASD, po prawej strzałki.'}</p>
        <div class="menu"><button class="btn btn-primary" id="btn-tourney-start">START TURNIEJU</button></div></div>`;
      $$('[data-tsize]').forEach((b) => b.onclick = () => { this.tourneySize = +b.dataset.tsize; this.renderTourney(); });
      $$('[data-tname]').forEach((i) => i.addEventListener('keydown', (e) => e.stopPropagation()));
      $('#btn-tourney-start').onclick = () => {
        const slots = Array.from({ length: n }, (_, i) => ({ name: ($(`[data-tname="${i}"]`).value.trim() || `Gracz ${i + 1}`).slice(0, 14), ch: ROSTER.find((c) => c.id === $(`[data-tch="${i}"]`).value) }));
        this.tourneySlots = slots;
        const players = shuffle(slots);
        const rounds = []; let cur = players.map((p) => ({ p })); 
        while (cur.length > 1) { const ms = []; for (let i = 0; i < cur.length; i += 2) ms.push({ a: cur[i].p || null, b: cur[i + 1].p || null, winner: null, score: null }); rounds.push(ms); cur = ms.map(() => ({ p: null })); }
        this.tourney = { rounds, ri: 0, mi: 0, touch: isTouchDevice() && !usingKeyboard };
        this.renderTourney();
      };
      return;
    }
    const t = this.tourney; const names = ['Ćwierćfinały', 'Półfinały', 'FINAŁ']; const rn = t.rounds.length === 3 ? names : t.rounds.length === 2 ? names.slice(1) : ['FINAŁ'];
    const cur = t.rounds[t.ri] && t.rounds[t.ri][t.mi];
    box.innerHTML = `<div class="bracket">${t.rounds.map((ms, ri) => `<div class="round"><div class="round-name">${rn[ri]}</div>${ms.map((m, mi) => { const live = ri === t.ri && mi === t.mi && !m.winner; const ent = (p, won) => p ? `<div class="ent ${won ? 'won' : ''} ${m.winner && !won ? 'lost' : ''}"><img src="${headSrc(p.ch)}" alt=""><span>${p.name}</span></div>` : '<div class="ent tbd">?</div>'; return `<div class="match ${live ? 'live' : ''} ${m.winner ? 'done' : ''}">${ent(m.a, m.winner === m.a)}<div class="vs">vs</div>${ent(m.b, m.winner === m.b)}${m.score ? `<div class="score">${m.score}</div>` : ''}</div>`; }).join('')}</div>`).join('')}
      ${t.champion ? `<div class="round"><div class="round-name">MISTRZ</div><div class="match champ"><div class="ent won"><img src="${headSrc(t.champion.ch)}" alt=""><span>🏆 ${t.champion.name}</span></div></div></div>` : ''}</div>
      <div class="menu">${cur && !t.champion ? `<button class="btn btn-primary btn-lg" id="btn-tourney-play">${t.touch && t.pending ? `TERAZ GRA: ${t.pending.name.toUpperCase()}` : `GRAJ: ${cur.a.name} vs ${cur.b.name}`}</button>` : ''}<button class="btn btn-ghost" id="btn-tourney-new">Nowy turniej</button></div>`;
    const play = $('#btn-tourney-play'); if (play) play.onclick = () => this.playTourneyMatch();
    $('#btn-tourney-new').onclick = () => { const duel = t.duel; this.tourney = null; if (duel) { this.mode = 'versus'; this.openSelect(); } else this.renderTourney(); };
    const h = $('#s-tourney h2'); if (t.duel) { $('#btn-tourney-new').textContent = 'Nowy pojedynek'; if (h) h.textContent = '🤝 2 graczy: na punkty'; } else if (h) h.textContent = '🏟️ Turniej ekipy';
  },
  playTourneyMatch() {
    const t = this.tourney, m = t.rounds[t.ri][t.mi]; this.mode = 'tourney';
    if (!t.touch) { this.startMatch({ p1: m.a.ch, p2: m.b.ch, mode: 'tourney', human2: true, label: `${m.a.name.toUpperCase()} vs ${m.b.name.toUpperCase()}` }); return; }
    // telefon: na punkty, każdy po kolei z AI
    t.pending = t.pending || m.a; const me = t.pending, opp = me === m.a ? m.b : m.a;
    this.startMatch({ p1: me.ch, p2: opp.ch, mode: 'tourney', diff: 0.7, label: `${me.name.toUpperCase()} (na punkty) vs ${opp.name.toUpperCase()}` });
  },
  tourneyResult(winner, match) {
    const t = this.tourney, m = t.rounds[t.ri][t.mi];
    if (!t.touch) { m.winner = winner === 0 ? m.a : m.b; }
    else {
      const me = t.pending, f = match.f[0];
      const score = winner === 0 ? 1000 + Math.round(f.hp) * 5 + Math.max(0, Math.round(90 - match.fightTime)) : Math.round(f.stats.dmgDealt);
      m.scores = m.scores || {}; m.scores[me === m.a ? 'a' : 'b'] = score;
      toast('🏟️', `${me.name}: ${score} pkt`, winner === 0 ? 'wygrana z AI' : 'przegrana z AI, liczą się zadane obrażenia');
      if (m.scores.a === undefined || m.scores.b === undefined) { t.pending = me === m.a ? m.b : m.a; this.renderTourney(); this.show('s-tourney'); return; }
      m.winner = m.scores.a >= m.scores.b ? m.a : m.b; m.score = `${m.scores.a} : ${m.scores.b}`; t.pending = null;
    }
    // przenieś zwycięzcę dalej
    if (t.ri + 1 < t.rounds.length) { const nm = t.rounds[t.ri + 1][Math.floor(t.mi / 2)]; if (t.mi % 2 === 0) nm.a = m.winner; else nm.b = m.winner; }
    t.mi++; if (t.mi >= t.rounds[t.ri].length) { t.mi = 0; t.ri++; }
    if (t.ri >= t.rounds.length) { t.champion = m.winner; if (t.duel) { toast('🥊', `${m.winner.name} wygrywa pojedynek!`, m.score ? 'Punkty: ' + m.score : ''); } else { PROFILE.d.tourneyWins++; PROFILE.d.chips += 200; PROFILE.save(); toast('🏆', `Mistrz turnieju: ${m.winner.name}`, '+200 żetonów dla właściciela telefonu'); } SFX.cheer(); SFX.bell(); }
    this.renderTourney(); this.show('s-tourney');
  },
  // ---------- Sklep ----------
  renderShop() {
    const p = PROFILE.d;
    $('#chips-shop').textContent = '🪙 ' + p.chips; $('#chips-title').textContent = p.chips;
    $('#shop-crates').innerHTML = Object.entries(CRATES).map(([k, c]) => `
      <div class="shop-card"><div class="big">${c.icon}</div><div class="n">${c.name}</div>
        <div class="d">${Object.entries(c.odds).filter(([, v]) => v).map(([r, v]) => `${RARITY[r].name} ${v}%`).join(' • ')}</div>
        <div class="own">Masz: ${p.crates[k]}</div>
        <div class="menu"><button class="btn btn-sm" data-buy="${k}" ${p.chips < c.price ? 'disabled' : ''}>KUP <span class="price">🪙 ${c.price}</span></button>
        <button class="btn btn-sm btn-primary" data-open="${k}" ${p.crates[k] ? '' : 'disabled'}>OTWÓRZ</button></div></div>`).join('');
    $('#shop-daily').innerHTML = PROFILE.dailyOffer().map((it) => { const owned = PROFILE.owns(it.id); const price = RARITY[it.rarity].price; return `
      <div class="shop-card ${owned ? 'owned' : ''}" style="border-color:${RARITY[it.rarity].col}55"><div class="big">${itemIcon(it)}</div><div class="n">${it.name}</div>
        <div class="d" style="color:${RARITY[it.rarity].col}">${RARITY[it.rarity].name} • ${ITEM_TYPES[it.type]}</div>
        ${owned ? '<div class="own">✅ Masz</div>' : `<button class="btn btn-sm btn-primary" data-buyitem="${it.id}" ${p.chips < price ? 'disabled' : ''}>KUP <span style="color:#1b1200">🪙 ${price}</span></button>`}</div>`; }).join('');
    $$('[data-buy]').forEach((b) => b.onclick = () => { const k = b.dataset.buy; if (p.chips >= CRATES[k].price) { p.chips -= CRATES[k].price; p.crates[k]++; PROFILE.save(); SFX.ensure(); SFX.jump(); this.renderShop(); } });
    $$('[data-open]').forEach((b) => b.onclick = () => this.openCrate(b.dataset.open, () => this.renderShop()));
    $$('[data-buyitem]').forEach((b) => b.onclick = () => { const it = ITEM_BY_ID[b.dataset.buyitem]; const price = RARITY[it.rarity].price; if (p.chips >= price && !PROFILE.owns(it.id)) { p.chips -= price; PROFILE.giveItem(it.id); toast(itemIcon(it), it.name, 'Kupione! Załóż w Szatni.'); this.renderShop(); } });
  },
  openCrate(tier, done) {
    const p = PROFILE.d; if (!p.crates[tier]) return; p.crates[tier]--; p.cratesOpened++; PROFILE.save();
    const item = PROFILE.rollCrate(tier); const res = PROFILE.giveItem(item.id); const rc = RARITY[item.rarity].col;
    const ov = $('#crate'), icon = $('#crate-icon'), stage = $('#crate-stage'), result = $('#crate-result'), actions = $('#crate-actions');
    ov.hidden = false; result.hidden = true; actions.innerHTML = ''; stage.classList.remove('legendary');
    icon.textContent = CRATES[tier].icon; icon.className = 'crate-icon'; icon.hidden = false; void icon.offsetWidth; icon.classList.add('shake');
    SFX.ensure(); SFX.noise(0.9, 400, 1, 0.3, 'bandpass');
    setTimeout(() => { icon.classList.add('burst'); SFX.punch(true); }, 900);
    setTimeout(() => {
      icon.hidden = true; result.hidden = false; stage.classList.toggle('legendary', item.rarity === 'legendary');
      result.style.setProperty('--rc', rc);
      $('#crate-rarity').textContent = RARITY[item.rarity].name.toUpperCase(); $('#crate-rarity').style.color = rc;
      $('#crate-item').innerHTML = itemIcon(item, true);
      $('#crate-name').textContent = item.type === 'taunt' ? 'Nowy tekst' : item.name;
      $('#crate-type').innerHTML = (item.type === 'taunt' ? item.name + '<br>' : '') + ITEM_TYPES[item.type] + (res.dup ? `<div class="dup">Duplikat: +${res.refund} żetonów</div>` : '');
      if (item.rarity === 'legendary') { SFX.bell(); SFX.cheer(); } else if (item.rarity === 'epic') SFX.bell(); else SFX.jump();
      actions.innerHTML = `${!res.dup ? `<button class="btn btn-primary" id="crate-equip">ZAŁÓŻ</button>` : ''}${p.crates[tier] ? `<button class="btn" id="crate-again">OTWÓRZ KOLEJNĄ (${p.crates[tier]})</button>` : ''}<button class="btn btn-ghost" id="crate-close">Zamknij</button>`;
      const close = () => { ov.hidden = true; if (done) done(); };
      $('#crate-close').onclick = close;
      const eqb = $('#crate-equip'); if (eqb) eqb.onclick = () => { p.equipped[item.type] = item.id; PROFILE.save(); toast(itemIcon(item), 'Założone!', item.type === 'taunt' ? 'Usłyszysz to przed walką' : item.name); close(); };
      const ag = $('#crate-again'); if (ag) ag.onclick = () => this.openCrate(tier, done);
    }, 1350);
  },
  // ---------- Szatnia ----------
  renderWardrobe() {
    const p = PROFILE.d; $('#chips-wardrobe').textContent = '🪙 ' + p.chips;
    const tabs = Object.keys(ITEM_TYPES).concat(['upg']);
    $('#wardrobe-tabs').innerHTML = tabs.map((t) => `<button class="tab ${this.wardrobeTab === t ? 'on' : ''}" data-tab="${t}">${t === 'upg' ? '⬆️ Rozwój' : ITEM_TYPES[t]}</button>`).join('');
    $$('[data-tab]').forEach((b) => b.onclick = () => { this.wardrobeTab = b.dataset.tab; this.renderWardrobe(); });
    const grid = $('#item-grid'), upg = $('#upg-box');
    this.previewChar = this.previewChar || ROSTER[0];
    $('#preview-pick').innerHTML = ROSTER.map((ch) => `<img src="${headSrc(ch)}" data-pv="${ch.id}" class="${ch.id === this.previewChar.id ? 'on' : ''}" alt="${ch.name}">`).join('');
    $$('[data-pv]').forEach((img) => img.onclick = () => { this.previewChar = ROSTER.find((c) => c.id === img.dataset.pv); this.renderWardrobe(); });
    if (this.wardrobeTab === 'upg') {
      grid.hidden = true; upg.hidden = false; this.renderUpgrades();
    } else {
      grid.hidden = false; upg.hidden = true;
      const type = this.wardrobeTab; const list = ITEMS.filter((i) => i.type === type);
      const owned = list.filter((i) => PROFILE.owns(i.id)).length;
      grid.innerHTML = `<div class="item none ${!p.equipped[type] ? 'on' : ''}" data-eq=""><div class="ic">🚫</div><div class="n">Bez niczego</div><div class="r" style="color:var(--muted)">${owned}/${list.length} zdobytych</div></div>` +
        list.map((it) => { const has = PROFILE.owns(it.id); return `<div class="item ${has ? '' : 'locked'} ${p.equipped[type] === it.id ? 'on' : ''}" data-eq="${it.id}" title="${it.name}"><div class="ic">${itemIcon(it)}</div><div class="n">${has || it.type !== 'taunt' ? it.name : '???'}</div><div class="r" style="color:${RARITY[it.rarity].col}">${RARITY[it.rarity].name}</div></div>`; }).join('');
      $$('[data-eq]').forEach((el) => el.onclick = () => { const id = el.dataset.eq; if (id && !PROFILE.owns(id)) { toast('🔒', 'Nie masz tego', 'Zdobądź w skrzynce albo kup w sklepie'); return; } p.equipped[type] = id || null; PROFILE.save(); SFX.ensure(); SFX.jump(); this.renderWardrobe(); });
    }
    this.drawPreview();
  },
  drawPreview() {
    const cv = $('#preview-canvas'); const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
    const eq = PROFILE.equipped();
    const f = new Fighter(this.previewChar, 0, NULL_CTRL); f.cos = { gloves: eq.gloves, shorts: eq.shorts, hat: eq.hat, ko: eq.ko }; f.bigHead = PROFILE.d.bigHeads;
    f.x = 150; f.y = 300; f.animT = performance.now() / 1000; f.pose = computePose(f);
    ctx.save(); ctx.translate(0, 0); ctx.scale(1.05, 1.05); drawFighter(ctx, f, performance.now() / 1000); ctx.restore();
    if (this.screen === 's-wardrobe') requestAnimationFrame(() => this.drawPreview());
  },
  renderUpgrades() {
    const p = PROFILE.d, ch = this.previewChar, lvl = p.upgrades[ch.id] || 0, sp = SPECIALS[ch.id], wins = p.charWins[ch.id] || 0;
    const tiers = [
      { name: 'Szybsze ładowanie', desc: 'Pasek MOCY ładuje się o 25% szybciej', cost: 300, req: 3 },
      { name: 'Mocniejsza moc', desc: 'Supermoc zadaje 30% więcej obrażeń', cost: 600, req: 10 },
      { name: sp ? sp.up3n : 'Ulepszenie', desc: sp ? sp.up3 : '', cost: 1000, req: 25 },
    ];
    $('#upg-box').innerHTML = `<h3>⬆️ Rozwój: ${ch.name} ${'★'.repeat(lvl)}${'☆'.repeat(3 - lvl)}</h3><div class="t" style="color:var(--muted);font-size:0.8rem">Wygrane tą postacią: ${wins}. Ulepszenia kupujesz za żetony, po kolei.</div>` +
      tiers.map((t, i) => { const done = lvl > i, next = lvl === i, can = next && wins >= t.req && p.chips >= t.cost;
        return `<div class="upg-row ${done ? 'done' : ''}"><div><b>${i + 1}. ${t.name}</b><span class="t">${t.desc}</span>${next && wins < t.req ? `<div class="req">Wymaga ${t.req} wygranych tą postacią (masz ${wins})</div>` : ''}</div>
          <div>${done ? '✅' : next ? `<button class="btn btn-sm ${can ? 'btn-primary' : ''}" data-upg="${i}" ${can ? '' : 'disabled'}>🪙 ${t.cost}</button>` : '🔒'}</div></div>`; }).join('');
    $$('[data-upg]').forEach((b) => b.onclick = () => { const i = +b.dataset.upg; const t = tiers[i]; if (p.chips >= t.cost && (p.upgrades[ch.id] || 0) === i) { p.chips -= t.cost; p.upgrades[ch.id] = i + 1; PROFILE.save(); toast('⬆️', ch.name + ': ' + t.name, t.desc); SFX.ensure(); SFX.bell(); this.renderWardrobe(); } });
  },
  saveHall(id) { PROFILE.d.crowns[id] = (PROFILE.d.crowns[id] || 0) + 1; PROFILE.save(); },
  renderTrophies() {
    const p = PROFILE.d, lvl = PROFILE.level();
    const fav = Object.entries(p.charPlays).sort((a, b) => b[1] - a[1])[0];
    const tiles = [['Poziom', lvl], ['Walki', p.fights], ['Wygrane', p.wins], ['Przegrane', p.losses], ['Najlepsza seria', p.bestStreak], ['Najdłuższe combo', p.maxCombo + 'x'], ['Supermoce', p.specials], ['Bloki', p.blocks], ['Uniki', p.dodges], ['Korony', Object.values(p.crowns).reduce((a, b) => a + b, 0)], ['Przetrwanie', p.survivalBest], ['Najszybsze K.O.', p.fastestWin ? p.fastestWin.toFixed(1) + ' s' : '–'], ['Ulubiona postać', fav ? (ROSTER.find((c) => c.id === fav[0]) || {}).name || '–' : '–']];
    $('#stats-box').innerHTML = tiles.map(([l, v]) => `<div class="stat-tile"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');
    const bosses = Object.entries(p.bosses).sort((a, b) => b[1].date - a[1].date);
    $('#boss-badges').innerHTML = bosses.length ? '<h3>👹 Pokonani bossowie tygodnia</h3><div class="badges-row">' + bosses.map(([k, b]) => { const ch = ROSTER.find((c) => c.id === b.ch) || {}; const mod = BOSS_MODS.find((m) => m.id === b.mod) || {}; return `<div class="badge"><img src="${ch.id ? headSrc(ch) : ''}" alt=""><b>${ch.name || '?'}</b><span>${mod.name || ''}</span><small>${new Date(b.date).toLocaleDateString('pl-PL')}</small></div>`; }).join('') + '</div>' : '';
    $('#trophy-grid').innerHTML = TROPHIES.map((t) => {
      const done = !!p.trophies[t.id]; const pr = t.prog ? t.prog(p) : null;
      return `<div class="trophy ${done ? 'done' : ''}"><div class="ic">${t.icon}</div><div><div class="n">${t.name}</div><div class="d">${t.desc}</div>${pr && !done ? `<div class="p"><b style="width:${Math.min(100, Math.round(pr[0] / pr[1] * 100))}%"></b></div><div class="pt">${Math.min(pr[0], pr[1])} / ${pr[1]}</div>` : ''}${done ? '<div class="pt">✅ zdobyty</div>' : ''}</div></div>`;
    }).join('');
  },

  // ---------- Wybór ----------
  openSelect() {
    this.p1 = null; this.p2 = null; this.pickingP2 = false;
    this.renderGrid(); this.show('s-select');
  },
  renderGrid() {
    const grid = $('#grid'); grid.innerHTML = '';
    const wbx = weeklyBoss();
    $('#select-title').textContent = this.mode === 'casino' ? `Pojedynek z krupierem o ${this.casinoStake} żetonów. Kim walczysz?` : this.mode === 'versus' ? (this.pickingP2 ? 'Gracz 2: wybierz wojownika' : 'Gracz 1: wybierz wojownika') : this.mode === 'quick' ? (this.pickingP2 ? 'Szybki mecz: wybierz przeciwnika' : 'Szybki mecz: kim walczysz?') : this.mode === 'boss' ? `Boss: ${wbx.ch.name} ${wbx.mod.name}. Kim walczysz?` : this.mode === 'tourney' ? 'Wybierz wojownika' : 'Wybierz wojownika';
    $('#btn-fight').textContent = (this.mode === 'versus' || this.mode === 'quick') && !this.pickingP2 ? 'DALEJ' : 'WALCZ!';
    ROSTER.forEach((ch) => {
      const card = document.createElement('div'); card.className = 'card' + (ch.legendary ? ' legendary' : '');
      card.style.setProperty('--glove', ch.glove);
      const hp = BASE_HP * (ch.legendary ? LEGEND_MULT : 1);
      card.innerHTML = `
        <div class="card-head"><img src="${headSrc(ch)}" alt="${ch.name}" /></div>
        <div class="name">${ch.name}${VOICES.any(ch) ? ' <span class="voice" title="ma głos">🔊</span>' : ''}</div>
        <div class="title">${ch.title}</div>
        <div class="badges">${'⭐'.repeat(masteryStars(ch.id))}${PROFILE.d.crowns[ch.id] ? ' 👑' + (PROFILE.d.crowns[ch.id] > 1 ? 'x' + PROFILE.d.crowns[ch.id] : '') : ''}</div>
        ${statsHtml(ch)}
        <div class="sp">${SPECIALS[ch.id] ? SPECIALS[ch.id].icon + ' <b>' + SPECIALS[ch.id].name + '</b>' : ''}</div>`;
      if (this.pickingP2 && this.p1 && this.p1.id === ch.id) card.classList.add('taken');
      card.addEventListener('click', () => this.pickCard(ch, card, hp));
      grid.appendChild(card);
    });
    $('#btn-fight').disabled = true;
    $('#spotlight').querySelector('.spot-empty').hidden = false; $('#spotlight').querySelector('.spot-card').hidden = true;
    $('#sel-info').innerHTML = this.mode === 'boss' ? `👹 <b>${wbx.ch.name}</b> jako <em>${wbx.mod.name}</em>: ${wbx.mod.desc}. Nagroda za pierwsze zwycięstwo w tygodniu: 500 żetonów i Złota Skrzynka.` : this.mode === 'versus' ? (this.touchVersus() ? 'Na telefonie gracie na punkty: każdy po kolei walczy z AI jako postać rywala, lepszy wynik wygrywa. Podajcie sobie telefon.' : 'Gracz 1 wybiera na WASD, Gracz 2 na strzałkach.') : this.mode === 'quick' ? (this.pickingP2 ? `Grasz jako <b>${this.p1 ? this.p1.name : ''}</b>. Teraz wybierz, z kim chcesz się bić. Jeden mecz, normalne nagrody.` : 'Jeden mecz na Twoich zasadach: wybierasz swoją postać i przeciwnika. XP i żetony jak zwykle.') : this.mode === 'survival' ? 'Przetrwanie: walczysz z całą ekipą po kolei, HP nie odnawia się w pełni. Ile fal wytrzymasz?' : 'Pokonaj całą ekipę i zdobądź koronę. Legendy czekają na końcu.';
  },
  fillSpotlight(ch) {
    const sp = $('#spotlight'); sp.querySelector('.spot-empty').hidden = true;
    const box = sp.querySelector('.spot-card'); box.hidden = false;
    box.style.setProperty('--glove', ch.glove);
    box.classList.toggle('legendary', !!ch.legendary);
    $('#spot-badge').hidden = !ch.legendary;
    $('#spot-img').src = headSrc(ch);
    $('#spot-name').textContent = ch.name;
    $('#spot-title').textContent = '„' + ch.title + '”';
    $('#spot-taunt').textContent = '„' + ch.taunt + '”';
    $('#spot-stats').innerHTML = statsHtml(ch);
    const spc = SPECIALS[ch.id];
    $('#spot-special').innerHTML = spc ? `<b>${spc.icon} ${spc.name}</b>${spc.desc}` : '';
    const w = PROFILE.d.charWins[ch.id] || 0, cr = PROFILE.d.crowns[ch.id] || 0, st = masteryStars(ch.id);
    $('#spot-mastery').innerHTML = `${'⭐'.repeat(st)}${st < 3 ? '☆'.repeat(3 - st) : ''} <b>${w}</b> wygranych${cr ? ` • 👑 <b>${cr}</b> ${cr === 1 ? 'korona' : 'koron'}` : ''}`;
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  },
  pickCard(ch, card, hp) {
    SFX.ensure(); SFX.jump();
    if (!VOICES.play(ch, 'wybor', { cooldown: 300 })) VOICES.play(ch, 'intro', { cooldown: 300 });
    $$('.card').forEach((c) => c.classList.remove('selected', 'selected-p2'));
    card.classList.add(this.pickingP2 ? 'selected-p2' : 'selected');
    if (this.pickingP2) this.p2 = ch; else this.p1 = ch;
    this.fillSpotlight(ch);
    const spx = SPECIALS[ch.id];
    $('#sel-info').innerHTML = `<b>${ch.name}</b> „${ch.title}” • ${hp} HP • szybkość ${ch.speed.toFixed(2)} • siła ${ch.power.toFixed(2)}${ch.legendary ? ' • <em>★ LEGENDA</em>' : ''}${spx ? `<br>${spx.icon} <em>${spx.name}</em>: ${spx.desc}` : ''}`;
    $('#btn-fight').disabled = false;
  },
  touchVersus() { return isTouchDevice() && !usingKeyboard; },
  confirmSelect() {
    if (this.mode === 'versus') {
      if (!this.pickingP2) { this.pickingP2 = true; this.renderGrid(); return; }
      if (this.touchVersus()) {
        // telefon bez klawiatury: pojedynek na punkty, jak w turnieju (każdy po kolei z AI jako postać rywala)
        const a = { name: 'Gracz 1', ch: this.p1 }, b = { name: 'Gracz 2', ch: this.p2 };
        this.tourney = { rounds: [[{ a, b, winner: null, score: null }]], ri: 0, mi: 0, touch: true, duel: true, pending: a };
        this.playTourneyMatch(); return;
      }
      this.startMatch({ p1: this.p1, p2: this.p2, mode: 'versus', label: 'GRACZ 1 vs GRACZ 2' });
    } else if (this.mode === 'quick') {
      if (!this.pickingP2) { this.pickingP2 = true; this.renderGrid(); return; }
      this.startQuick();
    } else if (this.mode === 'casino') {
      const dealer = ROSTER.find((c) => c.id === 'gazdziol') || ROSTER[0];
      this.startMatch({ p1: this.p1, p2: dealer, mode: 'casino', diff: 0.85, label: `POJEDYNEK Z KRUPIEREM • STAWKA ${this.casinoStake} 🪙`, events: true });
    } else if (this.mode === 'boss') {
      const wb = weeklyBoss();
      this.startMatch({ p1: this.p1, p2: wb.ch, mode: 'boss', diff: 0.9, boss: wb.mod, label: `BOSS TYGODNIA • ${wb.mod.name}` });
    } else if (this.mode === 'survival') {
      this.campaign = { player: this.p1, order: shuffle(ROSTER.filter((c) => c.id !== this.p1.id)), idx: 0, hp: BASE_HP, meter: 0, survival: true };
      this.startCampaignFight();
    } else {
      const normals = shuffle(ROSTER.filter((c) => !c.legendary && c.id !== this.p1.id));
      const legends = ROSTER.filter((c) => c.legendary && c.id !== this.p1.id);
      this.campaign = { player: this.p1, order: normals.concat(legends), idx: 0 };
      this.startCampaignFight();
    }
  },

  // ---------- Kampania ----------
  startQuick() {
    this.startMatch({ p1: this.p1, p2: this.p2, mode: 'quick', diff: 0.8, events: true, label: `SZYBKI MECZ • ${this.p1.name.toUpperCase()} vs ${this.p2.name.toUpperCase()}` });
  },
  startCampaignFight() {
    const c = this.campaign, opp = c.order[c.idx], n = c.order.length;
    const diff = c.survival ? Math.min(1, 0.4 + 0.06 * c.idx) : (opp.legendary ? 1.0 : 0.35 + 0.55 * (c.idx / Math.max(1, n - 1)));
    this.startMatch({ p1: c.player, p2: opp, mode: c.survival ? 'survival' : 'campaign', diff, p1Hp: c.survival ? c.hp : 0, p1Meter: c.survival ? c.meter : 0,
      label: c.survival ? `PRZETRWANIE • FALA ${c.idx + 1} / ${n}` : `WALKA ${c.idx + 1} / ${n}${opp.legendary ? ' • LEGENDA' : ''}` });
  },
  startMatch(opts) {
    opts.onEnd = (winner) => this.onMatchEnd(winner);
    this.match = new Match(opts); this.paused = false; $('#pause').hidden = true;
    this.show('s-game');
  },
  onMatchEnd(winner) {
    const m = this.match; const wf = m.f[winner], lf = m.f[1 - winner];
    this.match = null;
    const me = m.f[0], opp = m.f[1];
    const sum = { mode: this.mode, won: winner === 0, player: me.ch, opp: opp.ch, hpEnd: me.hp, hpMax: me.maxHp, dmgTaken: me.stats.dmgTaken, maxCombo: me.stats.maxCombo, specials: me.stats.specials, blocks: me.stats.blocks, dodges: me.stats.dodges, time: m.fightTime, oppLegendary: !!opp.ch.legendary, wave: (this.campaign && this.campaign.survival && winner === 0) ? this.campaign.idx + 1 : 0, crits: me.stats.crits || 0, pickups: me.stats.pickups || 0, perfect: m.perfect && winner === 0, boss: !!m.opts.boss };
    if (this.mode === 'casino' || this.mode === 'debt') { const p = PROFILE.d; p.fights++; p.charPlays[me.ch.id] = (p.charPlays[me.ch.id] || 0) + 1; PROFILE.save(); }
    if (this.mode === 'versus' || this.mode === 'tourney') { const p = PROFILE.d; p.fights++; p.versusFights++; p.charPlays[me.ch.id] = (p.charPlays[me.ch.id] || 0) + 1; p.charPlays[opp.ch.id] = (p.charPlays[opp.ch.id] || 0) + 1; p.maxCombo = Math.max(p.maxCombo, me.stats.maxCombo, opp.stats.maxCombo); p.specials += me.stats.specials + opp.stats.specials; const nt = TROPHIES.filter((t) => !p.trophies[t.id] && t.check(p, null)); nt.forEach((t, i) => { p.trophies[t.id] = Date.now(); setTimeout(() => toast(t.icon, 'Pucharek: ' + t.name, t.desc), 500 + i * 900); }); PROFILE.save(); }
    const settle = (this.mode === 'versus' || this.mode === 'tourney' || this.mode === 'casino' || this.mode === 'debt') ? null : settleFight(sum);
    const xpBox = $('#result-xp'); xpBox.hidden = !settle;
    if (settle) {
      const lvl = settle.lvl, cur = settle.after - PROFILE.xpFor(lvl), need = PROFILE.xpFor(lvl + 1) - PROFILE.xpFor(lvl);
      xpBox.innerHTML = '<div class="rows">' + settle.rows.map((r) => `<div class="row"><span>${r[0]}</span><b>+${r[1]} XP</b></div>`).join('') + '</div>' +
        `<div class="total"><span>RAZEM</span><b style="color:var(--gold)">+${settle.xp} XP</b></div>
         <div class="xpbar" style="margin-top:6px"><b style="width:${Math.round(cur / need * 100)}%"></b></div>
         <div class="row"><span>Poziom ${lvl} • ${PROFILE.rank(lvl)}</span><span>${cur} / ${need} XP</span></div>
         ${settle.levelUp ? `<div class="lvlup">⬆️ NOWY POZIOM ${lvl}!</div>` : ''}
         <div class="row"><span class="chips">🪙 +${settle.chips} żetonów</span>${settle.crate ? `<span class="cratewon">${CRATES[settle.crate].icon} ${CRATES[settle.crate].name}!</span>` : ''}</div>
         ${settle.crate ? `<div class="menu" style="margin-top:6px"><button class="btn btn-sm btn-primary" id="btn-open-won">OTWÓRZ SKRZYNKĘ</button></div>` : ''}`;
      const ob = $('#btn-open-won'); if (ob) ob.onclick = () => this.openCrate(settle.crate, () => { ob.remove(); });
    }
    $('#result-trophies').innerHTML = settle ? settle.newTrophies.map((t) => `<span class="t">${t.icon} <b>${t.name}</b></span>`).join('') : '';
    const rb = $('#btn-replay'); rb.hidden = !this.lastReplay;
    rb.onclick = async () => {
      const r = this.lastReplay; if (!r) return;
      const file = new File([r.blob], r.name, { type: r.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'K.O. w Only Pantslow Gang' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
      const url = URL.createObjectURL(r.blob); const v = $('#replay-video'); v.src = url; $('#replay-modal').hidden = false; $('#replay-dl').href = url; $('#replay-dl').download = r.name;
    };
    const faces = $('#result-faces');
    faces.innerHTML = `<img src="${headSrc(wf.ch)}" alt=""><span class="vs">pokonuje</span><img class="loser" src="${headSrc(lf.ch)}" alt="">`;
    const title = $('#result-title'); title.classList.remove('lose');
    $('#result-progress').innerHTML = '';

    if (this.mode === 'tourney') { this.tourneyResult(winner, m); return; }
    if (this.mode === 'debt') {
      const p = PROFILE.d, debt = p.debt;
      if (winner === 0) { p.debt = 0; p.debtDue = 0; PROFILE.save(); $('#result-kicker').textContent = 'WINDYKACJA'; title.textContent = 'DŁUG ANULOWANY!'; $('#result-text').textContent = `Watol wraca do Gazdziola z pustymi rękami. ${debt} żetonów długu znika.`; toast('💸', 'Dług anulowany', 'Watol pokonany'); }
      else {
        const taken = Math.min(p.chips, debt); p.chips -= taken; let itemTxt = '';
        if (taken < debt) { const owned = Object.keys(p.items); if (owned.length) { const id = pick(owned); delete p.items[id]; for (const k in p.equipped) if (p.equipped[k] === id) p.equipped[k] = null; itemTxt = ` i zabiera z szatni: ${ITEM_BY_ID[id] ? ITEM_BY_ID[id].name : id}`; } }
        p.debt = 0; p.debtDue = 0; PROFILE.save();
        $('#result-kicker').textContent = 'WINDYKACJA'; title.textContent = 'ZAJĘCIE'; title.classList.add('lose'); $('#result-text').textContent = `Watol zabiera ${taken} żetonów${itemTxt}. Dług zamknięty. Gazdziol przesyła pozdrowienia.`;
      }
      $('#btn-next').textContent = 'DO MENU'; $('#btn-next').onclick = () => this.show('s-title');
      this.show('s-result'); return;
    }
    if (this.mode === 'casino') {
      const stake = this.casinoStake || 0;
      if (winner === 0) { PROFILE.d.chips += stake; PROFILE.d.casinoLost = 0; PROFILE.d.casinoDuels++; PROFILE.save(); $('#result-kicker').textContent = 'POJEDYNEK Z KRUPIEREM'; title.textContent = 'ODKUTY!'; $('#result-text').textContent = `Gazdziol oddaje ${stake} żetonów. Z twarzy mu zeszło. Wracasz do stołu?`; toast('🪙', `+${stake} żetonów`, 'Krupier oddał przegrane'); }
      else { PROFILE.d.casinoLost = 0; PROFILE.save(); $('#result-kicker').textContent = 'POJEDYNEK Z KRUPIEREM'; title.textContent = 'PRZEGRANA'; title.classList.add('lose'); $('#result-text').textContent = `Gazdziol zatrzymuje ${stake} żetonów i poprawia marynarkę. Licznik strat wyzerowany.`; }
      $('#btn-next').textContent = 'DO KASYNA'; $('#btn-next').onclick = () => { CASINO.render(); this.show('s-casino'); };
      this.show('s-result'); return;
    }
    if (this.mode === 'quick') {
      $('#result-kicker').textContent = 'SZYBKI MECZ';
      if (winner === 0) { title.textContent = 'ZWYCIĘSTWO!'; $('#result-text').textContent = `${lf.ch.name} leży. Rewanż z tym samym rywalem albo wróć do menu i ustaw inną parę.`; }
      else { title.textContent = 'PRZEGRANA'; title.classList.add('lose'); $('#result-text').textContent = `${wf.ch.name} tym razem górą. Rewanż?`; }
      $('#btn-next').textContent = 'REWANŻ'; $('#btn-next').onclick = () => this.startQuick();
      this.show('s-result'); return;
    }
    if (this.mode === 'boss') {
      const wb = weeklyBoss();
      if (winner === 0) {
        $('#result-kicker').textContent = 'BOSS TYGODNIA POKONANY';
        title.textContent = 'BOSS PADŁ!';
        if (!PROFILE.d.bosses[wb.key]) { PROFILE.d.bosses[wb.key] = { ch: wb.ch.id, mod: wb.mod.id, date: Date.now() }; PROFILE.d.chips += 500; PROFILE.d.crates.gold++; PROFILE.save(); toast('👹', 'Boss tygodnia pokonany!', '+500 żetonów i Złota Skrzynka'); $('#result-text').textContent = `${wb.ch.name} ${wb.mod.name} leży. Odznaka bossa zapisana w Pucharkach. +500 żetonów, Złota Skrzynka w Sklepie.`; }
        else $('#result-text').textContent = `${wb.ch.name} ${wb.mod.name} znowu leży. Nagroda tygodnia już odebrana, wpadnij po nowego bossa za ${fmtLeft(wb.left)}.`;
        $('#btn-next').textContent = 'JESZCZE RAZ';
      } else {
        $('#result-kicker').textContent = 'BOSS TYGODNIA'; title.textContent = 'PRZEGRANA'; title.classList.add('lose');
        $('#result-text').textContent = `${wb.ch.name} ${wb.mod.name}: ${wb.mod.desc}. Spróbuj inną postacią albo z ulepszeniami.`;
        $('#btn-next').textContent = 'REWANŻ';
      }
      $('#btn-next').onclick = () => this.startMatch({ p1: this.p1, p2: wb.ch, mode: 'boss', diff: 0.9, boss: wb.mod, label: `BOSS TYGODNIA • ${wb.mod.name}` });
      this.show('s-result'); return;
    }
    if (this.mode === 'versus') {
      $('#result-kicker').textContent = 'KONIEC WALKI';
      title.textContent = `${wf.ch.name.toUpperCase()} WYGRYWA!`;
      $('#result-text').textContent = `Gracz ${winner + 1} rozłożył ${lf.ch.name}. Rewanż?`;
      $('#btn-next').textContent = 'REWANŻ';
      $('#btn-next').onclick = () => this.startMatch({ p1: this.p1, p2: this.p2, mode: 'versus', label: 'GRACZ 1 vs GRACZ 2' });
      this.show('s-result'); return;
    }

    const c = this.campaign;
    if (c.survival) {
      const prog0 = $('#result-progress'); prog0.innerHTML = '';
      c.order.forEach((ch, i) => { const img = document.createElement('img'); img.src = headSrc(ch); img.className = i < c.idx + (winner === 0 ? 1 : 0) ? 'done' : (i === c.idx + (winner === 0 ? 1 : 0) ? 'now' : ''); prog0.appendChild(img); });
      if (winner === 0) {
        c.idx++; c.hp = Math.min(BASE_HP, me.hp + BASE_HP * 0.3); c.meter = me.meter;
        PROFILE.d.survivalBest = Math.max(PROFILE.d.survivalBest, c.idx); PROFILE.save();
        if (c.idx >= c.order.length) { this.showChampion(c.player, true); return; }
        const next = c.order[c.idx];
        $('#result-kicker').textContent = `PRZETRWANIE • FALA ${c.idx} / ${c.order.length} ZA TOBĄ`;
        title.textContent = 'FALA POKONANA!';
        $('#result-text').textContent = `Odzyskujesz 30 HP, wchodzisz z ${Math.ceil(c.hp)} HP. Następna fala: ${next.name} „${next.title}”.`;
        $('#btn-next').textContent = `FALA ${c.idx + 1}: ${next.name.toUpperCase()}`;
        $('#btn-next').onclick = () => this.startCampaignFight();
      } else {
        $('#result-kicker').textContent = 'PRZETRWANIE • KONIEC';
        title.textContent = `${c.idx} ${c.idx === 1 ? 'FALA' : c.idx >= 2 && c.idx <= 4 ? 'FALE' : 'FAL'}`; title.classList.add('lose');
        $('#result-text').textContent = `${wf.ch.name} zakończył twój bieg. Pokonanych: ${c.idx}. Rekord: ${PROFILE.d.survivalBest}.`;
        $('#btn-next').textContent = 'OD NOWA';
        $('#btn-next').onclick = () => { this.campaign = { player: c.player, order: shuffle(ROSTER.filter((x) => x.id !== c.player.id)), idx: 0, hp: BASE_HP, meter: 0, survival: true }; this.startCampaignFight(); };
      }
      this.show('s-result'); return;
    }
    const prog = $('#result-progress');
    c.order.forEach((ch, i) => { const img = document.createElement('img'); img.src = headSrc(ch); img.className = i < c.idx + (winner === 0 ? 1 : 0) ? 'done' : (i === c.idx + (winner === 0 ? 1 : 0) ? 'now' : ''); prog.appendChild(img); });

    if (winner === 0) {
      c.idx++;
      if (c.idx >= c.order.length) { this.showChampion(c.player); return; }
      const next = c.order[c.idx];
      $('#result-kicker').textContent = `WALKA ${c.idx} / ${c.order.length} WYGRANA`;
      title.textContent = lf.ch.legendary ? 'LEGENDA UPADŁA!' : 'ZWYCIĘSTWO!';
      $('#result-text').textContent = `${lf.ch.name} leży. Następny w kolejce: ${next.name} „${next.title}”${next.legendary ? ' — LEGENDA!' : ''}.`;
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
  showChampion(ch, survival) {
    if (!survival) { this.saveHall(ch.id); const nt = TROPHIES.filter((t) => !PROFILE.d.trophies[t.id] && t.check(PROFILE.d, null)); nt.forEach((t, i) => { PROFILE.d.trophies[t.id] = Date.now(); setTimeout(() => toast(t.icon, 'Pucharek: ' + t.name, t.desc), 800 + i * 900); }); PROFILE.d.xp += 500; PROFILE.save(); }
    $('#champ-img').src = headSrc(ch);
    $('#champ-name').textContent = ch.name;
    $('.champ-title').textContent = survival ? 'OSTATNI NA NOGACH' : 'KRÓL ONLY PANTSLOW GANG';
    $('#champ-text').textContent = survival ? `${ch.name} przetrwał całą ekipę bez odpoczynku. Nikt nie został na nogach oprócz Ciebie.` : `${ch.name} „${ch.title}” pokonał całą ekipę, w tym legendy. Korona jest Twoja, do następnego turnieju. +500 XP za koronę.`;
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
      if (this.match) { this.match.draw(this.ctx); const tb = $('#tbtn-special'); if (tb) tb.classList.toggle('ready', this.match.f[0].meter >= METER_MAX); } // update mógł zakończyć walkę
    }
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },
};

window.OPG = App; window.OPG_VOICES = VOICES; window.OPG_PICKUPS = PICKUPS; window.OPG_CASINO = CASINO;
PROFILE.load();
Promise.all([loadHeads(), VOICES.load()]).then(() => App.init());
})();
