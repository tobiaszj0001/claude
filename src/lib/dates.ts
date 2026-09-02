import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import type { Period } from "./enums";

export const TZ = "Europe/Warsaw";

export type Range = { start: Date; end: Date };

/**
 * Zakres dat dla okresu na ekranie głównym / w podsumowaniach.
 * "ALL" = od początku (bardzo szeroki zakres w dół).
 */
export type PeriodKey = "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR" | "ALL";

export function rangeForPeriod(period: PeriodKey, ref: Date = new Date()): Range {
  switch (period) {
    case "DAY":
      return { start: startOfDay(ref), end: endOfDay(ref) };
    case "WEEK":
      return {
        start: startOfWeek(ref, { weekStartsOn: 1 }),
        end: endOfWeek(ref, { weekStartsOn: 1 }),
      };
    case "MONTH":
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case "QUARTER":
      return { start: startOfDay(subMonths(ref, 3)), end: endOfDay(ref) };
    case "YEAR":
      return { start: startOfYear(ref), end: endOfYear(ref) };
    case "ALL":
      // „Od początku" = wszystko, bez ucinania. Gdyby koniec zatrzymać na
      // dzisiaj, transakcje wpisane z datą w przyszłości (np. faktura
      // wystawiona na 20. tego miesiąca) znikałyby z podsumowania.
      return { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) };
  }
}

/** Poprzedni okres tej samej długości (do porównań). */
export function previousRange(period: PeriodKey, ref: Date = new Date()): Range {
  switch (period) {
    case "DAY":
      return rangeForPeriod("DAY", subDays(ref, 1));
    case "WEEK":
      return rangeForPeriod("WEEK", subDays(ref, 7));
    case "MONTH":
      return rangeForPeriod("MONTH", subMonths(ref, 1));
    case "QUARTER":
      return {
        start: startOfDay(subMonths(ref, 6)),
        end: endOfDay(subMonths(ref, 3)),
      };
    case "YEAR":
      return rangeForPeriod("YEAR", subYears(ref, 1));
    case "ALL":
      return { start: new Date(2000, 0, 1), end: new Date(2000, 0, 1) };
  }
}

/** "YYYY-MM" dla danej daty (do FixedCostEntry.month). */
export function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function periodToKey(p: Period): PeriodKey {
  return p;
}
