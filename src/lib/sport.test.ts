import { describe, it, expect } from "vitest";
import { weekStats, progressSeries, lastSessionSummary } from "./sport";

const mon = new Date(2026, 7, 10); // poniedziałek
const d = (offset: number, h = 18) => new Date(2026, 7, 10 + offset, h).toISOString();

describe("weekStats", () => {
  it("liczy treningi, aktywności i dni przerwy", () => {
    const r = weekStats(
      [
        { date: d(0), sets: [{ reps: 10, weight: 80 }] },
        { date: d(3), sets: [{ reps: 8, weight: 90 }] },
      ],
      [{ date: d(5) }],
      mon
    );
    expect(r.workouts).toBe(2);
    expect(r.activities).toBe(1);
    expect(r.restDays).toBe(4); // 7 − 3 dni aktywne
  });

  it("trening i aktywność tego samego dnia to jeden dzień aktywny", () => {
    const r = weekStats([{ date: d(0), sets: [] }], [{ date: d(0, 7) }], mon);
    expect(r.restDays).toBe(6);
  });

  it("nie wlicza rzeczy spoza tygodnia", () => {
    const r = weekStats(
      [
        { date: d(-1), sets: [{ reps: 10, weight: 100 }] }, // poprzedni tydzień
        { date: d(7), sets: [{ reps: 10, weight: 100 }] }, // następny
        { date: d(2), sets: [{ reps: 10, weight: 50 }] },
      ],
      [],
      mon
    );
    expect(r.workouts).toBe(1);
    expect(r.volume).toBe(500);
  });

  it("sumuje objętość i liczbę serii", () => {
    const r = weekStats(
      [
        {
          date: d(1),
          sets: [
            { reps: 10, weight: 80 },
            { reps: 8, weight: 80 },
          ],
        },
      ],
      [],
      mon
    );
    expect(r.sets).toBe(2);
    expect(r.volume).toBe(800 + 640);
  });

  it("pusty tydzień to 7 dni przerwy", () => {
    expect(weekStats([], [], mon).restDays).toBe(7);
  });
});

describe("progressSeries", () => {
  const sessions = [
    { date: d(7), sets: [{ reps: 8, weight: 85 }, { reps: 6, weight: 85 }] },
    { date: d(0), sets: [{ reps: 10, weight: 80 }, { reps: 8, weight: 80 }] },
  ];

  it("sortuje rosnąco po dacie", () => {
    const r = progressSeries(sessions);
    expect(new Date(r[0].date) < new Date(r[1].date)).toBe(true);
  });

  it("bierze najcięższą serię i najwięcej powtórzeń z sesji", () => {
    const r = progressSeries([
      { date: d(0), sets: [{ reps: 12, weight: 60 }, { reps: 5, weight: 100 }] },
    ]);
    expect(r[0].maxWeight).toBe(100);
    expect(r[0].maxReps).toBe(12);
  });

  it("liczy objętość sesji", () => {
    const r = progressSeries([
      { date: d(0), sets: [{ reps: 10, weight: 80 }, { reps: 8, weight: 80 }] },
    ]);
    expect(r[0].volume).toBe(1440);
  });

  it("ćwiczenie bez ciężaru ma objętość 0, ale liczy powtórzenia", () => {
    const r = progressSeries([{ date: d(0), sets: [{ reps: 20, weight: null }] }]);
    expect(r[0].volume).toBe(0);
    expect(r[0].maxReps).toBe(20);
  });
});

describe("lastSessionSummary", () => {
  it("zwraca ostatnią sesję", () => {
    const pts = progressSeries([
      { date: d(0), sets: [{ reps: 10, weight: 80 }] },
      { date: d(7), sets: [{ reps: 8, weight: 90 }] },
    ]);
    expect(lastSessionSummary(pts)?.maxWeight).toBe(90);
  });
  it("null dla pustej historii", () => {
    expect(lastSessionSummary([])).toBeNull();
  });
});
