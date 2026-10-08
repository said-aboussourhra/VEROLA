import type { Localized } from "./pricing";

export interface Testimonial {
  q: Localized;
  name: string;
  role: Localized;
  city: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    q: {
      en: "Sent the file at 9am, had 2,000 cards in my hands by 8pm the next day. The soft-touch finish got compliments before I even spoke.",
      fr: "Fichier envoyé à 9 h, 2 000 cartes en main à 20 h le lendemain. La finition velours a été complimentée avant même que je ne parle.",
      ar: "أرسلت الملف صباحاً، واستلمت 2,000 بطاقة قبل الثامنة مساءً. التشطيب المخملي نال الإعجاب قبل أن أنطق بكلمة.",
    },
    name: "Yassine B.",
    role: { en: "Founder, fintech startup", fr: "Fondateur, startup fintech", ar: "مؤسس شركة ناشئة" },
    city: "Casablanca",
  },
  {
    q: {
      en: "Their preflight caught a bleed error my printer never caught in three years. That's the difference of a studio.",
      fr: "Leur preflight a attrapé une erreur de fond perdu que mon imprimeur n'avait jamais vue en trois ans. C'est ça, un studio.",
      ar: "فحصهم التقط خطأ هامش لم يلحظه مصمم سابق منذ ثلاث سنوات. هذه هي قيمة الاستوديو.",
    },
    name: "Salma R.",
    role: { en: "Brand designer", fr: "Directrice de design", ar: "مصممة هويات" },
    city: "Rabat",
  },
  {
    q: {
      en: "500 menus, linen paper, gold foil on the crest. Our regulars now ask who made the menus. Not the food.",
      fr: "500 menus, papier lin, foil or sur le blason. Nos habitués demandent maintenant qui a fait les menus. Pas la cuisine.",
      ar: "500 قائمة بكتابي وذهبي. زبناؤنا الدائمون صاروا يسألون عن صانع القائمة، لا عن الطعام.",
    },
    name: "Omar T.",
    role: { en: "Restaurant owner", fr: "Propriétaire de restaurant", ar: "صاحب مطعم" },
    city: "Marrakech",
  },
  {
    q: {
      en: "We run their API for all our client jobs now. Webhooks included. It's like having a print floor in the building.",
      fr: "Tous nos jobs clients passent par leur API. Webhooks inclus. On a l'impression d'avoir une presse dans le bâtiment.",
      ar: "كل أعمال عملائنا تمر عبر واجهتهم. كأننا نملك خط طباعة داخل المبنى.",
    },
    name: "Nadia F.",
    role: { en: "Creative director, agency", fr: "Directrice créative, agence", ar: "مديرة إبداعية، وكالة" },
    city: "Casablanca",
  },
  {
    q: {
      en: "The holographic stickers on our water bottles sell out before they land. Vélora's foil line is a cheat code.",
      fr: "Nos stickers holographiques se vendent avant même d'arriver au magasin. Le foil de Vélora, c'est une triche autorisée.",
      ar: "ملصقاتنا الهولوغرافية تنفد قبل وصولها للمتجر. خط الفويل عندهم سلاح سري.",
    },
    name: "Mehdi A.",
    role: { en: "E-commerce seller", fr: "E-commerçant", ar: "تاجر إلكتروني" },
    city: "Tangier",
  },
  {
    q: {
      en: "Poster run for a gallery opening — 1200 dpi on fine-art canvas. People kept touching the wall instead of the art.",
      fr: "Tirage d'affiches pour une vernissage — 1200 dpi sur toile. Les gens touchaient le mur au lieu des toiles.",
      ar: "طباعة أفيش لفتحة معرض — 1200 نقطة على قماش. الزوار لمسوا الجدار بدل اللوحات.",
    },
    name: "Lina K.",
    role: { en: "Event producer", fr: "Productrice d'événements", ar: "منتجة فعاليات" },
    city: "Rabat",
  },
  {
    q: {
      en: "Portfolio books for my thesis, embossed spine, delivered in 24h before the jury. They even fixed my kerning.",
      fr: "Livres de portfolio pour mon mémoire, dos embossé, livrés en 24 h avant le jury. Ils ont même corrigé ma typographie.",
      ar: "دفاتر تخرجي بنقش بارز على الظهر، وصلني قبل لجنة الامتحان بـ24 ساعة. صححوا حتى حروفية ملفي.",
    },
    name: "Karim Z.",
    role: { en: "Architecture student", fr: "Étudiant en architecture", ar: "طالب معمارية" },
    city: "Agadir",
  },
  {
    q: {
      en: "Packaging that made a €40 product feel like a gift. Repackaging our entire line in September.",
      fr: "Un packaging qui donne l'air d'un cadeau à un produit à 40 €. Toute la gamme sera réemballée en septembre.",
      ar: "تغليف جعل منتوجاً بـ40 أورو يبدو هدية. سنعيد تغليف الخط كاملاً في شتنبر.",
    },
    name: "Sofia M.",
    role: { en: "Fashion founder", fr: "Fondatrice de marque", ar: "مؤسسة علامة أزياء" },
    city: "Agadir",
  },
];

