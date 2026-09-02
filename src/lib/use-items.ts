"use client";

import * as React from "react";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import type { ItemDTO } from "@/lib/types";

/** Pobiera itemy z API i odświeża po każdym zapisie (dataVersion). */
export function useItems(query?: Record<string, string>) {
  const { dataVersion } = useApp();
  const [items, setItems] = React.useState<ItemDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const qs = query ? new URLSearchParams(query).toString() : "";

  const reload = React.useCallback(async () => {
    setError(null);
    try {
      const data = await api<ItemDTO[]>(`/api/items${qs ? `?${qs}` : ""}`);
      setItems(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  React.useEffect(() => {
    reload();
  }, [reload, dataVersion]);

  return { items, loading, error, reload };
}
