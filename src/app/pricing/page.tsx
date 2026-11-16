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

        <Reveal delay={0.08}>
          <div className="mt-12 mb-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-[#0b63d6]">
                SaaS Subscription Plans
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-display font-extrabold text-[#0d1b32]">
                {lang === "ar" ? "خطط اشتراك SaaS لأدوات الذكاء الاصطناعي والتجهيز الطباعي" : "AI Preflight & Packaging 3D SaaS Subscriptions"}
              </h2>
              <p className="mt-2 text-sm text-[#5b6779]">
                {lang === "ar" ? "اشترك للحصول على وصول غير محدود لأدوات فحص الملفات وتوليد التصاميم ثلاثية الأبعاد بضغطة زر." : "Unlimited automated print checks, 3D packaging generator and API endpoints."}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter / Freelancer",
                  price: "199",
                  sub: lang === "ar" ? "شهرياً" : "/month",
                  desc: lang === "ar" ? "مثالي للمصممين الأفراد والوكالات الناشئة" : "Perfect for independent designers & creators",
                  features: [
                    lang === "ar" ? "50 فحص ملفات طباعي AI شهرياً" : "50 AI preflight checks / month",
                    lang === "ar" ? "تصدير ثلاثي الأبعاد 4K للتغليف" : "4K 3D packaging export",
                    lang === "ar" ? "معالجة أوتوماتيكية للهوامش والألوان" : "Auto-bleed & CMYK conversion",
                    lang === "ar" ? "دعم فني عبر البريد" : "Standard email support",
                  ],
                  popular: false,
                },
                {
                  name: "Pro Agency / Studio",
                  price: "499",
                  sub: lang === "ar" ? "شهرياً" : "/month",
                  desc: lang === "ar" ? "للوكالات الإعلانية ومصممي الهويات البصرية" : "For creative studios & printing agencies",
                  features: [
                    lang === "ar" ? "فحوصات طباعة بالذكاء الاصطناعي غير محدودة" : "Unlimited AI preflight checks",
                    lang === "ar" ? "استوديو 3D حي وتعديل القوالب" : "Real-time 3D die-cut studio",
                    lang === "ar" ? "توليد ملفات PDF/X جاهزة للطباعة فوراً" : "Instant PDF/X-4 print-ready output",
                    lang === "ar" ? "ربط 5 مستخدمين للفريق" : "Up to 5 team seats",
                    lang === "ar" ? "أولوية في طوابير معالجة السحابة" : "High-speed cloud queue priority",
                  ],
                  popular: true,
                },
                {
                  name: "Enterprise Printing SaaS",
                  price: "1,299",
                  sub: lang === "ar" ? "شهرياً" : "/month",
                  desc: lang === "ar" ? "للمطابع الكبرى وشبكات التجارة الإلكترونية" : "For commercial printers & e-commerce",
                  features: [
                    lang === "ar" ? "واجهة برمجة تطبيقات REST API كاملة" : "Full REST API & Webhooks access",
                    lang === "ar" ? "لوحة تحكم White-label باسم مطبعتك" : "White-label client portal",
                    lang === "ar" ? "تكامل آلات Zünd & HP Indigo" : "Zünd & Indigo direct gateway bridge",
                    lang === "ar" ? "حسابات مستخدمين غير محدودة" : "Unlimited team accounts",
                    lang === "ar" ? "مدير حساب مخصص واتفاقية SLA 99.9%" : "Dedicated account manager & SLA",
                  ],
                  popular: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative rounded-[28px] p-7 transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-b from-white to-[#f0f6ff] border-2 border-[#0b63d6] shadow-[0_25px_60px_-20px_rgba(11,99,214,0.35)] scale-[1.02]"
                      : "bg-white border border-[#0b63d6]/15 shadow-sm hover:border-[#0b63d6]/40"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-3 py-1 rounded-full aurora-bg text-white text-[0.68rem] font-extrabold uppercase tracking-wider shadow-sm">
                      {lang === "ar" ? "الخيار الأكثر طلباً" : "Most High-Demand"}
                    </span>
                  )}
                  <p className="font-display font-extrabold text-lg text-[#0d1b32]">{plan.name}</p>
                  <p className="mt-1 text-xs text-[#5b6779] min-h-[32px]">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display font-black text-4xl text-[#0b63d6]">{plan.price}</span>
                    <span className="text-xs text-[#5b6779] font-medium">{t.common.mad} {plan.sub}</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-[#0b63d6]/10 pt-6">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-center gap-2.5 text-xs text-[#33445e]">
                        <span className="w-4 h-4 rounded-full bg-[#0b63d6]/10 flex items-center justify-center shrink-0">
                          <Icon name="check" className="w-2.5 h-2.5 text-[#0b63d6]" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/order"
                    className={`mt-8 block text-center rounded-full py-3 text-xs font-bold transition-all ${
                      plan.popular
                        ? "aurora-bg text-white shadow-md hover:brightness-110"
                        : "bg-[#f2f6fc] text-[#0b63d6] hover:bg-[#0b63d6] hover:text-white"
                    }`}
                  >
                    {lang === "ar" ? "ابدأ التجربة المجانية 14 يوماً" : "Start 14-Day Free Trial"}
                  </a>
                </div>
              ))}
            </div>
          </div>
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
