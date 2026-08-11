"use client";

import { BalanceCard } from "@/components/finance/balance-card";
import { PendingCosts } from "@/components/finance/pending-costs";
import { TransactionList } from "@/components/finance/transaction-list";
import { FixedCostManager } from "@/components/finance/fixed-cost-manager";

export default function FinansePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Finanse</h1>
      <BalanceCard />
      <PendingCosts />
      <TransactionList title="Wszystkie transakcje" />
      <FixedCostManager />
    </div>
  );
}
