import type { ItemDTO } from "./types";

/** Czas sortowania: startAt (event) lub dueAt (timed task), inaczej null. */
export function itemTime(item: ItemDTO): number | null {
  const iso = item.startAt ?? item.dueAt;
  return iso ? new Date(iso).getTime() : null;
}

/**
 * Sortowanie list wg zasady z §5:
 * najpierw PILNE, potem reszta po godzinie (bez godziny na końcu),
 * a odhaczone zawsze na dole.
 */
export function sortForList(items: ItemDTO[]): ItemDTO[] {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ap = a.priority === "PILNE";
    const bp = b.priority === "PILNE";
    if (ap !== bp) return ap ? -1 : 1;
    const at = itemTime(a);
    const bt = itemTime(b);
    if (at == null && bt == null) return a.title.localeCompare(b.title, "pl");
    if (at == null) return 1;
    if (bt == null) return -1;
    return at - bt;
  });
}

export function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

/** Element „na dziś": event/timed task z datą dziś, albo zwykłe zadanie niezrobione. */
export function isForToday(item: ItemDTO, ref: Date = new Date()): boolean {
  if (item.type === "TASK") return !item.done;
  const iso = item.startAt ?? item.dueAt;
  return iso ? isSameDay(iso, ref) : false;
}

/** Zaległe: niezrobione TIMED_TASK z poprzednich dni. */
export function isOverdue(item: ItemDTO, ref: Date = new Date()): boolean {
  if (item.type !== "TIMED_TASK" || item.done || !item.dueAt) return false;
  const d = new Date(item.dueAt);
  const startToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  return d < startToday;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
