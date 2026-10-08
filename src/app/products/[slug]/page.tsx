"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { CATALOG, FINISHES, calculatePrice, formatMAD } from "@/lib/pricing";
import { Button, Icon, Badge, SectionHeading, Reveal } from "@/components/ui";
import { TiltCard } from "@/components/motion";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <ProductView slug={slug} />;
}

function ProductView({ slug }: { slug: string }) {
  const { t, L, lang } = useI18n();
  const product = CATALOG.find((c) => c.id === slug);
  if (!product) notFound();
  const p = product!;
  const bp = calculatePrice({
    product: p.id,
    sizeId: p.sizes[0].id,
    paperId: p.papers[0].id,
    finishId: "matte",
    qty: p.minQty,
  });

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <a href="/#products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors mb-10">
            <Icon name="arrow" className="w-4 h-4 rotate-180 rtl-flip" />
            {t.product.back}
          </a>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <TiltCard className="rounded-panel">
              <div className="rounded-panel overflow-hidden border border-white/10">
                <img src={p.image} alt={L(p.name)} className="w-full aspect-[4/3] object-cover" />
              </div>
            </TiltCard>
          </Reveal>

          <div>
            <Reveal>
              <SectionHeading kicker={t.products.kicker} title={L(p.name)} sub={L(p.tagline)} />
            </Reveal>
            <Reveal delay={0.05}>
              <p className="font-display font-extrabold text-4xl">
                {t.product.from}{" "}
                <span className="aurora-text">{formatMAD(bp.subtotal, lang)}</span>
              </p>
              <p className="text-sm text-muted mt-1">
                min. {p.minQty.toLocaleString()} {L(p.unit)} · {bp.size.dim}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h4 className="font-display font-bold mt-10 mb-4">{t.product.specs}</h4>
              <ul className="space-y-2 text-sm text-paper/80">
                {p.sizes.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4 text-cyan" />
                    {s.name[lang]} — <span dir="ltr">{s.dim}</span>
                  </li>
                ))}
                {p.papers.map((pp) => (
                  <li key={pp.id} className="flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4 text-cyan" />
                    {pp.name[lang]} ({pp.spec})
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15}>
              <h4 className="font-display font-bold mt-8 mb-4">{t.product.finishes}</h4>
              <div className="flex flex-wrap gap-2">
                {FINISHES.map((f) => (
                  <Badge key={f.id} gold={f.premium}>
                    {L(f.name)}
                  </Badge>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <Button href={`/order?product=${p.id}`} size="lg" magnetic className="mt-10">
                {t.product.start}
                <Icon name="arrow" className="w-5 h-5 rtl-flip" />
              </Button>
            </Reveal>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="font-display font-bold text-2xl mb-8">{t.product.related}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATALOG.filter((c) => c.id !== p.id).slice(0, 4).map((c) => (
              <a key={c.id} href={`/order?product=${c.id}`} className="group">
                <div className="rounded-3xl overflow-hidden border border-white/8 hover:border-cyan/40 transition-colors">
                  <img src={c.image} alt={L(c.name)} className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-3 font-semibold text-sm group-hover:text-cyan transition-colors">{L(c.name)}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
