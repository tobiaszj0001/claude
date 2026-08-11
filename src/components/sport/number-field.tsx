"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pole liczbowe z przyciskami +/− (§11).
 * W trakcie treningu wbija się to jedną ręką między seriami, więc cele
 * dotyku mają 44 px, a klawiatura otwiera się od razu numeryczna.
 */
export function NumberField({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  decimal,
  label,
  suffix,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  max?: number;
  decimal?: boolean;
  label?: string;
  suffix?: string;
  className?: string;
}) {
  const num = parseFloat(value.replace(",", ".")) || 0;

  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, Math.round((num + delta) * 100) / 100));
    onChange(decimal ? String(next) : String(Math.round(next)));
  };

  return (
    <div className={cn("min-w-0", className)}>
      {label && <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-stretch overflow-hidden rounded-md border border-input">
        <button
          type="button"
          onClick={() => bump(-step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors active:bg-muted"
          aria-label={`Zmniejsz${label ? " " + label : ""}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={decimal ? "decimal" : "numeric"}
          className="tnum h-11 w-full min-w-0 border-x border-input bg-background text-center text-base font-semibold outline-none focus:border-accent"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => bump(step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors active:bg-muted"
          aria-label={`Zwiększ${label ? " " + label : ""}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {suffix && <p className="mt-0.5 text-center text-[10px] text-muted-foreground">{suffix}</p>}
    </div>
  );
}
