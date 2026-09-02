import { describe, it, expect } from "vitest";
import { layoutBlocks } from "./calendar-layout";

const b = (id: string, startMin: number, endMin: number) => ({ data: id, startMin, endMin });

describe("layoutBlocks", () => {
  it("rozłączne bloki dostają ten sam pas", () => {
    const r = layoutBlocks([b("a", 540, 600), b("b", 660, 720)]);
    expect(r.map((x) => x.lane)).toEqual([0, 0]);
    expect(r.every((x) => x.lanes === 1)).toBe(true);
  });

  it("nakładające się bloki dostają osobne pasy", () => {
    const r = layoutBlocks([b("a", 540, 660), b("b", 600, 700)]);
    const lanes = r.map((x) => x.lane).sort();
    expect(lanes).toEqual([0, 1]);
    expect(r.every((x) => x.lanes === 2)).toBe(true);
  });

  it("trzy nakładające się bloki dają trzy pasy", () => {
    const r = layoutBlocks([b("a", 540, 700), b("b", 560, 700), b("c", 580, 700)]);
    expect(r.every((x) => x.lanes === 3)).toBe(true);
    expect(r.map((x) => x.lane).sort()).toEqual([0, 1, 2]);
  });

  it("pas jest zwalniany po zakończeniu bloku", () => {
    // a: 9-10, b: 9:30-11 (kolizja), c: 10:15-11 mieści się w pasie a
    const r = layoutBlocks([b("a", 540, 600), b("b", 570, 660), b("c", 615, 660)]);
    const byId = Object.fromEntries(r.map((x) => [x.data, x]));
    expect(byId.a.lane).toBe(0);
    expect(byId.b.lane).toBe(1);
    expect(byId.c.lane).toBe(0);
  });

  it("punktowy blok (zadanie czasowe) nie zasłania eventu", () => {
    // event 17:30-19:00, zadanie 18:00 (traktowane jako 30 min)
    const r = layoutBlocks([b("event", 1050, 1140), b("task", 1080, 1110)]);
    const byId = Object.fromEntries(r.map((x) => [x.data, x]));
    expect(byId.event.lane).not.toBe(byId.task.lane);
    expect(byId.event.lanes).toBe(2);
  });
});
