"use client";

import * as React from "react";

type Toast = { id: number; message: string; kind: "success" | "error" };

const ToastCtx = React.createContext<(message: string, kind?: Toast["kind"]) => void>(
  () => {}
);

export function useToast() {
  return React.useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto animate-fade-in rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg " +
              (t.kind === "error" ? "bg-danger" : "bg-foreground")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
