// Logika treningowa: objętość, rekordy, statystyki.

export type SetLike = {
  reps: number;
  weight?: number | string | null;
  difficulty?: number | null;
};

/** Objętość pojedynczej serii = powtórzenia × ciężar (kg). Bez ciężaru = 0. */
export function setVolume(set: SetLike): number {
  const w = set.weight == null ? 0 : typeof set.weight === "string" ? parseFloat(set.weight) : set.weight;
  if (!Number.isFinite(w)) return 0;
  return set.reps * w;
}

/** Objętość całości = suma objętości serii. */
export function totalVolume(sets: SetLike[]): number {
  return sets.reduce((acc, s) => acc + setVolume(s), 0);
}

export type ExerciseRecords = {
  maxWeight: number | null;
  maxReps: number | null;
  maxSessionVolume: number | null;
  avgDifficulty: number | null;
};

/**
 * Rekordy dla ćwiczenia. `sessionVolumes` to objętości pogrupowane per sesja
 * (do wyznaczenia największej objętości w jednej sesji).
 */
export function computeExerciseRecords(
  sets: SetLike[],
  sessionVolumes: number[]
): ExerciseRecords {
  if (sets.length === 0) {
    return { maxWeight: null, maxReps: null, maxSessionVolume: null, avgDifficulty: null };
  }
  let maxWeight = 0;
  let maxReps = 0;
  let diffSum = 0;
  let diffCount = 0;
  for (const s of sets) {
    const w = s.weight == null ? 0 : typeof s.weight === "string" ? parseFloat(s.weight) : s.weight;
    if (Number.isFinite(w) && w > maxWeight) maxWeight = w;
    if (s.reps > maxReps) maxReps = s.reps;
    if (s.difficulty != null) {
      diffSum += s.difficulty;
      diffCount += 1;
    }
  }
  return {
    maxWeight: maxWeight || null,
    maxReps: maxReps || null,
    maxSessionVolume: sessionVolumes.length ? Math.max(...sessionVolumes) : null,
    avgDifficulty: diffCount ? Math.round((diffSum / diffCount) * 10) / 10 : null,
  };
}
