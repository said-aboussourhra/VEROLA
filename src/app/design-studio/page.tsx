"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { FINISHES, calculatePrice, formatMAD, findOrFirst, TIERS, type FinishId } from "@/lib/pricing";
import { DESIGNS, designSvg, type DesignDef } from "@/lib/designs";
import { SectionHeading, Reveal, Icon } from "@/components/ui";
import { useCatalog } from "@/components/catalog";

/* ------------------------------------------------------------------
   Design studio: a public preview of any product before ordering.
   Shape, colour, finish, side, ready-made artwork, quantity and live
   price. Visual only: the preview never changes the price or the order.
   ------------------------------------------------------------------ */

const SHAPES = [
  { id: "rect", label: { en: "Rectangle", fr: "Rectangle", ar: "مستطيل" } },
  { id: "rounded", label: { en: "Rounded", fr: "Arrondi", ar: "حواف دائرية" } },
  { id: "circle", label: { en: "Circle", fr: "Rond", ar: "دائري" } },
  { id: "die", label: { en: "Die-cut", fr: "Découpe", ar: "قطع خاص" } },
] as const;
type ShapeId = (typeof SHAPES)[number]["id"];

const COLORS = [
  { id: "paper", hex: "", label: { en: "Paper", fr: "Papier", ar: "الورق" } },
  { id: "white", hex: "#ffffff", label: { en: "White", fr: "Blanc", ar: "أبيض" } },
  { id: "ivory", hex: "#f3ead6", label: { en: "Ivory", fr: "Ivoire", ar: "عاجي" } },
  { id: "blue", hex: "#0B63D6", label: { en: "Blue", fr: "Bleu", ar: "أزرق" } },
  { id: "pink", hex: "#FF2E93", label: { en: "Pink", fr: "Rose", ar: "وردي" } },
  { id: "gold", hex: "#FFC400", label: { en: "Gold", fr: "Or", ar: "ذهبي" } },
  { id: "black", hex: "#111111", label: { en: "Black", fr: "Noir", ar: "أسود" } },
] as const;

const FACE_LABEL = {
  front: { en: "Front", fr: "Recto", ar: "الوجه الأمامي" },
  back: { en: "Back", fr: "Verso", ar: "الوجه الخلفي" },
};

const T = {
  title: { en: "Design studio", fr: "Studio de design", ar: "استوديو التصميم" },
  sub: {
    en: "Pick a product, a shape and a colour. See it in 3D, choose a ready design, then the quantity and price.",
    fr: "Choisissez un produit, une forme et une couleur. Voyez-le en 3D, puis la quantité et le prix.",
    ar: "اختر المنتج والشكل واللون، وشاهده بالأبعاد الثلاثية، ثم اختر التصميم والكمية والسعر.",
  },
  product: { en: "Product", fr: "Produit", ar: "المنتج" },
  size: { en: "Size", fr: "Format", ar: "المقاس" },
  paper: { en: "Material", fr: "Support", ar: "الخامة" },
  finish: { en: "Finish & protection", fr: "Finition", ar: "التشطيب والحماية" },
  shape: { en: "Shape", fr: "Forme", ar: "الشكل" },
  color: { en: "Colour", fr: "Couleur", ar: "اللون" },
  custom: { en: "Your colour", fr: "Votre couleur", ar: "لونك الخاص" },
  face: { en: "Side", fr: "Face", ar: "الوجه" },
  templates: { en: "Ready designs", fr: "Designs prêts", ar: "تصاميم جاهزة" },
  yourArt: { en: "Back to product photo", fr: "Retour à la photo", ar: "العودة لصورة المنتج" },
  qty: { en: "Quantity", fr: "Quantité", ar: "الكمية" },
  unit: { en: "Per unit", fr: "Par unité", ar: "سعر الوحدة" },
  subtotal: { en: "Subtotal", fr: "Sous-total", ar: "المجموع الفرعي" },
  total: { en: "Total incl. VAT & delivery", fr: "Total TTC et livraison", ar: "الإجمالي شامل الضريبة والتوصيل" },
  order: { en: "Continue to order", fr: "Continuer la commande", ar: "متابعة الطلب" },
  note: {
    en: "Colours on screen are a preview. The final colour depends on the paper and print profile.",
    fr: "Les couleurs à l'écran sont un aperçu. La couleur finale dépend du papier et du profil d'impression.",
    ar: "الألوان على الشاشة للمعاينة فقط، واللون النهائي يعتمد على الورق وطريقة الطباعة.",
  },
  qtyTier: { en: "The price per unit drops with volume", fr: "Le prix baisse avec le volume", ar: "سعر الوحدة ينخفض مع الكمية" },
};

