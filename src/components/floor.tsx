"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATALOG } from "@/lib/pricing";
import { Button, Icon, Reveal } from "./ui";
import type { FloorSnapshot, MachineState } from "@/lib/floor/engine";

const ROLE_LABEL: Record<string, { en: string; fr: string; ar: string }> = {
  print: { en: "Press", fr: "Impression", ar: "طباعة" },
  cut: { en: "Cutting", fr: "Découpe", ar: "قصّ" },
  finish: { en: "Finishing", fr: "Finition", ar: "تشطيب" },
};

function MachineCard({ m, i }: { m: MachineState; i: number }) {
  const { t, L, lang } = useI18n();
  const product = CATALOG.find((c) => c.id === m.product);
  const statusCls =
    m.status === "running"
      ? "bg-cyan/12 text-cyan"
      : m.status === "maintenance"
        ? "bg-gold/15 text-gold"
        : "bg-white/5 text-muted";

  return (
    <Reveal delay={i * 0.08}>
      <div className="glass rounded-card p-6 h-full relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display font-bold text-lg leading-tight">{m.name}</p>
            <p className="text-xs text-muted mt-1">
              {ROLE_LABEL[m.role]?.[lang] ?? m.role} · {m.protocol}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.status === "running" ? "bg-cyan pulse-glow" : m.status === "maintenance" ? "bg-gold" : "bg-muted"}`} />
            {m.status === "running" ? t.floor.running : m.status === "maintenance" ? t.floor.maintenance : t.floor.idle}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span>
              {t.floor.currentJob}
              {m.jobCode && (
                <span className="ms-2 font-mono tracking-widest text-cyan" dir="ltr">
                  {m.jobCode}
                </span>
              )}
            </span>
            <span className="tabular-nums text-paper/80">
              {m.jobCode && (
                <>
                  {m.sheetsDone.toLocaleString()} / {m.sheets.toLocaleString()} {t.floor.sheets}
                </>
              )}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full aurora-bg rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${Math.round(m.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-paper/80 truncate">{m.product ? L(product!.name) : "—"}</p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="font-display font-extrabold text-xl tabular-nums">{m.speed.toLocaleString()}</p>
            <p className="text-micro text-muted mt-0.5">{t.floor.speed}</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-xl tabular-nums">{m.ink}%</p>
            <p className="text-micro text-muted mt-0.5">{t.floor.ink}</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-xl tabular-nums">{m.temp}°</p>
            <p className="text-micro text-muted mt-0.5">{t.floor.temp}</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-xl tabular-nums">{m.uptime}%</p>
            <p className="text-micro text-muted mt-0.5">{t.floor.uptime}</p>
          </div>
        </div>

        <div className="mt-4 h-1 rounded-full bg-white/8 overflow-hidden" aria-hidden>
          <div
            className={`h-full rounded-full ${m.ink > 40 ? "bg-cyan" : "bg-magenta"}`}
            style={{ width: `${m.ink}%` }}
          />
        </div>
      </div>
    </Reveal>
  );
}

export function FloorDashboard() {
  const { t, L, lang } = useI18n();
  const [snap, setSnap] = useState<FloorSnapshot | null>(null);
  const [live, setLive] = useState(false);
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const fallback = async () => {
      try {
        const res = await fetch("/api/machines");
        if (res.ok) setSnap(await res.json());
      } catch {
        /* offline */
      }
    };
    void fallback();
    try {
      const es = new EventSource("/api/floor/stream");
      esRef.current = es;
      es.onmessage = (e) => {
        try {
          setSnap(JSON.parse(e.data) as FloorSnapshot);
          setLive(true);
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        setLive(false);
        es.close();
        void fallback();
      };
    } catch {
      void fallback();
    }
    return () => esRef.current?.close();
  }, []);

  const test = async () => {
    setTestState("testing");
    try {
      const res = await fetch("/api/machines");
      setTestState(res.ok ? "ok" : "fail");
    } catch {
      setTestState("fail");
    }
  };

  const totalSpeed = snap?.machines.reduce((s, m) => s + m.speed, 0) ?? 0;

  return (
    <div className="floor-dark relative min-h-screen bg-ink overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="absolute top-0 inset-x-0 h-px aurora-bg" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px aurora-bg" />
              <span className="text-cyan text-sm font-semibold tracking-[0.2em] uppercase">{t.floor.kicker}</span>
            </div>
            <h1 className="font-display font-extrabold uppercase text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] text-paper">
              {t.floor.title}
            </h1>
            <p className="mt-4 text-muted max-w-xl">{t.floor.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest ${
                live ? "bg-cyan/12 text-cyan" : "bg-white/5 text-muted"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${live ? "bg-cyan pulse-glow" : "bg-muted"}`} />
              {t.floor.live}
            </span>
            {snap && (
              <span className="text-xs text-muted tabular-nums hidden sm:block">
                {t.floor.updated}{" "}
                {new Date(snap.at).toLocaleTimeString(lang === "ar" ? "ar-MA" : "en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { v: snap ? snap.done24 : "—", l: t.floor.done24 },
            { v: snap ? snap.queue.length : "—", l: t.floor.inQueue },
            { v: snap ? totalSpeed.toLocaleString() : "—", l: t.floor.sh },
          ].map((s, i) => (
            <div key={i} className="glass rounded-3xl p-5 text-center">
              <p className="font-display font-extrabold text-3xl aurora-text tabular-nums">{s.v}</p>
              <p className="text-xs text-muted mt-1.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* machines */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {(snap?.machines ?? []).map((m, i) => (
            <MachineCard key={m.id} m={m} i={i} />
          ))}
          {!snap &&
            [0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-card p-6 animate-pulse">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-2.5 w-full rounded bg-white/5 mt-8" />
                <div className="h-3 w-24 rounded bg-white/5 mt-6" />
              </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* queue */}
          <div className="glass rounded-card p-6">
            <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-3">
              <Icon name="clock" className="w-5 h-5 text-cyan" />
              {t.floor.queue}
            </h3>
            {snap && snap.queue.length > 0 ? (
              <ul className="space-y-3">
                {snap.queue.map((q) => {
                  const product = CATALOG.find((c) => c.id === q.product);
                  return (
                    <li key={q.code} className="flex items-center gap-4 rounded-2xl border border-white/8 px-4 py-3">
                      <span className="font-mono text-xs tracking-widest text-cyan" dir="ltr">
                        {q.code}
                      </span>
                      <span className="text-sm text-paper/85 flex-1 truncate">
                        {product ? L(product.name) : q.product}
                      </span>
                      <span className="text-xs text-muted tabular-nums">
                        {q.sheets.toLocaleString()} {t.floor.sheets}
                      </span>
                      <span className="text-xs text-paper/70 tabular-nums">
                        {t.floor.eta}{" "}
                        {new Date(q.eta).toLocaleTimeString(lang === "ar" ? "ar-MA" : "en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted py-8 text-center">{t.floor.none}</p>
            )}
          </div>

          {/* gateway */}
          <div className="glass rounded-card p-6">
            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-3">
              <Icon name="zap" className="w-5 h-5 text-cyan" />
              {t.floor.gateway}
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">{t.floor.gatewaySub}</p>
            <div className="space-y-2 text-sm">
              {[
                [t.floor.adapter, "SIM → Indigo Web Services / Zünd OPC-UA / Modbus TCP"],
                ["GET /api/machines", "snapshot"],
                ["GET /api/floor/stream", "SSE · 2s"],
                ["POST /api/orders", "→ jobs queue"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-2.5">
                  <span className="font-mono text-xs text-paper/85" dir="ltr">
                    {k}
                  </span>
                  <span className="text-xs text-muted">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <Button onClick={test} variant="glass" disabled={testState === "testing"}>
                <Icon name="zap" className="w-4 h-4" />
                {testState === "testing" ? t.floor.testing : t.floor.test}
              </Button>
              {testState === "ok" && (
                <span className="text-xs text-cyan flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5" />
                  {t.floor.connected}
                </span>
              )}
              {testState === "fail" && (
                <span className="text-xs text-magenta flex items-center gap-1.5">
                  <Icon name="x" className="w-3.5 h-3.5" />
                  {t.floor.failed}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          {t.floor.job} → VLR → JB · {t.floor.done24}: {snap ? snap.done24 : "—"}
        </p>
      </div>
    </div>
  );
}
