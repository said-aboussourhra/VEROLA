"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { CATALOG, FINISHES, calculatePrice, type Product } from "@/lib/pricing";
import { PORTFOLIO, TESTIMONIALS, NUMBERS, WHATSAPP_URL } from "@/lib/data";
import { POSTS } from "@/lib/blog";
import { Button, Icon, Badge, SectionHeading, Reveal, PriceCounter, CountUp, Accordion, inputCls } from "./ui";
import { AuroraBlob, Marquee, TiltCard, KineticHeading, PressLoader } from "./motion";

/* ================= HERO ================= */

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-10" id="top">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--ink-glow)" }} />
        <AuroraBlob intensity={0.9} />
        <div className="absolute top-24 -start-24 w-96 h-96 halftone opacity-30 [mask-image:radial-gradient(circle,black_30%,transparent_70%)]" />
        <div className="absolute bottom-10 -end-24 w-96 h-96 halftone opacity-20 [mask-image:radial-gradient(circle,black_30%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-paper/80">
            <Icon name="droplet" className="w-4 h-4 text-cyan" />
            {t.hero.kicker}
          </span>
        </motion.div>

        <h1
          className="font-display uppercase leading-[1.02] text-paper text-[clamp(3rem,9vw,9rem)] tracking-[-0.02em] max-w-[12ch]"
          aria-hidden
        >
          <span className="aurora-text">
            <KineticHeading text={t.hero.h1} delay={0.25} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg md:text-xl text-muted leading-relaxed"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button href="/order" size="lg" magnetic>
            {t.hero.ctaPrimary}
            <Icon name="arrow" className="w-5 h-5 rtl-flip" />
          </Button>
          <Button href="/portfolio" variant="ghost" size="lg">
            {t.hero.ctaSecondary}
          </Button>
        </motion.div>

        {/* trust strip */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {t.trust.map((item, i) => (
            <li key={i} className="glass rounded-2xl px-4 py-3 text-sm text-paper/75 flex items-center gap-2.5">
              <Icon name={["truck", "sparkle", "leaf", "cash", "sparkle"][i]} className="w-4 h-4 shrink-0 text-cyan" />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="absolute bottom-6 inset-x-0 flex justify-center" aria-hidden>
        <div className="flex flex-col items-center gap-2 text-muted text-[0.8125rem] tracking-[0.25em] uppercase">
          {t.hero.scroll}
          <div className="w-px h-8 bg-gradient-to-b from-cyan to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}

/* ================= PRODUCTS ================= */

export function ProductsGrid() {
  const { t, L, lang } = useI18n();
  return (
    <section id="products" className="relative py-[clamp(96px,12vw,180px)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.products.kicker} title={t.products.title} />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATALOG.map((c, i) => {
            const bp = calculatePrice({
              product: c.id,
              sizeId: c.sizes[0].id,
              paperId: c.papers[0].id,
              finishId: "matte",
              qty: c.minQty,
            });
            return (
              <Reveal key={c.id} delay={(i % 4) * 0.08}>
                <a href={`/order?product=${c.id}`} className="block group">
                  <TiltCard className="rounded-3xl">
                    <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-ink-2 group-hover:border-cyan/30 transition-colors duration-500">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={c.image}
                          alt={L(c.name)}
                          loading={i < 4 ? "eager" : "lazy"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-70" />
                      <div className="absolute bottom-0 inset-x-0 p-5">
                        <h3 className="font-display font-bold text-xl misreg group-hover:[text-shadow:2px_0_rgba(255,46,147,0.6),-2px_0_rgba(0,240,255,0.6)] transition-[text-shadow]">
                          {L(c.name)}
                        </h3>
                        <p className="mt-1 text-sm text-muted line-clamp-1">{L(c.tagline)}</p>
                      </div>
                    </div>
                  </TiltCard>
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-sm text-muted">
                      {t.products.from}{" "}
                      <strong className="text-paper font-semibold">
                        {bp.subtotal.toLocaleString()} {t.common.mad}
                      </strong>
                    </span>
                    <span className="text-sm text-cyan opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      {t.products.order}
                      <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                    </span>
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

/* ================= FINISHES ================= */

export function FinishesScroller() {
  const { t, L } = useI18n();
  return (
    <section className="relative py-[clamp(96px,12vw,180px)] bg-ink-2/40 border-y border-white/8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.finishes.kicker} title={t.finishes.title} sub={t.finishes.sub} />
        </Reveal>
      </div>
      <div className="relative">
        <div className="flex gap-5 overflow-x-auto px-[max(1rem,calc((100vw-80rem)/2))] pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FINISHES.map((f, i) => (
            <article
              key={f.id}
              className="snap-start shrink-0 w-72 rounded-3xl border border-white/8 bg-ink-2 overflow-hidden group"
            >
              <div className={`h-44 relative shine-sweep ${f.mat}`} aria-hidden>
                <div className="absolute inset-0 halftone opacity-20" />
                {f.premium && (
                  <span className="absolute top-4 end-4">
                    <Badge gold>
                      <Icon name="sparkle" className="w-3 h-3" />
                      Premium
                    </Badge>
                  </span>
                )}
                <span className="absolute bottom-4 start-4 font-display font-extrabold text-5xl text-white/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-lg">{L(f.name)}</h3>
                  {f.factor > 1 && (
                    <span className="text-xs text-cyan font-semibold tabular-nums">
                      +{Math.round((f.factor - 1) * 100)}%
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{L(f.desc)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS (pinned scroll story) ================= */

export function HowItWorks() {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.3"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(2, Math.floor(v * 3)));
  });

  const icons = ["file", "layers", "printer"];

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0" style={{ background: "var(--ink-glow)" }} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] rounded-full aurora-bg opacity-[0.05] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px aurora-bg" />
              <span className="text-cyan text-sm font-semibold tracking-[0.2em] uppercase">{t.how.kicker}</span>
            </div>
            <h2 className={`font-display uppercase text-paper ${lang === "ar" ? "text-3xl md:text-5xl" : "text-[clamp(2rem,5vw,4.5rem)]"} leading-[1.05]`}>
              {t.how.title}
            </h2>

            <div className="mt-10 space-y-0 max-w-md">
              {t.how.steps.map((s, i) => (
                <div
                  key={i}
                  className={`relative flex items-center gap-4 pb-10 last:pb-0 transition-opacity duration-500 ${
                    active === i ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <span
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-500 shrink-0 ${
                      active === i
                        ? "aurora-bg text-ink border-transparent scale-110"
                        : "border-white/15 text-muted"
                    }`}
                  >
                    <Icon name={icons[i]} className="w-5 h-5" />
                  </span>
                  <span
                    className={`absolute top-12 bottom-0 start-6 w-px transition-opacity duration-500 ${
                      i === 2 ? "hidden" : "aurora-bg"
                    } ${active > i ? "opacity-60" : "opacity-15"}`}
                  />
                  <span className="font-semibold text-paper/90 text-lg">
                    {String(i + 1).padStart(2, "0")} — {s.t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[52vh] min-h-[320px]">
            {t.how.steps.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: reduced
                    ? "none"
                    : `translateX(${(active - i) * 60}px)`,
                  transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: "none",
                }}
                aria-hidden={active !== i}
              >
                <div className="glass rounded-[24px] p-10 max-w-md relative overflow-hidden">
                  <span className="absolute -top-8 -end-4 font-display font-extrabold text-[10rem] leading-none text-white/[0.04] select-none">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-2xl font-bold mb-4 relative">{s.t}</h3>
                  <p className="text-muted leading-relaxed relative">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= LIVE CONFIGURATOR TEASER ================= */

export function ConfigTeaser() {
  const { t, L, lang } = useI18n();
  const [pid, setPid] = useState<Product["id"]>("business-cards");
  const product = CATALOG.find((c) => c.id === pid)!;
  const [qty, setQty] = useState(100);
  const q = Math.max(product.minQty, Math.round(qty / product.step) * product.step || product.minQty);
  const bp = calculatePrice({
    product: pid,
    sizeId: product.sizes[0].id,
    paperId: product.papers[0].id,
    finishId: "matte",
    qty: q,
  });

  return (
    <section className="py-[clamp(96px,12vw,180px)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative rounded-[32px] border border-white/10 overflow-hidden bg-ink-2">
          <div className="absolute inset-0 aurora-bg opacity-[0.07]" aria-hidden />
          <div className="relative grid lg:grid-cols-2 gap-10 p-8 md:p-14">
            <div>
              <SectionHeading kicker={t.teaser.kicker} title={t.teaser.title} />
              <div className="flex flex-wrap gap-2">
                {CATALOG.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPid(c.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 cursor-pointer ${
                      pid === c.id
                        ? "aurora-bg text-ink border-transparent"
                        : "border-white/12 text-paper/70 hover:border-cyan/40 hover:text-cyan"
                    }`}
                    aria-pressed={pid === c.id}
                  >
                    {L(c.name)}
                  </button>
                ))}
              </div>
              <div className="mt-8 max-w-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">{t.teaser.qty}</span>
                  <span className="text-paper font-semibold tabular-nums">{q.toLocaleString()} {L(product.unit)}</span>
                </div>
                <input
                  type="range"
                  min={product.minQty}
                  max={Math.max(product.minQty * 10, 500)}
                  step={product.step}
                  value={q}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full accent-cyan cursor-pointer"
                  aria-label={t.teaser.qty}
                />
              </div>
              <Button href="/order" className="mt-8" magnetic>
                {t.teaser.open}
                <Icon name="arrow" className="w-4 h-4 rtl-flip" />
              </Button>
            </div>

            <div className="flex items-center">
              <div className="w-full glass rounded-3xl p-8 flex flex-col items-center gap-2">
                <img src={product.image} alt={L(product.name)} className="w-full max-h-64 object-cover rounded-2xl" />
                <span className="text-sm text-muted mt-4">{t.teaser.price}</span>
                <span className="font-display font-extrabold text-5xl text-paper">
                  <PriceCounter value={bp.subtotal} lang={lang} />
                  <span className="text-xl text-muted font-body font-medium ms-2">{t.common.mad}</span>
                </span>
                <span className="text-xs text-muted">
                  {L(product.name)} · {q} {L(product.unit)} · {t.products.from} {bp.unit.toLocaleString()} {t.common.mad}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= DESIGNS TEASER ================= */

interface DesignMetaLite {
  slug: string;
  title: { en: string; fr: string; ar: string };
  access: "free" | "member";
  cat: string;
}

export function DesignsTeaser() {
  const { t, L } = useI18n();
  const [list, setList] = useState<DesignMetaLite[]>([]);

  useEffect(() => {
    fetch("/api/designs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setList(d.designs.slice(0, 3)))
      .catch(() => undefined);
  }, []);

  return (
    <section className="py-[clamp(80px,10vw,140px)] border-t border-white/8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-[3px] rounded-full aurora-bg" />
                <span className="text-[#0b63d6] text-xs font-bold tracking-[0.28em] uppercase">
                  {t.designs.kicker}
                </span>
              </div>
              <h2 className="font-display font-extrabold leading-[1.03] tracking-[-0.03em] text-[#0d1b32] text-[clamp(2.15rem,5vw,4.15rem)] uppercase">
                {t.designs.title}
              </h2>
            </div>
            <Link
              href="/designs"
              className="inline-flex items-center gap-2 rounded-full border border-[#0b63d6]/25 px-5 py-2.5 text-sm font-semibold text-[#0b63d6] hover:bg-[#0b63d6] hover:text-white transition-colors"
            >
              /designs
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </Link>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {list.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.08}>
              <Link
                href="/designs"
                className="group block rounded-[26px] overflow-hidden bg-white border border-[#0b63d6]/12 shadow-[0_26px_62px_-40px_rgba(16,42,90,0.65)] hover:shadow-[0_40px_84px_-34px_rgba(11,99,214,0.7)] hover:-translate-y-1.5 transition-all duration-500"
              >
                <div className="relative h-52 overflow-hidden" style={{ background: "linear-gradient(160deg,#f2f7fd,#e6eef9)" }}>
                  <img
                    src={`/api/designs/${d.slug}`}
                    alt={L(d.title)}
                    loading="lazy"
                    className="w-full h-full object-contain p-5 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 start-4">
                    {d.access === "free" ? (
                      <Badge className="!bg-white/85 !text-[#0b4fb0] !border-white/60">{t.designs.free}</Badge>
                    ) : (
                      <Badge gold>{t.designs.member}</Badge>
                    )}
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between gap-3">
                  <h3 className="font-display font-bold text-[#0d1b32] group-hover:text-[#0b63d6] transition-colors">
                    {L(d.title)}
                  </h3>
                  <span className="w-9 h-9 rounded-full border border-[#0b63d6]/25 flex items-center justify-center text-[#0b63d6] transition-all duration-500 group-hover:bg-[#0b63d6] group-hover:text-white">
                    <Icon name="download" className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= PORTFOLIO ================= */

export function PortfolioSection() {
  const { t, L } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [openIdx, setOpenIdx] = useState(-1);
  const items = useMemo(
    () => PORTFOLIO.filter((p) => filter === "all" || p.cat === filter),
    [filter],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cats = [
    { id: "all", label: t.portfolio.all },
    { id: "brand", label: t.portfolio.brand },
    { id: "editorial", label: t.portfolio.editorial },
    { id: "retail", label: t.portfolio.retail },
    { id: "event", label: t.portfolio.event },
  ];

  return (
    <section id="portfolio" className="py-[clamp(96px,12vw,180px)] bg-ink-2/30 border-y border-white/8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.portfolio.kicker} title={t.portfolio.title} sub={t.portfolio.sub} />
        </Reveal>

        <div className="flex flex-wrap gap-2 mb-10">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                filter === c.id
                  ? "aurora-bg text-ink border-transparent"
                  : "border-white/12 text-paper/70 hover:border-cyan/40"
              }`}
              aria-pressed={filter === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="columns-2 md:columns-3 xl:columns-4 gap-5 [column-fill:_balance]">
          {items.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setOpenIdx(i)}
              className="break-inside-avoid mb-5 group relative w-full rounded-3xl overflow-hidden border border-white/8 text-start cursor-pointer focus-visible:outline-cyan"
            >
              <div className={`${p.ratio} w-full overflow-hidden`}>
                <img
                  src={p.img}
                  alt={L(p.title)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                <div>
                  <p className="text-xs text-cyan mb-1">{p.client} · {p.year}</p>
                  <h3 className="font-semibold text-paper text-sm leading-snug">{L(p.title)}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/portfolio" variant="glass">
            /portfolio <Icon name="arrow" className="w-4 h-4 rtl-flip" />
          </Button>
        </div>
      </div>

      {openIdx >= 0 && items[openIdx] && (
        <div
          className="fixed inset-0 z-[150] bg-ink/95 backdrop-blur-xl flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIdx(-1)}
        >
          <button
            className="absolute top-6 end-6 w-11 h-11 rounded-full glass flex items-center justify-center text-paper hover:text-magenta cursor-pointer"
            onClick={() => setOpenIdx(-1)}
            aria-label="Close"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
          <button
            className="absolute top-1/2 -translate-y-1/2 start-4 md:start-8 w-11 h-11 rounded-full glass flex items-center justify-center text-paper hover:text-cyan cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((openIdx - 1 + items.length) % items.length);
            }}
            aria-label="Previous"
          >
            <Icon name="arrow" className="w-5 h-5 rotate-180 rtl-flip" />
          </button>
          <figure className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={items[openIdx].img} alt={L(items[openIdx].title)} className="w-full max-h-[70vh] object-contain rounded-2xl" />
            <figcaption className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-cyan text-sm">{items[openIdx].client} · {items[openIdx].year}</p>
                <p className="text-paper font-medium">{L(items[openIdx].title)}</p>
              </div>
              <span className="text-muted text-sm tabular-nums">
                {openIdx + 1} / {items.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="absolute top-1/2 -translate-y-1/2 end-4 md:end-8 w-11 h-11 rounded-full glass flex items-center justify-center text-paper hover:text-cyan cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((openIdx + 1) % items.length);
            }}
            aria-label="Next"
          >
            <Icon name="arrow" className="w-5 h-5 rtl-flip" />
          </button>
        </div>
      )}
    </section>
  );
}

/* ================= NUMBERS ================= */

export function Numbers() {
  const { t } = useI18n();
  return (
    <section className="py-[clamp(96px,12vw,140px)] border-b border-white/8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {NUMBERS.map((n, i) => (
          <Reveal key={n.key} delay={i * 0.1} className="text-center">
            <div className="font-display font-extrabold text-5xl md:text-6xl aurora-text">
              <CountUp to={n.value} suffix={n.suffix} />
            </div>
            <p className="mt-3 text-muted text-sm tracking-wide">{t.numbers[n.key]}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= TESTIMONIALS ================= */

function QuoteCard({ q, name, role, city }: { q: string; name: string; role: string; city: string }) {
  return (
    <figure className="w-[340px] md:w-[420px] shrink-0 glass rounded-3xl p-6 me-5">
      <div className="flex gap-1 mb-4" aria-label="5/5">
        {[...Array(5)].map((_, i) => (
          <Icon key={i} name="sparkle" className="w-3.5 h-3.5 text-cyan" fill />
        ))}
      </div>
      <blockquote className="text-paper/85 leading-relaxed text-[0.95rem]">{q}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full aurora-bg flex items-center justify-center font-display font-bold text-ink text-sm">
          {name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold text-paper">{name}</span>
          <span className="block text-xs text-muted">
            {role} — {city}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const { t, L } = useI18n();
  const rowA = TESTIMONIALS.slice(0, 4).map((x) => (
    <QuoteCard key={x.name} q={L(x.q)} name={x.name} role={L(x.role)} city={x.city} />
  ));
  const rowB = TESTIMONIALS.slice(4).map((x) => (
    <QuoteCard key={x.name} q={L(x.q)} name={x.name} role={L(x.role)} city={x.city} />
  ));
  return (
    <section className="py-[clamp(96px,12vw,180px)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 mb-12">
        <Reveal>
          <SectionHeading kicker={t.testimonials.kicker} title={t.testimonials.title} />
        </Reveal>
      </div>
      <Marquee duration={56} className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rowA}
      </Marquee>
      <Marquee reverse duration={64} className="mt-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rowB}
      </Marquee>
    </section>
  );
}

/* ================= B2B ================= */

export function B2B() {
  const { t } = useI18n();
  return (
    <section className="py-[clamp(96px,12vw,180px)] bg-ink-2/40 border-y border-white/8 relative overflow-hidden">
      <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full aurora-bg opacity-10 blur-3xl" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <SectionHeading kicker={t.b2b.kicker} title={t.b2b.title} sub={t.b2b.sub} />
          <Button href={WHATSAPP_URL} magnetic variant="glass" size="lg" className="no-underline">
            {t.b2b.cta}
            <WhatsAppMini />
          </Button>
        </Reveal>
        <div className="grid gap-4">
          {t.b2b.points.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="glass rounded-3xl p-6 flex gap-4 items-start hover:bg-white/[0.07] transition-colors">
                <span className="flex w-11 h-11 shrink-0 items-center justify-center rounded-xl aurora-bg text-ink">
                  <Icon name={["layers", "file", "zap"][i]} className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-display font-bold text-lg mb-1">{p.t}</span>
                  <span className="block text-muted text-sm leading-relaxed">{p.d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppMini() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15L2 22l5.13-1.5A9.94 9.94 0 1 0 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.24-3.8-.8-3.2-1.26-5.24-4.55-5.4-4.76-.15-.21-1.27-1.7-1.27-3.24s.8-2.3 1.1-2.62c.29-.32.64-.4.85-.4l.61.01c.2.01.46-.07.72.55.27.63.9 2.2.98 2.35.08.16.13.34.03.55-.1.21-.15.34-.3.52l-.45.53c-.15.15-.3.32-.13.62.17.3.75 1.25 1.61 2.02 1.11.99 2.05 1.3 2.35 1.45.3.15.47.13.65-.08.17-.2.75-.87.94-1.17.2-.3.39-.25.65-.15.27.1 1.7.8 2 .95.29.15.5.22.57.34.07.13.07.73-.17 1.41Z" />
    </svg>
  );
}

/* ================= FAQ ================= */

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="py-[clamp(96px,12vw,180px)]">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} align="center" />
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion items={t.faq.items} />
        </Reveal>
      </div>
    </section>
  );
}

/* ================= JOURNAL TEASER ================= */

export function Journal() {
  const { t, L } = useI18n();
  return (
    <section className="py-[clamp(96px,12vw,160px)] border-t border-white/8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px aurora-bg" />
              <span className="text-cyan text-sm font-semibold tracking-[0.2em] uppercase">{t.blog.kicker}</span>
            </div>
            <a href="/blog" className="flex items-center gap-1.5 text-sm text-muted hover:text-cyan transition-colors">
              {t.blog.back}
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </a>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <a href={`/blog/${p.slug}`} className="group block">
                <div className={`relative rounded-3xl overflow-hidden border border-white/8 blog-art ${p.art} h-32`}>
                  <div className="absolute inset-0 halftone opacity-40" aria-hidden />
                  <span className="absolute -bottom-6 end-2 font-display font-extrabold text-8xl text-ink/10 select-none group-hover:scale-110 transition-transform duration-700 origin-bottom">
                    {p.glyph}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold leading-snug group-hover:text-cyan transition-colors">{L(p.title)}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-2">{L(p.excerpt)}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA ================= */

export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden on-aurora">
      <div className="aurora-bg absolute inset-0" aria-hidden />
      <div className="absolute inset-0 halftone opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-[clamp(120px,16vw,220px)] text-center">
        <h2 className="font-display font-extrabold text-ink uppercase leading-[1.02] text-[clamp(3rem,8vw,7rem)]">
          {t.finalCta.line1}
          <br />
          <span className="bg-ink text-paper px-4 md:px-6 rounded-2xl inline-block translate-y-2">{t.finalCta.line2}</span>
        </h2>
        <div className="mt-12">
          <Button
            href="/order"
            size="lg"
            magnetic
            className="!bg-ink !text-paper !shadow-2xl aurora-bg-none hover:!brightness-125"
          >
            {t.finalCta.cta}
            <Icon name="arrow" className="w-5 h-5 rtl-flip" />
          </Button>
        </div>
      </div>
    </section>
  );
}
