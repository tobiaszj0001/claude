"use client";

import * as React from "react";
import { ListTodo, History } from "lucide-react";
import { ItemRow } from "@/components/item-row";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { useItems } from "@/lib/use-items";
import { sortForList, isForToday, isOverdue } from "@/lib/items";

export function TodayList() {
  const { openAdd } = useApp();
  const { items, loading, reload } = useItems();

  const today = React.useMemo(() => sortForList(items.filter((i) => isForToday(i))), [items]);
  const overdue = React.useMemo(() => sortForList(items.filter((i) => isOverdue(i))), [items]);
  const doneCount = today.filter((i) => i.done).length;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ListTodo className="h-5 w-5 text-muted-foreground" />
          Na dziś
        </h2>
        {today.length > 0 && (
          <span className="tnum text-sm text-muted-foreground">
            {doneCount} z {today.length} zrobione
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : today.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Nic na dziś"
          description="Dodaj event, zadanie albo zadanie czasowe."
          action={<Button onClick={() => openAdd()}>Dodaj</Button>}
        />
      ) : (
        <div className="space-y-1.5">
          {today.map((item) => (
            <ItemRow key={item.id} item={item} onChanged={reload} />
          ))}
        </div>
      )}

      {overdue.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-danger">
            <History className="h-4 w-4" />
            Zaległe ({overdue.length})
          </h3>
          <div className="space-y-1.5">
            {overdue.map((item) => (
              <ItemRow key={item.id} item={item} onChanged={reload} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
