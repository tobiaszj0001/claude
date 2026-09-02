import { describe, it, expect } from "vitest";
import { sortForList, isForToday, isOverdue } from "./items";
import type { ItemDTO } from "./types";

function mk(p: Partial<ItemDTO>): ItemDTO {
  return {
    id: Math.random().toString(36).slice(2),
    type: "TASK",
    title: "x",
    description: null,
    area: "BIZNES",
    businessSection: null,
    startAt: null,
    endAt: null,
    dueAt: null,
    priority: "NORMAL",
    done: false,
    doneAt: null,
    recurrenceRule: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...p,
  };
}

const today = new Date();
function at(h: number) {
  const d = new Date(today);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

describe("sortForList", () => {
  it("PILNE zawsze na górze", () => {
    const list = sortForList([
      mk({ title: "zwykłe", startAt: at(8), type: "EVENT" }),
      mk({ title: "pilne", startAt: at(20), type: "EVENT", priority: "PILNE" }),
    ]);
    expect(list[0].title).toBe("pilne");
  });

  it("reszta sortowana po godzinie", () => {
    const list = sortForList([
      mk({ title: "późne", startAt: at(18), type: "EVENT" }),
      mk({ title: "wczesne", startAt: at(7), type: "EVENT" }),
    ]);
    expect(list.map((i) => i.title)).toEqual(["wczesne", "późne"]);
  });

  it("elementy bez godziny na końcu", () => {
    const list = sortForList([
      mk({ title: "bez godziny" }),
      mk({ title: "z godziną", startAt: at(12), type: "EVENT" }),
    ]);
    expect(list.map((i) => i.title)).toEqual(["z godziną", "bez godziny"]);
  });

  it("odhaczone na samym dole, nawet gdy pilne", () => {
    const list = sortForList([
      mk({ title: "zrobione-pilne", priority: "PILNE", done: true }),
      mk({ title: "niezrobione" }),
    ]);
    expect(list.map((i) => i.title)).toEqual(["niezrobione", "zrobione-pilne"]);
  });
});

describe("isForToday", () => {
  it("zwykłe zadanie bez daty liczy się, dopóki niezrobione", () => {
    expect(isForToday(mk({ type: "TASK", done: false }))).toBe(true);
    expect(isForToday(mk({ type: "TASK", done: true }))).toBe(false);
  });
  it("event z dzisiejszą datą się liczy", () => {
    expect(isForToday(mk({ type: "EVENT", startAt: at(10) }))).toBe(true);
  });
});

describe("isOverdue", () => {
  it("niezrobiony TIMED_TASK z przeszłości jest zaległy", () => {
    const past = new Date(today);
    past.setDate(past.getDate() - 3);
    expect(isOverdue(mk({ type: "TIMED_TASK", dueAt: past.toISOString() }))).toBe(true);
  });
  it("zrobiony nie jest zaległy", () => {
    const past = new Date(today);
    past.setDate(past.getDate() - 3);
    expect(isOverdue(mk({ type: "TIMED_TASK", dueAt: past.toISOString(), done: true }))).toBe(false);
  });
  it("dzisiejszy nie jest zaległy", () => {
    expect(isOverdue(mk({ type: "TIMED_TASK", dueAt: at(8) }))).toBe(false);
  });
});
