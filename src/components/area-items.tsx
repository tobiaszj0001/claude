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

/**
 * Lista eventów/zadań/zadań czasowych danego obszaru (pilne na górze).
 * `fixedSection` przypina listę do jednej podzakładki Biznesu i chowa
 * własny przełącznik — używane na stronie Biznes, gdzie podzakładkę
 * wybiera się wyżej.
 */
export function AreaItems({
  area,
  fixedSection,
}: {
  area: Area;
  fixedSection?: BusinessSection;
}) {
  const { openAdd } = useApp();
  const { items, loading, reload } = useItems({ area });
  const [section, setSection] = React.useState<BusinessSection | "ALL">("ALL");

  const activeSection = fixedSection ?? (section === "ALL" ? undefined : section);

  const filtered = React.useMemo(() => {
    let list = items;
    if (area === "BIZNES" && activeSection) {
      list = list.filter((i) => i.businessSection === activeSection);
    }
    return sortForList(list);
  }, [items, area, activeSection]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Eventy i zadania</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openAdd({ area, section: activeSection })}
        >
          Dodaj
        </Button>
      </div>

      {area === "BIZNES" && !fixedSection && (
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
          action={
            <Button onClick={() => openAdd({ area, section: activeSection })}>
              Dodaj pierwszą
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((item) => (
            <ItemRow key={item.id} item={item} onChanged={reload} />
          ))}
        </div>
      )}
    </section>
  );
}
