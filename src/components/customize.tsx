"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATALOG, FINISHES, calculatePrice, formatMAD, type FinishId } from "@/lib/pricing";
import { Button, Icon, Badge, Field, inputCls, Reveal, PriceCounter, playPressClick, useSound } from "@/components/ui";
import { useToast } from "@/components/notify";
import { useAuth } from "@/components/notify";
import { pushDeviceCode } from "@/lib/store";
import type { MockupProduct } from "@/components/canvas/PrintEditor";

/* the editor is heavy — only downloaded on this page */
const PrintEditor = dynamic(
  () => import("@/components/canvas/PrintEditor").then((m) => m.PrintEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-tile border border-brand/12 bg-[#eef3fa] animate-pulse" style={{ aspectRatio: "1 / 0.82" }} />
    ),
  },
);

/* --------------------------------------------------------------
   Mockup catalogue. Defaults ship with the app; the admin can
   override every field (image, view, print area, DPI, formats)
   from /admin → Product mockups via the product_mockups table.
   -------------------------------------------------------------- */
const MOCKUPS: (MockupProduct & { key: string; label: string; productId: string })[] = [
  { key: "tshirt-front", label: "T-Shirt · Front", productId: "tshirts", id: "tshirt", name: "T-Shirt", view: "front", image: "/images/products/tshirts.jpg", area: { x: 24, y: 16, w: 52, h: 52 }, maxWidthCm: 30, maxHeightCm: 40, minWidthDpi: 300, formats: "png,jpg,jpeg,svg,pdf" },
  { key: "tshirt-back", label: "T-Shirt · Back", productId: "tshirts", id: "tshirt", name: "T-Shirt", view: "back", image: "/images/products/tshirts.jpg", area: { x: 24, y: 16, w: 52, h: 52 }, maxWidthCm: 30, maxHeightCm: 40, minWidthDpi: 300, formats: "png,jpg,jpeg,svg,pdf" },
  { key: "sticker", label: "Sticker Sheet", productId: "stickers", id: "sticker", name: "Sticker Sheet", view: "front", image: "/images/products/stickers.jpg", area: { x: 12, y: 12, w: 76, h: 76 }, maxWidthCm: 20, maxHeightCm: 28, minWidthDpi: 300, formats: "png,jpg,jpeg,svg,pdf" },
  { key: "poster", label: "Poster", productId: "posters", id: "poster", name: "Poster", view: "front", image: "/images/products/posters.jpg", area: { x: 8, y: 8, w: 84, h: 84 }, maxWidthCm: 60, maxHeightCm: 90, minWidthDpi: 150, formats: "png,jpg,jpeg,svg,pdf" },
  { key: "box", label: "Packaging Box", productId: "packaging", id: "box", name: "Packaging Box", view: "front", image: "/images/products/packaging.jpg", area: { x: 16, y: 20, w: 58, h: 52 }, maxWidthCm: 18, maxHeightCm: 12, minWidthDpi: 300, formats: "png,jpg,jpeg,svg,pdf" },
  { key: "banner", label: "Roll-up Banner", productId: "roll-ups", id: "banner", name: "Roll-up Banner", view: "front", image: "/images/products/roll-ups.jpg", area: { x: 12, y: 10, w: 76, h: 72 }, maxWidthCm: 85, maxHeightCm: 200, minWidthDpi: 150, formats: "png,jpg,jpeg,svg,pdf" },
];

const VIEWS = ["front", "back"] as const;

