"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import {
  CATALOG,
  FINISHES,
  ZONES,
  TIERS,
  calculatePrice,
  tierFor,
  formatMAD,
  type Product,
  type Finish,
} from "@/lib/pricing";
import { useConfig, useCart, pushDeviceCode } from "@/lib/store";
import { Button, Icon, Badge, PriceCounter, Field, inputCls, useSound, Logo, playPressClick } from "./ui";

/* paper preview tints */
const PAPER_TINTS: Record<string, string> = {
  std300: "#d9d3c5",
  silk350: "#e6e1d4",
  kraft: "#b3854f",
  coated135: "#ece9e1",
  coated170: "#ece9e1",
  coated250: "#eae7de",
  std170: "#ded9cc",
  photo230: "#e8e5dc",
  canvas: "#c9c2b2",
  vinyl: "#d7d7d9",
  clear: "rgba(180,210,255,0.4)",
  metallic: "linear-gradient(135deg,#8e8e98,#d8d8e0 45%,#77777f 70%,#b9b9c4)",
  c350: "#c7a877",
  rigid: "#e6e1d4",
  cotton: "#1d1d25",
  premium: "#14141a",
  pp440: "#e0ddd4",
  mesh: "#d4d1c8",
  coated150: "#ece9e1",
  uncoated120: "#d9d3c5",
  luxe: "#cfc4a5",
};

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Meknes",
  "Oujda", "Kenitra", "Mohammedia", "Salé", "Tetouan", "Other",
];

/* ================= 3D PREVIEW ================= */

function Preview3D() {
  const { L, lang } = useI18n();
  const c = useConfig();
  const reduced = useReducedMotion();
  const product = CATALOG.find((p) => p.id === c.product)!;
  const finish = FINISHES.find((f) => f.id === c.finishId)!;
  const paper = product.papers.find((p) => p.id === c.paperId) ?? product.papers[0];
  const [face, setFace] = useState<"front" | "back">("front");
  const [light, setLight] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFace("front");
  }, [c.product]);

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const base = face === "back" ? 180 : 0;
    ref.current.style.transform = `rotateY(${base + (px - 0.5) * 26}deg) rotateX(${(0.5 - py) * 22}deg)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    const base = face === "back" ? 180 : 0;
    ref.current.style.transform = `rotateY(${base}deg) rotateX(0deg)`;
  };

  const tint = PAPER_TINTS[paper.id] ?? "#d9d3c5";
  const dieCut = c.finishId === "die-cut";

  const finishOverlay = (() => {
    switch (c.finishId) {
      case "gloss":
        return <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, transparent 32%, rgba(255,255,255,0.38) 46%, transparent 60%)" }} />;
      case "soft-touch":
        return <div className="absolute inset-0" style={{ background: "radial-gradient(90% 90% at 30% 20%, rgba(255,255,255,0.1), transparent 60%)" }} />;
      case "spot-uv":
        return <div className="absolute inset-0" style={{ background: "radial-gradient(45% 38% at 64% 36%, rgba(255,255,255,0.45), transparent 70%)" }} />;
      case "holo-foil":
        return (
          <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[7rem] holo bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(0,240,255,0.4)]">
            V
          </span>
        );
      case "gold-foil":
        return (
          <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[7rem] text-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" style={{ textShadow: "0 1px 0 #fff5, 0 -1px 0 #0008" }}>
            V
          </span>
        );
      case "emboss":
        return (
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[7rem]"
            style={{ color: "rgba(0,0,0,0.18)", textShadow: "0 2px 3px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.35)" }}
          >
            V
          </span>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="relative select-none" style={{ perspective: "1200px" }}>
      <div
        className="absolute -inset-10 rounded-full blur-3xl opacity-30 aurora-bg"
        aria-hidden
      />
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative mx-auto w-64 h-80 md:w-72 md:h-[22rem] transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 overflow-hidden shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7)]"
          style={{
            background: tint,
            transform: "translateZ(1px)",
            borderRadius: dieCut ? 0 : 24,
            clipPath: dieCut
              ? "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)"
              : undefined,
          }}
        >
          <div className="absolute inset-0 halftone opacity-[0.12]" />
          {c.artworkSource === "designer" ? (
            <div className="absolute inset-0 flex flex-col justify-between p-5" style={{ background: c.design.accent }}>
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-ink text-sm tracking-tight">VÉLORA</span>
                <span className="w-6 h-6 rounded-full bg-ink/80" />
              </div>
              <div>
                <p className="font-display font-extrabold text-ink text-3xl leading-[1.05] break-words">
                  {c.design.headline || "…"}
                </p>
                <p className="mt-2 text-ink/70 text-sm">{c.design.subline}</p>
              </div>
              <div className="flex gap-1.5">
                {[...Array(18)].map((_, i) => (
                  <span key={i} className="h-4 w-1 bg-ink/50 rounded-full" />
                ))}
              </div>
            </div>
          ) : imgUrl ? (
            <img src={imgUrl} alt="Your artwork" className="absolute inset-0 w-full h-full object-cover" />
          ) : c.artworkUrl && /\.(png|jpe?g|webp|svg)$/i.test(c.artworkUrl) ? (
            <img src={c.artworkUrl} alt="Your artwork" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={product.image}
                alt=""
                className="w-full h-full object-cover opacity-90 rounded-lg"
                style={{ filter: "brightness(0.85) contrast(1.05)" }}
              />
            </div>
          )}
          {finishOverlay}
          {light && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }} />
          )}
        </div>
        {/* BACK */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: tint,
            transform: "rotateY(180deg) translateZ(1px)",
            borderRadius: dieCut ? 0 : 24,
            clipPath: dieCut
              ? "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)"
              : undefined,
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <span className="font-display font-extrabold text-2xl opacity-20" dir="ltr">VÉLORA</span>
            <div className="w-28 h-10 flex flex-col justify-center gap-1 opacity-20">
              <span className="h-px bg-ink w-full" />
              <span className="h-1 bg-ink w-2/3 self-center" />
              <span className="h-px bg-ink w-full" />
              <span className="h-0.5 bg-ink w-1/2 self-center" />
            </div>
            <span className="text-[10px] tracking-[0.3em] opacity-25" dir="ltr">PRINTED IN MOROCCO</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setFace(face === "front" ? "back" : "front")}
          className="flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors cursor-pointer"
        >
          <Icon name="flip" className="w-4 h-4" />
          {face === "front" ? "Back" : "Front"}
        </button>
        <span className="w-px h-4 bg-white/15" />
        <button
          onClick={() => setLight(!light)}
          className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${light ? "text-cyan" : "text-muted hover:text-cyan"}`}
          aria-pressed={light}
        >
          <Icon name="sun" className="w-4 h-4" />
          Light
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {L(product.name)} · {paper.name[lang]} · {finish.name[lang]}
      </p>
    </div>
  );
}

