"use client";

import * as React from "react";
import { Download, Upload, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { useApp } from "@/components/providers";

export default function UstawieniaPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useApp();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  async function importFile(file: File) {
    const ok = await confirm({
      title: "Zastąpić wszystkie dane?",
      description:
        "Import usuwa obecną zawartość bazy i wgrywa dane z pliku. Tej operacji nie da się cofnąć — zrób najpierw eksport.",
      confirmLabel: "Zastąp dane",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import nieudany");
      toast("Dane zaimportowane");
      refresh();
    } catch (e: any) {
      toast(e.message ?? "Nieprawidłowy plik", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ustawienia</h1>

      <Card className="p-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          Kopia zapasowa
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wszystkie dane w jednym pliku JSON. Trzymaj go poza aplikacją — to Twój backup.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <a href="/api/backup?format=json" download>
            <Button variant="secondary" className="w-full">
              <Download className="h-4 w-4" />
              Pobierz backup (JSON)
            </Button>
          </a>
          <a href="/api/backup?format=csv" download>
            <Button variant="secondary" className="w-full">
              <Download className="h-4 w-4" />
              Pobierz transakcje (CSV)
            </Button>
          </a>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {busy ? "Importowanie…" : "Wgraj backup (zastępuje dane)"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
