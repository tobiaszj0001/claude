"use client";

import * as React from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ItemForm } from "@/components/item-form";
import type { Area, BusinessSection, ItemType } from "@/lib/enums";
import type { ItemDTO } from "@/lib/types";

type OpenAddOpts = {
  area?: Area;
  section?: BusinessSection;
  type?: ItemType;
  date?: Date;
};

type Ctx = {
  openAdd: (opts?: OpenAddOpts) => void;
  openEdit: (item: ItemDTO) => void;
  /** Rośnie po każdym zapisie — komponenty listują na nowo. */
  dataVersion: number;
  refresh: () => void;
};

const AppCtx = React.createContext<Ctx>({
  openAdd: () => {},
  openEdit: () => {},
  dataVersion: 0,
  refresh: () => {},
});

export function useApp() {
  return React.useContext(AppCtx);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [dataVersion, setDataVersion] = React.useState(0);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ItemDTO | null>(null);
  const [opts, setOpts] = React.useState<OpenAddOpts>({});

  const refresh = React.useCallback(() => setDataVersion((v) => v + 1), []);

  const openAdd = React.useCallback((o?: OpenAddOpts) => {
    setEditing(null);
    setOpts(o ?? {});
    setFormOpen(true);
  }, []);

  const openEdit = React.useCallback((item: ItemDTO) => {
    setEditing(item);
    setOpts({});
    setFormOpen(true);
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppCtx.Provider value={{ openAdd, openEdit, dataVersion, refresh }}>
          {children}
          <ItemForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={refresh}
            initial={editing}
            defaultArea={opts.area}
            defaultSection={opts.section}
            defaultType={opts.type}
            defaultDate={opts.date}
          />
        </AppCtx.Provider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
