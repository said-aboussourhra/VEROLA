import { describe, expect, it } from "vitest";
import { parseProductInput } from "../product-input";

const valid = {
  slug: "wedding-invitations",
  name: { en: "Wedding invitations" },
  tagline: { en: "Elegant cards" },
  unit: { en: "piece" },
  base: 12,
  minQty: 50,
  step: 10,
  sizes: [{ id: "a5", name: { en: "A5" }, dim: "148 × 210 mm", factor: 1.6 }],
  papers: [{ id: "std", name: { en: "Standard" }, spec: "350 gsm", factor: 1 }],
};

describe("parseProductInput", () => {
  it("accepts a valid product and fills missing translations from English", () => {
    const p = parseProductInput(valid);
    expect(p.name).toEqual({ en: "Wedding invitations", fr: "Wedding invitations", ar: "Wedding invitations" });
    expect(p.active).toBe(true);
  });

  it("rejects slugs that are not URL-safe", () => {
    expect(() => parseProductInput({ ...valid, slug: "Bad Slug!" })).toThrow(/Slug/);
  });

  it("requires an English name", () => {
    expect(() => parseProductInput({ ...valid, name: { en: "" } })).toThrow(/English/);
  });

  it("rejects non-positive prices and factors", () => {
    expect(() => parseProductInput({ ...valid, base: 0 })).toThrow(/Base price/);
    expect(() => parseProductInput({ ...valid, sizes: [{ ...valid.sizes[0], factor: 0 }] })).toThrow(/factor/);
  });

  it("requires at least one size and one paper with unique ids", () => {
    expect(() => parseProductInput({ ...valid, sizes: [] })).toThrow(/at least one/);
    const dup = [valid.sizes[0], { ...valid.sizes[0] }];
    expect(() => parseProductInput({ ...valid, sizes: dup })).toThrow(/unique id/);
  });
});