/* ================= STEP PANELS ================= */

function OptionCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-2xl border p-4 text-start transition-all duration-300 cursor-pointer ${
        selected
          ? "border-cyan/70 bg-cyan/[0.06] shadow-[0_0_0_1px_rgba(0,240,255,0.4),0_0_30px_-8px_rgba(0,240,255,0.35)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      } ${className}`}
    >
      {children}
      <span
        className={`absolute top-3 end-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
          selected ? "aurora-bg border-transparent text-ink" : "border-white/20 text-transparent"
        }`}
      >
        <Icon name="check" className="w-3 h-3" />
      </span>
    </button>
  );
}

function ProductStep() {
  const { L } = useI18n();
  const c = useConfig();
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {CATALOG.map((p) => (
        <OptionCard
          key={p.id}
          selected={c.product === p.id}
          onClick={() =>
            c.set({
              product: p.id,
              sizeId: p.sizes[0].id,
              paperId: p.papers[0].id,
              qty: Math.max(c.qty, p.minQty),
            })
          }
        >
          <div className="flex gap-3">
            <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-sm">{L(p.name)}</p>
              <p className="text-xs text-muted mt-1 line-clamp-1">{L(p.tagline)}</p>
            </div>
          </div>
        </OptionCard>
      ))}
    </div>
  );
}

function SizeStep() {
  const { L, lang } = useI18n();
  const c = useConfig();
  const product = CATALOG.find((p) => p.id === c.product)!;
  return (
    <div className="grid gap-3">
      {product.sizes.map((s) => (
        <OptionCard key={s.id} selected={c.sizeId === s.id} onClick={() => c.set({ sizeId: s.id })}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{s.name[lang]}</p>
              <p className="text-xs text-muted mt-0.5" dir="ltr">{s.dim}</p>
            </div>
            <span className="text-xs text-cyan tabular-nums">×{s.factor}</span>
          </div>
        </OptionCard>
      ))}
    </div>
  );
}

function PaperStep() {
  const { lang } = useI18n();
  const c = useConfig();
  const product = CATALOG.find((p) => p.id === c.product)!;
  return (
    <div className="grid gap-3">
      {product.papers.map((pp) => (
        <OptionCard key={pp.id} selected={c.paperId === pp.id} onClick={() => c.set({ paperId: pp.id })}>
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-lg border border-white/15 shrink-0" style={{ background: PAPER_TINTS[pp.id] ?? "#ccc" }} />
            <div>
              <p className="font-semibold">{pp.name[lang]}</p>
              <p className="text-xs text-muted mt-0.5">{pp.spec}</p>
            </div>
          </div>
        </OptionCard>
      ))}
    </div>
  );
}

