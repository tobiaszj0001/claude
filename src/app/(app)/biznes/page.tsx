"use client";

import * as React from "react";
import { SegmentedControl } from "@/components/ui/misc";
import { BusinessOverview } from "@/components/finance/business-overview";
import { AreaSummary } from "@/components/area-summary";
import { SectionFinance } from "@/components/finance/section-finance";
import { TransactionList } from "@/components/finance/transaction-list";
import { AreaItems } from "@/components/area-items";
import { Goals } from "@/components/goals";
import { BUSINESS_SECTIONS, BUSINESS_SECTION_LABELS } from "@/lib/enums";
import type { BusinessSection } from "@/lib/enums";
import type { PeriodKey } from "@/lib/dates";

type Tab = "ALL" | BusinessSection;

export default function BiznesPage() {
  const [tab, setTab] = React.useState<Tab>("ALL");
  // Okres wspólny dla karty finansów i listy transakcji w podzakładce.
  const [period, setPeriod] = React.useState<PeriodKey>("MONTH");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Biznes</h1>

      {/* Podzakładki — sticky, żeby przy długich listach wiedzieć, gdzie się jest */}
      <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:px-0">
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "ALL", label: "Przegląd" },
            ...BUSINESS_SECTIONS.map((s) => ({
              value: s as Tab,
              label: BUSINESS_SECTION_LABELS[s],
            })),
          ]}
        />
      </div>

      {tab === "ALL" ? (
        <>
          <AreaSummary area="BIZNES" />
          <BusinessOverview />
          <Goals area="BIZNES" />
        </>
      ) : (
        <div className="space-y-6">
          <SectionFinance section={tab} period={period} onPeriodChange={setPeriod} />
          <TransactionList
            area="BIZNES"
            businessSection={tab}
            period={period}
            showPeriodSwitch={false}
            title="Transakcje"
          />
          <AreaItems area="BIZNES" fixedSection={tab} />
          <Goals area="BIZNES" businessSection={tab} />
        </div>
      )}
    </div>
  );
}
