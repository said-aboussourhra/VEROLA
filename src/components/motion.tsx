"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

/* ================= INK CURSOR ================= */

export function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add("velora-cursor");
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: w / 2, y: h / 2, px: w / 2, py: h / 2, v: 0 };
    const dot = { x: mouse.x, y: mouse.y };
    const ring = { x: mouse.x, y: mouse.y };
    let plus = false;
    let magEl: HTMLElement | null = null;
    let visible = false;

    const points: { x: number; y: number; life: number; r: number }[] = [];

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      visible = true;
      const dx = mouse.x - mouse.px;
      const dy = mouse.y - mouse.py;
      mouse.v = Math.min(1, mouse.v + Math.hypot(dx, dy) / 40);
      const target = e.target as HTMLElement;
      const p = target.closest?.('[data-cursor="plus"]');
      plus = !!p;
      const m = target.closest?.("[data-magnetic]");
      if (m !== magEl) {
        if (magEl) magEl.style.transform = "";
        magEl = (m as HTMLElement) || null;
      }
      if (magEl) {
        const r = magEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const ox = (mouse.x - cx) * 0.22;
        const oy = (mouse.y - cy) * 0.22;
        magEl.style.transform = `translate(${Math.max(-12, Math.min(12, ox))}px, ${Math.max(-12, Math.min(12, oy))}px)`;
      }
    };
    const onLeave = () => {
      visible = false;
      if (magEl) {
        magEl.style.transform = "";
        magEl = null;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const tint = () => {
      const cs = getComputedStyle(document.documentElement);
      return [
        cs.getPropertyValue("--tint-a").trim() || "#7b2ff7",
        cs.getPropertyValue("--tint-b").trim() || "#00f0ff",
        cs.getPropertyValue("--tint-c").trim() || "#ff2e93",
      ];
    };
    let colors = tint();

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      dot.x += (mouse.x - dot.x) * 0.55;
      dot.y += (mouse.y - dot.y) * 0.55;
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;

      if (dotRef.current)
        dotRef.current.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%,-50%)`;
      if (ringRef.current) {
        const s = plus ? 2.2 : 1 + mouse.v * 0.5;
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%,-50%) scale(${s})`;
        ringRef.current.style.opacity = visible ? "1" : "0";
      }
      if (dotRef.current) dotRef.current.style.opacity = visible ? "1" : "0";

      ctx.clearRect(0, 0, w, h);
      if (visible && mouse.v > 0.08) {
        points.push({
          x: mouse.x,
          y: mouse.y,
          life: 1,
          r: 6 + mouse.v * 26,
        });
      }
      mouse.v *= 0.88;
      const isLightCursor = document.documentElement.dataset.theme === "light";
      ctx.globalCompositeOperation = isLightCursor ? "source-over" : "lighter";
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.life -= 0.045;
        if (p.life <= 0) {
          points.splice(i, 1);
          continue;
        }
        const c = colors[Math.floor((1 - p.life) * 2.99)];
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * p.life);
        g.addColorStop(0, hexA(c, (isLightCursor ? 0.13 : 0.16) * p.life));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("velora-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={ringRef}
        className="absolute top-0 left-0 w-9 h-9 rounded-full border border-cyan/70 transition-[opacity] duration-300 flex items-center justify-center"
        style={{ willChange: "transform" }}
      >
        <span className="plus-mark hidden text-cyan">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </div>
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full aurora-bg transition-[opacity] duration-300"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(123,47,247,${a})`;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ================= AURORA BLOB (canvas, no WebGL needed) ================= */

export function AuroraBlob({ className = "", intensity = 1 }: { className?: string; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let colors = ["#7b2ff7", "#00f0ff", "#ff2e93"];
    let alive = true;

    const readTint = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = [
        cs.getPropertyValue("--tint-a").trim() || colors[0],
        cs.getPropertyValue("--tint-b").trim() || colors[1],
        cs.getPropertyValue("--tint-c").trim() || colors[2],
      ];
    };
    readTint();
    const tintIv = setInterval(readTint, 1000);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { cx: 0.28, cy: 0.4, r: 0.42, sx: 0.11, sy: 0.07, sp: 0.31, ph: 0, i: 0 },
      { cx: 0.72, cy: 0.35, r: 0.38, sx: 0.09, sy: 0.1, sp: 0.23, ph: 2, i: 1 },
      { cx: 0.5, cy: 0.72, r: 0.44, sx: 0.13, sy: 0.06, sp: 0.17, ph: 4, i: 2 },
      { cx: 0.5, cy: 0.3, r: 0.3, sx: 0.07, sy: 0.09, sp: 0.41, ph: 1, i: 0 },
    ];

    const m = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, v: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      m.v = Math.min(1, m.v + Math.hypot(nx - m.tx, ny - m.ty) * 2);
      m.tx = nx;
      m.ty = ny;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const drawBlob = (x: number, y: number, r: number, c: string, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(c, a));
      g.addColorStop(0.55, hexA(c, a * 0.45));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (t: number) => {
      if (!alive) return;
      const time = t / 1000;
      const isLight = document.documentElement.dataset.theme === "light";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = isLight ? "source-over" : "lighter";
      const min = Math.min(w, h);
      for (const b of blobs) {
        const x = (b.cx + Math.sin(time * b.sp + b.ph) * b.sx) * w;
        const y = (b.cy + Math.cos(time * b.sp * 1.2 + b.ph) * b.sy) * h;
        drawBlob(x, y, b.r * min, colors[b.i], (isLight ? 0.13 : 0.2) * intensity);
      }
      m.x += (m.tx - m.x) * 0.06;
      m.y += (m.ty - m.y) * 0.06;
      m.v *= 0.94;
      drawBlob(m.x * w, m.y * h, (0.16 + m.v * 0.2) * min, colors[1], (isLight ? 0.1 : 0.16) * intensity * (0.4 + m.v));
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearInterval(tintIv);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [intensity]);

  return <canvas ref={ref} className={`absolute inset-0 w-full h-full ${className}`} aria-hidden />;
}

