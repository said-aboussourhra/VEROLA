/**
 * VÉLORA pricing engine — pure, deterministic, no side effects.
 * JSON matrix: product × size × paper × finish × quantity tier,
 * plus express multiplier and delivery zones. All amounts in MAD.
 */

export type Lang = "en" | "fr" | "ar";
export type L = Record<Lang, string>;

export interface Localized {
  en: string;
  fr: string;
  ar: string;
}

export type ProductId =
  | "business-cards"
  | "flyers"
  | "posters"
  | "stickers"
  | "packaging"
  | "tshirts"
  | "roll-ups"
  | "menus";

export type FinishId =
  | "matte"
  | "gloss"
  | "soft-touch"
  | "spot-uv"
  | "holo-foil"
  | "gold-foil"
  | "emboss"
  | "die-cut";

export interface SizeOption {
  id: string;
  name: Localized;
  dim: string;
  factor: number;
}

export interface PaperOption {
  id: string;
  name: Localized;
  spec: string;
  factor: number;
}

export interface Product {
  id: ProductId;
  name: Localized;
  tagline: Localized;
  base: number; // unit price at baseline quantity, before multipliers
  minQty: number;
  step: number;
  unit: Localized;
  image: string;
  sizes: SizeOption[];
  papers: PaperOption[];
}

export interface Finish {
  id: FinishId;
  name: Localized;
  desc: Localized;
  factor: number;
  mat: string; // css class for the material preview
  premium?: boolean;
}

/* ---------------------------------- finishes --------------------------------- */

export const FINISHES: Finish[] = [
  {
    id: "matte",
    name: { en: "Matte", fr: "Mat", ar: "مطفي" },
    desc: {
      en: "Silky, light-free. The calm choice.",
      fr: "Satiné, sans reflets. Le choix posé.",
      ar: "ملمس حريري بلا بريق. الخيار الأنيق.",
    },
    factor: 1,
    mat: "mat-matte",
  },
  {
    id: "gloss",
    name: { en: "Gloss", fr: "Brillant", ar: "لامع" },
    desc: {
      en: "Maximum pop, deep blacks, saturated color.",
      fr: "Couleur maximale, noirs profonds, saturation totale.",
      ar: "ألوان مشبعة وسواد عميق. أقصى حدة.",
    },
    factor: 1,
    mat: "mat-gloss",
  },
  {
    id: "soft-touch",
    name: { en: "Soft-touch", fr: "Soft-touch", ar: "لمسة ناعمة" },
    desc: {
      en: "Velvet lamination you want to keep touching.",
      fr: "Pelliculage velours qu'on ne lâche plus.",
      ar: "تغليف مخملي لا تريد التوقف عن لمسه.",
    },
    factor: 1.12,
    mat: "mat-soft",
  },
  {
    id: "spot-uv",
    name: { en: "Spot UV", fr: "UV local", ar: "طباعية موضعية" },
    desc: {
      en: "Gloss islands on a matte sea. Precise.",
      fr: "Des îles brillantes sur un mat profond.",
      ar: "بقع لامعة على خلفية مطفية. بدقة.",
    },
    factor: 1.2,
    mat: "mat-spotuv",
  },
  {
    id: "holo-foil",
    name: { en: "Holographic foil", fr: "Foil holographique", ar: "فويل هولوغرافي" },
    desc: {
      en: "Light that bends. Impossible in a photo.",
      fr: "Une lumière qui se plie. Irréell en photo.",
      ar: "ضوء ينثني. لا تُلتقط حقيقته في الصورة.",
    },
    factor: 1.45,
    mat: "holo",
    premium: true,
  },
  {
    id: "gold-foil",
    name: { en: "Gold foil", fr: "Foil or", ar: "فويل ذهبي" },
    desc: {
      en: "Real metal. Premium finish indicator.",
      fr: "Du vrai métal. Le fini premium par excellence.",
      ar: "معادن حقيقية. لمسة فاخرة بامتياز.",
    },
    factor: 1.6,
    mat: "mat-foil-gold",
    premium: true,
  },
  {
    id: "emboss",
    name: { en: "Emboss", fr: "Embossage", ar: "نقش بارز" },
    desc: {
      en: "Relief you can read with your eyes closed.",
      fr: "Un relief qu'on lit les yeux fermés.",
      ar: "بارز تحسّه بأصابعك قبل عيونك.",
    },
    factor: 1.35,
    mat: "mat-emboss",
  },
  {
    id: "die-cut",
    name: { en: "Die-cut", fr: "Découpe guillochée", ar: "قصّ على المقاس" },
    desc: {
      en: "Cut to the shape of your idea.",
      fr: "Découpé à la forme exacte de l'idée.",
      ar: "مقصوص على شكل فكرتك بالضبط.",
    },
    factor: 1.25,
    mat: "mat-matte",
  },
];

