"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductRow } from "@/db/schema";
import { formatMAD, type PaperOption, type SizeOption } from "@/lib/pricing";
import { Button, Badge, Card, EmptyState, Field, Icon, Spinner, inputCls } from "@/components/ui";
import { useToast } from "@/components/notify";

/* Admin: add, edit, hide and delete the printing products sold on the site.
   Changes are live: the public catalogue reads the same table. */

type Form = {
  id: number | null;
  slug: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  taglineEn: string;
  taglineFr: string;
  taglineAr: string;
  unit: string;
  base: string;
  minQty: string;
  step: string;
  image: string;
  position: string;
  active: boolean;
  sizes: string;
  papers: string;
};

const EMPTY: Form = {
  id: null,
  slug: "",
  nameEn: "",
  nameFr: "",
  nameAr: "",
  taglineEn: "",
  taglineFr: "",
  taglineAr: "",
  unit: "piece",
  base: "10",
  minQty: "1",
  step: "1",
  image: "",
  position: "0",
  active: true,
  sizes: "a4 | A4 | 210 × 297 mm | 1",
  papers: "std | Standard 350 gsm | Coated, silk finish | 1",
};

const SIZE_HINT = "one per line:  id | name | dimensions | price factor";
const PAPER_HINT = "one per line:  id | name | specification | price factor";

function optionsToText(list: (SizeOption | PaperOption)[], kind: "size" | "paper"): string {
  return list
    .map((o) => {
      const detail = kind === "size" ? (o as SizeOption).dim : (o as PaperOption).spec;
      return `${o.id} | ${o.name.en} | ${detail} | ${o.factor}`;
    })
    .join("\n");
}

/** Parses "id | name | detail | factor" lines. Throws a readable error. */
function textToOptions(text: string, kind: "size" | "paper") {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error(`Add at least one ${kind === "size" ? "size" : "paper"}.`);
  return lines.map((line, i) => {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 4) throw new Error(`Line ${i + 1}: use "id | name | ${kind === "size" ? "dimensions" : "specification"} | factor".`);
    const [id, name, detail, factorRaw] = parts;
    const factor = Number(factorRaw);
    if (!id || !name) throw new Error(`Line ${i + 1}: id and name are required.`);
    if (!Number.isFinite(factor) || factor <= 0) throw new Error(`Line ${i + 1}: the price factor must be a number above 0.`);
    const localized = { en: name, fr: name, ar: name };
    return kind === "size"
      ? { id, name: localized, dim: detail, factor }
      : { id, name: localized, spec: detail, factor };
  });
}

function rowToForm(p: ProductRow): Form {
  return {
    id: p.id,
    slug: p.slug,
    nameEn: p.name.en,
    nameFr: p.name.fr,
    nameAr: p.name.ar,
    taglineEn: p.tagline.en,
    taglineFr: p.tagline.fr,
    taglineAr: p.tagline.ar,
    unit: p.unit.en,
    base: String(p.base),
    minQty: String(p.minQty),
    step: String(p.step),
    image: p.image,
    position: String(p.position),
    active: p.active,
    sizes: optionsToText(p.sizes, "size"),
    papers: optionsToText(p.papers, "paper"),
  };
}

function formToBody(f: Form) {
  const sizes = textToOptions(f.sizes, "size");
  const papers = textToOptions(f.papers, "paper");
  return {
    slug: f.slug,
    name: { en: f.nameEn, fr: f.nameFr || f.nameEn, ar: f.nameAr || f.nameEn },
    tagline: { en: f.taglineEn, fr: f.taglineFr || f.taglineEn, ar: f.taglineAr || f.taglineEn },
    unit: { en: f.unit, fr: f.unit, ar: f.unit },
    base: Number(f.base),
    minQty: Number(f.minQty),
    step: Number(f.step),
    image: f.image,
    position: Number(f.position) || 0,
    active: f.active,
    sizes,
    papers,
  };
}

