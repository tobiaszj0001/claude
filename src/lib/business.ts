// Agregacja finansów Biznesu w rozbiciu na podzakładki (§6).

import { toCents } from "./money";
import { BUSINESS_SECTIONS, type BusinessSection } from "./enums";

export type SectionTx = {
  kind: "INCOME" | "EXPENSE";
  amount: number | string | { toString(): string };
  businessSection?: BusinessSection | null;
};

export type SectionFinance = {
  incomeCents: number;
  expenseCents: number;
  profitCents: number; // dochód = przychód − koszty
};

export type BusinessBreakdown = {
  bySection: Record<BusinessSection, SectionFinance>;
  total: SectionFinance;
};

const empty = (): SectionFinance => ({ incomeCents: 0, expenseCents: 0, profitCents: 0 });

/**
 * Rozbicie przychodów, kosztów i dochodu na trzy podzakładki + suma.
 * Transakcje bez przypisanej podzakładki wchodzą tylko do sumy całego
 * Biznesu — inaczej znikałyby z widoku zbiorczego.
 */
export function computeBusinessBreakdown(txs: SectionTx[]): BusinessBreakdown {
  const bySection = Object.fromEntries(
    BUSINESS_SECTIONS.map((s) => [s, empty()])
  ) as Record<BusinessSection, SectionFinance>;
  const total = empty();

  for (const tx of txs) {
    const c = toCents(tx.amount);
    const bucket = tx.businessSection ? bySection[tx.businessSection] : null;

    if (tx.kind === "INCOME") {
      total.incomeCents += c;
      if (bucket) bucket.incomeCents += c;
    } else {
      total.expenseCents += c;
      if (bucket) bucket.expenseCents += c;
    }
  }

  for (const s of BUSINESS_SECTIONS) {
    bySection[s].profitCents = bySection[s].incomeCents - bySection[s].expenseCents;
  }
  total.profitCents = total.incomeCents - total.expenseCents;

  return { bySection, total };
}
