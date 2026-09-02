import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Pomocnicze ─────────────────────────────────────────────────────
const now = new Date();
function daysAgo(n: number, h = 9, m = 0) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
}
function at(day: Date, h: number, m = 0) {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}
function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  console.log("🌱 Czyszczę bazę…");
  await prisma.workoutSet.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.workoutTemplateItem.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.fixedCostEntry.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.fixedCost.deleteMany();
  await prisma.item.deleteMany();
  await prisma.goal.deleteMany();

  // ── ITEMY: eventy, zadania, zadania czasowe ─────────────────────
  console.log("📅 Itemy…");
  const items: any[] = [];

  // Dzisiejszy plan
  items.push(
    { type: "EVENT", title: "Nagranie Reels dla klienta X", area: "BIZNES", businessSection: "SOCIAL_MEDIA", startAt: at(now, 9), endAt: at(now, 10, 30), priority: "NORMAL" },
    { type: "EVENT", title: "Call z klientem — nowy lejek", area: "BIZNES", businessSection: "CRM", startAt: at(now, 11), endAt: at(now, 12), priority: "PILNE" },
    { type: "TIMED_TASK", title: "Wysłać ofertę do leada", area: "BIZNES", businessSection: "CRM", dueAt: at(now, 14), priority: "PILNE" },
    { type: "EVENT", title: "Trening — Góra A", area: "SPORT", startAt: at(now, 17, 30), endAt: at(now, 19), priority: "NORMAL" },
    { type: "TASK", title: "Zamówić suplementy", area: "SPORT", priority: "NORMAL" },
    { type: "TIMED_TASK", title: "Odebrać paczkę", area: "ZYCIE", dueAt: at(now, 18), priority: "NORMAL" },
    { type: "TASK", title: "Przeczytać rozdział książki", area: "ZYCIE", priority: "NORMAL" }
  );

  // Zaległe (poprzednie dni, niezrobione timed task)
  items.push(
    { type: "TIMED_TASK", title: "Zapłacić fakturę za reklamy", area: "BIZNES", businessSection: "DODATKOWE", dueAt: daysAgo(2, 12), priority: "PILNE", done: false },
    { type: "TIMED_TASK", title: "Umówić przegląd auta", area: "ZYCIE", dueAt: daysAgo(1, 15), priority: "NORMAL", done: false }
  );

  // Nadchodzące i historyczne eventy przez ~3 miesiące
  const eventTemplates = [
    { title: "Sesja zdjęciowa", area: "BIZNES", businessSection: "SOCIAL_MEDIA", h: 10, dur: 2 },
    { title: "Planowanie contentu", area: "BIZNES", businessSection: "SOCIAL_MEDIA", h: 9, dur: 1 },
    { title: "Onboarding klienta", area: "BIZNES", businessSection: "CRM", h: 13, dur: 1 },
    { title: "Analiza kampanii", area: "BIZNES", businessSection: "DODATKOWE", h: 15, dur: 1 },
    { title: "Spotkanie ze znajomymi", area: "ZYCIE", h: 19, dur: 3 },
    { title: "Wizyta u rodziców", area: "ZYCIE", h: 14, dur: 4 },
  ];
  for (let d = -80; d <= 20; d += 1) {
    if (Math.random() < 0.35) {
      const t = eventTemplates[rand(0, eventTemplates.length - 1)];
      const day = daysAgo(-d);
      items.push({
        type: "EVENT",
        title: t.title,
        area: t.area,
        businessSection: (t as any).businessSection ?? null,
        startAt: at(day, t.h),
        endAt: at(day, t.h + t.dur),
        priority: Math.random() < 0.15 ? "PILNE" : "NORMAL",
        done: d < 0,
      });
    }
  }

  for (const it of items) {
    await prisma.item.create({
      data: {
        ...it,
        done: it.done ?? false,
        doneAt: it.done ? it.startAt ?? it.dueAt ?? new Date() : null,
      },
    });
  }

  // ── CELE ────────────────────────────────────────────────────────
  console.log("🎯 Cele…");
  await prisma.goal.createMany({
    data: [
      { area: "BIZNES", title: "10 000 zł MRR z social media", period: "QUARTER", isMainFocus: true, businessSection: "SOCIAL_MEDIA" },
      { area: "BIZNES", title: "Pozyskać 3 nowych klientów CRM", period: "MONTH", businessSection: "CRM" },
      { area: "BIZNES", title: "20 rolek miesięcznie", period: "MONTH", businessSection: "SOCIAL_MEDIA" },
      { area: "BIZNES", title: "Wdrożyć automatyzację leadów", period: "QUARTER", businessSection: "CRM" },
      { area: "BIZNES", title: "Przetestować nowy kanał reklamowy", period: "MONTH", businessSection: "DODATKOWE" },
      { area: "SPORT", title: "Wyciskanie 100 kg na 5 powtórzeń", period: "QUARTER", isMainFocus: true },
      { area: "SPORT", title: "4 treningi w tygodniu", period: "WEEK" },
      { area: "ZYCIE", title: "Przeczytać 12 książek w tym roku", period: "YEAR", isMainFocus: true },
      { area: "ZYCIE", title: "Wyjazd w góry", period: "QUARTER" },
    ],
  });

  // ── FINANSE: transakcje ─────────────────────────────────────────
  console.log("💰 Transakcje…");
  const txs: any[] = [];
  // Przychody biznesowe (ostatnie 3 miesiące)
  for (let m = 0; m < 3; m++) {
    const base = new Date(now.getFullYear(), now.getMonth() - m, 1);
    txs.push(
      { kind: "INCOME", amount: rand(4000, 7000), date: new Date(base.getFullYear(), base.getMonth(), 5, 12), area: "BIZNES", businessSection: "SOCIAL_MEDIA", category: "Abonament", description: "Klient — prowadzenie social media" },
      { kind: "INCOME", amount: rand(3000, 5000), date: new Date(base.getFullYear(), base.getMonth(), 12, 12), area: "BIZNES", businessSection: "CRM", category: "Wdrożenie", description: "Wdrożenie CRM" },
      { kind: "INCOME", amount: rand(1500, 3000), date: new Date(base.getFullYear(), base.getMonth(), 20, 12), area: "BIZNES", businessSection: "DODATKOWE", category: "Konsultacje", description: "Konsultacja marketingowa" }
    );
    // Koszty biznes
    txs.push(
      { kind: "EXPENSE", amount: rand(800, 1400), date: new Date(base.getFullYear(), base.getMonth(), 8, 12), area: "BIZNES", businessSection: "SOCIAL_MEDIA", category: "Reklamy", description: "Budżet reklamowy Meta" },
      { kind: "EXPENSE", amount: rand(200, 500), date: new Date(base.getFullYear(), base.getMonth(), 15, 12), area: "BIZNES", businessSection: "DODATKOWE", category: "Narzędzia", description: "Subskrypcje SaaS" }
    );
    // Koszty sport
    txs.push(
      { kind: "EXPENSE", amount: rand(150, 250), date: new Date(base.getFullYear(), base.getMonth(), 3, 12), area: "SPORT", category: "Suplementy", description: "Odżywka białkowa" }
    );
    // Koszty życie
    txs.push(
      { kind: "EXPENSE", amount: rand(900, 1300), date: new Date(base.getFullYear(), base.getMonth(), 10, 12), area: "ZYCIE", category: "Jedzenie", description: "Zakupy spożywcze" },
      { kind: "EXPENSE", amount: rand(400, 700), date: new Date(base.getFullYear(), base.getMonth(), 18, 12), area: "ZYCIE", category: "Rozrywka", description: "Wyjścia i rozrywka" }
    );
  }
  for (const t of txs) await prisma.transaction.create({ data: t });

  // ── KOSZTY STAŁE + wpisy miesięczne ─────────────────────────────
  console.log("🔁 Koszty stałe…");
  const rentStart = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const fcRent = await prisma.fixedCost.create({
    data: { name: "Wynajem biura", amount: 1800, area: "BIZNES", businessSection: "DODATKOWE", dayOfMonth: 5, startDate: rentStart, active: true },
  });
  const fcGym = await prisma.fixedCost.create({
    data: { name: "Karnet na siłownię", amount: 159, area: "SPORT", dayOfMonth: 1, startDate: rentStart, active: true },
  });
  const fcNetflix = await prisma.fixedCost.create({
    data: { name: "Netflix", amount: 43, area: "ZYCIE", dayOfMonth: 12, startDate: rentStart, active: true },
  });

  // Zatwierdzone wpisy za poprzednie 2 miesiące, bieżący miesiąc = PENDING.
  for (const fc of [fcRent, fcGym, fcNetflix]) {
    for (let m = 2; m >= 1; m--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - m, fc.dayOfMonth, 12);
      const tx = await prisma.transaction.create({
        data: {
          kind: "EXPENSE",
          amount: fc.amount,
          date: mDate,
          area: fc.area,
          businessSection: fc.businessSection,
          category: "Koszt stały",
          description: fc.name,
          fixedCostId: fc.id,
        },
      });
      await prisma.fixedCostEntry.create({
        data: { fixedCostId: fc.id, month: monthKey(mDate), status: "CONFIRMED", transactionId: tx.id },
      });
    }
    // Bieżący miesiąc — oczekuje na zatwierdzenie
    await prisma.fixedCostEntry.create({
      data: { fixedCostId: fc.id, month: monthKey(now), status: "PENDING" },
    });
  }

  // ── TRENING: baza ćwiczeń ───────────────────────────────────────
  console.log("🏋️ Ćwiczenia i szablony…");
  const exDefs = [
    { name: "Wyciskanie sztangi na ławce płaskiej", muscleGroup: "klatka", isMachine: false, defaultSets: 4, defaultReps: 8 },
    { name: "Rozpiętki na maszynie (butterfly)", muscleGroup: "klatka", isMachine: true, equipment: "Maszyna butterfly", note: "Siedzisko 4, uchwyt środkowy", defaultSets: 3, defaultReps: 12 },
    { name: "Wiosłowanie sztangą", muscleGroup: "plecy", isMachine: false, defaultSets: 4, defaultReps: 10 },
    { name: "Ściąganie drążka wyciągu górnego", muscleGroup: "plecy", isMachine: true, equipment: "Wyciąg górny", note: "Siedzisko 3", defaultSets: 3, defaultReps: 12 },
    { name: "Wyciskanie żołnierskie (OHP)", muscleGroup: "barki", isMachine: false, defaultSets: 4, defaultReps: 8 },
    { name: "Uginanie ramion ze sztangą", muscleGroup: "biceps", isMachine: false, defaultSets: 3, defaultReps: 10 },
    { name: "Wyciskanie francuskie", muscleGroup: "triceps", isMachine: false, defaultSets: 3, defaultReps: 12 },
    { name: "Przysiad ze sztangą", muscleGroup: "nogi", isMachine: false, defaultSets: 4, defaultReps: 8 },
    { name: "Prostowanie nóg na maszynie", muscleGroup: "nogi", isMachine: true, equipment: "Maszyna do prostowania", note: "Oparcie 2", defaultSets: 3, defaultReps: 15 },
    { name: "Brzuszki na maszynie", muscleGroup: "brzuch", isMachine: true, defaultSets: 3, defaultReps: 20 },
  ];
  const exercises: Record<string, any> = {};
  for (const e of exDefs) {
    exercises[e.name] = await prisma.exercise.create({ data: e as any });
  }

  const gora = await prisma.workoutTemplate.create({
    data: {
      name: "Góra A",
      description: "Klatka, plecy, barki, ramiona",
      items: {
        create: [
          { exerciseId: exercises["Wyciskanie sztangi na ławce płaskiej"].id, order: 0, targetSets: 4, targetReps: 8 },
          { exerciseId: exercises["Wiosłowanie sztangą"].id, order: 1, targetSets: 4, targetReps: 10 },
          { exerciseId: exercises["Wyciskanie żołnierskie (OHP)"].id, order: 2, targetSets: 4, targetReps: 8 },
          { exerciseId: exercises["Rozpiętki na maszynie (butterfly)"].id, order: 3, targetSets: 3, targetReps: 12 },
          { exerciseId: exercises["Uginanie ramion ze sztangą"].id, order: 4, targetSets: 3, targetReps: 10 },
          { exerciseId: exercises["Wyciskanie francuskie"].id, order: 5, targetSets: 3, targetReps: 12 },
        ],
      },
    },
  });
  const dol = await prisma.workoutTemplate.create({
    data: {
      name: "Dół A",
      description: "Nogi i brzuch",
      items: {
        create: [
          { exerciseId: exercises["Przysiad ze sztangą"].id, order: 0, targetSets: 4, targetReps: 8 },
          { exerciseId: exercises["Prostowanie nóg na maszynie"].id, order: 1, targetSets: 3, targetReps: 15 },
          { exerciseId: exercises["Brzuszki na maszynie"].id, order: 2, targetSets: 3, targetReps: 20 },
        ],
      },
    },
  });

  // ── TRENING: historia (12 tygodni, progresja) ───────────────────
  console.log("📈 Historia treningów…");
  const goraExercises = [
    { name: "Wyciskanie sztangi na ławce płaskiej", startW: 70, reps: 8 },
    { name: "Wiosłowanie sztangą", startW: 60, reps: 10 },
    { name: "Wyciskanie żołnierskie (OHP)", startW: 40, reps: 8 },
    { name: "Rozpiętki na maszynie (butterfly)", startW: 45, reps: 12 },
    { name: "Uginanie ramion ze sztangą", startW: 30, reps: 10 },
    { name: "Wyciskanie francuskie", startW: 25, reps: 12 },
  ];
  const dolExercises = [
    { name: "Przysiad ze sztangą", startW: 90, reps: 8 },
    { name: "Prostowanie nóg na maszynie", startW: 50, reps: 15 },
    { name: "Brzuszki na maszynie", startW: 30, reps: 20 },
  ];

  for (let week = 11; week >= 0; week--) {
    const progress = (11 - week) * 1.25; // progresywne przeciążenie
    // Poniedziałek: Góra A, Czwartek: Dół A
    const monday = daysAgo(week * 7 + ((now.getDay() + 6) % 7), 18);
    const thursday = daysAgo(week * 7 + ((now.getDay() + 6) % 7) - 3, 18);
    if (monday <= now) {
      const w = await prisma.workout.create({
        data: { date: monday, name: "Góra A", templateId: gora.id, durationMin: rand(70, 95) },
      });
      for (const ex of goraExercises) {
        const exId = exercises[ex.name].id;
        for (let s = 1; s <= (ex.name.includes("sztangi") || ex.name.includes("Wiosł") || ex.name.includes("żołnierskie") ? 4 : 3); s++) {
          await prisma.workoutSet.create({
            data: {
              workoutId: w.id,
              exerciseId: exId,
              setNumber: s,
              reps: ex.reps - (s > 2 ? rand(0, 2) : 0),
              weight: Math.round((ex.startW + progress) / 2.5) * 2.5,
              difficulty: rand(6, 9),
            },
          });
        }
      }
    }
    if (thursday <= now) {
      const w = await prisma.workout.create({
        data: { date: thursday, name: "Dół A", templateId: dol.id, durationMin: rand(60, 85) },
      });
      for (const ex of dolExercises) {
        const exId = exercises[ex.name].id;
        for (let s = 1; s <= (ex.name.includes("Przysiad") ? 4 : 3); s++) {
          await prisma.workoutSet.create({
            data: {
              workoutId: w.id,
              exerciseId: exId,
              setNumber: s,
              reps: ex.reps - (s > 2 ? rand(0, 3) : 0),
              weight: Math.round((ex.startW + progress) / 2.5) * 2.5,
              difficulty: rand(6, 9),
            },
          });
        }
      }
    }
  }

  // ── Aktywności dodatkowe ────────────────────────────────────────
  console.log("🏃 Aktywności…");
  const actNames = ["Bieganie", "Rower", "Basen", "Spacer"];
  for (let d = 0; d < 84; d += 1) {
    if (Math.random() < 0.18) {
      await prisma.activity.create({
        data: {
          date: daysAgo(d, rand(7, 19)),
          name: actNames[rand(0, actNames.length - 1)],
          durationMin: rand(30, 75),
        },
      });
    }
  }

  console.log("✅ Seed zakończony.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
