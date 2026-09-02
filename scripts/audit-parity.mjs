import { chromium } from 'playwright';
const SP='/tmp/claude-0/-home-user-claude/81ba19d9-4465-5a73-93ba-4567dbbb8a40/scratchpad';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

/** Zbiera wszystkie widoczne akcje i nagłówki na bieżącym ekranie. */
const collect = `(()=>{
  const norm=s=>s.replace(/\\s+/g,' ').trim();
  const out={actions:new Set(),headings:new Set()};
  for(const el of document.querySelectorAll('button, a[href]')){
    const r=el.getBoundingClientRect();
    if(r.width===0||r.height===0) continue;
    const lab=norm(el.getAttribute('aria-label')||el.textContent||'');
    if(lab && lab.length<40) out.actions.add(lab);
  }
  for(const el of document.querySelectorAll('h1,h2,h3')){
    const t=norm(el.textContent||'');
    if(t) out.headings.add(t);
  }
  return {actions:[...out.actions], headings:[...out.headings]};
})()`;

async function survey(name, setup, tabs) {
  const ctx=await b.newContext({viewport:{width:375,height:812},locale:'pl-PL',timezoneId:'Europe/Warsaw'});
  const p=await ctx.newPage();
  await setup(p);
  const result={};
  for (const [label, go] of tabs) {
    await go(p);
    await p.waitForTimeout(1600);
    result[label]=await p.evaluate(collect);
  }
  await ctx.close();
  return result;
}

const appTabs=[
  ['Dziś', async p=>{await p.goto('http://localhost:3000/',{waitUntil:'networkidle'})}],
  ['Kalendarz', async p=>{await p.goto('http://localhost:3000/kalendarz',{waitUntil:'networkidle'})}],
  ['Biznes', async p=>{await p.goto('http://localhost:3000/biznes',{waitUntil:'networkidle'})}],
  ['Sport/Trening', async p=>{await p.goto('http://localhost:3000/sport',{waitUntil:'networkidle'})}],
  ['Sport/Historia', async p=>{await p.locator('.sticky button',{hasText:'Historia'}).click()}],
  ['Sport/Ćwiczenia', async p=>{await p.locator('.sticky button',{hasText:'Ćwiczenia'}).click()}],
  ['Sport/Koszty', async p=>{await p.locator('.sticky button',{hasText:'Koszty i cele'}).click()}],
  ['Życie', async p=>{await p.goto('http://localhost:3000/zycie',{waitUntil:'networkidle'})}],
  ['Finanse', async p=>{await p.goto('http://localhost:3000/finanse',{waitUntil:'networkidle'})}],
];

const prevTabs=[
  ['Dziś', async p=>{await p.locator('.bottomnav button',{hasText:'Dziś'}).click()}],
  ['Kalendarz', async p=>{await p.locator('.bottomnav button',{hasText:'Kalendarz'}).click()}],
  ['Biznes', async p=>{await p.locator('.bottomnav button',{hasText:'Biznes'}).click()}],
  ['Sport/Trening', async p=>{await p.locator('.bottomnav button',{hasText:'Sport'}).click()}],
  ['Sport/Historia', async p=>{await p.locator('.seg button',{hasText:'Historia'}).click()}],
  ['Sport/Ćwiczenia', async p=>{await p.locator('.seg button',{hasText:'Ćwiczenia'}).click()}],
  ['Sport/Koszty', async p=>{await p.locator('.seg button',{hasText:'Koszty i cele'}).click()}],
  ['Życie', async p=>{await p.locator('.bottomnav button',{hasText:'Życie'}).click()}],
  ['Finanse', async p=>{await p.locator('.bottomnav button',{hasText:'Finanse'}).click()}],
];

const app=await survey('app', async p=>{
  await p.goto('http://localhost:3000/login',{waitUntil:'networkidle'});
  await p.fill('input[type=password]','demo1234'); await p.click('button[type=submit]');
  await p.waitForURL('http://localhost:3000/');
}, appTabs);

const prev=await survey('preview', async p=>{
  await p.goto('http://localhost:4000/'); await p.waitForTimeout(400);
  await p.fill('#pw','demo1234'); await p.click('button[type=submit]'); await p.waitForTimeout(700);
}, prevTabs);

// Etykiety nawigacji i wspólne elementy pomijamy — interesują nas funkcje.
const IGNORE=new Set(['Dziś','Kalendarz','Biznes','Sport','Życie','Finanse','Ustawienia',
  'Wyloguj','Przełącz motyw','Dodaj','Miesiąc','Tydzień','Dzień','3 mies.','Rok','Od początku',
  'Wszystko','Przegląd','Social Media','CRMy','Dodatkowe tematy','Trening','Historia','Ćwiczenia',
  'Koszty i cele','Poprzedni','Następny','Zamknij','klatka','plecy','barki','biceps','triceps',
  'nogi','brzuch','inne','Wszystkie','Tylko treningi','Powtórzenia','Objętość','Ciężar']);

let gaps=0;
console.log('══ BRAKI W PODGLĄDZIE (jest w aplikacji, nie ma w podglądzie) ══\n');
for (const tab of Object.keys(app)) {
  const a=new Set(app[tab].actions.filter(x=>!IGNORE.has(x)));
  const pv=new Set((prev[tab]?.actions)||[]);
  const missing=[...a].filter(x=>!pv.has(x));
  const ah=new Set(app[tab].headings.filter(x=>!IGNORE.has(x)));
  const ph=new Set((prev[tab]?.headings)||[]);
  const missingH=[...ah].filter(x=>!ph.has(x));
  if (missing.length||missingH.length) {
    console.log(`▸ ${tab}`);
    missingH.forEach(x=>{console.log(`    sekcja: „${x}"`);gaps++});
    missing.forEach(x=>{console.log(`    akcja:  „${x}"`);gaps++});
    console.log('');
  }
}
console.log(gaps===0?'✅ pełny parytet':`${gaps} różnic do sprawdzenia`);
await b.close();
