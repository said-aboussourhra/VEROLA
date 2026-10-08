import { loadBrandBySlug, PLATFORM, brandCss } from "@/lib/tenant";
import { CATALOG, calculatePrice, formatMAD } from "@/lib/pricing";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = (await loadBrandBySlug(slug)) ?? PLATFORM;
  return {
    title: `${b.name} — ${b.tagline}`,
    description: `${b.name} is a printing studio in ${b.city}, powered by VEROLA.`,
  };
}

const COPY = {
  en: { cta: "Start your order", catalog: "What we print", powered: "Powered by", from: "from" },
  fr: { cta: "Commencer ma commande", catalog: "Ce que nous imprimons", powered: "Propulsé par", from: "dès" },
  ar: { cta: "ابدأ طلبك", catalog: "ما نطبعه", powered: "بتشغيل من", from: "ابتداءً من" },
};

export default async function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await loadBrandBySlug(slug);
  if (!brand) notFound();
  const t = COPY.en;

  return (
    <div className="min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: brandCss(brand) }} />

      {/* hero */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(85% 95% at 22% 12%, ${brand.brand2}33 0%, transparent 62%),
                         radial-gradient(70% 80% at 82% 22%, ${brand.brand3}26 0%, transparent 66%),
                         #ffffff`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-11 h-11 object-contain" />
            ) : (
              <span
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-xl"
                style={{ background: brand.accent }}
              >
                {brand.name.slice(0, 1)}
              </span>
            )}
            <div>
              <p className="font-display font-extrabold text-xl leading-tight text-navy">{brand.name}</p>
              <p className="text-xs text-ink-muted" dir="ltr">
                {brand.domain ?? `${brand.slug}.verola.com`}
              </p>
            </div>
          </div>

          <h1
            className="mt-10 font-display font-extrabold leading-[1.02] tracking-[-0.035em] text-navy"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.25rem)" }}
          >
            {brand.tagline}
          </h1>
          <p className="mt-5 text-lg text-ink-muted max-w-xl leading-relaxed">
            {t.catalog} — {brand.city}. {brand.phone}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/order"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-[0_22px_48px_-18px_rgba(11,99,214,0.85)] hover:brightness-110 transition"
              style={{ background: brand.accent }}
            >
              {t.cta}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 12h16m0 0-6-6m6 6-6 6" />
              </svg>
            </a>
            <a
              href="/customize"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-semibold transition hover:bg-black/[0.03]"
              style={{ borderColor: `${brand.accent}40`, color: brand.accent }}
            >
              Print customizer
            </a>
          </div>
        </div>
      </section>

      {/* catalog */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display font-extrabold text-3xl tracking-[-0.03em] text-navy uppercase">
            {t.catalog}
          </h2>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATALOG.map((c) => {
              const bp = calculatePrice({
                product: c.id,
                sizeId: c.sizes[0].id,
                paperId: c.papers[0].id,
                finishId: "matte",
                qty: c.minQty,
              });
              return (
                <a
                  key={c.id}
                  href={`/order?product=${c.id}`}
                  className="group rounded-3xl overflow-hidden bg-white border border-black/8 shadow-lift hover:-translate-y-1.5 transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image} alt={c.name.en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <p className="font-display font-bold text-navy">{c.name.en}</p>
                    <p className="text-sm text-ink-muted mt-1">
                      {t.from}{" "}
                      <strong style={{ color: brand.accent }} className="tabular-nums">
                        {formatMAD(bp.subtotal, "en")}
                      </strong>
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* footer strip */}
      <footer className="border-t border-black/8 py-10">
        <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} {brand.name} — {brand.city}
          </p>
          <p className="text-sm text-ink-faint">
            {t.powered}{" "}
            <a href="/" className="font-semibold" style={{ color: brand.accent }}>
              VEROLA
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
