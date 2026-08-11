"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { ItemRow } from "@/components/item-row";
import { EmptyState, Spinner, SegmentedControl } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { useItems } from "@/lib/use-items";
import { sortForList } from "@/lib/items";
import {
  BUSINESS_SECTIONS,
  BUSINESS_SECTION_LABELS,
  type Area,
  type BusinessSection,
} from "@/lib/enums";

/** Lista eventów/zadań/zadań czasowych danego obszaru (pilne na górze). */
export function AreaItems({ area }: { area: Area }) {
  const { openAdd } = useApp();
  const { items, loading, reload } = useItems({ area });
  const [section, setSection] = React.useState<BusinessSection | "ALL">("ALL");

  const filtered = React.useMemo(() => {
    let list = items;
    if (area === "BIZNES" && section !== "ALL") {
      list = list.filter((i) => i.businessSection === section);
    }
    return sortForList(list);
  }, [items, area, section]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Eventy i zadania</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openAdd({ area, section: area === "BIZNES" && section !== "ALL" ? section : undefined })}
        >
          Dodaj
        </Button>
      </div>

      {area === "BIZNES" && (
        <SegmentedControl<BusinessSection | "ALL">
          value={section}
          onChange={setSection}
          options={[
            { value: "ALL", label: "Wszystko" },
            ...BUSINESS_SECTIONS.map((s) => ({ value: s, label: BUSINESS_SECTION_LABELS[s] })),
          ]}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Brak pozycji"
          description="Nic tu jeszcze nie ma."
          action={<Button onClick={() => openAdd({ area })}>Dodaj pierwszą</Button>}
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <ItemRow key={item.id} item={item} onChanged={reload} />
          ))}
        </div>
      )}
    </section>
  );
}
