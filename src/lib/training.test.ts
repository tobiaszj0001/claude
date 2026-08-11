import { describe, it, expect } from "vitest";
import { setVolume, totalVolume, computeExerciseRecords } from "./training";

describe("setVolume", () => {
  it("liczy powtórzenia × ciężar", () => {
    expect(setVolume({ reps: 10, weight: 80 })).toBe(800);
  });
  it("bez ciężaru = 0", () => {
    expect(setVolume({ reps: 12, weight: null })).toBe(0);
  });
  it("akceptuje ciężar jako string", () => {
    expect(setVolume({ reps: 8, weight: "62.5" })).toBe(500);
  });
});

describe("totalVolume", () => {
  it("sumuje objętość serii", () => {
    const v = totalVolume([
      { reps: 10, weight: 80 },
      { reps: 8, weight: 80 },
      { reps: 6, weight: 90 },
    ]);
    expect(v).toBe(800 + 640 + 540);
  });
});

describe("computeExerciseRecords", () => {
  it("wyznacza rekordy i średnią trudność", () => {
    const r = computeExerciseRecords(
      [
        { reps: 10, weight: 80, difficulty: 6 },
        { reps: 8, weight: 90, difficulty: 8 },
        { reps: 12, weight: 70, difficulty: 7 },
      ],
      [1440, 2000]
    );
    expect(r.maxWeight).toBe(90);
    expect(r.maxReps).toBe(12);
    expect(r.maxSessionVolume).toBe(2000);
    expect(r.avgDifficulty).toBe(7);
  });
  it("pusta lista = same null", () => {
    const r = computeExerciseRecords([], []);
    expect(r).toEqual({ maxWeight: null, maxReps: null, maxSessionVolume: null, avgDifficulty: null });
  });
});
