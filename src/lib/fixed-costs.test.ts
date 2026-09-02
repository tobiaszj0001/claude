import { describe, it, expect } from "vitest";
import { dueMonths, occurrenceDate, monthKey, occurrenceForMonth } from "./fixed-costs";

const fc = (over: Partial<Parameters<typeof dueMonths>[0]> = {}) => ({
  id: "x",
  dayOfMonth: 5,
  startDate: new Date(2026, 0, 1),
  endDate: null,
  active: true,
  ...over,
});

describe("occurrenceDate", () => {
  it("przycina dzień do długości miesiąca", () => {
    // 31 lutego nie istnieje — księgujemy ostatniego dnia lutego
    expect(occurrenceDate(2026, 1, 31).getDate()).toBe(28);
    expect(occurrenceDate(2024, 1, 31).getDate()).toBe(29); // rok przestępny
    expect(occurrenceDate(2026, 3, 31).getDate()).toBe(30); // kwiecień ma 30
  });
  it("nie przesuwa się na kolejny miesiąc", () => {
    expect(occurrenceDate(2026, 1, 31).getMonth()).toBe(1);
  });
});

describe("dueMonths", () => {
  it("zwraca miesiące, w których dzień księgowania już minął", () => {
    const r = dueMonths(fc(), new Date(2026, 2, 10)); // 10 marca
    expect(r).toEqual(["2026-01", "2026-02", "2026-03"]);
  });

  it("nie zwraca bieżącego miesiąca przed dniem księgowania", () => {
    const r = dueMonths(fc(), new Date(2026, 2, 3)); // 3 marca, dzień 5 jeszcze nie nadszedł
    expect(r).toEqual(["2026-01", "2026-02"]);
  });

  it("pomija miesiące przed datą startu", () => {
    const r = dueMonths(fc({ startDate: new Date(2026, 1, 20) }), new Date(2026, 3, 10));
    // luty odpada: 5 lutego jest przed startem (20 lutego)
    expect(r).toEqual(["2026-03", "2026-04"]);
  });

  it("respektuje datę zakończenia", () => {
    const r = dueMonths(
      fc({ endDate: new Date(2026, 1, 28) }),
      new Date(2026, 5, 10)
    );
    expect(r).toEqual(["2026-01", "2026-02"]);
  });

  it("nieaktywny koszt nie generuje niczego", () => {
    expect(dueMonths(fc({ active: false }), new Date(2026, 5, 1))).toEqual([]);
  });

  it("koszt zaczynający się w przyszłości nie generuje niczego", () => {
    expect(dueMonths(fc({ startDate: new Date(2027, 0, 1) }), new Date(2026, 5, 1))).toEqual([]);
  });

  it("dzień 31 działa też w lutym", () => {
    const r = dueMonths(
      fc({ dayOfMonth: 31, startDate: new Date(2026, 0, 1) }),
      new Date(2026, 2, 1)
    );
    // styczeń (31.01) i luty (28.02) — marzec jeszcze nie
    expect(r).toEqual(["2026-01", "2026-02"]);
  });

  it("przechodzi przez granicę roku", () => {
    const r = dueMonths(
      fc({ startDate: new Date(2025, 10, 1) }),
      new Date(2026, 0, 10)
    );
    expect(r).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});

describe("monthKey / occurrenceForMonth", () => {
  it("formatuje klucz miesiąca z zerem wiodącym", () => {
    expect(monthKey(new Date(2026, 0, 15))).toBe("2026-01");
    expect(monthKey(new Date(2026, 11, 1))).toBe("2026-12");
  });
  it("odtwarza datę księgowania z klucza", () => {
    const d = occurrenceForMonth("2026-02", 31);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(28);
  });
});