export interface PortfolioItem {
  id: string;
  img: string;
  ratio: string; // tailwind aspect class
  cat: "brand" | "editorial" | "retail" | "event";
  title: Localized;
  client: string;
  year: string;
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "atlas",
    img: "/images/products/business-cards.jpg",
    ratio: "aspect-[4/5]",
    cat: "brand",
    title: { en: "Atlas & Co — soft-touch cards, holo edge", fr: "Atlas & Co — cartes velours, tranche holo", ar: "Atlas & Co — بطاقات مخملية بحافة هولوغرافية" },
    client: "Atlas & Co",
    year: "2025",
  },
  {
    id: "macro",
    img: "/images/portfolio/ink-macro.jpg",
    ratio: "aspect-square",
    cat: "editorial",
    title: { en: "Ink Study 07 — CMYK macro", fr: "Étude d'encre 07 — macro CMJN", ar: "دراسة حبر 07 — التقاط مقرب" },
    client: "VÉLORA Lab",
    year: "2025",
  },
  {
    id: "noor",
    img: "/images/products/posters.jpg",
    ratio: "aspect-[3/4]",
    cat: "event",
    title: { en: "Noor Festival — poster run, 1200 sheets", fr: "Festival Noor — tirage d'affiches, 1 200 feuilles", ar: "مهرجان نور — 1,200 أفيش" },
    client: "Noor Festival",
    year: "2024",
  },
  {
    id: "flatlay",
    img: "/images/portfolio/flatlay.jpg",
    ratio: "aspect-[4/3]",
    cat: "brand",
    title: { en: "Riad Sable — full identity, gold foil", fr: "Riad Sable — identité complète, foil or", ar: "Riad Sable — هوية كاملة بفويل ذهبي" },
    client: "Riad Sable",
    year: "2025",
  },
  {
    id: "kasa",
    img: "/images/products/packaging.jpg",
    ratio: "aspect-[4/5]",
    cat: "retail",
    title: { en: "Kasablancana — boxes with die-cut window", fr: "Kasablancana — boîtes à fenêtre guillochée", ar: "Kasablancana — علب بفتحة قصّ" },
    client: "Kasablancana",
    year: "2025",
  },
  {
    id: "hikma",
    img: "/images/products/menus.jpg",
    ratio: "aspect-[3/4]",
    cat: "editorial",
    title: { en: "Hikma — linen menus, embossed crest", fr: "Hikma — menus lin, blason embossé", ar: "Hikma — قوائم بكتابي ونقش بارز" },
    client: "Hikma",
    year: "2024",
  },
  {
    id: "vape",
    img: "/images/products/stickers.jpg",
    ratio: "aspect-square",
    cat: "retail",
    title: { en: "Vapor — holographic sticker sheets", fr: "Vapor — feuilles de stickers holo", ar: "Vapor — أوراق ملصقات هولوغرافية" },
    client: "Vapor",
    year: "2025",
  },
  {
    id: "riad",
    img: "/images/products/tshirts.jpg",
    ratio: "aspect-[4/5]",
    cat: "brand",
    title: { en: "Riad Wear — all-over textile prints", fr: "Riad Wear — impressions textile intégrales", ar: "Riad Wear — طباعة نسيج كاملة" },
    client: "Riad Wear",
    year: "2024",
  },
  {
    id: "silk",
    img: "/images/products/flyers.jpg",
    ratio: "aspect-[4/3]",
    cat: "editorial",
    title: { en: "Silk Week — 25k A5, three finishes", fr: "Semaine de la Soie — 25 000 A5, trois finitions", ar: "أسبوع الحرير — 25,000 A5 بثلاث تشطيبات" },
    client: "Maison Soie",
    year: "2025",
  },
  {
    id: "expo",
    img: "/images/products/roll-ups.jpg",
    ratio: "aspect-[3/4]",
    cat: "event",
    title: { en: "Marrakech Expo — 40 stands dressed in one day", fr: "Marrakech Expo — 40 stands habillés en une journée", ar: "معرض مراكش — تجهيز 40 ركناً في يوم" },
    client: "Marrakech Expo",
    year: "2024",
  },
];

export const NUMBERS = [
  { value: 5480, suffix: "+", key: "orders" as const },
  { value: 48, suffix: "", key: "papers" as const },
  { value: 31, suffix: "h", key: "hours" as const },
  { value: 12, suffix: "", key: "cities" as const },
];

export const WHATSAPP_URL =
  "https://wa.me/212661000000?text=" +
  encodeURIComponent("Hello VÉLORA — I want to talk about a print job.");
