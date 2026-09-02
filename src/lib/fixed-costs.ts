// Logika kosztów stałych.
//
// Zasada ze specyfikacji: koszt stały NIE księguje się sam. Gdy nadejdzie
// jego dzień miesiąca, pojawia się jako pozycja oczekująca (PENDING) i czeka
// na decyzję: „Zatwierdź" (tworzy Transaction) albo „Pomiń w tym miesiącu".
// Dopóki nie zostanie zatwierdzony, nie wlicza się do stanu konta.

export type FixedCostLike = {
  id: string;
  dayOfMonth: number;
  startDate: Date | string;
  endDate?: Date | string | null;
  active: boolean;
};

/** "YYYY-MM" dla danej daty. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Liczba dni w miesiącu (rok, miesiąc 0-11). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Faktyczna data księgowania w danym miesiącu.
 * dayOfMonth = 31 w lutym przypada na ostatni dzień miesiąca, nie „wylewa się"
 * na marzec — inaczej koszt z 31. znikałby w krótszych miesiącach.
 */
export function occurrenceDate(year: number, month: number, dayOfMonth: number): Date {
  const day = Math.min(dayOfMonth, daysInMonth(year, month));
  return new Date(year, month, day, 12, 0, 0, 0);
}

/**
 * Miesiące ("YYYY-MM"), w których koszt stały powinien już czekać na decyzję:
 * dzień księgowania minął, mieści się w okresie obowiązywania i nie wybiega
 * w przyszłość. Nieaktywny koszt nie generuje nic nowego.
 */
export function dueMonths(fc: FixedCostLike, now: Date = new Date()): string[] {
  if (!fc.active) return [];

  const start = new Date(fc.startDate);
  const end = fc.endDate ? new Date(fc.endDate) : null;
  if (start > now) return [];

  const out: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();

  // Zabezpieczenie przed nieskończoną pętlą przy absurdalnych datach.
  for (let guard = 0; guard < 1200; guard++) {
    const occ = occurrenceDate(y, m, fc.dayOfMonth);
    if (occ > now) break;
    if (occ >= startOfDay(start) && (!end || occ <= end)) {
      out.push(monthKey(occ));
    }
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    if (end && new Date(y, m, 1) > end) break;
  }
  return out;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** Data księgowania dla konkretnego klucza miesiąca. */
export function occurrenceForMonth(month: string, dayOfMonth: number): Date {
  const [y, m] = month.split("-").map(Number);
  return occurrenceDate(y, m - 1, dayOfMonth);
}
