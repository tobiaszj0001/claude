import type { Area, TxKind } from "./enums";

// Kwoty liczymy w groszach (liczby całkowite), żeby uniknąć błędów float.
// Wejście przyjmujemy jako number (PLN) lub string (z Decimal serializowanego).

/**
 * Zamienia kwotę na grosze.
 *
 * Przyjmuje też Prisma.Decimal — z bazy kwoty przychodzą jako obiekt Decimal,
 * nie jako number ani string. Wcześniejsza wersja sprawdzała tylko te dwa
 * typy i po cichu zwracała 0 dla każdej kwoty z bazy, przez co cały stan
 * konta wychodził zerowy.
 */
export function toCents(amount: number | string | { toString(): string }): number {
  const n = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function sumCents(amounts: Array<number | string | { toString(): string }>): number {
  return amounts.reduce<number>((acc, a) => acc + toCents(a), 0);
}

/** Formatuje kwotę w PLN: "12 480 zł", "-6 420 zł". */
export function formatPLN(amount: number | string | { toString(): string }, opts?: { sign?: boolean; decimals?: boolean }): string {
  const cents = toCents(amount);
  const value = fromCents(cents);
  const showDecimals = opts?.decimals ?? false;
  // Grupujemy tysiące sami: pl-PL w ICU nie grupuje liczb 4-cyfrowych
  // (minimumGroupingDigits=2), a my chcemy zawsze "6 420 zł".
  const absValue = Math.abs(value);
  const fixed = absValue.toFixed(showDecimals ? 2 : 0);
  const [intPart, fracPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const abs = fracPart ? `${grouped},${fracPart}` : grouped;
  const sign = value < 0 ? "−" : opts?.sign ? "+" : "";
  return `${sign}${abs} zł`;
}

export type MoneyTx = {
  kind: TxKind;
  /** number, string albo Prisma.Decimal — patrz toCents(). */
  amount: number | string | { toString(): string };
  area: Area;
};

export type AccountBalance = {
  incomeCents: number; // przychody (tylko biznes)
  expenseTotalCents: number; // koszty razem
  expenseByAreaCents: Record<Area, number>;
  balanceCents: number; // stan konta
};

/**
 * Stan konta = przychody z biznesu − (koszty biznes + sport + życie).
 * Przychody liczymy wyłącznie z obszaru BIZNES (INCOME występuje tylko w biznesie).
 */
export function computeAccountBalance(txs: MoneyTx[]): AccountBalance {
  let incomeCents = 0;
  const expenseByAreaCents: Record<Area, number> = {
    BIZNES: 0,
    SPORT: 0,
    ZYCIE: 0,
  };

  for (const tx of txs) {
    const c = toCents(tx.amount);
    if (tx.kind === "INCOME") {
      if (tx.area === "BIZNES") incomeCents += c;
    } else {
      expenseByAreaCents[tx.area] += c;
    }
  }

  const expenseTotalCents =
    expenseByAreaCents.BIZNES + expenseByAreaCents.SPORT + expenseByAreaCents.ZYCIE;

  return {
    incomeCents,
    expenseTotalCents,
    expenseByAreaCents,
    balanceCents: incomeCents - expenseTotalCents,
  };
}

export type AreaFinance = {
  incomeCents: number;
  expenseCents: number;
  profitCents: number; // dochód = przychód − koszty
};

/** Finanse pojedynczego obszaru (przychód / koszty / dochód). */
export function computeAreaFinance(txs: MoneyTx[]): AreaFinance {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const tx of txs) {
    const c = toCents(tx.amount);
    if (tx.kind === "INCOME") incomeCents += c;
    else expenseCents += c;
  }
  return {
    incomeCents,
    expenseCents,
    profitCents: incomeCents - expenseCents,
  };
}

/** Zmiana procentowa względem poprzedniego okresu. null gdy poprzedni = 0. */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
