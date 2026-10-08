"use client";

import { useId, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ============================================================
   VEROLA — vector identity
   Mark : two ink wings with sharp tips forming a V, a crescent
          orbit crossing in front, four rotated CMYK squares.
   Word : heavy geometric letterforms, magenta cut inside the A.
   ============================================================ */

const WING_L =
  "M146 88 C 162 96 178 130 198 174 C 228 240 264 332 286 402 C 298 440 276 454 252 430 C 216 394 168 238 146 88 Z";
const WING_L_FOLD =
  "M168 128 C 192 172 226 258 252 336 C 268 382 280 414 276 428 C 262 396 232 316 202 238 C 186 196 172 154 168 128 Z";
const WING_R =
  "M306 82 C 322 92 334 126 342 172 C 354 240 350 330 328 396 C 314 438 288 442 280 410 C 268 356 280 236 290 152 C 294 112 298 88 306 82 Z";
const WING_R_FOLD =
  "M318 122 C 330 164 338 236 336 300 C 334 352 324 392 312 414 C 320 366 322 288 316 216 C 312 172 310 138 318 122 Z";
const ORBIT_BACK = "M412 190 C 400 264 340 330 258 358";
const ORBIT_FRONT = "M258 358 C 176 386 104 362 76 300";

export function VerolaMark({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;

  return (
    <svg viewBox="0 0 520 520" className={className} role="img" aria-label="VEROLA">
      <defs>
        <linearGradient id={id("L")} x1="0.05" y1="0" x2="0.95" y2="1">
          <stop offset="0" stopColor="#8FEBFF" />
          <stop offset="0.14" stopColor="#39C4F8" />
          <stop offset="0.46" stopColor="#1177E4" />
          <stop offset="0.8" stopColor="#0B4AC8" />
          <stop offset="1" stopColor="#06248C" />
        </linearGradient>
        <linearGradient id={id("R")} x1="0.9" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="#FFE272" />
          <stop offset="0.14" stopColor="#FFA71E" />
          <stop offset="0.34" stopColor="#FF2E93" />
          <stop offset="0.58" stopColor="#D22CD0" />
          <stop offset="0.82" stopColor="#4B3AD6" />
          <stop offset="1" stopColor="#1B2AA6" />
        </linearGradient>
        <linearGradient id={id("ring")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2FD8FF" />
          <stop offset="0.24" stopColor="#2C7FF2" />
          <stop offset="0.5" stopColor="#A944F0" />
          <stop offset="0.74" stopColor="#FF2E93" />
          <stop offset="1" stopColor="#FFC93A" />
        </linearGradient>
        <linearGradient id={id("sheen")} x1="0.15" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.24" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#39C4F8" stopOpacity="0.28" />
          <stop offset="1" stopColor="#39C4F8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!mono && <circle cx="258" cy="262" r="250" fill={`url(#${id("glow")})`} />}

      {/* orbit — behind the wings */}
      <path
        d={ORBIT_BACK}
        fill="none"
        stroke={mono ? "currentColor" : `url(#${id("ring")})`}
        strokeWidth="17"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* right wing (warm) */}
      <path d={WING_R} fill={mono ? "currentColor" : `url(#${id("R")})`} />
      {!mono && <path d={WING_R_FOLD} fill={`url(#${id("sheen")})`} opacity="0.5" />}

      {/* left wing (blue) */}
      <path d={WING_L} fill={mono ? "currentColor" : `url(#${id("L")})`} />
      {!mono && <path d={WING_L_FOLD} fill={`url(#${id("sheen")})`} opacity="0.85" />}

      {/* orbit — crosses in front, curls at the tip */}
      <g fill="none" strokeLinecap="round">
        <path d={ORBIT_FRONT} stroke={mono ? "currentColor" : `url(#${id("ring")})`} strokeWidth="17" />
        <path d={ORBIT_FRONT} stroke="#fff" strokeWidth="5" opacity="0.42" />
      </g>

      {/* CMYK squares — diagonal cascade */}
      <g>
        <rect x="312" y="96" width="48" height="48" rx="11" transform="rotate(24 336 120)" fill={mono ? "currentColor" : "#22C1F0"} />
        <rect x="372" y="58" width="48" height="48" rx="11" transform="rotate(24 396 82)" fill={mono ? "currentColor" : "#FF2E93"} />
        <rect x="360" y="134" width="48" height="48" rx="11" transform="rotate(24 384 158)" fill={mono ? "currentColor" : "#FFC400"} />
        <rect x="412" y="182" width="44" height="44" rx="10" transform="rotate(24 434 204)" fill={mono ? "currentColor" : "#2B2B33"} />
      </g>
    </svg>
  );
}

/* ---------- wordmark : heavy geometric strokes ---------- */

const WORD = [
  "M26 30 L82 138 L138 30",
  "M258 30 L178 30 L178 138 L258 138",
  "M178 84 L242 84",
  "M300 138 L300 30 L362 30 C 412 30 412 92 362 92 L300 92",
  "M354 92 L414 138",
  "M500 30 A 54 54 0 1 1 499 30",
  "M596 30 L596 138 L686 138",
  "M722 138 L782 30 L842 138",
  "M742 104 L822 104",
];

function WordStrokes({ stroke }: { stroke: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="27" strokeLinecap="round" strokeLinejoin="round">
      {WORD.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
}

export function VerolaWordmark({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 880 168" className={className} role="img" aria-label="VEROLA" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`wm-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#57C6F8" />
          <stop offset="0.46" stopColor="#1379DE" />
          <stop offset="1" stopColor="#0A44B4" />
        </linearGradient>
      </defs>
      <WordStrokes stroke={mono ? "currentColor" : `url(#wm-${uid})`} />
      {!mono && <path d="M816 104 L848 140 L784 140 Z" fill="#FF2E93" />}
    </svg>
  );
}

/* ================= 5-second opening ceremony ================= */

export function LogoIntro() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setDone(true), 5000);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [reduced]);

  if (done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(115% 85% at 50% 8%, #ffffff 0%, #f2f7fd 48%, #e4edf9 100%)" }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      <motion.div
        className="absolute w-[86vmin] h-[86vmin] rounded-full"
        style={{
          background:
            "conic-gradient(from 200deg, rgba(11,99,214,0.20), rgba(34,193,240,0.18), rgba(255,46,147,0.16), rgba(255,196,0,0.16), rgba(11,99,214,0.20))",
          filter: "blur(70px)",
        }}
        initial={{ scale: 0.45, opacity: 0, rotate: -40 }}
        animate={{ scale: 1.1, opacity: 1, rotate: 25 }}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        initial={{ scale: 0.72, opacity: 0, y: 26 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, -1.2, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        >
          <VerolaMark className="w-[42vmin] h-[42vmin] drop-shadow-[0_36px_70px_rgba(18,80,190,0.30)]" />
        </motion.div>
      </motion.div>

      <div className="mt-[3vmin] overflow-hidden px-2">
        <motion.div
          initial={{ opacity: 0, y: 46, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <VerolaWordmark className="h-[10vmin] w-auto" />
        </motion.div>
      </div>

      <motion.p
        className="mt-[3vmin] text-[0.72rem] font-semibold tracking-[0.42em] text-[#7b8798]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.3 }}
      >
        PRINT · CUT · DELIVER
      </motion.p>

      <motion.div
        className="absolute bottom-16 h-[3px] rounded-full overflow-hidden"
        style={{ width: "min(340px, 58vw)", background: "rgba(16,24,40,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#0B63D6,#22C1F0,#FF2E93,#FFC400)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
}
