"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { CATALOG, FINISHES, formatMAD, ZONES } from "@/lib/pricing";
import { Button, Icon, SectionHeading } from "./ui";
import type { TrackData } from "@/app/track/[id]/page";

export function TrackClient({ code, data }: { code: string; data: TrackData | null }) {
  const { t, L, lang } = useI18n();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [nfCode, setNfCode] = useState("");

  const state = useMemo(() => {
    if (!data) return null;
    const hours = (Date.now() - new Date(data.createdAt).getTime()) / 3.6e6;
    const idx = hours < 1 ? 0 : hours < 4 ? 1 : hours < 20 ? 2 : hours < 26 ? 3 : hours < 30 ? 4 : hours < 40 ? 5 : 6;
    const eta = new Date(new Date(data.createdAt).getTime() + (data.express ? 1 : 2) * 864e5);
    return { idx, eta, hours };
  }, [data]);

  if (!data || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="max-w-md w-full text-center glass rounded-panel p-12">
          <span className="inline-flex w-16 h-16 rounded-full bg-white/5 items-center justify-center text-magenta mb-6">
            <Icon name="pin" className="w-7 h-7" />
          </span>
          <h1 className="font-display font-extrabold text-3xl text-paper" dir="ltr">
            {code}
          </h1>
          <p className="mt-4 text-muted">{t.track.notFound}</p>
          <form
            className="mt-8 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = nfCode.trim();
              if (v) router.push(`/track/${v.toUpperCase()}`);
            }}
          >
            <input
              value={nfCode}
              onChange={(e) => setNfCode(e.target.value)}
              placeholder={t.search.ph}
              className="flex-1 min-w-0 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-mono tracking-widest placeholder:text-muted/60 focus:border-cyan/60 focus:outline-none"
              aria-label={t.search.title}
              dir="ltr"
            />
            <Button type="submit" variant="glass" size="sm">
              {t.search.go}
            </Button>
          </form>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/track/VLR-2847" magnetic>
              {t.track.demo}
            </Button>
            <Button href="/order" variant="ghost">
              {t.track.newOrder}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const product = CATALOG.find((c) => c.id === data.product);
  const size = product?.sizes.find((s) => s.id === data.sizeId);
  const paper = product?.papers.find((p) => p.id === data.paperId);
  const finish = FINISHES.find((f) => f.id === data.finishId);
  const delivered = state.idx === 6;
  const payLabel =
    data.payment === "advance"
      ? t.track.payAdvance
      : data.payment === "card"
        ? t.track.payCard
        : data.payment === "bank"
          ? t.track.payBank
          : t.track.payCod;

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-5xl px-4 md:px-6">
        <SectionHeading kicker={`${t.track.kicker} — ${code}`} title={t.track.title} />

        {/* timeline */}
        <div className="glass rounded-card p-8 md:p-12 mb-8">
          <div className="relative mb-10">
            <div className="absolute top-[22px] inset-x-6 h-1 bg-white/10 rounded-full" aria-hidden />
            <motion.div
              className="absolute top-[22px] start-6 h-1 aurora-bg rounded-full"
              style={{ height: 4 }}
              initial={reduced ? { width: `${(state.idx / 6) * 100}%` } : { width: 0 }}
              animate={{ width: `${(state.idx / 6) * 100}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden
            />
            <ol className="relative flex justify-between" dir="ltr">
              {t.track.steps.map((s, i) => {
                const done = i < state.idx;
                const current = i === state.idx && !delivered;
                return (
                  <li key={i} className="flex flex-col items-center gap-3 w-1/7">
                    <span
                      className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        done || delivered
                          ? "aurora-bg text-ink border-transparent"
                          : current
                            ? "bg-ink border-cyan text-cyan pulse-glow"
                            : "bg-ink border-white/15 text-muted"
                      }`}
                    >
                      {done || delivered ? (
                        <Icon name="check" className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold tabular-nums">{i + 1}</span>
                      )}
                    </span>
                    <span
                      className={`text-micro md:text-xs font-medium text-center leading-tight ${
                        done || current ? "text-paper" : "text-muted"
                      }`}
                    >
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-sm text-muted">
                {t.track.placed}:{" "}
                {new Date(data.createdAt).toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-muted mt-1">
                {t.track.etaLabel}:{" "}
                <span className="text-cyan font-semibold">
                  {state.eta.toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </p>
            </div>
            <span className={`font-display font-extrabold text-2xl ${delivered ? "aurora-text" : "text-cyan"}`}>
              {t.track.steps[state.idx]}
            </span>
          </div>
        </div>

        {/* details */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="glass rounded-card p-8">
            <h3 className="font-display font-bold text-lg mb-5">{t.track.details}</h3>
            <ul className="space-y-3 text-sm">
              {[
                [t.track.product, product ? L(product.name) : data.product],
                [t.track.size, size ? `${size.name[lang]} — ${size.dim}` : "—"],
                [t.track.paper, paper ? paper.name[lang] : "—"],
                [t.track.finish, finish ? L(finish.name) : "—"],
                [t.track.qty, `${data.qty.toLocaleString()} ${product ? L(product.unit) : ""}`],
                [t.track.payment, payLabel],
              ].map(([k, v]) => (
                <li key={k as string} className="flex justify-between gap-4 border-b border-white/6 pb-3 last:border-0">
                  <span className="text-muted">{k}</span>
                  <span className="text-paper font-medium text-end">{v}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 pt-1">
                <span className="text-muted font-semibold">{t.track.total}</span>
                <span className="font-display font-extrabold text-xl text-paper">{formatMAD(data.total, lang)}</span>
              </li>
            </ul>
          </div>
          <div className="glass rounded-card p-8 flex flex-col justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-lg mb-2">
                {delivered ? "✓" : ""}
                {t.track.steps[delivered ? 6 : state.idx]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {delivered
                  ? lang === "ar"
                    ? "طلبك وصل. استمتع بالحبر الطازج — وأي ملاحظة، راسلنا على واتساب."
                    : lang === "fr"
                      ? "Votre commande est livrée. Profitez de l'encre fraîche — toute remarque, écrivez-nous sur WhatsApp."
                      : "Your order has arrived. Enjoy the fresh ink — any note, reach us on WhatsApp."
                  : t.track.demo && state.hours < 0.2
                    ? t.order.success.sub
                    : ""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button href="/order" magnetic className="flex-1">
                {t.track.newOrder}
                <Icon name="arrow" className="w-4 h-4 rtl-flip" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
