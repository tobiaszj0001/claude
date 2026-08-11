import { describe, it, expect } from "vitest";
import { computeAreaSummary, formatMinutes, type SummaryItem } from "./summary";

const range = { start: new Date(2026, 7, 1), end: new Date(2026, 7, 31, 23, 59) };
const d = (day: number, h: number, m = 0) => new Date(2026, 7, day, h, m).toISOString();

describe("computeAreaSummary — zadania", () => {
  const items: SummaryItem[] = [
    { type: "TASK", done: true },
    { type: "TASK", done: false },
    { type: "TIMED_TASK", done: true, dueAt: d(10, 12) },
    { type: "TIMED_TASK", done: false, dueAt: d(15, 12) },
  ];

  it("liczy wykonane i wszystkie", () => {
    const r = computeAreaSummary(items, [], range);
    expect(r.tasksDone).toBe(2);
    expect(r.tasksTotal).toBe(4);
    expect(r.completionPct).toBe(50);
  });

  it("nie wlicza eventów do zadań", () => {
    const r = computeAreaSummary(
      [...items, { type: "EVENT", done: false, startAt: d(5, 9), endAt: d(5, 10) }],
      [],
      range
    );
    expect(r.tasksTotal).toBe(4);
  });

  it("pomija zadania czasowe spoza okresu", () => {
    const r = computeAreaSummary(
      [{ type: "TIMED_TASK", done: true, dueAt: new Date(2026, 6, 10).toISOString() }],
      [],
      range
    );
    expect(r.tasksTotal).toBe(0);
  });

  it("brak zadań to 0%, nie dzielenie przez zero", () => {
    const r = computeAreaSummary([], [], range);
    expect(r.completionPct).toBe(0);
    expect(Number.isNaN(r.completionPct)).toBe(false);
  });
});

describe("computeAreaSummary — czas na eventy", () => {
  it("sumuje minuty trwania eventów", () => {
    const r = computeAreaSummary(
      [
        { type: "EVENT", done: false, startAt: d(3, 9), endAt: d(3, 10, 30) }, // 90
        { type: "EVENT", done: false, startAt: d(4, 14), endAt: d(4, 16) }, // 120
      ],
      [],
      range
    );
    expect(r.eventMinutes).toBe(210);
  });

  it("pomija eventy spoza okresu", () => {
    const r = computeAreaSummary(
      [{ type: "EVENT", done: false, startAt: new Date(2026, 6, 3, 9).toISOString(), endAt: new Date(2026, 6, 3, 11).toISOString() }],
      [],
      range
    );
    expect(r.eventMinutes).toBe(0);
  });

  it("event bez końca nie psuje sumy", () => {
    const r = computeAreaSummary(
      [{ type: "EVENT", done: false, startAt: d(3, 9), endAt: null }],
      [],
      range
    );
    expect(r.eventMinutes).toBe(0);
  });
});

describe("computeAreaSummary — finanse", () => {
  it("liczy przychód, koszty i dochód", () => {
    const r = computeAreaSummary([], [
      { kind: "INCOME", amount: 5000 },
      { kind: "EXPENSE", amount: 1200 },
    ], range);
    expect(r.incomeCents).toBe(500000);
    expect(r.expenseCents).toBe(120000);
    expect(r.profitCents).toBe(380000);
  });
});

describe("formatMinutes", () => {
  it("formatuje godziny i minuty", () => {
    expect(formatMinutes(0)).toBe("—");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(210)).toBe("3 h 30 min");
  });
});
