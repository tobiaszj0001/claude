"use client";

import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/misc";

export default function FinansePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finanse</h1>
      <EmptyState
        icon={Wallet}
        title="Finanse w drodze"
        description="Karta stanu konta, transakcje i koszty stałe pojawią się w etapie 4."
      />
    </div>
  );
}