/* ---------------------------------- catalog ---------------------------------- */

const p = (
  id: ProductId,
  name: Localized,
  tagline: Localized,
  base: number,
  minQty: number,
  step: number,
  unit: Localized,
  image: string,
  sizes: SizeOption[],
  papers: PaperOption[],
): Product => ({ id, name, tagline, base, minQty, step, unit, image, sizes, papers });

export const CATALOG: Product[] = [
  p(
    "business-cards",
    { en: "Business Cards", fr: "Cartes de visite", ar: "بطاقات العمل" },
    {
      en: "Your handshake, in paper.",
      fr: "Votre poignée de main, en papier.",
      ar: "مصافحة ورقية لا تُنسى.",
    },
    1.8, 50, 50,
    { en: "cards", fr: "cartes", ar: "بطاقة" },
    "/images/products/business-cards.jpg",
    [
      { id: "std", name: { en: "Standard", fr: "Standard", ar: "قياسي" }, dim: "90×50 mm", factor: 1 },
      { id: "sq", name: { en: "Square", fr: "Carré", ar: "مربع" }, dim: "70×70 mm", factor: 1.05 },
    ],
    [
      { id: "std300", name: { en: "Uncoated 300g", fr: "Offset 300 g", ar: "غير مطلي 300غ" }, spec: "300 g", factor: 1 },
      { id: "silk350", name: { en: "Silk 350g", fr: "Soie 350 g", ar: "حرير 350غ" }, spec: "350 g", factor: 1.35 },
      { id: "kraft", name: { en: "Kraft 300g", fr: "Kraft 300 g", ar: "كرافت 300غ" }, spec: "300 g", factor: 1.15 },
    ],
  ),
  p(
    "flyers",
    { en: "Flyers & Leaflets", fr: "Flyers & Dépliants", ar: "فلايرات وملصقات" },
    {
      en: "Paper that gets passed around.",
      fr: "Le papier qu'on se passe entre les mains.",
      ar: "ورق يتنقل من يد إلى يد.",
    },
    2.2, 50, 50,
    { en: "sheets", fr: "feuilles", ar: "ورقة" },
    "/images/products/flyers.jpg",
    [
      { id: "dl", name: { en: "DL", fr: "DL", ar: "DL" }, dim: "99×210 mm", factor: 0.85 },
      { id: "a5", name: { en: "A5", fr: "A5", ar: "A5" }, dim: "148×210 mm", factor: 1 },
      { id: "a4", name: { en: "A4", fr: "A4", ar: "A4" }, dim: "210×297 mm", factor: 1.35 },
    ],
    [
      { id: "coated135", name: { en: "Coated 135g", fr: "Cuissé 135 g", ar: "مطلي 135غ" }, spec: "135 g", factor: 1 },
      { id: "coated170", name: { en: "Coated 170g", fr: "Cuissé 170 g", ar: "مطلي 170غ" }, spec: "170 g", factor: 1.18 },
      { id: "coated250", name: { en: "Coated 250g", fr: "Cuissé 250 g", ar: "مطلي 250غ" }, spec: "250 g", factor: 1.4 },
    ],
  ),
  p(
    "posters",
    { en: "Posters & Prints", fr: "Affiches & Tirages", ar: "بنرات وصور" },
    {
      en: "Big ideas, sharp at 1200 dpi.",
      fr: "De grandes idées, nettes en 1200 dpi.",
      ar: "أفكار كبيرة بحدة 1200 نقطة.",
    },
    38, 5, 1,
    { en: "posters", fr: "affiches", ar: "أفيش" },
    "/images/products/posters.jpg",
    [
      { id: "a2", name: { en: "A2", fr: "A2", ar: "A2" }, dim: "420×594 mm", factor: 0.7 },
      { id: "s50", name: { en: "50×70", fr: "50×70", ar: "50×70" }, dim: "500×700 mm", factor: 1 },
      { id: "s60", name: { en: "60×90", fr: "60×90", ar: "60×90" }, dim: "600×900 mm", factor: 1.3 },
    ],
    [
      { id: "std170", name: { en: "Matte 170g", fr: "Mat 170 g", ar: "مطفي 170غ" }, spec: "170 g", factor: 1 },
      { id: "photo230", name: { en: "Photo 230g", fr: "Photo 230 g", ar: "فوتو 230غ" }, spec: "230 g", factor: 1.2 },
      { id: "canvas", name: { en: "Fine-art canvas", fr: "Toile fine-art", ar: "قماش فني" }, spec: "340 g", factor: 1.9 },
    ],
  ),
  p(
    "stickers",
    { en: "Stickers & Labels", fr: "Autocollants & Étiquettes", ar: "ملصقات وتبويبات" },
    {
      en: "Die-cut vinyl that survives everything.",
      fr: "Vinyle guilloché qui survit à tout.",
      ar: "فينيل مقاوم يصمد في كل الظروف.",
    },
    1.5, 50, 25,
    { en: "stickers", fr: "autocollants", ar: "ملصق" },
    "/images/products/stickers.jpg",
    [
      { id: "mini", name: { en: "Mini sheet", fr: "Feuille mini", ar: "ورقة صغيرة" }, dim: "60×80 mm", factor: 1 },
      { id: "a4", name: { en: "A4 sheet", fr: "Feuille A4", ar: "ورقة A4" }, dim: "210×297 mm", factor: 1.6 },
    ],
    [
      { id: "vinyl", name: { en: "Vinyl white", fr: "Vinyle blanc", ar: "فينيل أبيض" }, spec: "75 µ", factor: 1 },
      { id: "clear", name: { en: "Clear vinyl", fr: "Vinyle transparent", ar: "فينيل شفاف" }, spec: "75 µ", factor: 1.1 },
      { id: "metallic", name: { en: "Metallic vinyl", fr: "Vinyle métallisé", ar: "فينيل معدني" }, spec: "75 µ", factor: 1.35 },
    ],
  ),
  p(
    "packaging",
    { en: "Packaging & Boxes", fr: "Emballages & Boîtes", ar: "تغليف وصناديق" },
    {
      en: "The unboxing, engineered.",
      fr: "L'ouverture de boîte, pensée au millimètre.",
      ar: "لحظة فتح العلبة، مهندسة.",
    },
    9.5, 25, 25,
    { en: "boxes", fr: "boîtes", ar: "علبة" },
    "/images/products/packaging.jpg",
    [
      { id: "s", name: { en: "Small", fr: "Petite", ar: "صغيرة" }, dim: "120×120×60 mm", factor: 1 },
      { id: "m", name: { en: "Medium", fr: "Moyenne", ar: "متوسطة" }, dim: "180×140×80 mm", factor: 1.4 },
      { id: "l", name: { en: "Large", fr: "Grande", ar: "كبيرة" }, dim: "250×200×100 mm", factor: 1.9 },
    ],
    [
      { id: "c350", name: { en: "Cardboard 350g", fr: "Carton 350 g", ar: "كرتون 350غ" }, spec: "350 g", factor: 1 },
      { id: "kraft", name: { en: "Kraft 300g", fr: "Kraft 300 g", ar: "كرافت 300غ" }, spec: "300 g", factor: 1.1 },
      { id: "rigid", name: { en: "Rigid + silk", fr: "Rigide + soie", ar: "صلب + حرير" }, spec: "1000 g", factor: 1.7 },
    ],
  ),
  p(
    "tshirts",
    { en: "T-shirts & Textile", fr: "T-shirts & Textile", ar: "تيشيرتات ونسيج" },
    {
      en: "Prints that outlive the wash.",
      fr: "Des impressions qui survivent aux lavages.",
      ar: "طباعة تدوم مع كل غسلة.",
    },
    65, 10, 5,
    { en: "shirts", fr: "t-shirts", ar: "تيشيرت" },
    "/images/products/tshirts.jpg",
    [
      { id: "chest", name: { en: "Chest print", fr: "Impression poitrine", ar: "طباعة صدر" }, dim: "28×35 cm", factor: 1 },
      { id: "full", name: { en: "All-over", fr: "Sur-mesure total", ar: "طباعة كاملة" }, dim: "full", factor: 1.6 },
    ],
    [
      { id: "cotton", name: { en: "Cotton 180g", fr: "Coton 180 g", ar: "قطن 180غ" }, spec: "180 g", factor: 1 },
      { id: "premium", name: { en: "Combed cotton 220g", fr: "Coton peigné 220 g", ar: "قطن معبأ 220غ" }, spec: "220 g", factor: 1.25 },
    ],
  ),
  p(
    "roll-ups",
    { en: "Roll-ups & Banners", fr: "Roll-ups & Bannières", ar: "رول أب وبانرات" },
    {
      en: "Your stand, 2 meters of presence.",
      fr: "Votre stand, 2 mètres de présence.",
      ar: "حضورك بطول مترين.",
    },
    480, 1, 1,
    { en: "stands", fr: "stands", ar: "حامل" },
    "/images/products/roll-ups.jpg",
    [
      { id: "std", name: { en: "Standard", fr: "Standard", ar: "قياسي" }, dim: "85×200 cm", factor: 1 },
      { id: "wide", name: { en: "Wide", fr: "Large", ar: "واسع" }, dim: "120×200 cm", factor: 1.5 },
    ],
    [
      { id: "pp440", name: { en: "PP 440g", fr: "PP 440 g", ar: "PP 440غ" }, spec: "440 g", factor: 1 },
      { id: "mesh", name: { en: "Mesh outdoor", fr: "Méshe extérieur", ar: "شبكي خارجي" }, spec: "320 g", factor: 0.9 },
    ],
  ),
  p(
    "menus",
    { en: "Menus & Brochures", fr: "Menus & Brochures", ar: "قوائم ونشرات" },
    {
      en: "For tables that set the mood.",
      fr: "Pour les tables qui font la tête.",
      ar: "للموائد التي تصنع الأجواء.",
    },
    14, 25, 25,
    { en: "menus", fr: "menus", ar: "قائمة" },
    "/images/products/menus.jpg",
    [
      { id: "a5t", name: { en: "A5 tri-fold", fr: "A5 triptyque", ar: "A5 بثلاث طيات" }, dim: "210×297 mm", factor: 1 },
      { id: "a4b", name: { en: "A4 bi-fold", fr: "A4 bichonnier", ar: "A4 بطيتين" }, dim: "210×297 mm", factor: 1.5 },
    ],
    [
      { id: "coated150", name: { en: "Coated 150g", fr: "Cuissé 150 g", ar: "مطلي 150غ" }, spec: "150 g", factor: 1 },
      { id: "uncoated120", name: { en: "Uncoated 120g", fr: "Offset 120 g", ar: "غير مطلي 120غ" }, spec: "120 g", factor: 0.95 },
      { id: "luxe", name: { en: "Linen 250g", fr: "Lin 250 g", ar: "كتان 250غ" }, spec: "250 g", factor: 1.5 },
    ],
  ),
];

