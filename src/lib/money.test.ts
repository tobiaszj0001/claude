import { describe, it, expect } from "vitest";
import {
  toCents,
  formatPLN,
  computeAccountBalance,
  computeAreaFinance,
  pctChange,
  type MoneyTx,
} from "./money";

describe("toCents", () => {
  it("konwertuje PLN na grosze bez błędów float", () => {
    expect(toCents(10.1)).toBe(1010);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000004 -> 30
    expect(toCents("18900")).toBe(1890000);
  });
});

describe("formatPLN", () => {
  it("formatuje bez groszy z separatorem tysięcy", () => {
    expect(formatPLN(12480)).toBe("12 480 zł");
  });
  it("dodaje minus (U+2212) dla ujemnych", () => {
    expect(formatPLN(-6420)).toBe("−6 420 zł");
  });
  it("dodaje plus gdy sign=true", () => {
    expect(formatPLN(18900, { sign: true })).toBe("+18 900 zł");
  });
});

describe("computeAccountBalance", () => {
  const txs: MoneyTx[] = [
    { kind: "INCOME", amount: 18900, area: "BIZNES" },
    { kind: "EXPENSE", amount: 3100, area: "BIZNES" },
    { kind: "EXPENSE", amount: 520, area: "SPORT" },
    { kind: "EXPENSE", amount: 2800, area: "ZYCIE" },
  ];

  it("liczy stan konta = przychód biznes − wszystkie koszty", () => {
    const r = computeAccountBalance(txs);
    expect(r.incomeCents).toBe(1890000);
    expect(r.expenseTotalCents).toBe(642000);
    expect(r.balanceCents).toBe(1248000); // 12 480 zł
  });

  it("rozbija koszty na obszary", () => {
    const r = computeAccountBalance(txs);
    expect(r.expenseByAreaCents.BIZNES).toBe(310000);
    expect(r.expenseByAreaCents.SPORT).toBe(52000);
    expect(r.expenseByAreaCents.ZYCIE).toBe(280000);
  });

  it("ignoruje INCOME spoza biznesu w przychodach", () => {
    const r = computeAccountBalance([{ kind: "INCOME", amount: 1000, area: "SPORT" }]);
    expect(r.incomeCents).toBe(0);
  });
});

describe("computeAreaFinance", () => {
  it("liczy dochód = przychód − koszty", () => {
    const r = computeAreaFinance([
      { kind: "INCOME", amount: 5000, area: "BIZNES" },
      { kind: "EXPENSE", amount: 1500, area: "BIZNES" },
    ]);
    expect(r.incomeCents).toBe(500000);
    expect(r.expenseCents).toBe(150000);
    expect(r.profitCents).toBe(350000);
  });
});

describe("pctChange", () => {
  it("liczy zmianę procentową", () => {
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(80, 100)).toBe(-20);
  });
  it("zwraca null gdy poprzedni = 0 a obecny != 0", () => {
    expect(pctChange(50, 0)).toBeNull();
    expect(pctChange(0, 0)).toBe(0);
  });
});
