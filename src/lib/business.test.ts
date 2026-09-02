import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { computeBusinessBreakdown, type SectionTx } from "./business";

const txs: SectionTx[] = [
  { kind: "INCOME", amount: 5000, businessSection: "SOCIAL_MEDIA" },
  { kind: "EXPENSE", amount: 1200, businessSection: "SOCIAL_MEDIA" },
  { kind: "INCOME", amount: 4000, businessSection: "CRM" },
  { kind: "EXPENSE", amount: 500, businessSection: "CRM" },
  { kind: "INCOME", amount: 2000, businessSection: "DODATKOWE" },
  { kind: "EXPENSE", amount: 300, businessSection: "DODATKOWE" },
];

describe("computeBusinessBreakdown", () => {
  it("liczy dochód każdej podzakładki", () => {
    const r = computeBusinessBreakdown(txs);
    expect(r.bySection.SOCIAL_MEDIA.profitCents).toBe(380000);
    expect(r.bySection.CRM.profitCents).toBe(350000);
    expect(r.bySection.DODATKOWE.profitCents).toBe(170000);
  });

  it("suma zgadza się z sumą podzakładek", () => {
    const r = computeBusinessBreakdown(txs);
    const sum =
      r.bySection.SOCIAL_MEDIA.profitCents +
      r.bySection.CRM.profitCents +
      r.bySection.DODATKOWE.profitCents;
    expect(r.total.profitCents).toBe(sum);
    expect(r.total.incomeCents).toBe(1100000);
    expect(r.total.expenseCents).toBe(200000);
  });

  it("zawsze zwraca wszystkie trzy podzakładki, także puste", () => {
    const r = computeBusinessBreakdown([
      { kind: "INCOME", amount: 100, businessSection: "CRM" },
    ]);
    expect(Object.keys(r.bySection).sort()).toEqual(["CRM", "DODATKOWE", "SOCIAL_MEDIA"]);
    expect(r.bySection.DODATKOWE).toEqual({ incomeCents: 0, expenseCents: 0, profitCents: 0 });
  });

  // Transakcja biznesowa bez podzakładki nie może wyparować z sumy.
  it("transakcje bez podzakładki liczą się do sumy, ale nie do żadnej sekcji", () => {
    const r = computeBusinessBreakdown([
      { kind: "INCOME", amount: 1000, businessSection: null },
      { kind: "EXPENSE", amount: 400 },
    ]);
    expect(r.total.incomeCents).toBe(100000);
    expect(r.total.expenseCents).toBe(40000);
    expect(r.total.profitCents).toBe(60000);
    expect(r.bySection.SOCIAL_MEDIA.incomeCents).toBe(0);
  });

  it("obsługuje kwoty jako Prisma.Decimal", () => {
    const r = computeBusinessBreakdown([
      { kind: "INCOME", amount: new Prisma.Decimal("1234.56"), businessSection: "CRM" },
    ]);
    expect(r.bySection.CRM.incomeCents).toBe(123456);
  });

  it("ujemny dochód, gdy koszty przewyższają przychód", () => {
    const r = computeBusinessBreakdown([
      { kind: "EXPENSE", amount: 900, businessSection: "SOCIAL_MEDIA" },
    ]);
    expect(r.bySection.SOCIAL_MEDIA.profitCents).toBe(-90000);
  });
});