/* ---------------------------------- tiers & zones ---------------------------------- */

export interface Tier { min: number; factor: number }

export const TIERS: Tier[] = [
  { min: 1, factor: 1 },
  { min: 50, factor: 0.95 },
  { min: 100, factor: 0.9 },
  { min: 250, factor: 0.78 },
  { min: 500, factor: 0.66 },
  { min: 1000, factor: 0.54 },
  { min: 2500, factor: 0.44 },
  { min: 5000, factor: 0.36 },
];

export interface Zone {
  id: string;
  name: Localized;
  fee: number;
}

export const ZONES: Zone[] = [
  { id: "a", name: { en: "Casablanca · Rabat", fr: "Casablanca · Rabat", ar: "الدار البيضاء · الرباط" }, fee: 25 },
  { id: "b", name: { en: "Other major cities", fr: "Autres grandes villes", ar: "المدن الكبرى الأخرى" }, fee: 40 },
  { id: "c", name: { en: "All Morocco", fr: "Tout le Maroc", ar: "كل أنحاء المغرب" }, fee: 60 },
];

export const VAT_RATE = 0.2;
export const EXPRESS_MULTIPLIER = 1.5;

/* ---------------------------------- engine ---------------------------------- */

export interface PriceInput {
  product: ProductId;
  sizeId: string;
  paperId: string;
  finishId: FinishId;
  qty: number;
  express?: boolean;
  zoneId?: string;
}

