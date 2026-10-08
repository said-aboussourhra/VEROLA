"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { CATALOG, FINISHES, calculatePrice } from "@/lib/pricing";
import { TESTIMONIALS } from "@/lib/data";
import { Button, Icon, SectionHeading, Reveal, CountUp, Badge } from "./ui";
import { Marquee } from "./motion";
import { VerolaMark } from "./logo";
import { DesignsTeaser, Faq } from "./home";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ============================================================
   HERO
   ============================================================ */

const FLOATER_POS = [
  "top-2 -start-2 w-40 h-40 rotate-[-8deg]",
  "top-24 -end-4 w-44 h-44 rotate-[7deg]",
  "bottom-4 start-6 w-48 h-36 rotate-[4deg]",
  "bottom-24 end-2 w-36 h-36 rotate-[-6deg]",
];

const HERO_FALLBACK = [
  "/images/products/posters.jpg",
  "/images/products/stickers.jpg",
  "/images/products/packaging.jpg",
  "/images/products/roll-ups.jpg",
];

interface HeroMedia {
  id: number;
  title: string;
  description: string | null;
  url: string;
  featured: boolean;
  position: number;
}

export function Hero() {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const [media, setMedia] = useState<HeroMedia[]>([]);

  /* Hero imagery is admin-managed (CMS). Falls back to the built-in
     VEROLA artwork until the CMS holds items. */
  useEffect(() => {
    let alive = true;
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.items) return;
        const hero = (d.items as HeroMedia[])
          .filter((m) => m.title && m.url)
          .sort((a, b) => a.position - b.position);
        if (hero.length) setMedia(hero);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const slides = media.length ? media.map((m) => m.url) : HERO_FALLBACK;
  const lead = media[0];
  const floaters = slides
    .slice(1, 5)
    .map((img, i) => ({ img, cls: FLOATER_POS[i], d: i * 0.12 }));

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* gradient mesh backdrop */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-[-18%] inset-x-0 h-[78%] opacity-70 blur-[70px]"
          style={{
            background:
              "radial-gradient(38% 60% at 18% 40%, rgba(34,193,240,0.32), transparent 70%), radial-gradient(34% 55% at 78% 22%, rgba(255,46,147,0.20), transparent 72%), radial-gradient(30% 50% at 56% 78%, rgba(255,196,0,0.22), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(16,24,40,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(75% 60% at 50% 30%, black, transparent 78%)",
            WebkitMaskImage: "radial-gradient(75% 60% at 50% 30%, black, transparent 78%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-8 items-center">
          {/* ---- copy ---- */}
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-flex items-center gap-2.5 rounded-full bg-white/80 border border-brand/15 ps-2 pe-4 py-2 text-[0.82rem] font-semibold text-brand-deep shadow-[0_14px_34px_-20px_rgba(11,99,214,0.7)]">
                <span className="w-6 h-6 rounded-full aurora-bg flex items-center justify-center">
                  <Icon name="sparkle" className="w-3.5 h-3.5 text-white" />
                </span>
                {t.hero.kicker}
              </span>
            </motion.div>

            <h1 className="mt-7 font-display font-extrabold leading-[0.94] tracking-[-0.035em] text-navy">
              {t.hero.h1.split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block me-[0.22em] overflow-hidden pb-[0.06em]"
                  initial={reduced ? false : { opacity: 0, y: "0.55em", rotate: 2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.085, ease: EASE }}
                >
                  <span
                    className={
                      lang === "ar"
                        ? "text-[clamp(2.6rem,8vw,5.25rem)]"
                        : "text-[clamp(2.85rem,7.6vw,6.25rem)] uppercase"
                    }
                  >
                    {w}
                  </span>
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.42, ease: EASE }}
            >
              <div className="mt-6 flex items-start gap-4">
                <span className="mt-2 w-11 h-[3px] rounded-full aurora-bg shrink-0" />
                <p className="max-w-xl text-[1.0625rem] md:text-lead text-[#4a5a70] leading-[1.75]">
                  {t.hero.sub}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button href="/order" size="lg" magnetic>
                {t.hero.ctaPrimary}
                <Icon name="arrow" className="w-5 h-5 rtl-flip" />
              </Button>
              <Button href="/designs" variant="ghost" size="lg" className="!border-brand/25 hover:!border-brand">
                <Icon name="sparkle" className="w-5 h-5" />
                {t.designs.kicker}
              </Button>
            </motion.div>

            <motion.ul
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85 }}
              className="mt-11 flex flex-wrap gap-x-7 gap-y-3"
            >
              {t.trust.slice(0, 4).map((x, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[0.86rem] font-semibold text-ink-subtle">
                  <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                    <Icon name="check" className="w-3 h-3 text-brand" />
                  </span>
                  {x}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ---- product stage ---- */}
          <div className="relative h-[440px] sm:h-[520px]">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <VerolaMark className="w-[74%] opacity-[0.10]" />
            </motion.div>

            {/* main plate */}
            <motion.div
              className="absolute inset-x-[8%] top-[8%] bottom-[16%] rounded-[34px] overflow-hidden shadow-[0_60px_110px_-40px_rgba(11,60,140,0.55)]"
              initial={reduced ? false : { opacity: 0, y: 46, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.35, ease: EASE }}
            >
              <img
                src={slides[0]}
                alt={lead?.title ?? ""}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08204a]/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 start-6 end-6">
                <p className="text-white/85 text-xs tracking-[0.24em] uppercase">
                  {lead?.description ? lead.description.slice(0, 46) : "1200 dpi · Fine-art"}
                </p>
                <p className="mt-1.5 font-display font-extrabold text-white text-2xl leading-tight">
                  {lead?.title ?? t.products.title.slice(0, 22)}
                </p>
              </div>
            </motion.div>

            {/* floating chips */}
            <motion.div
              className="absolute top-[2%] end-0 w-32 h-32 rounded-inset overflow-hidden border-4 border-white shadow-[0_30px_60px_-26px_rgba(11,60,140,0.6)]"
              initial={reduced ? false : { opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.85, delay: 0.75, ease: EASE }}
            >
              <motion.img
                src={slides[1] ?? "/images/products/stickers.jpg"}
                alt=""
                className="w-full h-full object-cover"
                animate={reduced ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="absolute bottom-[24%] -start-2 w-36 h-28 rounded-inset overflow-hidden border-4 border-white shadow-[0_30px_60px_-26px_rgba(11,60,140,0.6)]"
              initial={reduced ? false : { opacity: 0, x: -30, y: 24 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.85, delay: 0.95, ease: EASE }}
            >
              <motion.img
                src={slides[2] ?? "/images/products/packaging.jpg"}
                alt=""
                className="w-full h-full object-cover"
                animate={reduced ? {} : { y: [0, 11, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* price / speed chip */}
            <motion.div
              className="absolute bottom-[2%] end-[4%] rounded-inset bg-white px-5 py-4 shadow-[0_36px_70px_-26px_rgba(11,60,140,0.62)] border border-brand/10"
              initial={reduced ? false : { opacity: 0, scale: 0.86, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 1.15, ease: EASE }}
            >
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl aurora-bg flex items-center justify-center text-white">
                  <Icon name="zap" className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-micro uppercase tracking-[0.22em] text-ink-faint">Express</p>
                  <p className="font-display font-extrabold text-navy leading-tight">24h</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   KINETIC MARQUEE BAND
   ============================================================ */

export function Band() {
  const words = [
    ["STICKERS", "#0b63d6"],
    ["DTF", "#22c1f0"],
    ["BOXES", "#ff2e93"],
    ["POSTERS", "#d98b00"],
    ["ROLL-UPS", "#0b63d6"],
    ["CARDS", "#22c1f0"],
    ["MENUS", "#ff2e93"],
    ["LABELS", "#d98b00"],
  ];
  return (
    <div className="relative py-7 overflow-hidden border-y border-brand/12 bg-white">
      <Marquee duration={34}>
        {words.map(([w, c], i) => (
          <span key={i} className="flex items-center gap-6 px-6">
            <span
              className="font-display font-extrabold text-[clamp(1.75rem,4vw,3.25rem)] tracking-[-0.02em] uppercase"
              style={{ color: c }}
            >
              {w}
            </span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

/* ============================================================
   BENTO SHOWCASE
   ============================================================ */

export function Showcase() {
  const { t, L } = useI18n();
  const p = (id: string) => {
    const c = CATALOG.find((x) => x.id === id)!;
    const bp = calculatePrice({
      product: c.id,
      sizeId: c.sizes[0].id,
      paperId: c.papers[0].id,
      finishId: "matte",
      qty: c.minQty,
    });
    return { c, price: bp.subtotal };
  };

  const tiles = [
    { id: "posters", span: "lg:col-span-7 lg:row-span-2", h: "h-[280px] lg:h-full" },
    { id: "stickers", span: "lg:col-span-5", h: "h-[280px] lg:h-[300px]" },
    { id: "tshirts", span: "lg:col-span-5", h: "h-[280px] lg:h-[300px]" },
    { id: "packaging", span: "lg:col-span-4", h: "h-[240px]" },
    { id: "roll-ups", span: "lg:col-span-4", h: "h-[240px]" },
    { id: "business-cards", span: "lg:col-span-4", h: "h-[240px]" },
  ];

  return (
    <section id="products" className="relative py-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <Reveal>
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-[3px] rounded-full aurora-bg" />
                <span className="text-brand text-xs font-bold tracking-[0.28em] uppercase">
                  {t.products.kicker}
                </span>
              </div>
              <h2 className="font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-navy text-[clamp(2.15rem,5vw,4.15rem)] uppercase">
                {t.products.title}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/order" variant="glass" magnetic>
              {t.products.order}
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </Button>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 md:gap-5 lg:grid-rows-[repeat(2,minmax(0,1fr))_auto]">
          {tiles.map((tile, i) => {
            const { c, price } = p(tile.id);
            return (
              <Reveal key={tile.id} delay={(i % 3) * 0.07} className={`${tile.span} min-w-0`}>
                <a
                  href={`/order?product=${c.id}`}
                  className={`group relative block rounded-tile overflow-hidden bg-navy ${tile.h} min-h-[240px] shadow-[0_28px_70px_-38px_rgba(11,60,140,0.75)] hover:shadow-[0_44px_90px_-32px_rgba(11,99,214,0.8)] transition-all duration-600 hover:-translate-y-1.5`}
                >
                  <div className="absolute inset-0">
                    <img
                      src={c.image}
                      alt={L(c.name)}
                      loading={i < 3 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.12]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08204a]/92 via-[#08204a]/22 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="!bg-white/15 !text-white !border-white/25 backdrop-blur-sm">
                        {c.sizes[0].dim}
                      </Badge>
                      {i === 0 && <Badge gold>{t.designs.featured}</Badge>}
                    </div>
                    <h3 className="font-display font-extrabold text-white text-xl md:text-2xl leading-tight">
                      {L(c.name)}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-white/70 text-sm">
                        {t.products.from}{" "}
                        <strong className="text-white font-display tabular-nums">
                          {price.toLocaleString()} {t.common.mad}
                        </strong>
                      </p>
                      <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white transition-all duration-500 group-hover:bg-white group-hover:text-brand">
                        <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DARK FINISH BAND
   ============================================================ */

export function FinishBand() {
  const { t, L } = useI18n();
  return (
    <section className="relative overflow-hidden py-[clamp(64px,8vw,120px)]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 120% at 12% 0%, #14305e 0%, #0b1b33 52%, #070f20 100%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 halftone opacity-[0.22]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-[3px] rounded-full aurora-bg" />
            <span className="text-[#57d3ff] text-xs font-bold tracking-[0.28em] uppercase">
              {t.finishes.kicker}
            </span>
          </div>
          <h2 className="font-display font-extrabold leading-[1.03] tracking-[-0.03em] text-white text-[clamp(2.15rem,5vw,4.15rem)] uppercase">
            {t.finishes.title}
          </h2>
          <p className="mt-5 text-white/65 leading-relaxed max-w-xl">{t.finishes.sub}</p>
        </div>

        <div className="mt-11 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FINISHES.slice(0, 8).map((f, i) => (
            <Reveal key={f.id} delay={(i % 4) * 0.07}>
              <div className="group rounded-inset overflow-hidden border border-white/10 bg-white/[0.04] hover:border-white/30 transition-colors duration-500">
                <div className={`h-28 md:h-32 relative shine-sweep ${f.mat}`}>
                  <div className="absolute inset-0 halftone opacity-25" />
                  {f.premium && (
                    <span className="absolute top-3 end-3">
                      <Badge gold>Premium</Badge>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-white text-sm md:text-base">{L(f.name)}</h3>
                  {f.factor > 1 && (
                    <p className="mt-1 text-[#57d3ff] text-xs font-semibold tabular-nums">
                      +{Math.round((f.factor - 1) * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SERVICES — big numbered rows
   ============================================================ */

const SERVICE_ROWS = [
  { icon: "sparkle", n: "01", href: "/designs" },
  { icon: "upload", n: "02", href: "/order" },
  { icon: "printer", n: "03", href: "/order" },
  { icon: "truck", n: "04", href: "/track" },
];

export function Services() {
  const { t } = useI18n();
  const rows = [
    { title: t.designs.kicker, body: t.designs.sub },
    { title: t.order.artwork.dropTitle, body: t.order.artwork.dropSub },
    { title: "DTF · Offset · Foil", body: t.finishes.sub },
    { title: t.track.title, body: t.hero.sub },
  ];
  return (
    <section className="py-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-[3px] rounded-full aurora-bg" />
            <span className="text-brand text-xs font-bold tracking-[0.28em] uppercase">
              {t.b2b.kicker}
            </span>
          </div>
          <h2 className="font-display font-extrabold leading-[1.03] tracking-[-0.03em] text-navy text-[clamp(2.15rem,5vw,4.15rem)] uppercase max-w-3xl">
            {t.b2b.title}
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-brand/12 border-y border-brand/12">
          {rows.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <a
                href={SERVICE_ROWS[i].href}
                className="group flex items-center gap-6 py-7 md:py-9 hover:ps-3 transition-all duration-500"
              >
                <span className="font-display font-extrabold text-brand/25 text-3xl md:text-5xl tabular-nums shrink-0">
                  {SERVICE_ROWS[i].n}
                </span>
                <span
                  className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_16px_32px_-16px_rgba(11,60,140,0.9)]"
                  style={{
                    background: ["#0b63d6", "#22c1f0", "#ff2e93", "#d98b00"][i],
                  }}
                >
                  <Icon name={SERVICE_ROWS[i].icon} className="w-5 h-5 md:w-6 md:h-6" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-extrabold text-navy text-xl md:text-3xl leading-tight tracking-[-0.02em]">
                    {r.title}
                  </span>
                  <span className="block text-ink-muted mt-1.5 text-sm md:text-base leading-relaxed line-clamp-2">
                    {r.body}
                  </span>
                </span>
                <span className="shrink-0 w-11 h-11 rounded-full border border-brand/25 flex items-center justify-center text-brand transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:border-brand">
                  <Icon name="arrow" className="w-5 h-5 rtl-flip" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STEPS
   ============================================================ */

export function Steps() {
  const { t } = useI18n();
  return (
    <section className="relative py-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.how.kicker} title={t.how.title} align="center" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {t.how.steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="relative rounded-tile bg-white border border-brand/12 p-8 h-full shadow-[0_26px_60px_-40px_rgba(16,42,90,0.6)]">
                <span
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white font-display font-extrabold text-lg shadow-[0_16px_30px_-14px_rgba(11,60,140,0.8)]"
                  style={{ background: ["#0b63d6", "#22c1f0", "#ff2e93"][i] }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display font-extrabold text-xl text-navy tracking-[-0.02em]">
                  {s.t}
                </h3>
                <p className="mt-3 text-ink-muted leading-[1.75] text-body-sm">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
   ============================================================ */

export function Stats() {
  const { t } = useI18n();
  const items = [
    { v: 5480, s: "+", l: t.numbers.orders },
    { v: 48, s: "", l: t.numbers.papers },
    { v: 31, s: "h", l: t.numbers.hours },
    { v: 12, s: "", l: t.numbers.cities },
  ];
  return (
    <section className="pb-[clamp(56px,7vw,100px)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative rounded-panel aurora-bg p-10 md:p-14 overflow-hidden shadow-[0_50px_110px_-50px_rgba(11,99,214,0.95)]">
          <div className="absolute inset-0 halftone opacity-25" aria-hidden />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((n, i) => (
              <Reveal key={i} delay={i * 0.08} className="text-center">
                <div className="font-display font-extrabold text-[clamp(2.4rem,5vw,3.6rem)] text-white leading-none drop-shadow-[0_4px_18px_rgba(6,32,80,0.4)]">
                  <CountUp to={n.v} suffix={n.s} />
                </div>
                <p className="mt-2.5 text-sm text-white/85">{n.l}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */

function QuoteCard({ q, name, role, city }: { q: string; name: string; role: string; city: string }) {
  return (
    <figure className="w-[330px] md:w-[410px] shrink-0 rounded-tile bg-white border border-brand/12 p-7 me-4 shadow-[0_26px_60px_-42px_rgba(16,42,90,0.7)]">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Icon key={i} name="sparkle" className="w-3.5 h-3.5 text-warning" fill />
        ))}
      </div>
      <blockquote className="text-ink-subtle leading-[1.8] text-[0.98rem]">“{q}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full aurora-bg text-white flex items-center justify-center font-display font-bold">
          {name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold text-navy">{name}</span>
          <span className="block text-xs text-ink-faint">
            {role} — {city}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const { t, L } = useI18n();
  const a = TESTIMONIALS.slice(0, 4).map((x) => (
    <QuoteCard key={x.name} q={L(x.q)} name={x.name} role={L(x.role)} city={x.city} />
  ));
  const b = TESTIMONIALS.slice(4).map((x) => (
    <QuoteCard key={x.name} q={L(x.q)} name={x.name} role={L(x.role)} city={x.city} />
  ));
  return (
    <section className="py-[clamp(56px,7vw,110px)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 mb-10">
        <Reveal>
          <SectionHeading kicker={t.testimonials.kicker} title={t.testimonials.title} align="center" />
        </Reveal>
      </div>
      <Marquee duration={52} className="[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {a}
      </Marquee>
      <Marquee reverse duration={60} className="mt-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {b}
      </Marquee>
    </section>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */

export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="pb-[clamp(72px,10vw,130px)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative rounded-[36px] overflow-hidden px-8 py-16 md:p-20 text-center shadow-[0_60px_120px_-55px_rgba(11,99,214,0.9)]"
          style={{
            background:
              "radial-gradient(90% 130% at 18% 0%, #22c1f0 0%, #0b63d6 42%, #7b2ff7 78%, #ff2e93 100%)",
          }}
        >
          <div className="absolute inset-0 halftone opacity-25" aria-hidden />
          <VerolaMark className="w-16 h-16 mx-auto opacity-95" />
          <h2 className="mt-7 font-display font-extrabold uppercase text-white leading-[1.02] tracking-[-0.03em] text-[clamp(2.15rem,6vw,4.75rem)]">
            {t.finalCta.line1}
            <br />
            <span className="text-white/90">{t.finalCta.line2}</span>
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/order" size="lg" magnetic className="!bg-white !text-[#0b3f9c] hover:!brightness-100">
              {t.finalCta.cta}
              <Icon name="arrow" className="w-5 h-5 rtl-flip" />
            </Button>
            <Button href="/designs" size="lg" variant="glass" className="!bg-white/15 !text-white !border-white/35">
              {t.designs.kicker}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FULL LANDING
   ============================================================ */

export function Landing() {
  return (
    <>
      <Hero />
      <Band />
      <Showcase />
      <FinishBand />
      <DesignsTeaser />
      <Services />
      <Steps />
      <Stats />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