function FinishStep() {
  const { L } = useI18n();
  const c = useConfig();
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {FINISHES.map((f: Finish) => (
        <OptionCard key={f.id} selected={c.finishId === f.id} onClick={() => c.set({ finishId: f.id })}>
          <div className={`h-14 rounded-lg mb-3 shine-sweep ${f.mat}`} />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{L(f.name)}</p>
            {f.premium ? <Badge gold>+</Badge> : f.factor > 1 ? <span className="text-xs text-cyan">+{Math.round((f.factor - 1) * 100)}%</span> : <span className="text-xs text-muted">—</span>}
          </div>
        </OptionCard>
      ))}
    </div>
  );
}

function QtyStep() {
  const { t, L } = useI18n();
  const c = useConfig();
  const product = CATALOG.find((p) => p.id === c.product)!;
  const presets = useMemo(
    () =>
      [1, 2, 5, 10, 25]
        .map((m) => Math.max(product.minQty, product.minQty * m))
        .filter((v, i, a) => a.indexOf(v) === i),
    [product],
  );
  const tier = tierFor(c.qty);
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-end justify-between mb-3">
          <span className="text-sm text-muted">{t.order.qty}</span>
          <span className="font-display font-extrabold text-4xl text-paper tabular-nums">
            {c.qty.toLocaleString()} <span className="text-base font-body font-medium text-muted">{L(product.unit)}</span>
          </span>
        </div>
        <input
          type="range"
          min={product.minQty}
          max={Math.max(product.minQty * 25, 5000)}
          step={product.step}
          value={c.qty}
          onChange={(e) => c.set({ qty: Number(e.target.value) })}
          className="w-full accent-cyan cursor-pointer"
          aria-label={t.order.qty}
        />
        <div className="flex justify-between text-small text-muted mt-2">
          <span>{product.minQty.toLocaleString()}</span>
          <span>{Math.max(product.minQty * 25, 5000).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => c.set({ qty: p })}
            className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${
              c.qty === p ? "aurora-bg text-ink border-transparent" : "border-white/12 text-paper/70 hover:border-cyan/40"
            }`}
          >
            {p.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-muted">{t.order.tier}</span>
        <span className="font-semibold text-cyan tabular-nums">
          −{Math.round((1 - tier.factor) * 100)}%
        </span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        {TIERS.map((tr) => (
          <span key={tr.min} className={c.qty >= tr.min ? "text-cyan" : ""}>
            {tr.min >= 1000 ? `${tr.min / 1000}k` : tr.min} −{Math.round((1 - tr.factor) * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---- artwork ---- */

function ArtworkStep() {
  const { t, lang } = useI18n();
  const c = useConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [colorNote, setColorNote] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [fileErr, setFileErr] = useState(false);

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const applyFile = async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const ok = ["pdf", "png", "jpg", "jpeg", "ai", "svg"].includes(ext);
    if (!ok || f.size > 50 * 1024 * 1024) {
      setFileErr(true);
      return;
    }
    setFileErr(false);
    c.set({ artworkName: f.name, artworkSource: "file", autofixed: false, artworkUrl: null });
    setColorNote(false);
    // real upload to the studio server
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.ok) c.set({ artworkUrl: d.url });
    } catch {
      /* keep going — studio can request the file by phone */
    }
    if (["png", "jpg", "jpeg", "svg"].includes(ext)) {
      const url = URL.createObjectURL(f);
      setImgUrl(url);
      const img = new Image();
      img.onload = () => {
        try {
          const cv = document.createElement("canvas");
          const s = 48;
          cv.width = s;
          cv.height = s;
          const ctx = cv.getContext("2d")!;
          ctx.drawImage(img, 0, 0, s, s);
          const data = ctx.getImageData(0, 0, s, s).data;
          const buckets = new Array(12).fill(0) as number[];
          const sums = new Array(12).fill(0) as number[];
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const l = (max + min) / 2;
            if (l < 30 || l > 235) continue;
            const sat = max === min ? 0 : (max - min) / (255 - Math.abs(2 * l - 125));
            if (sat < 0.2) continue;
            let h = 0;
            if (max === r) h = ((g - b) / (max - min)) % 6;
            else if (max === g) h = (b - r) / (max - min) + 2;
            else h = (r - g) / (max - min) + 4;
            h = (h / 6) * 360;
            if (h < 0) h += 360;
            const bin = Math.floor(h / 30) % 12;
            buckets[bin] += 1;
            sums[bin] += h;
          }
          const top = buckets
            .map((v, i) => ({ v, h: sums[i] / Math.max(1, v) }))
            .sort((a, b) => b.v - a.v)
            .filter((x) => x.v > 2);
          if (top.length >= 1) {
            const hslToHex = (h: number, s: number, l: number) => {
              const a = s * Math.min(l, 1 - l);
              const f = (n: number) => {
                const k = (n + h / 30) % 12;
                const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
                return Math.round(255 * c).toString(16).padStart(2, "0");
              };
              return `#${f(0)}${f(8)}${f(4)}`;
            };
            const root = document.documentElement;
            const mix = (a: string, b: string, t: number) => {
              const pa = parseInt(a.slice(1), 16);
              const pb = parseInt(b.slice(1), 16);
              const ch = (sh: number) =>
                Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t).toString(16).padStart(2, "0");
              return `#${ch(16)}${ch(8)}${ch(0)}`;
            };
            const cs = getComputedStyle(root);
            const curA = cs.getPropertyValue("--tint-a").trim() || "#7b2ff7";
            const h1 = top[0].h;
            const h2 = (h1 + 160) % 360;
            root.style.setProperty("--tint-a", mix(curA, hslToHex(h1, 0.85, 0.55), 0.45));
            root.style.setProperty("--tint-b", mix("#00f0ff", hslToHex(h2, 0.9, 0.6), 0.45));
            setColorNote(true);
          }
        } catch {
          /* canvas blocked — skip tinting */
        }
      };
      img.src = url;
    }
  };

  const ext = c.artworkName ? c.artworkName.split(".").pop()?.toLowerCase() : null;
  const vectorish = ["pdf", "ai", "svg"].includes(ext ?? "");
  const checks = [
    { label: t.order.artwork.dpi, ok: c.autofixed || !vectorish || true, warn: false },
    { label: t.order.artwork.bleed, ok: true, warn: false },
    { label: t.order.artwork.cmyk, ok: c.autofixed || !vectorish, warn: !c.autofixed && vectorish },
    { label: t.order.artwork.fonts, ok: true, warn: false },
  ];

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) applyFile(f);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          drag ? "border-cyan bg-cyan/10 scale-[1.01]" : c.artworkName ? "border-cyan/40 bg-cyan/[0.04]" : "border-white/15 hover:border-white/30"
        }`}
      >
        <Icon name="upload" className="w-8 h-8 mx-auto text-cyan mb-3" />
        <p className="font-semibold">{c.artworkName ?? t.order.artwork.dropTitle}</p>
        <p className="text-sm text-muted mt-1">{t.order.artwork.dropSub}</p>
        {fileErr && <p className="text-sm text-magenta mt-2">{t.order.artwork.dropSub}</p>}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) applyFile(f);
          }}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button variant="glass" size="sm" onClick={() => fileRef.current?.click()}>
            {t.order.artwork.browse}
          </Button>
          <Button
            variant={showDesigner ? "aurora" : "ghost"}
            size="sm"
            onClick={() => setShowDesigner(!showDesigner)}
          >
            <Icon name="sparkle" className="w-4 h-4" />
            {t.order.designer.title.split("—")[0].trim()}
          </Button>
        </div>
      </div>

      {c.artworkSource === "file" && c.artworkUrl && (
        <p className="flex items-center gap-2 text-sm text-cyan">
          <Icon name="check" className="w-4 h-4" />
          {t.order.artwork.sent}
        </p>
      )}
      {c.artworkSource === "designer" && (
        <p className="flex items-center gap-2 text-sm text-cyan">
          <Icon name="check" className="w-4 h-4" />
          {t.order.artwork.designed}
        </p>
      )}
      {colorNote && (
        <p className="flex items-center gap-2 text-sm text-cyan">
          <Icon name="droplet" className="w-4 h-4" />
          {t.order.artwork.auroraNote}
        </p>
      )}

      <AnimatePresence>
        {showDesigner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 space-y-4">
              <p className="font-display font-bold">{t.order.designer.title}</p>
              <input
                className={inputCls}
                value={c.design.headline}
                maxLength={28}
                onChange={(e) => c.set({ design: { ...c.design, headline: e.target.value } })}
                placeholder={t.order.designer.headline}
                aria-label={t.order.designer.headline}
              />
              <input
                className={inputCls}
                value={c.design.subline}
                maxLength={48}
                onChange={(e) => c.set({ design: { ...c.design, subline: e.target.value } })}
                placeholder={t.order.designer.subline}
                aria-label={t.order.designer.subline}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{t.order.designer.accent}</span>
                {["#7B2FF7", "#00F0FF", "#FF2E93", "#D4AF37", "#0A0A0F"].map((col) => (
                  <button
                    key={col}
                    onClick={() => c.set({ design: { ...c.design, accent: col } })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                      c.design.accent === col ? "border-cyan scale-110" : "border-white/20"
                    }`}
                    style={{ background: col }}
                    aria-label={col}
                    aria-pressed={c.design.accent === col}
                  />
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  c.set({
                    artworkSource: "designer",
                    artworkName: "velora-studio-design.png",
                  });
                  setShowDesigner(false);
                }}
              >
                {t.order.designer.use}
                <Icon name="check" className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {c.artworkName && c.artworkSource === "file" && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold flex items-center gap-2">
              <Icon name="file" className="w-4 h-4 text-cyan" />
              {t.order.artwork.preflight}
            </p>
            <Button
              variant={c.autofixed ? "ghost" : "glass"}
              size="sm"
              onClick={() => c.set({ autofixed: true })}
              disabled={c.autofixed}
            >
              <Icon name="zap" className="w-4 h-4" />
              {c.autofixed ? t.order.artwork.fixed : t.order.artwork.autofix}
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {checks.map((ch, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {ch.warn ? (
                  <span className="w-5 h-5 rounded-full bg-magenta/15 text-magenta flex items-center justify-center shrink-0">
                    <Icon name="sparkle" className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-cyan/15 text-cyan flex items-center justify-center shrink-0">
                    <Icon name="check" className="w-3 h-3" />
                  </span>
                )}
                <span className={ch.warn ? "text-magenta/90" : "text-paper/80"}>{ch.label}</span>
              </li>
            ))}
          </ul>
          {!c.autofixed && vectorish ? (
            <p className="mt-4 text-xs text-magenta/90 leading-relaxed">{t.order.artwork.warning}</p>
          ) : (
            <p className="mt-4 text-xs text-cyan leading-relaxed">{t.order.artwork.ok}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- review ---- */

interface FormState {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  payment: "advance" | "cod" | "card";
  ribSender: string;
  receipt: string | null;
  notes: string;
}

function ReviewStep({
  onPlaced,
  placing,
  total,
}: {
  onPlaced: (code: string) => void;
  placing: boolean;
  total: number;
}) {
  const { t, L, lang } = useI18n();
  const c = useConfig();
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    city: CITIES[0],
    address: "",
    payment: "advance",
    ribSender: "",
    receipt: null,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLInputElement>(null);

  const RIB = "230590516317321101540030";
  const ADVANCE_HOLDER = "SAID ABOUSSOURHRA";
  const advance = Math.round(total * 0.2 * 100) / 100;

  const copyRib = () => {
    navigator.clipboard?.writeText(RIB).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onReceipt = async (f: File | undefined) => {
    if (!f) return;
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.ok) setForm((s) => ({ ...s, receipt: d.url }));
    } catch {
      /* ignore */
    }
  };

  const submit = async () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = t.order.required;
    if (!/^[+0-9()\s-]{8,}$/.test(form.phone)) errs.phone = t.order.badPhone;
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t.order.required;
    if (!form.address.trim()) errs.address = t.order.required;
    if (form.payment === "advance" && !form.ribSender.trim()) errs.ribSender = t.order.required;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.city,
          address: form.address,
          payment: form.payment,
          ribSender: form.payment === "advance" ? form.ribSender : null,
          receipt: form.payment === "advance" ? form.receipt : null,
          artworkUrl: c.artworkUrl,
          notes: form.notes,
          config: {
            product: c.product,
            sizeId: c.sizeId,
            paperId: c.paperId,
            finishId: c.finishId,
            qty: c.qty,
            express: c.express,
            zoneId: c.zoneId,
            artworkName: c.artworkName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "fail");
      onPlaced(data.code as string);
    } catch {
      setErrors({ name: "—" });
    }
  };

  const pays = [
    { id: "advance" as const, label: t.pay.advance, icon: "bank", badge: "20%" },
    { id: "cod" as const, label: t.pay.cod, icon: "cash", badge: null },
    { id: "card" as const, label: t.pay.card, icon: "card", badge: null },
  ];

  return (
    <div className="space-y-6">
      <p className="font-display text-2xl font-bold">{t.order.review.title}</p>
      <p className="text-sm text-muted -mt-4">{t.order.review.contact}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t.order.review.name} error={errors.name}>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t.order.review.phone} error={errors.phone}>
          <input className={inputCls} dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6 61 00 00 00" />
        </Field>
        <Field label={t.order.review.email}>
          <input className={inputCls} type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label={t.order.review.city}>
          <select className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
            {CITIES.map((city) => (
              <option key={city} value={city} className="bg-ink-2">{city}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t.order.review.address} error={errors.address}>
        <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </Field>
      <div>
        <span className="block text-sm font-medium text-paper/70 mb-2">{t.order.review.pay}</span>
        <div className="grid grid-cols-3 gap-2">
          {pays.map((p) => (
            <OptionCard key={p.id} selected={form.payment === p.id} onClick={() => setForm({ ...form, payment: p.id })}>
              <div className="flex items-center gap-2 text-sm">
                <Icon name={p.icon} className="w-5 h-5 text-cyan shrink-0" />
                <span className="leading-tight">{p.label}</span>
              </div>
              {p.badge && <span className="mt-2 inline-block rounded-full aurora-bg text-ink text-[0.65rem] font-bold px-2 py-0.5">{p.badge}</span>}
            </OptionCard>
          ))}
        </div>
      </div>

      {form.payment === "advance" && (
        <div className="glass rounded-2xl p-5 space-y-4 border-cyan/30">
          <p className="font-display font-bold flex items-center gap-2">
            <Icon name="bank" className="w-5 h-5 text-cyan" />
            {t.advance.title}
          </p>
          <div className="rounded-xl border border-white/10 divide-y divide-white/8 text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted">{t.advance.bank}</span>
              <span className="font-semibold" dir="ltr">CIH</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 gap-3">
              <span className="text-muted">{t.advance.holder}</span>
              <span className="font-semibold" dir="ltr">{ADVANCE_HOLDER}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 gap-3">
              <span className="text-muted">{t.advance.rib}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wider" dir="ltr">{RIB}</span>
                <button
                  onClick={copyRib}
                  className="text-xs text-cyan hover:text-paper transition-colors cursor-pointer"
                  aria-label={t.advance.copy}
                >
                  {copied ? t.advance.copied : t.advance.copy}
                </button>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
            <span className="text-sm text-muted">{t.advance.amount}</span>
            <span className="font-display font-extrabold text-2xl tabular-nums">
              {advance.toLocaleString()} {t.common.mad}
            </span>
          </div>
          <p className="text-xs text-muted">
            {t.advance.rest}: {(Math.round((total - advance) * 100) / 100).toLocaleString()} {t.common.mad}
          </p>
          <Field label={t.advance.sender} error={errors.ribSender}>
            <input
              className={inputCls}
              dir="ltr"
              value={form.ribSender}
              placeholder={t.advance.senderPh}
              onChange={(e) => setForm({ ...form, ribSender: e.target.value })}
            />
          </Field>
          <div>
            <span className="block text-sm font-medium text-paper/70 mb-2">{t.advance.receipt}</span>
            <input
              ref={receiptRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="hidden"
              onChange={(e) => void onReceipt(e.target.files?.[0])}
            />
            {form.receipt ? (
              <p className="flex items-center gap-2 text-sm text-cyan">
                <Icon name="check" className="w-4 h-4" />
                <a href={form.receipt} target="_blank" rel="noreferrer" className="underline decoration-cyan/40 hover:decoration-cyan">
                  {t.advance.receipt} ↗
                </a>
              </p>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => receiptRef.current?.click()}>
                <Icon name="upload" className="w-4 h-4" />
                {t.advance.uploadReceipt}
              </Button>
            )}
          </div>
        </div>
      )}
      <Field label={t.order.review.notes}>
        <textarea
          className={`${inputCls} min-h-20 resize-y`}
          value={form.notes}
          placeholder={t.order.review.notesPh}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>
      <Button onClick={submit} disabled={placing} magnetic className="w-full" size="lg">
        {placing ? t.order.review.placing : t.order.review.confirm}
        {!placing && <Icon name="arrow" className="w-5 h-5 rtl-flip" />}
      </Button>
    </div>
  );
}

