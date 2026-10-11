import type { Localized, PaperOption, SizeOption } from "./pricing";

/* Pure validation for admin product input. No database access here, so it is unit-tested. */

export type ProductInput = {
  slug: string;
  name: Localized;
  tagline: Localized;
  unit: Localized;
  base: number;
  minQty: number;
  step: number;
  image: string;
  sizes: SizeOption[];
  papers: PaperOption[];
  position: number;
  active: boolean;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function str(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function localized(v: unknown, max: number, field: string): Localized {
  const o = (v ?? {}) as Record<string, unknown>;
  const out = { en: str(o.en, max), fr: str(o.fr, max), ar: str(o.ar, max) };
  if (!out.en) throw new Error(`${field}: English text is required.`);
  // missing translations fall back to English so the site never shows blanks
  return { en: out.en, fr: out.fr || out.en, ar: out.ar || out.en };
}

function num(v: unknown, field: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${field} must be between ${min} and ${max}.`);
  return n;
}

function options(v: unknown, field: string) {
  const list = Array.isArray(v) ? v : [];
  const seen = new Set<string>();
  const out = list.map((raw) => {
    const o = raw as Record<string, unknown>;
    const id = str(o.id, 40).toLowerCase().replace(/\s+/g, "-");
    if (!id || seen.has(id)) throw new Error(`${field}: each option needs a unique id.`);
    seen.add(id);
    return o;
  });
  if (!out.length) throw new Error(`${field}: add at least one option.`);
  return out;
}

export function parseProductInput(body: unknown): ProductInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const slug = str(b.slug, 60).toLowerCase();
  if (!SLUG.test(slug)) throw new Error("Slug: use lowercase letters, numbers and dashes (e.g. wedding-invitations).");

  const sizes = options(b.sizes, "Sizes").map((o) => ({
    id: str(o.id, 40).toLowerCase().replace(/\s+/g, "-"),
    name: localized(o.name, 80, "Size name"),
    dim: str(o.dim, 60),
    factor: num(o.factor, "Size factor", 0.01, 100),
  }));
  const papers = options(b.papers, "Papers").map((o) => ({
    id: str(o.id, 40).toLowerCase().replace(/\s+/g, "-"),
    name: localized(o.name, 80, "Paper name"),
    spec: str(o.spec, 120),
    factor: num(o.factor, "Paper factor", 0.01, 100),
  }));

  const minQty = Math.round(num(b.minQty, "Minimum quantity", 1, 100000));
  const step = Math.round(num(b.step, "Quantity step", 1, 100000));

  return {
    slug,
    name: localized(b.name, 120, "Name"),
    tagline: localized(b.tagline, 240, "Tagline"),
    unit: localized(b.unit, 40, "Unit"),
    base: num(b.base, "Base price", 0.01, 1000000),
    minQty,
    step,
    image: str(b.image, 400),
    sizes,
    papers,
    position: Math.round(num(b.position ?? 0, "Position", -10000, 10000)),
    active: b.active !== false,
  };
}
