import type { Localized } from "./pricing";

export type Access = "free" | "member";
export type DesignCat = "poster" | "card" | "flyer" | "invite" | "banner" | "label";

export interface DesignDef {
  slug: string;
  title: Localized;
  cat: DesignCat;
  access: Access;
  w: number;
  h: number;
  palette: [string, string, string];
  gen: () => string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const SYNE = "'Syne', 'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const INTER = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function svg(w: number, h: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

function halftone(x0: number, y0: number, cols: number, rows: number, gap: number, r0: number, rMax: number, fill: string, fade: number): string {
  let out = "";
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const r = Math.max(0.4, rMax - ((i + j) / (cols + rows)) * rMax * fade);
      out += `<circle cx="${x0 + i * gap}" cy="${y0 + j * gap}" r="${r.toFixed(1)}" fill="${fill}" opacity="0.55"/>`;
    }
  }
  return out;
}

const designs: DesignDef[] = [
  {
    slug: "aurora-poster",
    title: { en: "Aurora Poster", fr: "Affiche Aurora", ar: "أفيش الشفق" },
    cat: "poster",
    access: "free",
    w: 620,
    h: 877,
    palette: ["#7B2FF7", "#00F0FF", "#FF2E93"],
    gen: () =>
      svg(620, 877, `<rect width="620" height="877" fill="#0A0A0F"/>
<defs>
<linearGradient id="ap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B2FF7"/><stop offset="0.5" stop-color="#00F0FF"/><stop offset="1" stop-color="#FF2E93"/></linearGradient>
<radialGradient id="ap2" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="url(#ap)"/><stop offset="1" stop-color="#7B2FF7" stop-opacity="0"/></radialGradient>
</defs>
<circle cx="310" cy="330" r="235" fill="url(#ap2)" opacity="0.85"/>
<circle cx="310" cy="330" r="150" fill="none" stroke="url(#ap)" stroke-width="1.4"/>
<circle cx="310" cy="330" r="95" fill="none" stroke="#00F0FF" stroke-width="0.8" opacity="0.6"/>
${halftone(430, 60, 8, 10, 16, 3.4, 5, "#00F0FF", 1)}
<text x="52" y="640" font-family="${SYNE}" font-weight="800" font-size="104" fill="url(#ap)">AURORA</text>
<text x="54" y="690" font-family="${INTER}" font-size="17" letter-spacing="9" fill="#F7F5F0" opacity="0.85">PRINT THE UNIMAGINABLE</text>
<line x1="52" y1="800" x2="568" y2="800" stroke="#F7F5F0" stroke-opacity="0.2"/>
<text x="52" y="830" font-family="${INTER}" font-size="12" letter-spacing="3" fill="#8A8A99">VELORA PRINT STUDIO</text>
<text x="568" y="830" text-anchor="end" font-family="${INTER}" font-size="12" letter-spacing="3" fill="#8A8A99">620 × 877 MM — A3+</text>
${[...Array(14)].map((_, i) => `<rect x="${480 + i * 8}" y="794" width="${i % 3 === 0 ? 4 : 2}" height="10" fill="#F7F5F0" opacity="0.5"/>`).join("")}`),
  },
  {
    slug: "ink-card",
    title: { en: "Ink Drop Card", fr: "Carte Goutte d'encre", ar: "بطاقة قطرة الحبر" },
    cat: "card",
    access: "free",
    w: 1050,
    h: 600,
    palette: ["#0A0A0F", "#7B2FF7", "#00F0FF"],
    gen: () =>
      svg(1050, 600, `<defs>
<linearGradient id="ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B2FF7"/><stop offset="0.55" stop-color="#00F0FF"/><stop offset="1" stop-color="#FF2E93"/></linearGradient>
</defs>
<rect width="1050" height="600" fill="#F7F5F0"/>
<rect width="1050" height="600" fill="url(#ic)" opacity="0.05"/>
<path d="M770 120 C 890 170 940 300 870 400 C 820 470 700 490 640 430 C 590 380 610 300 660 260 C 620 320 640 380 700 400 C 770 420 830 370 830 300 C 830 230 790 170 770 120 Z" fill="#0A0A0F"/>
<circle cx="762" cy="210" r="14" fill="url(#ic)"/>
<text x="80" y="255" font-family="${SYNE}" font-weight="800" font-size="64" fill="#0A0A0F">SAID ABOUSSOURHRA</text>
<text x="82" y="300" font-family="${INTER}" font-size="20" letter-spacing="6" fill="#5C5C68">PREMIUM PRINT STUDIO — CASABLANCA</text>
<rect x="82" y="340" width="360" height="3" fill="url(#ic)"/>
<text x="82" y="420" font-family="${INTER}" font-size="22" fill="#0A0A0F">+212 6 61 00 00 00</text>
<text x="82" y="458" font-family="${INTER}" font-size="22" fill="#0A0A0F">hello@velora.ma</text>
<text x="82" y="530" font-family="${INTER}" font-size="13" letter-spacing="4" fill="#8A8A99">24H EXPRESS · FSC PAPERS · SOY INKS</text>
${[...Array(6)].map((_, i) => `<circle cx="${940}" cy="${90 + i * 22}" r="4" fill="url(#ic)" opacity="${1 - i * 0.15}"/>`).join("")}`),
  },
  {
    slug: "gold-crest",
    title: { en: "Gold Crest Invite", fr: "Invitation Blason Or", ar: "دعوة الشعار الذهبي" },
    cat: "invite",
    access: "member",
    w: 620,
    h: 877,
    palette: ["#0A0A0F", "#D4AF37", "#F7F5F0"],
    gen: () =>
      svg(620, 877, `<defs>
<linearGradient id="gc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A6D1F"/><stop offset="0.4" stop-color="#D4AF37"/><stop offset="0.6" stop-color="#F5E29A"/><stop offset="1" stop-color="#A8842A"/></linearGradient>
</defs>
<rect width="620" height="877" fill="#0A0A0F"/>
<rect x="28" y="28" width="564" height="821" fill="none" stroke="url(#gc)" stroke-width="2.4"/>
<rect x="44" y="44" width="532" height="789" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.7"/>
<rect x="285" y="150" width="50" height="50" transform="rotate(45 310 175)" fill="none" stroke="url(#gc)" stroke-width="2.6"/>
<rect x="297" y="162" width="26" height="26" transform="rotate(45 310 175)" fill="url(#gc)"/>
<line x1="150" y1="175" x2="255" y2="175" stroke="#D4AF37" stroke-width="1" opacity="0.8"/>
<line x1="365" y1="175" x2="470" y2="175" stroke="#D4AF37" stroke-width="1" opacity="0.8"/>
<text x="310" y="380" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="58" fill="url(#gc)" letter-spacing="4">GOLD CREST</text>
<text x="310" y="430" text-anchor="middle" font-family="${INTER}" font-size="15" letter-spacing="7" fill="#F7F5F0" opacity="0.8">YOU ARE INVITED</text>
<line x1="230" y1="470" x2="390" y2="470" stroke="#D4AF37" stroke-width="0.8" opacity="0.7"/>
<text x="310" y="530" text-anchor="middle" font-family="${INTER}" font-size="19" fill="#F7F5F0" opacity="0.9">SATURDAY — 19:00</text>
<text x="310" y="562" text-anchor="middle" font-family="${INTER}" font-size="14" letter-spacing="3" fill="#8A8A99">GRAND RIAD — CASABLANCA</text>
<circle cx="310" cy="680" r="34" fill="none" stroke="url(#gc)" stroke-width="1.4"/>
<text x="310" y="688" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="24" fill="url(#gc)">V</text>
<text x="310" y="800" text-anchor="middle" font-family="${INTER}" font-size="11" letter-spacing="5" fill="#8A8A99">VELORA · SOFT-TOUCH 350G · GOLD FOIL</text>`),
  },
  {
    slug: "halftone-cover",
    title: { en: "Halftone Cover", fr: "Couverture Halftone", ar: "غلاف نقطي" },
    cat: "poster",
    access: "free",
    w: 620,
    h: 877,
    palette: ["#F7F5F0", "#0A0A0F", "#7B2FF7"],
    gen: () =>
      svg(620, 877, `<rect width="620" height="877" fill="#F7F5F0"/>
${halftone(40, 40, 14, 12, 40, 12, 14, "#0A0A0F", 1)}
<rect x="40" y="470" width="120" height="34" fill="#0A0A0F"/>
<text x="54" y="494" font-family="${INTER}" font-size="14" letter-spacing="4" fill="#F7F5F0">VOL. 07</text>
<text x="40" y="640" font-family="${SYNE}" font-weight="800" font-size="118" fill="#0A0A0F">HALF-</text>
<text x="40" y="756" font-family="${SYNE}" font-weight="800" font-size="118" fill="#0A0A0F">TONE</text>
<rect x="470" y="700" width="110" height="110" fill="#7B2FF7"/>
<text x="478" y="750" font-family="${INTER}" font-size="12" letter-spacing="2" fill="#F7F5F0">A PAPER</text>
<text x="478" y="768" font-family="${INTER}" font-size="12" letter-spacing="2" fill="#F7F5F0">STUDY</text>
<line x1="40" y1="820" x2="580" y2="820" stroke="#0A0A0F" stroke-width="2"/>
<text x="40" y="848" font-family="${INTER}" font-size="12" letter-spacing="3" fill="#5C5C68">VELORA — 4-COLOR OFFSET + FOIL</text>
<text x="580" y="848" text-anchor="end" font-family="${INTER}" font-size="12" letter-spacing="3" fill="#5C5C68">2025</text>`),
  },
  {
    slug: "cyan-wave",
    title: { en: "Cyan Wave Banner", fr: "Bannière Onde Cyan", ar: "بانر الموجة السماوية" },
    cat: "banner",
    access: "member",
    w: 1050,
    h: 600,
    palette: ["#0A0A0F", "#00F0FF", "#FF2E93"],
    gen: () =>
      svg(1050, 600, `<rect width="1050" height="600" fill="#0A0A0F"/>
<path d="M0 420 C 180 340 320 500 520 420 C 720 340 860 500 1050 420 L1050 600 L0 600 Z" fill="#7B2FF7" opacity="0.35"/>
<path d="M0 460 C 200 380 340 540 540 460 C 740 380 880 540 1050 460 L1050 600 L0 600 Z" fill="#00F0FF" opacity="0.5"/>
<path d="M0 505 C 220 430 360 570 560 505 C 760 440 900 570 1050 505 L1050 600 L0 600 Z" fill="#FF2E93" opacity="0.65"/>
<circle cx="860" cy="170" r="90" fill="none" stroke="#00F0FF" stroke-width="1.4" opacity="0.8"/>
<circle cx="860" cy="170" r="58" fill="#00F0FF" opacity="0.25"/>
<text x="70" y="220" font-family="${SYNE}" font-weight="800" font-size="120" fill="#F7F5F0">CYAN</text>
<text x="70" y="330" font-family="${SYNE}" font-weight="800" font-size="120" fill="none" stroke="#00F0FF" stroke-width="2">WAVE</text>
<text x="74" y="390" font-family="${INTER}" font-size="17" letter-spacing="8" fill="#F7F5F0" opacity="0.8">SUMMER FESTIVAL — CASABLANCA 2026</text>
<rect x="74" y="556" width="210" height="2" fill="#00F0FF"/>
<text x="74" y="584" font-family="${INTER}" font-size="13" letter-spacing="3" fill="#8A8A99">VELORA · 120×200 CM · PP 440G</text>`),
  },
  {
    slug: "mono-grid",
    title: { en: "Mono Grid Flyer", fr: "Flyer Grille Mono", ar: "فلاير الشبكة الأحادية" },
    cat: "flyer",
    access: "free",
    w: 620,
    h: 877,
    palette: ["#F7F5F0", "#0A0A0F", "#00F0FF"],
    gen: () => {
      let grid = "";
      for (let i = 1; i < 12; i++) grid += `<line x1="${i * 51.6}" y1="0" x2="${i * 51.6}" y2="877" stroke="#0A0A0F" stroke-width="0.5" opacity="0.12"/>`;
      for (let j = 1; j < 16; j++) grid += `<line x1="0" y1="${j * 54.8}" x2="620" y2="${j * 54.8}" stroke="#0A0A0F" stroke-width="0.5" opacity="0.12"/>`;
      return svg(620, 877, `<rect width="620" height="877" fill="#F7F5F0"/>${grid}
<text x="46" y="360" font-family="${SYNE}" font-weight="800" font-size="290" fill="none" stroke="#0A0A0F" stroke-width="2.4" opacity="0.9">66</text>
<rect x="46" y="430" width="528" height="2" fill="#0A0A0F"/>
<text x="46" y="490" font-family="${SYNE}" font-weight="800" font-size="52" fill="#0A0A0F">MONO GRID</text>
<text x="46" y="530" font-family="${INTER}" font-size="15" letter-spacing="6" fill="#5C5C68">SYSTEMS · RHYTHM · REPETITION</text>
<circle cx="530" cy="120" r="26" fill="#00F0FF"/>
<rect x="46" y="700" width="170" height="90" fill="#0A0A0F"/>
<text x="62" y="738" font-family="${INTER}" font-size="12" letter-spacing="2" fill="#F7F5F0">EXHIBITION</text>
<text x="62" y="762" font-family="${INTER}" font-size="12" letter-spacing="2" fill="#F7F5F0">FEB — APR 2026</text>
<text x="46" y="840" font-family="${INTER}" font-size="11" letter-spacing="4" fill="#8A8A99">A5 · 135G · MATTE · VELORA</text>`);
    },
  },
  {
    slug: "neon-night",
    title: { en: "Neon Night Flyer", fr: "Flyer Nuit Néon", ar: "فلاير الليل النيون" },
    cat: "flyer",
    access: "member",
    w: 620,
    h: 877,
    palette: ["#0A0A0F", "#FF2E93", "#00F0FF"],
    gen: () =>
      svg(620, 877, `<defs>
<filter id="nl" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="620" height="877" fill="#0A0A0F"/>
${[...Array(40)].map((_, i) => `<circle cx="${(i * 137) % 620}" cy="${(i * 211) % 340}" r="${(i % 3) * 0.7 + 0.6}" fill="#F7F5F0" opacity="${0.25 + (i % 5) * 0.12}"/>`).join("")}
<text x="310" y="400" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="120" fill="none" stroke="#FF2E93" stroke-width="2.4" filter="url(#nl)">NEON</text>
<text x="310" y="530" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="120" fill="none" stroke="#00F0FF" stroke-width="2.4" filter="url(#nl)">NIGHT</text>
<line x1="120" y1="600" x2="500" y2="600" stroke="#FF2E93" stroke-width="1.2" opacity="0.8"/>
<text x="310" y="660" text-anchor="middle" font-family="${INTER}" font-size="18" letter-spacing="8" fill="#F7F5F0">OPEN LATE — EVERY FRIDAY</text>
<text x="310" y="700" text-anchor="middle" font-family="${INTER}" font-size="14" letter-spacing="3" fill="#8A8A99">DARB GHALLEF 21 — CASABLANCA</text>
<rect x="240" y="760" width="140" height="44" fill="none" stroke="#00F0FF" stroke-width="1.4"/>
<text x="310" y="788" text-anchor="middle" font-family="${INTER}" font-size="13" letter-spacing="4" fill="#00F0FF">RSVP ONLY</text>`),
  },
  {
    slug: "kraft-label",
    title: { en: "Kraft Label", fr: "Étiquette Kraft", ar: "تبويب الكرافت" },
    cat: "label",
    access: "free",
    w: 1050,
    h: 600,
    palette: ["#C9A876", "#0A0A0F", "#7B2FF7"],
    gen: () =>
      svg(1050, 600, `<rect width="1050" height="600" fill="#C9A876"/>
${[...Array(26)].map((_, i) => `<rect x="0" y="${i * 24}" width="1050" height="1" fill="#8A6D4A" opacity="0.14"/>`).join("")}
<circle cx="270" cy="300" r="150" fill="none" stroke="#0A0A0F" stroke-width="3"/>
<circle cx="270" cy="300" r="128" fill="none" stroke="#0A0A0F" stroke-width="1.4" stroke-dasharray="6 8"/>
<text x="270" y="285" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="44" fill="#0A0A0F">KRAFT</text>
<text x="270" y="330" text-anchor="middle" font-family="${SYNE}" font-weight="800" font-size="44" fill="#0A0A0F">LABEL</text>
<text x="270" y="368" text-anchor="middle" font-family="${INTER}" font-size="12" letter-spacing="4" fill="#3E2F1D">EST. 2019</text>
<text x="620" y="230" font-family="${INTER}" font-size="16" letter-spacing="5" fill="#0A0A0F">SMALL BATCH — HAND FINISHED</text>
<text x="620" y="270" font-family="${INTER}" font-size="16" letter-spacing="5" fill="#3E2F1D">VELORA PRINT STUDIO</text>
<rect x="620" y="300" width="330" height="2" fill="#0A0A0F"/>
<text x="620" y="350" font-family="${INTER}" font-size="14" fill="#0A0A0F">LOT No. 0042</text>
<text x="620" y="382" font-family="${INTER}" font-size="14" fill="#0A0A0F">CASABLANCA — MOROCCO</text>
${[...Array(22)].map((_, i) => `<rect x="${620 + i * 15}" y="420" width="${i % 4 === 0 ? 7 : 3.5}" height="34" fill="#0A0A0F"/>`).join("")}`),
  },
];

export const DESIGNS: DesignDef[] = designs;

export function getDesign(slug: string): DesignDef | undefined {
  return DESIGNS.find((d) => d.slug === slug);
}

export function designSvg(d: DesignDef): string {
  return d.gen();
}

export { esc };
