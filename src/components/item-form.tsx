"use client";

import * as React from "react";
import { Calendar, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AREAS,
  AREA_LABELS,
  BUSINESS_SECTIONS,
  BUSINESS_SECTION_LABELS,
  ITEM_TYPE_LABELS,
} from "@/lib/enums";
import type { Area, BusinessSection, ItemType } from "@/lib/enums";
import type { ItemDTO } from "@/lib/types";

// ── Helpery daty/godziny (lokalna strefa urządzenia = Europe/Warsaw) ──
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function combine(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

const TYPE_ICON = { EVENT: Calendar, TASK: CheckSquare, TIMED_TASK: Clock };

export interface ItemFormProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initial?: ItemDTO | null;
  defaultArea?: Area;
  defaultSection?: BusinessSection;
  defaultType?: ItemType;
  defaultDate?: Date;
}

export function ItemForm({
  open,
  onClose,
  onSaved,
  initial,
  defaultArea = "BIZNES",
  defaultSection,
  defaultType = "EVENT",
  defaultDate,
}: ItemFormProps) {
  const toast = useToast();
  const [type, setType] = React.useState<ItemType>(defaultType);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [area, setArea] = React.useState<Area>(defaultArea);
  const [section, setSection] = React.useState<BusinessSection>(defaultSection ?? "SOCIAL_MEDIA");
  const [priority, setPriority] = React.useState(false);
  const [recurrence, setRecurrence] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!initial;

  // Reset przy otwarciu
  React.useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setType(initial.type);
      setTitle(initial.title);
      setDescription(initial.description ?? "");
      setArea(initial.area);
      setSection((initial.businessSection as BusinessSection) ?? "SOCIAL_MEDIA");
      setPriority(initial.priority === "PILNE");
      setRecurrence(initial.recurrenceRule ?? "");
      const ref = initial.startAt ?? initial.dueAt;
      setDate(toDateInput(ref));
      setStartTime(toTimeInput(initial.startAt) || "09:00");
      setEndTime(toTimeInput(initial.endAt) || "10:00");
    } else {
      setType(defaultType);
      setTitle("");
      setDescription("");
      setArea(defaultArea);
      setSection(defaultSection ?? "SOCIAL_MEDIA");
      setPriority(false);
      setRecurrence("");
      const d = defaultDate ?? new Date();
      setDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [open, initial, defaultType, defaultArea, defaultSection, defaultDate]);

  async function save() {
    setError(null);
    if (!title.trim()) {
      setError("Podaj tytuł");
      return;
    }
    const payload: any = {
      type,
      title: title.trim(),
      description: description.trim() || null,
      area,
      businessSection: area === "BIZNES" ? section : null,
      priority: priority ? "PILNE" : "NORMAL",
      recurrenceRule: recurrence || null,
      startAt: null,
      endAt: null,
      dueAt: null,
    };
    if (type === "EVENT") {
      payload.startAt = combine(date, startTime);
      payload.endAt = combine(date, endTime);
      if (!payload.startAt || !payload.endAt) {
        setError("Event wymaga daty i godzin");
        return;
      }
    } else if (type === "TIMED_TASK") {
      payload.dueAt = combine(date, startTime);
      if (!payload.dueAt) {
        setError("Zadanie czasowe wymaga daty i godziny");
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/api/items/${initial!.id}`, { method: "PUT", json: payload });
        toast("Zapisano zmiany");
      } else {
        await api("/api/items", { method: "POST", json: payload });
        toast("Dodano");
      }
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <Button className="w-full" size="lg" onClick={save} disabled={saving}>
      {saving ? "Zapisywanie…" : isEdit ? "Zapisz zmiany" : "Dodaj"}
    </Button>
  );

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? "Edytuj" : "Dodaj"} footer={footer}>
      {/* Zakładki typu */}
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {(["EVENT", "TASK", "TIMED_TASK"] as ItemType[]).map((t) => {
          const Icon = TYPE_ICON[t];
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors",
                type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {ITEM_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Tytuł</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Co to jest?" autoFocus />
        </div>

        <div>
          <Label>Opis (opcjonalnie)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Obszar</Label>
            <Select value={area} onChange={(e) => setArea(e.target.value as Area)}>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {AREA_LABELS[a]}
                </option>
              ))}
            </Select>
          </div>
          {area === "BIZNES" && (
            <div>
              <Label>Podzakładka</Label>
              <Select value={section} onChange={(e) => setSection(e.target.value as BusinessSection)}>
                {BUSINESS_SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {BUSINESS_SECTION_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Pola zależne od typu */}
        {type === "EVENT" && (
          <div className="space-y-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Od</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label>Do</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        {type === "TIMED_TASK" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Godzina</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
        )}

        {/* PILNE */}
        <button
          type="button"
          onClick={() => setPriority((p) => !p)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border px-3 py-3 transition-colors",
            priority ? "border-danger bg-danger/10 text-danger" : "border-input"
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Pilne
          </span>
          <span
            className={cn(
              "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
              priority ? "bg-danger" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "h-5 w-5 rounded-full bg-white transition-transform",
                priority && "translate-x-5"
              )}
            />
          </span>
        </button>

        <div>
          <Label>Cykliczność (opcjonalnie)</Label>
          <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="">Brak</option>
            <option value="FREQ=DAILY">Codziennie</option>
            <option value="FREQ=WEEKLY">Co tydzień</option>
            <option value="FREQ=MONTHLY">Co miesiąc</option>
          </Select>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Sheet>
  );
}
