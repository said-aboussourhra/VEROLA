import { describe, expect, it } from "vitest";
import { CATALOG, FINISHES, ZONES, TIERS, calculatePrice, fromPrice, tierFor, VAT_RATE, EXPRESS_MULTIPLIER } from "../pricing";

const base = {
  product: CATALOG[0].id,
  sizeId: CATALOG[0].sizes[0].id,
  paperId: CATALOG[0].papers[0].id,
  finishId: FINISHES[0].id,
  qty: 1,
};

describe("tierFor", () => {
  it("uses the lowest tier below the first threshold and steps at each boundary", () => {
    expect(tierFor(1).factor).toBe(TIERS[0].factor);
    expect(tierFor(49).min).toBe(1);
    expect(tierFor(50).min).toBe(50);
    expect(tierFor(99).min).toBe(50);
    expect(tierFor(100).min).toBe(100);
    expect(tierFor(10_000).min).toBe(5000);
  });

  it("never gets more expensive per unit as quantity grows", () => {
    const factors = TIERS.map((t) => t.factor);
    for (let i = 1; i < factors.length; i++) expect(factors[i]).toBeLessThan(factors[i - 1]);
  });
});

describe("calculatePrice", () => {
  it("adds VAT to the subtotal and delivery on top, rounded to centimes", () => {
    const p = calculatePrice({ ...base, qty: 10, zoneId: ZONES[0].id });
    expect(p.subtotal).toBeCloseTo(p.unit * 10, 2);
    expect(p.vat).toBeCloseTo(p.subtotal * VAT_RATE, 2);
    expect(p.delivery).toBe(ZONES[0].fee);
    expect(p.total).toBeCloseTo(p.subtotal + p.vat + p.delivery, 2);
  });

  it("applies the express multiplier to delivery only", () => {
    const std = calculatePrice({ ...base, qty: 10 });
    const exp = calculatePrice({ ...base, qty: 10, express: true });
    expect(exp.delivery).toBeCloseTo(std.delivery * EXPRESS_MULTIPLIER, 2);
    expect(exp.unit).toBe(std.unit);
    expect(exp.expressApplied).toBe(true);
    expect(exp.days).toBe(1);
    expect(std.days).toBe(2);
  });

  it("gives a lower unit price for bulk orders", () => {
    const small = calculatePrice({ ...base, qty: 1 });
    const bulk = calculatePrice({ ...base, qty: 500 });
    expect(bulk.unit).toBeLessThan(small.unit);
  });

  it("falls back to defaults for unknown size, paper, finish and zone", () => {
    const p = calculatePrice({
      ...base,
      sizeId: "does-not-exist",
      paperId: "nope",
      finishId: "nope" as never,
      zoneId: "nope",
    });
    expect(p.size).toBe(CATALOG[0].sizes[0]);
    expect(p.paper).toBe(CATALOG[0].papers[0]);
    expect(p.zone).toBe(ZONES[0]);
  });

  it("throws for an unknown product", () => {
    expect(() => calculatePrice({ ...base, product: "unknown" as never })).toThrow(/Unknown product/);
  });
});

describe("fromPrice", () => {
  it("returns a positive starting price for every product", () => {
    for (const p of CATALOG) expect(fromPrice(p.id)).toBeGreaterThan(0);
  });
});
