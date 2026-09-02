import { z } from "zod";
import {
  AREAS,
  BUSINESS_SECTIONS,
  ITEM_TYPES,
  PRIORITIES,
  PERIODS,
  TX_KINDS,
  MUSCLE_GROUPS,
} from "./enums";

const areaEnum = z.enum(AREAS);
const sectionEnum = z.enum(BUSINESS_SECTIONS);

// ── Item ───────────────────────────────────────────────────────────
export const itemInput = z
  .object({
    type: z.enum(ITEM_TYPES),
    title: z.string().min(1, "Tytuł jest wymagany").max(200),
    description: z.string().max(2000).optional().nullable(),
    area: areaEnum,
    businessSection: sectionEnum.optional().nullable(),
    startAt: z.string().datetime().optional().nullable(),
    endAt: z.string().datetime().optional().nullable(),
    dueAt: z.string().datetime().optional().nullable(),
    priority: z.enum(PRIORITIES).default("NORMAL"),
    done: z.boolean().optional().default(false),
    recurrenceRule: z.string().max(200).optional().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "EVENT") {
      if (!v.startAt || !v.endAt) {
        ctx.addIssue({ code: "custom", message: "Event wymaga początku i końca", path: ["startAt"] });
      } else if (new Date(v.endAt) <= new Date(v.startAt)) {
        ctx.addIssue({ code: "custom", message: "Koniec musi być po początku", path: ["endAt"] });
      }
    }
    if (v.type === "TIMED_TASK" && !v.dueAt) {
      ctx.addIssue({ code: "custom", message: "Zadanie czasowe wymaga terminu", path: ["dueAt"] });
    }
    if (v.area !== "BIZNES" && v.businessSection) {
      ctx.addIssue({ code: "custom", message: "Podzakładka tylko dla Biznesu", path: ["businessSection"] });
    }
    if (v.area === "BIZNES" && !v.businessSection) {
      ctx.addIssue({ code: "custom", message: "Wybierz podzakładkę biznesu", path: ["businessSection"] });
    }
  });

export const itemPatch = z.object({
  done: z.boolean().optional(),
});

// ── Transaction ────────────────────────────────────────────────────
export const transactionInput = z
  .object({
    kind: z.enum(TX_KINDS),
    amount: z.coerce.number().positive("Kwota musi być dodatnia"),
    date: z.string().datetime(),
    area: areaEnum,
    businessSection: sectionEnum.optional().nullable(),
    category: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "INCOME" && v.area !== "BIZNES") {
      ctx.addIssue({ code: "custom", message: "Przychód tylko w Biznesie", path: ["kind"] });
    }
  });

// ── FixedCost ──────────────────────────────────────────────────────
export const fixedCostInput = z.object({
  name: z.string().min(1).max(120),
  amount: z.coerce.number().positive(),
  area: areaEnum,
  businessSection: sectionEnum.optional().nullable(),
  dayOfMonth: z.coerce.number().int().min(1).max(31),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export const confirmEntryInput = z.object({
  amount: z.coerce.number().positive().optional(),
  date: z.string().datetime().optional(),
});

// ── Goal ───────────────────────────────────────────────────────────
export const goalInput = z.object({
  area: areaEnum,
  // Cel może dotyczyć podzakładki Biznesu; null = cel całego obszaru.
  businessSection: sectionEnum.optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  period: z.enum(PERIODS),
  targetDate: z.string().datetime().optional().nullable(),
  isMainFocus: z.boolean().optional().default(false),
  done: z.boolean().optional().default(false),
});

// ── Trening ────────────────────────────────────────────────────────
export const exerciseInput = z.object({
  name: z.string().min(1).max(120),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  isMachine: z.boolean().optional().default(false),
  equipment: z.string().max(120).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  defaultSets: z.coerce.number().int().min(0).max(50).optional().nullable(),
  defaultReps: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  archived: z.boolean().optional().default(false),
});

export const activityInput = z.object({
  name: z.string().min(1).max(120),
  date: z.string().datetime(),
  durationMin: z.coerce.number().int().min(0).max(1440).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
});

const workoutSetInput = z.object({
  exerciseId: z.string().min(1),
  setNumber: z.coerce.number().int().min(1),
  reps: z.coerce.number().int().min(0).max(1000),
  weight: z.coerce.number().min(0).max(2000).optional().nullable(),
  difficulty: z.coerce.number().int().min(1).max(10).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const workoutInput = z.object({
  date: z.string().datetime(),
  name: z.string().max(120).optional().nullable(),
  templateId: z.string().optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  durationMin: z.coerce.number().int().min(0).max(1440).optional().nullable(),
  sets: z.array(workoutSetInput).default([]),
});

export const templateInput = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  archived: z.boolean().optional().default(false),
  items: z
    .array(
      z.object({
        exerciseId: z.string().min(1),
        order: z.coerce.number().int().min(0),
        targetSets: z.coerce.number().int().min(0).max(50).optional().nullable(),
        targetReps: z.coerce.number().int().min(0).max(1000).optional().nullable(),
        note: z.string().max(500).optional().nullable(),
      })
    )
    .default([]),
});

export type ItemInput = z.infer<typeof itemInput>;
export type TransactionInput = z.infer<typeof transactionInput>;
