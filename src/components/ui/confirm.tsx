"use client";

import * as React from "react";
import { Sheet } from "./sheet";
import { Button } from "./button";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
};

const ConfirmCtx = React.createContext<(opts: ConfirmOptions) => Promise<boolean>>(
  async () => false
);

export function useConfirm() {
  return React.useContext(ConfirmCtx);
}

/** Potwierdzenie przed usunięciem czegokolwiek (§11). */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = React.useState<ConfirmOptions | null>(null);
  const resolver = React.useRef<(v: boolean) => void>();

  const confirm = React.useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    setOpts(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Sheet open={!!opts} onClose={() => close(false)} title={opts?.title}>
        {opts?.description && (
          <p className="text-sm text-muted-foreground">{opts.description}</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => close(false)}>
            Anuluj
          </Button>
          <Button
            variant={opts?.danger ? "danger" : "primary"}
            className="flex-1"
            onClick={() => close(true)}
          >
            {opts?.confirmLabel ?? "Potwierdź"}
          </Button>
        </div>
      </Sheet>
    </ConfirmCtx.Provider>
  );
}
