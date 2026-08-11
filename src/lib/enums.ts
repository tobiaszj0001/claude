// Jedno źródło prawdy dla "enumów" (trzymanych w bazie jako String),
// ich etykiet po polsku i przypisanych kolorów obszarów.

export const AREAS = ["BIZNES", "SPORT", "ZYCIE"] as const;
export type Area = (typeof AREAS)[number];

export const BUSINESS_SECTIONS = ["SOCIAL_MEDIA", "CRM", "DODATKOWE"] as const;
export type BusinessSection = (typeof BUSINESS_SECTIONS)[number];

export const ITEM_TYPES = ["EVENT", "TASK", "TIMED_TASK"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const PRIORITIES = ["NORMAL", "PILNE"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PERIODS = ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"] as const;
export type Period = (typeof PERIODS)[number];

export const TX_KINDS = ["INCOME", "EXPENSE"] as const;
export type TxKind = (typeof TX_KINDS)[number];

export const FIXED_COST_STATUSES = ["PENDING", "CONFIRMED", "SKIPPED"] as const;
export type FixedCostStatus = (typeof FIXED_COST_STATUSES)[number];

export const MUSCLE_GROUPS = [
  "klatka",
  "plecy",
  "barki",
  "biceps",
  "triceps",
  "nogi",
  "brzuch",
  "inne",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// ── Etykiety po polsku ─────────────────────────────────────────────
export const AREA_LABELS: Record<Area, string> = {
  BIZNES: "Biznes",
  SPORT: "Sport",
  ZYCIE: "Życie",
};

export const BUSINESS_SECTION_LABELS: Record<BusinessSection, string> = {
  SOCIAL_MEDIA: "Social Media",
  CRM: "CRMy",
  DODATKOWE: "Dodatkowe tematy",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  EVENT: "Event",
  TASK: "Zadanie",
  TIMED_TASK: "Zadanie czasowe",
};

export const PERIOD_LABELS: Record<Period, string> = {
  DAY: "Dzień",
  WEEK: "Tydzień",
  MONTH: "Miesiąc",
  QUARTER: "3 miesiące",
  YEAR: "Rok",
};

// ── Kolory obszarów (Tailwind classes + wartości do wykresów) ──────
// Spójne w całej aplikacji: kalendarz, listy, wykresy.
export const AREA_COLOR: Record<Area, { dot: string; bg: string; border: string; text: string; hex: string }> = {
  BIZNES: {
    dot: "bg-biznes",
    bg: "bg-biznes/10",
    border: "border-biznes/30",
    text: "text-biznes",
    hex: "#2563eb",
  },
  SPORT: {
    dot: "bg-sport",
    bg: "bg-sport/10",
    border: "border-sport/30",
    text: "text-sport",
    hex: "#059669",
  },
  ZYCIE: {
    dot: "bg-zycie",
    bg: "bg-zycie/10",
    border: "border-zycie/30",
    text: "text-zycie",
    hex: "#d97706",
  },
};

export function isArea(v: unknown): v is Area {
  return typeof v === "string" && (AREAS as readonly string[]).includes(v);
}
