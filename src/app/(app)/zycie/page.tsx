"use client";

import * as React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { LifeTimeline } from "@/components/life/life-timeline";
import { TransactionList } from "@/components/finance/transaction-list";
import { AreaItems } from "@/components/area-items";
import { Goals } from "@/components/goals";
import { AreaSummary } from "@/components/area-summary";
import { cn } from "@/lib/utils";

/**
 * Zakładka Życie (§8) — ma być prosta. Na wierzchu trzy rzeczy:
 * dodawanie wydarzeń, oś czasu i koszty. Zadania są dostępne,
 * ale schowane pod rozwijaną sekcją, żeby nie zabierały pierwszego planu.
 */
export default function ZyciePage() {
  const { openAdd } = useApp();
  const [showTasks, setShowTasks] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Życie</h1>
        <Button size="sm" onClick={() => openAdd({ area: "ZYCIE", type: "EVENT" })}>
          <Plus className="h-4 w-4" />
          Wydarzenie
        </Button>
      </div>

      <AreaSummary area="ZYCIE" />

      <LifeTimeline />

      <TransactionList area="ZYCIE" title="Koszty" allowIncome={false} />

      {/* Zadania — dostępne, ale nie na pierwszym planie */}
      <section>
        <button
          onClick={() => setShowTasks((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
          aria-expanded={showTasks}
        >
          <span className="font-medium">Zadania i przypomnienia</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-150",
              showTasks && "rotate-180"
            )}
          />
        </button>
        {showTasks && (
          <div className="mt-3">
            <AreaItems area="ZYCIE" />
          </div>
        )}
      </section>

      <Goals area="ZYCIE" />
    </div>
  );
}
