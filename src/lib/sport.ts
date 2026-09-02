// Statystyki treningowe: tydzień, progres ćwiczenia, objętość.

import { setVolume, type SetLike } from "./training";

export type WorkoutLike = {
  date: string | Date;
  sets: SetLike[];
};
export type ActivityLike = { date: string | Date };

const dayKey = (d: string | Date) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

export type WeekStats = {
  workouts: number;
  activities: number;
  /** Dni w tygodniu bez treningu i bez aktywności. */
  restDays: number;
  volume: number;
  sets: number;
};

/**
 * Podsumowanie tygodnia (§7.2): ile treningów siłowych, ile dodatkowych
 * aktywności, ile dni przerwy. Dzień z treningiem I aktywnością liczy się
 * raz jako dzień aktywny.
 */
export function weekStats(
  workouts: WorkoutLike[],
  activities: ActivityLike[],
  weekStart: Date
): WeekStats {
  const start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const inWeek = (d: string | Date) => {
    const x = new Date(d);
    return x >= start && x < end;
  };

  const w = workouts.filter((x) => inWeek(x.date));
  const a = activities.filter((x) => inWeek(x.date));

  const activeDays = new Set([...w.map((x) => dayKey(x.date)), ...a.map((x) => dayKey(x.date))]);

  let volume = 0;
  let sets = 0;
  for (const x of w) {
    sets += x.sets.length;
    for (const s of x.sets) volume += setVolume(s);
  }

  return {
    workouts: w.length,
    activities: a.length,
    restDays: 7 - activeDays.size,
    volume: Math.round(volume),
    sets,
  };
}

export type ProgressPoint = {
  date: string;
  /** Najcięższa seria tego dnia. */
  maxWeight: number;
  /** Największa liczba powtórzeń tego dnia. */
  maxReps: number;
  /** Objętość ćwiczenia w tej sesji (serie × powt. × ciężar). */
  volume: number;
};

/**
 * Szereg czasowy dla karty ćwiczenia (§7.2): jeden punkt na sesję,
 * posortowany rosnąco po dacie.
 */
export function progressSeries(
  sessions: { date: string | Date; sets: SetLike[] }[]
): ProgressPoint[] {
  return sessions
    .map((s) => {
      let maxWeight = 0;
      let maxReps = 0;
      let volume = 0;
      for (const set of s.sets) {
        const w = set.weight == null ? 0 : Number(set.weight);
        if (Number.isFinite(w) && w > maxWeight) maxWeight = w;
        if (set.reps > maxReps) maxReps = set.reps;
        volume += setVolume(set);
      }
      return {
        date: new Date(s.date).toISOString(),
        maxWeight,
        maxReps,
        volume: Math.round(volume),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Ostatnia sesja danego ćwiczenia — podpowiedź „od czego zacząć". */
export function lastSessionSummary(points: ProgressPoint[]): ProgressPoint | null {
  return points.length ? points[points.length - 1] : null;
}
