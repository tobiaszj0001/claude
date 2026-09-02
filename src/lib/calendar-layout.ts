// Układ nakładających się elementów w siatce czasu.
// Elementy, które zachodzą na siebie w czasie, dzielą szerokość kolumny
// na "pasy" (lanes), żeby żaden nie zasłaniał drugiego.

export type Block<T> = {
  data: T;
  /** minuty od północy */
  startMin: number;
  endMin: number;
};

export type PositionedBlock<T> = Block<T> & {
  lane: number;
  lanes: number;
};

/**
 * Przydziela każdemu blokowi pas tak, żeby nakładające się elementy
 * leżały obok siebie. Zwraca też łączną liczbę pasów w grupie kolizji,
 * żeby dało się policzyć szerokość (100% / lanes).
 */
export function layoutBlocks<T>(blocks: Block<T>[]): PositionedBlock<T>[] {
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const result: PositionedBlock<T>[] = [];

  // Grupa kolizji = ciąg bloków, gdzie każdy zachodzi na poprzedni zakres.
  let group: PositionedBlock<T>[] = [];
  let groupEnd = -Infinity;

  const flush = () => {
    if (group.length === 0) return;
    const lanes = Math.max(...group.map((b) => b.lane)) + 1;
    for (const b of group) {
      b.lanes = lanes;
      result.push(b);
    }
    group = [];
    groupEnd = -Infinity;
  };

  for (const block of sorted) {
    if (block.startMin >= groupEnd) flush();

    // Znajdź pierwszy wolny pas w bieżącej grupie.
    const taken = new Set(
      group.filter((b) => b.endMin > block.startMin).map((b) => b.lane)
    );
    let lane = 0;
    while (taken.has(lane)) lane += 1;

    group.push({ ...block, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, block.endMin);
  }
  flush();

  return result;
}

export function minutesOf(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}
