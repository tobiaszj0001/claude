import { describe, it, expect } from "vitest";
import { rangeForPeriod, previousRange, monthKey } from "./dates";

const ref = new Date(2026, 7, 11, 14, 30); // wtorek, 11 sierpnia 2026

describe("rangeForPeriod", () => {
  it("DAY obejmuje cały dzień", () => {
    const r = rangeForPeriod("DAY", ref);
    expect(r.start.getHours()).toBe(0);
    expect(r.start.getDate()).toBe(11);
    expect(r.end.getDate()).toBe(11);
    expect(r.end.getHours()).toBe(23);
  });

  it("WEEK zaczyna się w poniedziałek", () => {
    const r = rangeForPeriod("WEEK", ref);
    expect(r.start.getDay()).toBe(1); // poniedziałek
    expect(r.start.getDate()).toBe(10);
    expect(r.end.getDate()).toBe(16); // niedziela
  });

  it("MONTH obejmuje cały miesiąc, także dni po dzisiaj", () => {
    const r = rangeForPeriod("MONTH", ref);
    expect(r.start.getDate()).toBe(1);
    expect(r.end.getDate()).toBe(31);
    // transakcja z 20 sierpnia (w przyszłości) mieści się w zakresie
    expect(new Date(2026, 7, 20) >= r.start && new Date(2026, 7, 20) <= r.end).toBe(true);
  });

  // Regresja: wcześniej „od początku" kończyło się na dzisiaj, przez co
  // transakcje z datą w przyszłości wypadały z podsumowania i suma
  // nie zgadzała się z zawartością bazy.
  it("ALL nie ucina przyszłości", () => {
    const r = rangeForPeriod("ALL", ref);
    const future = new Date(2027, 0, 1);
    expect(future >= r.start && future <= r.end).toBe(true);
  });

  it("ALL obejmuje też odległą przeszłość", () => {
    const r = rangeForPeriod("ALL", ref);
    expect(new Date(2001, 0, 1) >= r.start).toBe(true);
  });
});

describe("previousRange", () => {
  it("poprzedni miesiąc to lipiec", () => {
    const r = previousRange("MONTH", ref);
    expect(r.start.getMonth()).toBe(6);
    expect(r.end.getMonth()).toBe(6);
  });
  it("poprzedni tydzień kończy się przed bieżącym", () => {
    const prev = previousRange("WEEK", ref);
    const cur = rangeForPeriod("WEEK", ref);
    expect(prev.end < cur.start).toBe(true);
  });
});

describe("monthKey", () => {
  it("zwraca YYYY-MM", () => {
    expect(monthKey(ref)).toBe("2026-08");
  });
});
