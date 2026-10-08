"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/pricing";

/* ================= icons (1.5px stroke, rounded) ================= */

const PATHS: Record<string, ReactNode> = {
  arrow: <path d="M4 12h16m0 0-6-6m6 6-6 6" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  truck: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />,
  box: (
    <>
      <path d="m12 2 8 4.5v9L12 22l-8-6.5v-9L12 2Z" />
      <path d="M12 22V11M4 6.5l8 4.5 8-4.5" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3h10v5M7 17H4v-9h16v9h-3" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: <path d="M5 4h4l1.5 4L8 10a12 12 0 0 0 6 6l2-2.5 4 1.5v4c0 1-1 2-2 2A16 16 0 0 1 3 6c0-1 1-2 2-2Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  bank: (
    <>
      <path d="m3 9 9-5 9 5v1H3V9ZM5 10v7M10 10v7M14 10v7M19 10v7M3 20h18" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
      <path d="M6 10.5v.01M18 14.5v.01" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l5 5v15H6V2Z" />
      <path d="M14 2v5h5M9 13h6M9 17h6" />
    </>
  ),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.9 2.6L22.5 19l-2.6.9L19 22.5l-.9-2.6L15.5 19l2.6-.9L19 16Z" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" />,
  leaf: <path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15Zm0 0c2-5 6-9 11-11" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  volume: <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5-1.5a5 5 0 0 1 0 9M18 6a9 9 0 0 1 0 12" />,
  volumeOff: <path d="M4 9v6h4l5 4V5L8 9H4Zm12 0 4 6m0-6-4 6" />,
  flip: <path d="M8 5H5v14h3M16 5h3v14h-3M12 3v18" />,
  zoom: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M11 8v6M8 11h6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  cart: (
    <>
      <path d="M4 5h2l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h7.3a1.5 1.5 0 0 0 1.5-1.2L20 8H7" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  download: <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />,
};

export function Icon({
  name,
  className = "w-5 h-5",
  fill = false,
}: {
  name: keyof typeof PATHS | string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15L2 22l5.13-1.5A9.94 9.94 0 1 0 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.24-3.8-.8-3.2-1.26-5.24-4.55-5.4-4.76-.15-.21-1.27-1.7-1.27-3.24s.8-2.3 1.1-2.62c.29-.32.64-.4.85-.4l.61.01c.2.01.46-.07.72.55.27.63.9 2.2.98 2.35.08.16.13.34.03.55-.1.21-.15.34-.3.52l-.45.53c-.15.15-.3.32-.13.62.17.3.75 1.25 1.61 2.02 1.11.99 2.05 1.3 2.35 1.45.3.15.47.13.65-.08.17-.2.75-.87.94-1.17.2-.3.39-.25.65-.15.27.1 1.7.8 2 .95.29.15.5.22.57.34.07.13.07.73-.17 1.41Z" />
    </svg>
  );
}

/* ================= buttons ================= */

type BtnVariant = "aurora" | "glass" | "ghost";

export function Button({
  children,
  variant = "aurora",
  size = "md",
  className = "",
  href,
  onClick,
  type = "button",
  disabled,
  magnetic,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  magnetic?: boolean;
  ariaLabel?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 select-none cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "px-6 py-3",
    lg: "text-lg px-8 py-4",
  }[size];
  const variants: Record<BtnVariant, string> = {
    aurora:
      "aurora-bg text-ink shadow-[0_8px_32px_-8px_rgba(0,240,255,0.45)] hover:shadow-[0_10px_40px_-6px_rgba(123,47,247,0.55)] hover:brightness-110",
    glass: "glass text-paper hover:bg-white/10",
    ghost:
      "text-paper/80 border border-white/10 hover:border-cyan/50 hover:text-cyan",
  };
  const cls = `${base} ${sizes} ${variants[variant]} ${className}`;
  const props = {
    className: cls,
    "data-magnetic": magnetic ? "true" : undefined,
    onClick,
    "aria-label": ariaLabel,
  };
  if (href)
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  return (
    <button type={type} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

/* ================= badge / chips ================= */

export function Badge({
  children,
  className = "",
  gold,
}: {
  children: ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.8125rem] font-medium border ${
        gold
          ? "border-gold/40 text-gold bg-gold/10"
          : "border-white/10 text-paper/70 bg-white/5"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/* ================= section heading ================= */

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "start",
}: {
  kicker: string;
  title: string;
  sub?: string;
  align?: "start" | "center";
}) {
  const { lang } = useI18n();
  return (
    <div className={`mb-12 md:mb-16 ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}`}>
      <div className="flex items-center gap-3 mb-5 justify-center" style={{ justifyContent: align === "center" ? "center" : undefined }}>
        <span className="w-8 h-px aurora-bg" />
        <span className="text-cyan text-sm font-semibold tracking-[0.2em] uppercase">{kicker}</span>
      </div>
      <h2
        className={`font-display uppercase leading-[1.05] text-paper ${
          lang === "ar" ? "text-3xl md:text-5xl" : "text-[clamp(2rem,5vw,4.5rem)]"
        }`}
      >
        {title}
      </h2>
      {sub && <p className="mt-5 text-muted leading-relaxed max-w-2xl" style={align === "center" ? { marginInline: "auto" } : undefined}>{sub}</p>}
    </div>
  );
}

/* ================= reveal on scroll ================= */

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ================= animated price ================= */

export function PriceCounter({
  value,
  className = "",
  lang,
}: {
  value: number;
  className?: string;
  lang?: Lang;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || Math.abs(prev.current - value) < 0.001) {
      prev.current = value;
      setDisplay(value);
      return;
    }
    const from = prev.current;
    const to = value;
    prev.current = value;
    const start = performance.now();
    const dur = 450;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-MA" : "en-US", {
    minimumFractionDigits: display % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return <span className={`tabular-nums ${className}`}>{nf.format(Math.round(display * 100) / 100)}</span>;
}

/* ================= count-up number ================= */

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          if (reduced) {
            setVal(to);
            return;
          }
          const start = performance.now();
          const dur = 1600;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            setVal(Math.round(to * (1 - Math.pow(1 - p, 4))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ================= accordion ================= */

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-white/8 border-y border-white/8">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 py-6 text-start group cursor-pointer"
            >
              <span className={`text-lg font-semibold transition-colors ${isOpen ? "text-cyan" : "text-paper group-hover:text-cyan/80"}`}>
                {it.q}
              </span>
              <span className={`shrink-0 transition-transform duration-500 ${isOpen ? "rotate-45 text-cyan" : "text-muted"}`}>
                <Icon name="plus" className="w-5 h-5" />
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-7 pe-10 text-muted leading-relaxed">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= form field ================= */

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-paper/70 mb-2">{label}</span>
      {children}
      {error && <span className="block mt-1.5 text-sm text-magenta">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-paper placeholder:text-muted/60 focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20 transition";

/* ================= sound ================= */

let audioCtx: AudioContext | null = null;

export function playPressClick() {
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const dur = 0.09;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start();
  } catch {
    /* audio unavailable */
  }
}

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(localStorage.getItem("velora-sound") === "1");
  }, []);
  const toggle = useCallback(() => {
    setEnabled((e) => {
      localStorage.setItem("velora-sound", e ? "0" : "1");
      return !e;
    });
  }, []);
  return { enabled, toggle };
}

/* ================= logo ================= */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[-0.02em] text-paper select-none ${className}`} dir="ltr">
      VÉ
      <span className="relative inline-block">
        L
        <svg viewBox="0 0 24 24" className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5" aria-hidden>
          <defs>
            <linearGradient id="dropg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7B2FF7" />
              <stop offset="0.5" stopColor="#00F0FF" />
              <stop offset="1" stopColor="#FF2E93" />
            </linearGradient>
          </defs>
          <path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" fill="url(#dropg)" />
        </svg>
      </span>
      <span className="relative inline-block">
        O
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="w-3/5 h-3/5 rounded-full border border-white/10" />
        </span>
      </span>
      RA
    </span>
  );
}
