import type { Area, BusinessSection, ItemType, Priority } from "./enums";

// Kształt danych zwracanych do klienta (daty jako ISO string, Decimal jako string).
export type ItemDTO = {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  area: Area;
  businessSection: BusinessSection | null;
  startAt: string | null;
  endAt: string | null;
  dueAt: string | null;
  priority: Priority;
  done: boolean;
  doneAt: string | null;
  recurrenceRule: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalDTO = {
  id: string;
  area: Area;
  title: string;
  description: string | null;
  period: string;
  targetDate: string | null;
  isMainFocus: boolean;
  done: boolean;
};

export type TransactionDTO = {
  id: string;
  kind: "INCOME" | "EXPENSE";
  amount: string;
  date: string;
  area: Area;
  businessSection: BusinessSection | null;
  category: string | null;
  description: string | null;
  fixedCostId: string | null;
};