/* ================= MAIN ================= */

export function Configurator({ initialProduct }: { initialProduct?: string }) {
  const { t, L, lang } = useI18n();
  const c = useConfig();
  const [placed, setPlaced] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const { enabled: soundOn } = useSound();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (initialProduct && CATALOG.some((p) => p.id === initialProduct)) {
      const p = CATALOG.find((x) => x.id === initialProduct)!;
      c.set({ product: p.id, sizeId: p.sizes[0].id, paperId: p.papers[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct]);

  const product = CATALOG.find((p) => p.id === c.product)!;
  const bp = calculatePrice({
    product: c.product,
    sizeId: c.sizeId,
    paperId: c.paperId,
    finishId: c.finishId,
    qty: c.qty,
    express: c.express,
    zoneId: c.zoneId,
  });

  const cartAdd = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    cartAdd({
      product: c.product,
      sizeId: c.sizeId,
      paperId: c.paperId,
      finishId: c.finishId,
      qty: c.qty,
      express: c.express,
      zoneId: c.zoneId,
      artworkName: c.artworkName,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const eta = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + bp.days);
    return d.toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-MA" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [bp.days, lang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [c.step, placed]);

  const canNext = c.step < 6;
  const stepTitle = [
    t.order.product,
    t.order.size,
    t.order.paper,
    t.order.finish,
    t.order.qty,
    t.order.artwork.preflight,
    t.order.review.title,
  ][c.step];

  const onPlaced = (code: string) => {
    setPlacing(false);
    setPlaced(code);
    pushDeviceCode(code);
    if (soundOn) playPressClick();
  };

  if (placed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--ink-glow)" }} aria-hidden />
        <AuroraBg />
        <div className="relative max-w-xl w-full text-center">
          <motion.div
            initial={reduced ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-panel p-10 md:p-14"
          >
            <span className="inline-flex w-16 h-16 rounded-full aurora-bg items-center justify-center text-ink mb-6 pulse-glow">
              <Icon name="check" className="w-8 h-8" />
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase text-paper">{t.order.success.title}</h1>
            <p className="mt-4 text-muted">{t.order.success.sub}</p>
            <div className="mt-8 glass rounded-2xl p-5">
              <p className="text-sm text-muted mb-1">{t.order.success.code}</p>
              <p className="font-display font-extrabold text-3xl aurora-text tracking-widest" dir="ltr">
                {placed}
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button href={`/track/${placed}`} magnetic size="lg">
                {t.order.success.track}
                <Icon name="arrow" className="w-5 h-5 rtl-flip" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  c.reset();
                  setPlaced(null);
                }}
              >
                {t.order.success.again}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen relative">
      {/* print sheet for quote PDF */}
      <div className="print-sheet fixed inset-0 z-[300] p-10">
        <div className="max-w-2xl mx-auto" dir="ltr">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <span className="font-bold text-2xl">VÉLORA</span>
            <span className="text-sm">Print quote — {new Date().toLocaleDateString()}</span>
          </div>
          <table className="w-full mt-6 text-sm">
            <tbody>
              {[
                ["Product", `${L(product.name)} — ${bp.size.name.en} (${bp.size.dim})`],
                ["Paper", bp.paper.name.en],
                ["Finish", bp.finish.name.en],
                ["Quantity", `${c.qty.toLocaleString()} ${product.unit.en}`],
                ["Express", c.express ? "24h" : "Standard 48h"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gray-300">
                  <td className="py-2 font-semibold">{k}</td>
                  <td className="py-2 text-right">{v}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 font-semibold">Unit price</td>
                <td className="py-2 text-right">{formatMAD(bp.unit, "en")}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Subtotal</td>
                <td className="py-2 text-right">{formatMAD(bp.subtotal, "en")}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">VAT 20%</td>
                <td className="py-2 text-right">{formatMAD(bp.vat, "en")}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Delivery</td>
                <td className="py-2 text-right">{formatMAD(bp.delivery, "en")}</td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-3 font-bold">Total</td>
                <td className="py-3 text-right font-bold">{formatMAD(bp.total, "en")}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-10 text-xs">VÉLORA — Made with ink in Morocco · hello@velora.ma · +212 661 000 000</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* steps bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <a href="/" className="flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors">
            <Icon name="arrow" className="w-4 h-4 rotate-180 rtl-flip" />
            {t.order.back}
          </a>
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label={t.order.kicker}>
            {t.order.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => i < c.step && c.set({ step: i })}
                disabled={i > c.step}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-small font-medium whitespace-nowrap transition-all cursor-pointer disabled:cursor-default ${
                  i === c.step
                    ? "aurora-bg text-ink"
                    : i < c.step
                      ? "text-cyan bg-cyan/10"
                      : "text-muted"
                }`}
                aria-current={i === c.step ? "step" : undefined}
              >
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="hidden md:inline">{s}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px_320px] gap-10 items-start">
          {/* LEFT: options */}
          <div className="order-2 lg:order-1">
            <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-3">
              <span className="text-cyan tabular-nums text-sm">{String(c.step + 1).padStart(2, "0")}/07</span>
              {stepTitle}
            </h2>
            <div key={c.step}>
              {c.step === 0 && <ProductStep />}
              {c.step === 1 && <SizeStep />}
              {c.step === 2 && <PaperStep />}
              {c.step === 3 && <FinishStep />}
              {c.step === 4 && <QtyStep />}
              {c.step === 5 && <ArtworkStep />}
              {c.step === 6 && <ReviewStep onPlaced={onPlaced} placing={placing} total={bp.total} />}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => c.set({ step: Math.max(0, c.step - 1) })} disabled={c.step === 0}>
                <Icon name="arrow" className="w-4 h-4 rotate-180 rtl-flip" />
                {t.order.backBtn}
              </Button>
              {canNext && (
                <Button
                  magnetic
                  onClick={() => {
                    const p = CATALOG.find((x) => x.id === c.product)!;
                    if (c.qty < p.minQty) c.set({ qty: p.minQty });
                    c.set({ step: c.step + 1 });
                  }}
                >
                  {t.order.next}
                  <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                </Button>
              )}
            </div>
          </div>

          {/* CENTER: preview */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="glass rounded-card p-6 md:p-8">
              <Preview3D />
            </div>
          </div>

          {/* RIGHT: summary */}
          <aside className="order-3 lg:sticky lg:top-28">
            <div className="glass rounded-card p-6 space-y-5">
              <h3 className="font-display font-bold text-lg flex items-center justify-between">
                {t.order.summary}
                <button
                  onClick={() => window.print()}
                  className="text-xs text-muted hover:text-cyan transition-colors flex items-center gap-1 cursor-pointer"
                  aria-label={t.order.savePdf}
                >
                  <Icon name="download" className="w-3.5 h-3.5" />
                  PDF
                </button>
              </h3>

              <ul className="text-sm space-y-2.5">
                {[
                  [t.order.product, L(product.name)],
                  [t.order.size, `${bp.size.name[lang]} — ${bp.size.dim}`],
                  [t.order.paper, bp.paper.name[lang]],
                  [t.order.finish, bp.finish.name[lang]],
                ].map(([k, v]) => (
                  <li key={k as string} className="flex justify-between gap-3">
                    <span className="text-muted">{k}</span>
                    <span className="text-paper/90 font-medium text-end">{v}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">
                    {t.order.perUnit} · {c.qty.toLocaleString()} {L(product.unit)}
                  </span>
                  <span className="text-paper font-medium tabular-nums">{formatMAD(bp.unit, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t.order.subtotal}</span>
                  <span className="text-paper tabular-nums">{formatMAD(bp.subtotal, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t.order.vat}</span>
                  <span className="text-paper tabular-nums">{formatMAD(bp.vat, lang)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted">{t.order.zone}</span>
                  <select
                    value={c.zoneId}
                    onChange={(e) => c.set({ zoneId: e.target.value })}
                    className="bg-ink-2 border border-white/10 rounded-lg px-2 py-1 text-xs text-paper"
                    aria-label={t.order.zone}
                  >
                    {ZONES.map((z) => (
                      <option key={z.id} value={z.id}>{z.name[lang]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t.order.delivery}</span>
                  <span className="text-paper tabular-nums">{formatMAD(bp.delivery, lang)}</span>
                </div>
              </div>

              <label className="flex items-center justify-between glass rounded-2xl px-4 py-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold flex items-center gap-2">
                    <Icon name="zap" className="w-4 h-4 text-cyan" />
                    {t.order.express}
                  </span>
                  <span className="block text-xs text-muted mt-0.5">{t.order.expressNote}</span>
                </span>
                <button
                  role="switch"
                  aria-checked={c.express}
                  onClick={() => c.set({ express: !c.express })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${c.express ? "aurora-bg" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                      c.express ? "start-[22px]" : "start-0.5"
                    }`}
                  />
                </button>
              </label>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-muted">{t.order.total}</span>
                  <span className="font-display font-extrabold text-4xl text-paper">
                    <PriceCounter value={bp.total} lang={lang} />
                    <span className="text-sm font-body text-muted ms-1.5">{t.common.mad}</span>
                  </span>
                </div>
                <p className="mt-2 text-xs text-cyan flex items-center gap-1.5">
                  <Icon name="truck" className="w-3.5 h-3.5" />
                  {t.order.eta}: {eta}
                </p>
                <button
                  onClick={addToCart}
                  className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    added
                      ? "border-cyan/60 text-cyan bg-cyan/10"
                      : "border-white/15 text-paper/75 hover:border-cyan/50 hover:text-cyan"
                  }`}
                >
                  <Icon name={added ? "check" : "cart"} className="w-4 h-4" />
                  {added ? t.cart.added : t.cart.add}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AuroraBg() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: "var(--ink-glow)" }} />
    </div>
  );
}
