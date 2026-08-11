// Wspólne podsumowanie obszaru dla wybranego okresu (§9).

import { toCents } from "./money";

export type SummaryItem = {
  type: "EVENT" | "TASK" | "TIMED_TASK";
  done: boolean;
  startAt?: string | Date | null;
  endAt?: string | Date | null;
  dueAt?: string | Date | null;
};

export type SummaryTx = {
  kind: "INCOME" | "EXPENSE";
  amount: number | string | { toString(): string };
};

export type AreaSummary = {
  incomeCents: number;
  expenseCents: number;
  profitCents: number;
  tasksDone: number;
  tasksTotal: number;
  /** Procent ukończenia, 0–100. Brak zadań = 0. */
  completionPct: number;
  /** Minuty spędzone na eventach w tym obszarze. */
  eventMinutes: number;
};

const time = (v?: string | Date | null) => (v ? new Date(v).getTime() : null);

/**
 * Liczy finanse, ukończenie zadań i czas poświęcony na eventy.
 *
 * Do zadań wliczamy TASK i TIMED_TASK — event to blok czasu, a nie rzecz
 * do odhaczenia, więc nie zaniża statystyki wykonania.
 */
export function computeAreaSummary(
  items: SummaryItem[],
  txs: SummaryTx[],
  range: { start: Date; end: Date }
): AreaSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const t of txs) {
    const c = toCents(t.amount);
    if (t.kind === "INCOME") incomeCents += c;
    else expenseCents += c;
  }

  const from = range.start.getTime();
  const to = range.end.getTime();
  const inRange = (v?: string | Date | null) => {
    const t = time(v);
    return t != null && t >= from && t <= to;
  };

  let tasksDone = 0;
  let tasksTotal = 0;
  let eventMinutes = 0;

  for (const i of items) {
    if (i.type === "EVENT") {
      if (!inRange(i.startAt)) continue;
      const s = time(i.startAt);
      const e = time(i.endAt);
      if (s != null && e != null && e > s) {
        eventMinutes += Math.round((e - s) / 60000);
      }
      continue;
    }

    // TIMED_TASK liczy się w okresie swojego terminu.
    // TASK nie ma daty — bierzemy je zawsze, bo to otwarta lista.
    if (i.type === "TIMED_TASK" && !inRange(i.dueAt)) continue;

    tasksTotal += 1;
    if (i.done) tasksDone += 1;
  }

  return {
    incomeCents,
    expenseCents,
    profitCents: incomeCents - expenseCents,
    tasksDone,
    tasksTotal,
    completionPct: tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100),
    eventMinutes,
  };
}

/** "3 h 30 min" / "45 min" / "—" */
export function formatMinutes(min: number): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
