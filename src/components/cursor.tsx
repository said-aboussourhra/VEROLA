"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   VEROLA cursor — precise ring + dot, spring follow.
   Replaces the old heavy ink trail. Hidden on touch devices,
   disabled entirely under prefers-reduced-motion, and text
   fields keep the native I-beam.
   ============================================================ */

export function BrandyCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [plus, setPlus] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const root = document.documentElement;
    root.classList.add("velora-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    const dot = { x: target.x, y: target.y };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.(
        'a, button, [role="button"], [data-cursor], input[type="range"], select, label',
      );
      setPlus(!!el?.closest?.('[data-cursor="plus"]'));
      ringRef.current?.setAttribute("data-hover", interactive ? "1" : "0");
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // dot is immediate, ring trails with a soft spring
      dot.x += (target.x - dot.x) * 0.42;
      dot.y += (target.y - dot.y) * 0.42;
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      root.classList.remove("velora-cursor");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[110] hidden md:block">
      <div
        ref={ringRef}
        className={`verola-ring ${down ? "is-down" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        {plus && (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </div>
      <div
        ref={dotRef}
        className="verola-dot"
        style={{ opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
