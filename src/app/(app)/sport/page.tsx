"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/misc";
import { useApp } from "@/components/providers";
import { Calendar } from "@/components/calendar/calendar";
import { AreaItems } from "@/components/area-items";
import { Goals } from "@/components/goals";
import { TransactionList } from "@/components/finance/transaction-list";
import { WorkoutLogger } from "@/components/sport/workout-logger";
import { Templates } from "@/components/sport/templates";
import { ExerciseLibrary } from "@/components/sport/exercise-library";
import {
  WeekSummary,
  WorkoutHistory,
  Activities,
} from "@/components/sport/history-activities";

type Tab = "trening" | "historia" | "cwiczenia" | "reszta";

export default function SportPage() {
  const { refresh } = useApp();
  const [tab, setTab] = React.useState<Tab>("trening");
  const [logger, setLogger] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Sport</h1>
        <Button size="sm" onClick={() => setLogger(true)}>
          <Plus className="h-4 w-4" />
          Trening
        </Button>
      </div>

      <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:px-0">
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "trening", label: "Trening" },
            { value: "historia", label: "Historia" },
            { value: "cwiczenia", label: "Ćwiczenia" },
            { value: "reszta", label: "Koszty i cele" },
          ]}
        />
      </div>

      {tab === "trening" && (
        <div className="space-y-6">
          <WeekSummary />
          <Templates onWorkoutSaved={refresh} />
          <Activities />
        </div>
      )}

      {tab === "historia" && (
        <div className="space-y-6">
          {/* Ten sam kalendarz co na ekranie głównym, odfiltrowany do Sportu */}
          <Calendar sportOnly />
          <WorkoutHistory />
        </div>
      )}

      {tab === "cwiczenia" && <ExerciseLibrary />}

      {tab === "reszta" && (
        <div className="space-y-6">
          <TransactionList
            area="SPORT"
            title="Koszty sportowe"
            allowIncome={false}
          />
          <AreaItems area="SPORT" />
          <Goals area="SPORT" />
        </div>
      )}

      <WorkoutLogger open={logger} onClose={() => setLogger(false)} onSaved={refresh} />
    </div>
  );
}
