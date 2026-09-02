"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Przyklejona stopka (np. przycisk zapisu) */
  footer?: React.ReactNode;
}

/**
 * Modal: na mobile arkusz wysuwany od dołu (bottom sheet, zamykany gestem
 * w dół), na desktopie wyśrodkowana karta. Przycisk zapisu w stopce jest
 * przyklejony do dolnej krawędzi.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [dragY, setDragY] = React.useState(0);
  const startY = React.useRef<number | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-border bg-card shadow-xl animate-sheet-up",
          "sm:max-w-lg sm:rounded-2xl sm:animate-scale-in"
        )}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {/* Uchwyt do przeciągania (mobile) */}
        <div
          className="flex shrink-0 cursor-grab justify-center pt-3 sm:hidden"
          onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (startY.current == null) return;
            const dy = e.touches[0].clientY - startY.current;
            if (dy > 0) setDragY(dy);
          }}
          onTouchEnd={() => {
            if (dragY > 100) onClose();
            setDragY(0);
            startY.current = null;
          }}
        >
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border bg-card px-4 py-3 pb-safe sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