export function Customize() {
  const { t, L, lang } = useI18n();
  const toast = useToast();
  const { user, open: openAuth } = useAuth();
  const { enabled: soundOn } = useSound();

  const [key, setKey] = useState(MOCKUPS[0].key);
  const mockup = useMemo(() => MOCKUPS.find((m) => m.key === key)!, [key]);
  const catalogProduct = CATALOG.find((c) => c.id === mockup.productId)!;

  const [qty, setQty] = useState(catalogProduct.minQty);
  const [sizeId, setSizeId] = useState(catalogProduct.sizes[0].id);
  const [finishId, setFinishId] = useState<FinishId>("matte");
  const [side, setSide] = useState<(typeof VIEWS)[number]>("front");
  const [design, setDesign] = useState<{ layers: number; json: string | null }>({ layers: 0, json: null });
  const [checked, setChecked] = useState({ placement: false, colors: false });
  const [showProof, setShowProof] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    setQty(catalogProduct.minQty);
    setSizeId(catalogProduct.sizes[0].id);
  }, [catalogProduct]);

  const bp = calculatePrice({
    product: catalogProduct.id,
    sizeId,
    paperId: catalogProduct.papers[0].id,
    finishId,
    qty,
  });

  const currentMockup: MockupProduct = { ...mockup, view: side };

  const submit = async () => {
    if (!user) {
      openAuth("register");
      toast.info("Create your account", "Your design is kept and the order is filed under your name.");
      return;
    }
    if (!checked.placement || !checked.colors) {
      toast.error("Print proof", "Please confirm both statements before ordering.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone ?? "+212600000000",
          city: "—",
          address: "customizer",
          payment: "cod",
          notes: `Customizer · ${mockup.label} · ${side} · ${design.layers} layer(s)`,
          config: {
            product: catalogProduct.id,
            sizeId,
            paperId: catalogProduct.papers[0].id,
            finishId,
            qty,
            express: false,
            zoneId: "a",
            artworkName: `custom:${mockup.key}`,
          },
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCode(d.code);
      pushDeviceCode(d.code);
      if (soundOn) playPressClick();
      toast.push({
        kind: "order",
        title: `Order #${d.code} created successfully.`,
        body: `${mockup.label} · ${qty} × ${L(catalogProduct.unit)}`,
        href: `/track/${d.code}`,
        hrefLabel: t.account.track,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong. Please try again.", "Your work is kept on this device.");
    } finally {
      setPlacing(false);
    }
  };

  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-32">
        <div className="max-w-lg w-full rounded-[30px] bg-white border border-brand/12 p-10 text-center shadow-[0_50px_100px_-40px_rgba(11,99,214,0.5)]">
          <span className="mx-auto flex w-16 h-16 rounded-full aurora-bg items-center justify-center text-white pulse-glow">
            <Icon name="check" className="w-8 h-8" />
          </span>
          <h1 className="mt-6 font-display font-extrabold text-3xl text-navy">Order created</h1>
          <p className="mt-2 text-ink-muted">Your file is in the queue.</p>
          <p className="mt-6 font-display font-extrabold text-3xl aurora-text tracking-widest" dir="ltr">
            #{code}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button href={`/track/${code}`} magnetic className="flex-1">{t.account.track}</Button>
            <Button href="/customize" variant="ghost" className="flex-1">New design</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-[3px] rounded-full aurora-bg" />
            <span className="text-brand text-xs font-bold tracking-[0.28em] uppercase">Print customizer</span>
          </div>
          <h1 className="font-display font-extrabold text-[clamp(2.15rem,5vw,4rem)] leading-[1.03] tracking-[-0.03em] text-navy uppercase">
            {t.hero.h1}
          </h1>
        </Reveal>

        {offline && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber/40 bg-amber/[0.12] px-4 py-3 text-sm text-[#8a6100]">
            <Icon name="zap" className="w-4 h-4 mt-0.5 shrink-0" />
            Offline — your changes are temporarily stored on this device. They will sync when the connection returns.
          </div>
        )}

        {/* product / view switcher */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {MOCKUPS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setKey(m.key);
                setSide("front");
              }}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
                key === m.key
                  ? "aurora-bg text-white border-transparent shadow-[0_12px_28px_-12px_rgba(11,99,214,0.85)]"
                  : "bg-white text-ink-muted border-brand/15 hover:border-brand/45"
              }`}
              aria-pressed={key === m.key}
            >
              {m.label}
            </button>
          ))}
          {mockup.id === "tshirt" && (
            <span className="ms-auto flex items-center gap-2">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  onClick={() => setSide(v)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border transition-all cursor-pointer ${
                    side === v
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-ink-muted border-brand/15"
                  }`}
                  aria-pressed={side === v}
                >
                  {v === "front" ? "Front" : "Back"}
                </button>
              ))}
            </span>
          )}
        </div>

        <div className="mt-7 grid lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
          {/* editor */}
          <div>
            <PrintEditor product={currentMockup} />
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="rounded-tile bg-white border border-brand/12 p-6 shadow-[0_28px_70px_-42px_rgba(16,42,90,0.55)]">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Icon name="printer" className="w-5 h-5 text-brand" /> Live summary
              </h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  ["Product", mockup.name],
                  ["Service", "DTF / Digital print"],
                  ["Size", catalogProduct.sizes.find((s) => s.id === sizeId)!.name[lang]],
                  ["Colour", "Black"],
                  ["Print position", side === "front" ? "Front" : "Back"],
                  ["Design", design.layers > 0 ? `${design.layers} layer(s)` : "—"],
                  ["Production", `${bp.days} days`],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3">
                    <dt className="text-ink-faint">{k}</dt>
                    <dd className="text-navy font-medium text-end">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Field label="Size">
                  <select className={inputCls} value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
                    {catalogProduct.sizes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name[lang]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input
                    type="number"
                    className={inputCls}
                    min={catalogProduct.minQty}
                    step={catalogProduct.step}
                    value={qty}
                    onChange={(e) => setQty(Math.max(catalogProduct.minQty, Number(e.target.value)))}
                  />
                </Field>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {FINISHES.slice(0, 5).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFinishId(f.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      finishId === f.id
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-ink-muted border-brand/15"
                    }`}
                    aria-pressed={finishId === f.id}
                  >
                    {L(f.name)}
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-brand/10">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-ink-muted">Estimated price</span>
                  <span className="font-display font-extrabold text-3xl text-navy">
                    <PriceCounter value={bp.total} lang={lang} />
                    <span className="text-sm font-normal text-ink-faint ms-1.5">{t.common.mad}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-faint tabular-nums">
                  {formatMAD(bp.unit, lang)} / {L(catalogProduct.unit)}
                </p>
              </div>
            </div>

            {/* print proof */}
            <div className="rounded-tile bg-white border border-brand/12 p-6 shadow-[0_28px_70px_-42px_rgba(16,42,90,0.55)]">
              <div className="flex items-center gap-2">
                <Badge className="!bg-magenta/10 !text-[#c2185b] !border-magenta/25">PRINT PROOF</Badge>
                <button
                  onClick={() => setShowProof(true)}
                  className="text-xs font-semibold text-brand hover:underline cursor-pointer ms-auto"
                >
                  Preview
                </button>
              </div>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                This is a digital preview of your order.
              </p>
              <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.placement}
                  onChange={(e) => setChecked({ ...checked, placement: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-brand"
                />
                <span className="text-sm text-ink-subtle">I reviewed the design and placement.</span>
              </label>
              <label className="mt-2.5 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.colors}
                  onChange={(e) => setChecked({ ...checked, colors: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-brand"
                />
                <span className="text-sm text-ink-subtle">
                  I understand that screen colours may differ from printed colours.
                </span>
              </label>
              <Button
                onClick={() => void submit()}
                disabled={placing}
                magnetic
                size="lg"
                className="w-full mt-5"
              >
                {placing ? "Sending…" : user ? "Confirm Design & Order" : "Create account & order"}
                {!placing && <Icon name="arrow" className="w-5 h-5 rtl-flip" />}
              </Button>
              <p className="mt-3 text-caption text-ink-faint leading-relaxed">
                By ordering you confirm you hold the rights to the artwork you upload.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* clean preview mode */}
      {showProof && (
        <div
          className="fixed inset-0 z-[200] bg-navy/92 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowProof(false)}
        >
          <button
            className="absolute top-5 end-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
            onClick={() => setShowProof(false)}
            aria-label="Close"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
          <figure className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-card overflow-hidden border border-white/15">
              <img src={currentMockup.image} alt="" className="w-full max-h-[72vh] object-contain bg-white" />
            </div>
            <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-white/70 text-xs tracking-[0.22em] uppercase">PRINT PROOF</p>
                <p className="text-white font-display font-bold text-xl mt-1">
                  {mockup.name} · {side === "front" ? "Front" : "Back"} · {qty.toLocaleString()}
                </p>
              </div>
              <Button magnetic onClick={() => setShowProof(false)}>Continue to Order</Button>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