/* ================= MARQUEE ================= */

export function Marquee({
  children,
  reverse = false,
  duration = 42,
  className = "",
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden marquee-paused ${className}`}>
      <div
        className={`flex w-max ${reverse ? "marquee-track-r" : "marquee-track-l"}`}
        style={{ "--marquee-dur": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= TILT CARD ================= */

export function TiltCard({
  children,
  className = "",
  glare = true,
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.transition = "transform 0.08s linear";
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    if (gRef.current)
      gRef.current.style.background = `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.14), transparent 55%)`;
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    el.style.transform = "rotateX(0) rotateY(0)";
    if (gRef.current) gRef.current.style.background = "transparent";
  };

  return (
    <div className={`tilt-wrap ${className}`}>
      <div
        ref={ref}
        className="tilt-inner relative h-full"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor="plus"
      >
        {children}
        {glare && (
          <div
            ref={gRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
            style={{ background: "transparent" }}
          />
        )}
      </div>
    </div>
  );
}

/* ================= KINETIC HEADLINE ================= */

export function KineticHeading({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const { lang } = useI18n();
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const units: string[] = [];
  if (lang === "ar") {
    units.push(...words);
  } else {
    words.forEach((w, wi) => {
      if (wi > 0) units.push(" ");
      for (const ch of w) units.push(ch);
    });
  }

  return (
    <span className={className} role="heading" aria-level={1} aria-label={text}>
      {units.map((u, i) =>
        u === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
            <motion.span
              className="inline-block kinetic-letter"
              initial={reduced ? false : { y: "110%", rotate: 5, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: reduced ? 0 : delay + i * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {u}
            </motion.span>
          </span>
        ),
      )}
    </span>
  );
}

/* ================= PRESS LOADER (print line by line → paper tear) ================= */

export function PressLoader() {
  const { t, dir } = useI18n();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"print" | "tear" | "done">(reduced ? "done" : "print");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 850);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("tear");
        setTimeout(() => setPhase("done"), 650);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (phase === "done") return null;

  const content = (
    <div className="absolute inset-x-0 top-0 h-1/2 flex flex-col items-center justify-end pb-16" dir={dir}>
      <div className="font-display font-extrabold text-3xl md:text-5xl tracking-[-0.02em] text-paper">
        VÉLORA
      </div>
      <div className="mt-2 text-small tracking-[0.3em] text-muted">{t.loader.studio}</div>
      <div className="mt-10 w-full max-w-md px-6 space-y-4" dir="ltr">
        {[t.loader.line1, t.loader.line2].map((line, i) => (
          <div key={i} className="relative h-12 overflow-hidden border-b border-white/8">
            <span className="absolute inset-0 flex items-center justify-between font-mono text-xs tracking-[0.25em] text-paper/50">
              <span>{line}</span>
              <span className="text-cyan">{String(i * 50 + Math.min(50, pct + (i ? 0 : 0) + (i ? 50 - pct : pct) % 100)).padStart(3, "0")}%</span>
            </span>
            <span
              key={`${line}-${i}-${phase}`}
              className="press-bar absolute top-0 bottom-0 w-1/3 aurora-bg opacity-80"
              style={{ animationDelay: `${i * 0.28}s` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3 text-xs tracking-[0.3em] text-muted">
        <span className="w-2 h-2 rounded-full aurora-bg pulse-glow" />
        {t.loader.ready}
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[200] ${phase === "tear" ? "pointer-events-none" : ""}`} aria-hidden>
      {phase === "print" ? (
        <div className="absolute inset-0 bg-ink">{content}</div>
      ) : (
        <>
          <div className="tear-top absolute inset-0 bg-ink">{content}</div>
          <div className="tear-bottom absolute inset-0 bg-ink-2" />
        </>
      )}
    </div>
  );
}