export default function DesignStudioPage() {
  const CATALOG = useCatalog();
  const { L, lang } = useI18n();

  const [productId, setProductId] = useState<string>(CATALOG[0]?.id ?? "");
  const product = findOrFirst(CATALOG, (p) => p.id === productId);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [paperId, setPaperId] = useState<string | null>(null);
  const [finishId, setFinishId] = useState<FinishId>("matte");
  const [shape, setShape] = useState<ShapeId>("rect");
  const [colorHex, setColorHex] = useState<string>("");
  const [customHex, setCustomHex] = useState<string>("#0B63D6");
  const [face, setFace] = useState<"front" | "back">("front");
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(product.minQty);

  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const paper = product.papers.find((p) => p.id === paperId) ?? product.papers[0];
  const template: DesignDef | undefined = DESIGNS.find((d) => d.slug === templateSlug);
  const templateUrl = useMemo(
    () => (template ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(designSvg(template))}` : null),
    [template],
  );

  const price = calculatePrice(
    { product: product.id, sizeId: size.id, paperId: paper.id, finishId, qty: Math.max(qty, product.minQty), zoneId: "a" },
    CATALOG,
  );
  const tier = TIERS.filter((t) => qty >= t.min).pop();

  const shapeStyle: CSSProperties = {
    borderRadius: shape === "rounded" ? 28 : shape === "circle" ? "50%" : 6,
    clipPath:
      shape === "die"
        ? "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)"
        : undefined,
  };
  const aspect = shape === "circle" ? "1 / 1" : "4 / 3";
  const quantities = [product.minQty, product.minQty * 2, product.minQty * 5, product.minQty * 10];

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={L(T.title)} title={L(T.title)} sub={L(T.sub)} />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          {/* ---------- controls ---------- */}
          <div className="min-w-0 space-y-6 order-2 lg:order-1">
            <Group label={L(T.product)}>
              <div className="flex flex-wrap gap-2">
                {CATALOG.map((p) => (
                  <Chip
                    key={p.id}
                    active={p.id === product.id}
                    onClick={() => {
                      setProductId(p.id);
                      setSizeId(null);
                      setPaperId(null);
                      setQty(p.minQty);
                    }}
                  >
                    {L(p.name)}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={L(T.size)}>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <Chip key={s.id} active={s.id === size.id} onClick={() => setSizeId(s.id)}>
                    {L(s.name)} · {s.dim}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={L(T.paper)}>
              <div className="flex flex-wrap gap-2">
                {product.papers.map((p) => (
                  <Chip key={p.id} active={p.id === paper.id} onClick={() => setPaperId(p.id)}>
                    {L(p.name)}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={L(T.finish)}>
              <div className="flex flex-wrap gap-2">
                {FINISHES.map((f) => (
                  <Chip key={f.id} active={f.id === finishId} onClick={() => setFinishId(f.id)}>
                    {L(f.name)}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={L(T.shape)}>
              <div className="flex flex-wrap gap-2">
                {SHAPES.map((s) => (
                  <Chip key={s.id} active={s.id === shape} onClick={() => setShape(s.id)}>
                    {L(s.label)}
                  </Chip>
                ))}
              </div>
            </Group>

            <Group label={L(T.color)}>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={L(T.color)}>
                {COLORS.map((c) => {
                  const on = colorHex === c.hex;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={L(c.label)}
                      title={L(c.label)}
                      onClick={() => setColorHex(c.hex)}
                      className={`h-9 min-w-9 px-2 rounded-full border text-xs cursor-pointer transition-transform ${on ? "border-cyan scale-110" : "border-white/20"}`}
                      style={{ background: c.hex || "transparent" }}
                    >
                      {c.hex ? "" : <span className="text-muted">{L(c.label)}</span>}
                    </button>
                  );
                })}
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setColorHex(e.target.value);
                    }}
                    className="h-9 w-12 rounded cursor-pointer bg-transparent"
                    aria-label={L(T.custom)}
                  />
                  {L(T.custom)}
                </label>
              </div>
            </Group>

            <Group label={L(T.face)}>
              <div className="flex gap-2">
                {(["front", "back"] as const).map((f) => (
                  <Chip key={f} active={face === f} onClick={() => setFace(f)}>
                    {L(FACE_LABEL[f])}
                  </Chip>
                ))}
              </div>
            </Group>
          </div>

          {/* ---------- preview ---------- */}
          <div className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="glass rounded-card p-5 md:p-8">
              <div className="relative mx-auto w-full max-w-md" style={{ perspective: "1200px" }}>
                <div className="absolute -inset-8 rounded-full blur-3xl opacity-25 aurora-bg" aria-hidden />
                <div
                  className="relative mx-auto overflow-hidden shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6)]"
                  style={{
                    ...shapeStyle,
                    aspectRatio: aspect,
                    background: colorHex || "#ffffff",
                    transform: face === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1), background 0.5s",
                  }}
                >
                  {face === "front" ? (
                    <>
                      {templateUrl ? (
                        <img src={templateUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <img
                          src={product.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ mixBlendMode: colorHex ? "multiply" : "normal" }}
                        />
                      )}
                      {finishId === "gloss" && (
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, transparent 32%, rgba(255,255,255,0.38) 46%, transparent 60%)" }} />
                      )}
                      {finishId === "spot-uv" && (
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(45% 38% at 64% 36%, rgba(255,255,255,0.45), transparent 70%)" }} />
                      )}
                      {(finishId === "holo-foil" || finishId === "gold-foil") && (
                        <div
                          className="absolute inset-0 pointer-events-none mix-blend-overlay"
                          style={{
                            background: finishId === "holo-foil" ? "linear-gradient(115deg,#22C1F0,#FF2E93,#FFC400,#22C1F0)" : "linear-gradient(115deg,#8a6a1f,#ffd76a,#8a6a1f)",
                            opacity: 0.45,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }} />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-ink" style={{ transform: "rotateY(180deg)" }}>
                      <span className="font-display font-extrabold text-2xl opacity-40" dir="ltr">VEROLA</span>
                      <span className="text-xs tracking-[0.3em] opacity-40" dir="ltr">PRINTED IN MOROCCO</span>
                    </div>
                  )}
                </div>
              </div>

              {templateSlug && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setTemplateSlug(null)}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-muted hover:text-cyan cursor-pointer"
                  >
                    {L(T.yourArt)}
                  </button>
                </div>
              )}
              <p className="mt-4 text-center text-xs text-muted">{L(T.note)}</p>
            </div>
          </div>

          {/* ---------- price & templates ---------- */}
          <aside className="min-w-0 order-3 lg:sticky lg:top-28 space-y-5">
            <div className="glass rounded-card p-6 space-y-5">
              <Group label={L(T.qty)}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={product.minQty}
                  step={product.step}
                  value={qty}
                  onChange={(e) => setQty(Math.max(product.minQty, Number(e.target.value) || product.minQty))}
                  className="w-full rounded-tile border border-white/15 bg-transparent px-4 py-3 font-display text-xl"
                  aria-label={L(T.qty)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {quantities.map((q) => (
                    <Chip key={q} active={qty === q} onClick={() => setQty(q)}>
                      {q.toLocaleString()}
                    </Chip>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">{L(T.qtyTier)}</p>
              </Group>

              <div className="space-y-2 text-sm">
                <Row label={L(T.unit)} value={formatMAD(price.unit, lang)} />
                <Row label={L(T.subtotal)} value={formatMAD(price.subtotal, lang)} />
                <Row label={L(T.total)} value={formatMAD(price.total, lang)} strong />
                {tier && tier.factor < 1 && <p className="text-xs text-cyan">-{Math.round((1 - tier.factor) * 100)}%</p>}
              </div>

              <a href="/customize" className="flex w-full items-center justify-center gap-2 rounded-full aurora-bg px-6 py-3 font-semibold text-white">
                {L(T.order)}
                <Icon name="arrow" className="w-4 h-4 rtl-flip" />
              </a>
            </div>

            <Group label={L(T.templates)}>
              <div className="grid grid-cols-2 gap-3">
                {DESIGNS.filter((d) => d.access === "free").slice(0, 8).map((d) => {
                  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(designSvg(d))}`;
                  const on = templateSlug === d.slug;
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      onClick={() => setTemplateSlug(d.slug)}
                      aria-pressed={on}
                      className={`overflow-hidden rounded-tile border text-start cursor-pointer transition-transform hover:-translate-y-0.5 ${on ? "border-cyan" : "border-white/12"}`}
                    >
                      <img src={url} alt={L(d.title)} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                      <span className="block px-2 py-1.5 text-xs truncate">{L(d.title)}</span>
                    </button>
                  );
                })}
              </div>
            </Group>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-sm transition-colors cursor-pointer ${
        active ? "aurora-bg border-transparent text-white" : "border-white/15 text-muted hover:text-cyan"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-display font-bold text-lg" : "font-medium"}>{value}</span>
    </div>
  );
}
