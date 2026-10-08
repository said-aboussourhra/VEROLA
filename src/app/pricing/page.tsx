"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATALOG, calculatePrice, formatMAD, tierFor } from "@/lib/pricing";
import { Button, Icon, SectionHeading, Reveal, PriceCounter } from "@/components/ui";

function TierCalc() {
  const { t, L, lang } = useI18n();
  const [pid, setPid] = useState<string>("business-cards");
  const product = CATALOG.find((c) => c.id === pid)!;
  const [qty, setQty] = useState(1000);
  const q = Math.max(product.minQty, Math.round(qty / product.step) * product.step || product.minQty);

  const bp = calculatePrice({
    product: pid as (typeof CATALOG)[number]["id"],
    sizeId: product.sizes[0].id,
    paperId: product.papers[0].id,
    finishId: "matte",
    qty: q,
  });
  const baseUnit = calculatePrice({
    product: pid as (typeof CATALOG)[number]["id"],
    sizeId: product.sizes[0].id,
    paperId: product.papers[0].id,
    finishId: "matte",
    qty: Math.max(1, product.minQty),
  }).unit;
  const saving = Math.round((1 - bp.unit / baseUnit) * 100);

  const pts = useMemo(() => {
    const arr: { x: number; y: number; q: number }[] = [];
    const MAXQ = 5000;
    const units = Array.from({ length: 61 }, (_, i) => {
      const qq = Math.max(1, Math.round(1 + (i / 60) * (MAXQ - 1)));
      return calculatePrice({
        product: pid as (typeof CATALOG)[number]["id"],
        sizeId: product.sizes[0].id,
        paperId: product.papers[0].id,
        finishId: "matte",
        qty: qq,
      }).unit;
    });
    const min = Math.min(...units);
    const max = Math.max(...units);
    units.forEach((u, i) => {
      arr.push({
        x: (i / 60) * 600,
        y: 10 + (1 - (u - min) / (max - min || 1)) * 100,
        q: 1 + (i / 60) * (MAXQ - 1),
      });
    });
    return arr;
  }, [pid, product]);

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const cur = useMemo(() => {
    const frac = Math.min(1, (q - 1) / 4999);
    const i = Math.round(frac * 60);
    return pts[i];
  }, [pts, q]);

  const tier = tierFor(q);

  return (
    <div className="glass rounded-[28px] p-6 md:p-10">
      <div className="flex flex-wrap gap-2 mb-8">
        {CATALOG.map((c) => (
          <button
            key={c.id}
            onClick={() => setPid(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              pid === c.id ? "aurora-bg text-ink border-transparent" : "border-white/12 text-paper/70 hover:border-cyan/40"
            }`}
            aria-pressed={pid === c.id}
          >
            {L(c.name)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="flex items-end justify-between mb-3">
            <span className="text-sm text-muted">{t.teaser.qty}</span>
            <span className="font-display font-extrabold text-3xl text-paper tabular-nums">
              {q.toLocaleString()} <span className="text-sm font-body font-medium text-muted">{L(product.unit)}</span>
            </span>
          </div>
          <input
            type="range"
            min={product.minQty}
            max={5000}
            step={product.step}
            value={q}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full accent-cyan cursor-pointer"
            aria-label={t.teaser.qty}
          />
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">{t.order.perUnit}</p>
              <p className="font-display font-extrabold text-2xl tabular-nums">
                <PriceCounter value={bp.unit} lang={lang} />
                <span className="text-xs text-muted font-body ms-1">{t.common.mad}</span>
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">{t.order.tier}</p>
              <p className="font-display font-extrabold text-2xl text-cyan">
                −{Math.round((1 - tier.factor) * 100)}%
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">{t.order.total}</p>
              <p className="font-display font-extrabold text-2xl tabular-nums">
                <PriceCounter value={bp.subtotal} lang={lang} />
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-cyan">
            {saving > 0 ? `−${saving}% vs single-piece pricing` : t.order.artwork.ok}
          </p>
        </div>

        <div className="relative">
          <svg viewBox="0 0 600 120" className="w-full" role="img" aria-label="unit price curve">
            <defs>
              <linearGradient id="curveg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7B2FF7" />
                <stop offset="0.5" stopColor="#00F0FF" />
                <stop offset="1" stopColor="#FF2E93" />
              </linearGradient>
            </defs>
            <path d={`${path} L600,120 L0,120 Z`} fill="url(#curveg)" opacity="0.12" />
            <path d={path} fill="none" stroke="url(#curveg)" strokeWidth="2.5" strokeLinecap="round" />
            {cur && (
              <>
                <line x1={cur.x} y1={cur.y} x2={cur.x} y2={118} stroke="#00F0FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <circle cx={cur.x} cy={cur.y} r="6" fill="#00F0FF" className="pulse-glow" />
              </>
            )}
          </svg>
          <div className="flex justify-between text-[0.68rem] text-muted mt-2" dir="ltr">
            <span>1</span>
            <span>500</span>
            <span>1k</span>
            <span>2.5k</span>
            <span>5k</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { t, L, lang } = useI18n();

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.pricing.kicker} title={t.pricing.title} sub={t.pricing.sub} />
        </Reveal>

        <Reveal delay={0.05}>
          <TierCalc />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 glass rounded-[28px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-muted">
                    <th className="text-start px-6 py-4 font-semibold">{t.pricing.table}</th>
                    <th className="text-end px-6 py-4 font-semibold">{t.pricing.from}</th>
                    <th className="text-end px-6 py-4 font-semibold">×1,000</th>
                    <th className="text-end px-6 py-4 font-semibold">×5,000</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {CATALOG.map((c) => {
                    const min = calculatePrice({
                      product: c.id,
                      sizeId: c.sizes[0].id,
                      paperId: c.papers[0].id,
                      finishId: "matte",
                      qty: c.minQty,
                    });
                    const k1 = calculatePrice({
                      product: c.id,
                      sizeId: c.sizes[0].id,
                      paperId: c.papers[0].id,
                      finishId: "matte",
                      qty: Math.max(1000, c.minQty),
                    });
                    const k5 = calculatePrice({
                      product: c.id,
                      sizeId: c.sizes[0].id,
                      paperId: c.papers[0].id,
                      finishId: "matte",
                      qty: Math.max(5000, c.minQty),
                    });
                    return (
                      <tr key={c.id} className="border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-semibold text-paper">{L(c.name)}</p>
                              <p className="text-xs text-muted">min. {c.minQty.toLocaleString()} {L(c.unit)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-end text-paper tabular-nums">{formatMAD(min.subtotal, lang)}</td>
                        <td className="px-6 py-4 text-end text-paper tabular-nums">{formatMAD(k1.unit, lang)}</td>
                        <td className="px-6 py-4 text-end text-cyan font-semibold tabular-nums">{formatMAD(k5.unit, lang)}</td>
                        <td className="px-6 py-4 text-end">
                          <a href={`/order?product=${c.id}`} className="inline-flex items-center gap-1 text-xs text-cyan hover:text-paper transition-colors">
                            {t.pricing.cta}
                            <Icon name="arrow" className="w-3.5 h-3.5 rtl-flip" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted leading-relaxed max-w-3xl">{t.pricing.note}</p>
        </Reveal>

        <div className="mt-10">
          <Button href="/order" size="lg" magnetic>
            {t.pricing.cta}
            <Icon name="arrow" className="w-5 h-5 rtl-flip" />
          </Button>
        </div>
      </div>
    </div>
  );
}
