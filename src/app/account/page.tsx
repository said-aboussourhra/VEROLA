"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { CATALOG, formatMAD, type ProductId, type FinishId } from "@/lib/pricing";
import { deviceCodes, useConfig } from "@/lib/store";
import { statusIndex, hoursSince, etaDate } from "@/lib/status";
import { Button, Icon, SectionHeading, Reveal, inputCls } from "@/components/ui";

interface Row {
  code: string;
  product: string;
  qty: number;
  total: number;
  createdAt: string;
  express: boolean;
}

export default function AccountPage() {
  const { t, L, lang } = useI18n();
  const router = useRouter();
  const cfg = useConfig();
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const codes = deviceCodes();
    let alive = true;
    (async () => {
      const out: Row[] = [];
      for (const c of codes.slice(0, 10)) {
        try {
          const res = await fetch(`/api/orders/${c}`);
          if (res.ok) {
            const d = await res.json();
            out.push({
              code: d.code,
              product: d.product,
              qty: d.quantity,
              total: d.total,
              createdAt: d.createdAt,
              express: d.express,
            });
          }
        } catch {
          /* skip */
        }
      }
      if (alive) {
        setRows(out);
        setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const reorder = (r: Row) => {
    const product = CATALOG.find((c) => c.id === r.product);
    cfg.set({
      product: (r.product as ProductId) || "business-cards",
      sizeId: product ? product.sizes[0].id : "std",
      paperId: product ? product.papers[0].id : "std300",
      finishId: ("matte" as FinishId),
      qty: r.qty,
      express: r.express,
      step: 0,
    });
    router.push("/order");
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) router.push(`/track/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-4xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.account.kicker} title={t.account.title} sub={t.account.sub} />
        </Reveal>

        <Reveal delay={0.05}>
          <form onSubmit={search} className="flex gap-3 mb-12">
            <input
              className={`${inputCls} max-w-xs font-mono tracking-widest`}
              placeholder={t.account.searchPh}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label={t.account.search}
              dir="ltr"
            />
            <Button type="submit" variant="glass" magnetic>
              {t.account.go}
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </Button>
          </form>
        </Reveal>

        {!loaded ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="h-3 w-64 rounded bg-white/5 mt-3" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-card p-12 text-center space-y-5">
            <span className="inline-flex w-14 h-14 rounded-full bg-white/5 items-center justify-center text-muted">
              <Icon name="printer" className="w-6 h-6" />
            </span>
            <p className="text-muted">{t.account.empty}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/order" magnetic>
                {t.account.emptyCta}
                <Icon name="arrow" className="w-4 h-4 rtl-flip" />
              </Button>
              <Button href="/track/VLR-3102" variant="ghost">
                {t.account.demo}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((r, i) => {
              const product = CATALOG.find((c) => c.id === r.product);
              const idx = statusIndex(hoursSince(r.createdAt));
              const done = idx === 6;
              return (
                <Reveal key={r.code} delay={i * 0.06}>
                  <div className="glass rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {product && <img src={product.image} alt="" className="w-14 h-14 rounded-2xl object-cover hidden sm:block" />}
                      <div className="min-w-0">
                        <p className="font-display font-bold text-lg aurora-text tracking-widest" dir="ltr">
                          {r.code}
                        </p>
                        <p className="text-sm text-paper/80 truncate">
                          {product ? L(product.name) : r.product} · {r.qty.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {t.account.placed}{" "}
                          {new Date(r.createdAt).toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {formatMAD(r.total, lang)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`self-start md:self-center inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
                        done ? "aurora-bg text-ink" : "bg-cyan/10 text-cyan"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-ink/40" : "bg-cyan pulse-glow"}`} />
                      {t.track.steps[idx]}
                    </span>
                    <div className="flex gap-2">
                      <Button href={`/track/${r.code}`} variant="ghost" size="sm">
                        {t.account.track}
                      </Button>
                      <Button variant="glass" size="sm" onClick={() => reorder(r)}>
                        <Icon name="flip" className="w-4 h-4" />
                        {t.account.reorder}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <p className="text-xs text-muted text-center pt-2">
              {t.track.etaLabel}: {etaDate(rows[0].createdAt, rows[0].express).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