export interface PriceBreakdown {
  unit: number;
  subtotal: number;
  vat: number;
  delivery: number;
  total: number;
  tier: Tier;
  expressApplied: boolean;
  days: number;
  product: Product;
  size: SizeOption;
  paper: PaperOption;
  finish: Finish;
  zone: Zone;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function tierFor(qty: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (qty >= t.min) current = t;
  return current;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const product = CATALOG.find((c) => c.id === input.product);
  if (!product) throw new Error(`Unknown product: ${input.product}`);
  const size = product.sizes.find((s) => s.id === input.sizeId) ?? product.sizes[0];
  const paper = product.papers.find((s) => s.id === input.paperId) ?? product.papers[0];
  const finish = FINISHES.find((f) => f.id === input.finishId) ?? FINISHES[0];
  const zone = ZONES.find((z) => z.id === input.zoneId) ?? ZONES[0];
  const tier = tierFor(input.qty);

  const unit = round2(product.base * size.factor * paper.factor * finish.factor * tier.factor);
  const subtotal = round2(unit * input.qty);
  const vat = round2(subtotal * VAT_RATE);
  const delivery = round2(zone.fee * (input.express ? EXPRESS_MULTIPLIER : 1));
  const total = round2(subtotal + vat + delivery);

  return {
    unit, subtotal, vat, delivery, total, tier,
    expressApplied: !!input.express,
    days: input.express ? 1 : 2,
    product, size, paper, finish, zone,
  };
}

export function fromPrice(productId: ProductId): number {
  const product = CATALOG.find((c) => c.id === productId)!;
  return round2(
    product.base * Math.max(product.minQty, product.step) * Math.min(...TIERS.map((t) => t.min <= Math.max(product.minQty, product.step) ? t.factor : 1)),
  );
}

export function formatMAD(n: number, lang: Lang = "en"): string {
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 2,
  });
  return lang === "en" ? `${nf.format(n)} MAD` : `${nf.format(n)} ${lang === "ar" ? "درهم" : "DH"}`;
}

export function etaDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