export function ProductsAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<ProductRow[] | null>(null);
  const [editing, setEditing] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/products?all=1", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load products");
      setItems(data.items as ProductRow[]);
    } catch (e) {
      toast.error("Products", e instanceof Error ? e.message : "Could not load products");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state after mount; avoids server/client markup mismatch
    load();
  }, [load]);

  const set = (patch: Partial<Form>) => setEditing((f) => (f ? { ...f, ...patch } : f));

  const save = async () => {
    if (!editing) return;
    let body;
    try {
      body = formToBody(editing);
    } catch (e) {
      toast.error("Check the form", e instanceof Error ? e.message : "Invalid values");
      return;
    }
    setSaving(true);
    try {
      const url = editing.id ? `/api/products/${editing.id}` : "/api/products";
      const res = await fetch(url, {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save the product");
      toast.success("Saved", `${body.name.en} is ${body.active ? "live on the site" : "hidden from the site"}.`);
      setEditing(null);
      await load();
    } catch (e) {
      toast.error("Could not save", e instanceof Error ? e.message : "Try again");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ProductRow) => {
    if (!window.confirm(`Delete "${p.name.en}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error("Could not delete", data.error || "Try again");
      return;
    }
    toast.success("Deleted", `${p.name.en} was removed.`);
    await load();
  };

  const toggle = async (p: ProductRow) => {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        unit: p.unit,
        base: p.base,
        minQty: p.minQty,
        step: p.step,
        image: p.image,
        position: p.position,
        sizes: p.sizes,
        papers: p.papers,
        active: !p.active,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error("Could not change visibility", data.error || "Try again");
      return;
    }
    await load();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set({ image: data.url });
    } catch (e) {
      toast.error("Upload failed", e instanceof Error ? e.message : "Try again");
    } finally {
      setUploading(false);
    }
  };

  if (editing) {
    return (
      <Card className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display font-bold text-lg">{editing.id ? "Edit product" : "New product"}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-small text-ink-muted hover:text-paper">
            Cancel
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Slug (URL)" required hint="lowercase, dashes · e.g. wedding-invitations">
            <input className={inputCls} dir="ltr" value={editing.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} />
          </Field>
          <Field label="Position" hint="lower numbers appear first">
            <input className={inputCls} type="number" value={editing.position} onChange={(e) => set({ position: e.target.value })} />
          </Field>
          <Field label="Name (English)" required>
            <input className={inputCls} value={editing.nameEn} onChange={(e) => set({ nameEn: e.target.value })} />
          </Field>
          <Field label="Name (French)" hint="leave empty to reuse English">
            <input className={inputCls} value={editing.nameFr} onChange={(e) => set({ nameFr: e.target.value })} />
          </Field>
          <Field label="Name (Arabic)" hint="leave empty to reuse English">
            <input className={inputCls} dir="rtl" value={editing.nameAr} onChange={(e) => set({ nameAr: e.target.value })} />
          </Field>
          <Field label="Unit" hint="e.g. piece, sheet, box">
            <input className={inputCls} value={editing.unit} onChange={(e) => set({ unit: e.target.value })} />
          </Field>
          <Field label="Tagline (English)">
            <input className={inputCls} value={editing.taglineEn} onChange={(e) => set({ taglineEn: e.target.value })} />
          </Field>
          <Field label="Tagline (French)">
            <input className={inputCls} value={editing.taglineFr} onChange={(e) => set({ taglineFr: e.target.value })} />
          </Field>
          <Field label="Tagline (Arabic)">
            <input className={inputCls} dir="rtl" value={editing.taglineAr} onChange={(e) => set({ taglineAr: e.target.value })} />
          </Field>
          <Field label="Base price (MAD)" required hint="price per unit before sizes, paper, finish and quantity">
            <input className={inputCls} type="number" min="0" step="0.01" value={editing.base} onChange={(e) => set({ base: e.target.value })} />
          </Field>
          <Field label="Minimum quantity">
            <input className={inputCls} type="number" min="1" value={editing.minQty} onChange={(e) => set({ minQty: e.target.value })} />
          </Field>
          <Field label="Quantity step">
            <input className={inputCls} type="number" min="1" value={editing.step} onChange={(e) => set({ step: e.target.value })} />
          </Field>
          <Field label="Photo" hint="upload a photo, or paste an image URL">
            <div className="space-y-3">
              <input className={inputCls} dir="ltr" placeholder="/api/uploads/…" value={editing.image} onChange={(e) => set({ image: e.target.value })} />
              <label className="inline-flex items-center gap-2 text-small text-cyan cursor-pointer">
                <Icon name="plus" className="w-4 h-4" />
                {uploading ? "Uploading…" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </Field>
        </div>

        <Field label="Sizes" hint={SIZE_HINT}>
          <textarea className={`${inputCls} font-mono text-small min-h-32`} dir="ltr" value={editing.sizes} onChange={(e) => set({ sizes: e.target.value })} />
        </Field>
        <Field label="Papers" hint={PAPER_HINT}>
          <textarea className={`${inputCls} font-mono text-small min-h-32`} dir="ltr" value={editing.papers} onChange={(e) => set({ papers: e.target.value })} />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-brand" checked={editing.active} onChange={(e) => set({ active: e.target.checked })} />
          <span className="text-small">Show this product on the site</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={save} loading={saving} disabled={!editing.slug || !editing.nameEn}>
            Save product
          </Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted text-small">
          Products you add or change here appear on the website straight away.
        </p>
        <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
          <Icon name="plus" className="w-4 h-4" /> New product
        </Button>
      </div>

      {items === null && (
        <div className="grid place-items-center py-16">
          <Spinner className="w-6 h-6 text-cyan" label="Loading products" />
        </div>
      )}

      {items && items.length === 0 && (
        <Card padded={false}>
          <EmptyState title="No products yet" description="Add your first printing product to show it on the site." />
        </Card>
      )}

      {items && items.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((p) => (
            <li key={p.id}>
              <Card className="flex h-full flex-col gap-4">
                <div className="flex items-start gap-4">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-20 h-20 rounded-inset object-cover shrink-0" />
                  ) : (
                    <span className="w-20 h-20 rounded-inset glass grid place-items-center text-ink-faint shrink-0">
                      <Icon name="box" className="w-6 h-6" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold truncate">{p.name.en}</p>
                      <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Live" : "Hidden"}</Badge>
                    </div>
                    <p className="text-caption text-ink-muted" dir="ltr">
                      /products/{p.slug}
                    </p>
                    <p className="text-small text-ink-body mt-1">
                      From {formatMAD(p.base, "en")} · min {p.minQty} · {p.sizes.length} sizes · {p.papers.length} papers
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button variant="glass" size="sm" onClick={() => setEditing(rowToForm(p))}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggle(p)}>
                    {p.active ? "Hide" : "Show"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)}>
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
