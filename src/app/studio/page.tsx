"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATALOG, formatMAD } from "@/lib/pricing";
import { Button, Icon, SectionHeading, Reveal, Badge } from "@/components/ui";

interface StudioOrder {
  code: string;
  job: string | null;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  product: string;
  quantity: number;
  total: number;
  express: boolean;
  payment: string;
  advanceAmount: number;
  ribSender: string | null;
  artworkName: string | null;
  artworkUrl: string | null;
  receipt: string | null;
  note: string | null;
  createdAt: string;
}

interface StudioData {
  stats: { requests: number; revenue: number; advances: number; members: number };
  orders: StudioOrder[];
  members: { name: string; phone: string; createdAt: string }[];
}

export default function StudioPage() {
  const { t, L, lang } = useI18n();
  const [data, setData] = useState<StudioData | null>(null);

  useEffect(() => {
    fetch("/api/studio")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => undefined);
  }, []);

  const payLabel = (p: string) =>
    p === "advance" ? t.pay.advance : p === "card" ? t.pay.card : p === "cod" ? t.pay.cod : p;

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.studio.kicker} title={t.studio.title} sub={t.studio.sub} />
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { v: data ? data.stats.requests.toLocaleString() : "—", l: t.studio.sRequests },
            { v: data ? `${formatMAD(data.stats.revenue, lang)}` : "—", l: t.studio.sRevenue },
            { v: data ? `${formatMAD(data.stats.advances, lang)}` : "—", l: t.studio.sAdvances },
            { v: data ? data.stats.members.toLocaleString() : "—", l: t.studio.sMembers },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="glass rounded-3xl p-5">
                <p className="font-display font-extrabold text-2xl aurora-text tabular-nums truncate">{s.v}</p>
                <p className="text-xs text-muted mt-1.5">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <h3 className="font-display font-bold text-xl mb-5 flex items-center gap-3">
            <Icon name="file" className="w-5 h-5 text-cyan" />
            {t.studio.requests}
          </h3>
        </Reveal>

        {!data ? (
          <div className="glass rounded-3xl p-10 animate-pulse text-center text-muted">…</div>
        ) : data.orders.length === 0 ? (
          <div className="glass rounded-card p-12 text-center text-muted">{t.studio.empty}</div>
        ) : (
          <div className="space-y-4">
            {data.orders.map((o, i) => {
              const product = CATALOG.find((c) => c.id === o.product);
              return (
                <Reveal key={o.code} delay={Math.min(i * 0.04, 0.2)}>
                  <div className="glass rounded-3xl p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="font-display font-bold text-lg aurora-text tracking-widest" dir="ltr">
                        {o.code}
                      </span>
                      {o.job && (
                        <span className="font-mono text-xs text-cyan" dir="ltr">
                          {o.job}
                        </span>
                      )}
                      <span className="text-sm text-paper/85">
                        {product ? L(product.name) : o.product} · {o.quantity.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(o.createdAt).toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="ms-auto text-end">
                        <span className="block text-micro text-muted">{t.studio.total}</span>
                        <span className="font-display font-bold tabular-nums">{formatMAD(o.total, lang)}</span>
                      </span>
                    </div>

                    <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/8 px-4 py-3">
                        <p className="text-xs text-muted mb-1">
                          {t.order.review.name} · {t.order.review.phone}
                        </p>
                        <p className="font-medium">{o.name}</p>
                        <p className="text-xs text-muted" dir="ltr">
                          {o.phone}
                          {o.city ? ` — ${o.city}` : ""}
                        </p>
                        <a
                          href={`https://wa.me/${o.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan hover:text-paper transition-colors"
                        >
                          <Icon name="phone" className="w-3.5 h-3.5" />
                          {t.studio.contact}
                        </a>
                      </div>

                      <div className="rounded-2xl border border-white/8 px-4 py-3">
                        <p className="text-xs text-muted mb-1">{t.studio.payment}</p>
                        <p className="font-medium flex items-center gap-2">
                          <Icon name={o.payment === "advance" ? "bank" : o.payment === "card" ? "card" : "cash"} className="w-4 h-4 text-cyan" />
                          {payLabel(o.payment)}
                        </p>
                        {o.payment === "advance" && (
                          <p className="mt-1.5 text-xs">
                            <span className="text-cyan font-semibold tabular-nums">{formatMAD(o.advanceAmount, lang)}</span>
                            {o.ribSender && (
                              <span className="text-muted" dir="ltr">
                                {" "}
                                · {o.ribSender}
                              </span>
                            )}
                          </p>
                        )}
                        {o.receipt && (
                          <a href={o.receipt} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-cyan hover:text-paper transition-colors">
                            <Icon name="file" className="w-3.5 h-3.5" />
                            {t.studio.receipt} ↗
                          </a>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/8 px-4 py-3">
                        <p className="text-xs text-muted mb-1">{t.studio.artwork}</p>
                        {o.artworkUrl ? (
                          <a href={o.artworkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan hover:text-paper transition-colors">
                            <Icon name="download" className="w-3.5 h-3.5" />
                            {o.artworkName} ↗
                          </a>
                        ) : o.artworkName ? (
                          <p className="text-xs text-muted">{o.artworkName}</p>
                        ) : (
                          <p className="text-xs text-muted">{t.studio.none}</p>
                        )}
                        {o.note && <p className="mt-1.5 text-xs text-paper/70 line-clamp-2">“{o.note}”</p>}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="mt-14">
          <Reveal>
            <h3 className="font-display font-bold text-xl mb-5 flex items-center gap-3">
              <Icon name="sparkle" className="w-5 h-5 text-cyan" />
              {t.studio.members}
            </h3>
          </Reveal>
          {!data ? null : data.members.length === 0 ? (
            <p className="glass rounded-3xl p-8 text-center text-sm text-muted">{t.studio.noMembers}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.members.map((m) => (
                <a
                  key={m.phone}
                  href={`https://wa.me/${m.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass rounded-full px-4 py-2 flex items-center gap-3 text-sm hover:border-cyan/40 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full aurora-bg text-ink flex items-center justify-center font-bold text-xs">
                    {m.name[0]?.toUpperCase()}
                  </span>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted" dir="ltr">
                    {m.phone}
                  </span>
                  <Badge>{m.createdAt.slice(0, 10)}</Badge>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="/order" magnetic>
            {t.nav.cta}
            <Icon name="arrow" className="w-4 h-4 rtl-flip" />
          </Button>
          <Button href="/floor" variant="ghost">
            {t.floor.kicker}
          </Button>
        </div>
      </div>
    </div>
  );
}
