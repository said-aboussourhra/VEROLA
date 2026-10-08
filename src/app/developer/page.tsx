"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Icon, Button, Badge, Reveal, SectionHeading, inputCls } from "@/components/ui";
import { Marquee } from "@/components/motion";
import { useAuth, useToast } from "@/components/notify";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DevProfile {
  name: string;
  role: string;
  about: string | null;
  photo: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  skills: string | null;
}

const DEFAULT: DevProfile = {
  name: "BAOUCOUS",
  role: "Web Developer & Digital Creator",
  about:
    "I design and engineer premium digital products end to end — from the design system and the interaction layer down to the database, the API and the infrastructure. VEROLA is the proof: a real print customizer, a multi-tenant white-label SaaS, a live production floor and a complete order pipeline — built to be used by real printing companies.",
  photo: null,
  whatsapp: "+212600000000",
  instagram: "baoucous.dev",
  email: "baoucous@verola.ma",
  skills: null,
};

const CAPABILITIES = [
  {
    icon: "layers",
    title: "Web Development",
    d: "Next.js App Router · TypeScript strict · server components · edge runtime",
    c: "#0b63d6",
  },
  {
    icon: "sparkle",
    title: "UI / UX Design",
    d: "Design systems · interaction design · accessibility · WCAG 2.2 AA",
    c: "#22c1f0",
  },
  {
    icon: "file",
    title: "Frontend Engineering",
    d: "React 19 · Tailwind · Framer Motion · Fabric.js canvas · RTL",
    c: "#ff2e93",
  },
  {
    icon: "box",
    title: "Backend & APIs",
    d: "Auth & RBAC · REST · Server-Sent Events · payments · file storage",
    c: "#d98b00",
  },
  {
    icon: "shield",
    title: "Database",
    d: "PostgreSQL · Drizzle ORM · relational modelling · migrations",
    c: "#0b63d6",
  },
  {
    icon: "zap",
    title: "Performance",
    d: "LCP · CLS · INP · code-splitting · caching · image pipelines",
    c: "#22c1f0",
  },
  {
    icon: "globe",
    title: "Digital Experiences",
    d: "Motion design · realtime dashboards · PWA · white-label SaaS",
    c: "#ff2e93",
  },
  {
    icon: "printer",
    title: "Domain Systems",
    d: "Print production · pricing engines · preflight · order pipelines",
    c: "#d98b00",
  },
];

const WORK = [
  {
    icon: "sparkle",
    title: "Print Customizer",
    d: "A real Fabric.js design canvas — layers, undo/redo, snapping, DPI preflight, print areas and print proof.",
    tags: ["Fabric.js", "Canvas", "Autosave"],
    c: "#0b63d6",
  },
  {
    icon: "globe",
    title: "White-label SaaS",
    d: "Multi-tenant platform where every printing shop gets its own name, logo, palette and domain.",
    tags: ["Multi-tenant", "CSS theming", "DNS"],
    c: "#7C3AED",
  },
  {
    icon: "printer",
    title: "Press Floor",
    d: "Live machine telemetry over Server-Sent Events behind a pluggable hardware gateway adapter.",
    tags: ["SSE", "Gateway", "Realtime"],
    c: "#22c1f0",
  },
  {
    icon: "shield",
    title: "Admin CMS",
    d: "Full control of hero, media, orders, notifications, pricing, branding and developer content.",
    tags: ["RBAC", "CMS", "Rate-limited"],
    c: "#ff2e93",
  },
];

const PROCESS = [
  { t: "Discover", d: "Understand the business, the users and the real constraints before a single pixel." },
  { t: "Design", d: "A system first — tokens, type scale, motion language, accessibility rules." },
  { t: "Build", d: "Typed, tested, server-validated code with clean architecture and no placeholders." },
  { t: "Ship", d: "Measure LCP, CLS and INP, then deploy and keep improving on real data." },
];

const STACK = [
  "Next.js", "TypeScript", "React 19", "PostgreSQL", "Drizzle ORM", "Tailwind CSS",
  "Framer Motion", "Fabric.js", "Node.js", "REST", "SSE", "RBAC", "PWA", "RTL / i18n",
];

const STATS = [
  { v: "6+", l: "Years building" },
  { v: "40+", l: "Products shipped" },
  { v: "100%", l: "TypeScript strict" },
  { v: "24/7", l: "Production support" },
];

export default function DeveloperPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [p, setP] = useState<DevProfile>(DEFAULT);
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/dev-profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.profile) setP((cur) => ({ ...cur, ...d.profile }));
      })
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/dev-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (res.ok) {
        toast.success("Profile saved", "The developer page is updated.");
        setEdit(false);
      } else {
        toast.error("Something went wrong.", "Only the administrator can edit this page.");
      }
    } finally {
      setBusy(false);
    }
  };

  const socials = [
    {
      icon: "phone",
      label: "WhatsApp",
      value: p.whatsapp,
      href: p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}` : null,
      c: "#25D366",
    },
    {
      icon: "sparkle",
      label: "Instagram",
      value: p.instagram,
      href: p.instagram ? `https://instagram.com/${p.instagram.replace("@", "")}` : null,
      c: "#E1306C",
    },
    {
      icon: "mail",
      label: "Gmail",
      value: p.email,
      href: p.email ? `mailto:${p.email}` : null,
      c: "#EA4335",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 80% at 12% 8%, rgba(34,193,240,0.26), transparent 66%), radial-gradient(60% 70% at 88% 18%, rgba(255,46,147,0.18), transparent 68%), radial-gradient(55% 60% at 50% 100%, rgba(255,196,0,0.16), transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(16,24,40,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.05) 1px, transparent 1px)",
              backgroundSize: "68px 68px",
              maskImage: "radial-gradient(78% 62% at 50% 24%, black, transparent 78%)",
              WebkitMaskImage: "radial-gradient(78% 62% at 50% 24%, black, transparent 78%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-center">
            <div>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <span className="inline-flex items-center gap-2.5 rounded-full bg-white/85 border border-[#0b63d6]/16 ps-2 pe-4 py-2 text-[0.82rem] font-semibold text-[#0b4fb0] shadow-[0_14px_34px_-20px_rgba(11,99,214,0.7)]">
                  <span className="w-6 h-6 rounded-full aurora-bg flex items-center justify-center">
                    <Icon name="sparkle" className="w-3.5 h-3.5 text-white" />
                  </span>
                  Developer
                </span>
              </motion.div>

              <motion.h1
                initial={reduced ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.12, ease: EASE }}
                className="mt-7 font-display font-extrabold leading-[0.92] tracking-[-0.045em] text-[#0d1b32]"
                style={{ fontSize: "clamp(3.25rem, 11vw, 9rem)" }}
              >
                {p.name}
              </motion.h1>

              <motion.p
                initial={reduced ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
                className="mt-5 text-xl md:text-2xl font-medium aurora-text"
              >
                {p.role}
              </motion.p>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.42, ease: EASE }}
                className="mt-7 flex items-start gap-4"
              >
                <span className="mt-2 w-11 h-[3px] rounded-full aurora-bg shrink-0" />
                <p className="max-w-2xl text-[1.0625rem] md:text-[1.15rem] text-[#4a5a70] leading-[1.8]">
                  {p.about}
                </p>
              </motion.div>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.55 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                {p.whatsapp && (
                  <Button
                    href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                    size="lg"
                    magnetic
                  >
                    <Icon name="phone" className="w-5 h-5" />
                    WhatsApp
                  </Button>
                )}
                <Button href="/" variant="ghost" size="lg">
                  {t.nav.cta}
                </Button>
                {user?.role === "admin" && !edit && (
                  <Button variant="glass" size="lg" onClick={() => setEdit(true)}>
                    <Icon name="file" className="w-5 h-5" />
                    Edit profile
                  </Button>
                )}
              </motion.div>
            </div>

            {/* portrait */}
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.28, ease: EASE }}
              className="relative"
            >
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_60px_120px_-45px_rgba(11,60,140,0.8)] aspect-[4/5]">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        "radial-gradient(85% 85% at 28% 18%, #37C6F7 0%, #0b63d6 52%, #0a2f8f 100%)",
                    }}
                  >
                    <div className="absolute inset-0 halftone opacity-30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="font-display font-extrabold text-white leading-none"
                        style={{ fontSize: "clamp(3.5rem, 11vw, 7rem)" }}
                      >
                        B
                      </span>
                      <span className="mt-3 text-white/75 text-xs tracking-[0.42em] uppercase">
                        BAOUCOUS
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08204a]/80 to-transparent" />
                <div className="absolute bottom-5 start-5 end-5">
                  <Badge className="!bg-white/20 !text-white !border-white/30 backdrop-blur">
                    Web Developer & Digital Creator
                  </Badge>
                </div>
              </div>

              {/* floating stat card */}
              <div className="absolute -bottom-6 -start-4 md:-start-8 rounded-2xl bg-white px-5 py-4 shadow-[0_30px_64px_-26px_rgba(11,60,140,0.7)] border border-[#0b63d6]/12">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#98a2b3]">Built</p>
                <p className="font-display font-extrabold text-[#0d1b32] text-xl leading-tight">VEROLA</p>
                <p className="text-xs text-[#5b6779]">Full printing platform</p>
              </div>
            </motion.div>
          </div>

          {/* stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="rounded-3xl bg-white border border-[#0b63d6]/12 p-6 shadow-[0_22px_54px_-40px_rgba(16,42,90,0.6)]">
                  <p className="font-display font-extrabold text-4xl aurora-text leading-none">{s.v}</p>
                  <p className="mt-2 text-sm text-[#5b6779]">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STACK MARQUEE ================= */}
      <div className="relative py-7 overflow-hidden border-y border-[#0b63d6]/12 bg-white">
        <Marquee duration={38}>
          {STACK.map((s, i) => (
            <span key={i} className="flex items-center gap-5 px-5">
              <span
                className="font-display font-extrabold text-[clamp(1.15rem,2.4vw,1.9rem)] tracking-[-0.02em]"
                style={{ color: i % 3 === 0 ? "#0b63d6" : i % 3 === 1 ? "#ff2e93" : "#d98b00" }}
              >
                {s}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b63d6]/30" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* ================= EDIT FORM ================= */}
      {edit && (
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <div className="rounded-[26px] bg-white border border-[#0b63d6]/12 p-7">
              <h3 className="font-display font-bold text-xl">Edit developer profile</h3>
              <div className="mt-5 space-y-3">
                <input className={inputCls} value={p.name} placeholder="Name" onChange={(e) => setP({ ...p, name: e.target.value })} />
                <input className={inputCls} value={p.role} placeholder="Role" onChange={(e) => setP({ ...p, role: e.target.value })} />
                <textarea className={`${inputCls} min-h-32`} value={p.about ?? ""} placeholder="About" onChange={(e) => setP({ ...p, about: e.target.value })} />
                <input className={inputCls} dir="ltr" value={p.photo ?? ""} placeholder="Photo URL (uploaded from Admin)" onChange={(e) => setP({ ...p, photo: e.target.value })} />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input className={inputCls} dir="ltr" value={p.whatsapp ?? ""} placeholder="WhatsApp number" onChange={(e) => setP({ ...p, whatsapp: e.target.value })} />
                  <input className={inputCls} dir="ltr" value={p.instagram ?? ""} placeholder="Instagram handle" onChange={(e) => setP({ ...p, instagram: e.target.value })} />
                  <input className={inputCls} dir="ltr" value={p.email ?? ""} placeholder="Email" onChange={(e) => setP({ ...p, email: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => void save()} disabled={busy} magnetic>
                    <Icon name="check" className="w-4 h-4" /> {busy ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="ghost" onClick={() => setEdit(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= CAPABILITIES ================= */}
      <section className="py-[clamp(72px,9vw,130px)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <SectionHeading
              kicker="Capabilities"
              title="WHAT I DO"
              sub="Everything needed to take a product from an idea to production."
              align="center"
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((s, i) => (
              <Reveal key={s.title} delay={(i % 4) * 0.07}>
                <div className="rounded-3xl bg-white border border-[#0b63d6]/12 p-6 h-full shadow-[0_22px_54px_-40px_rgba(16,42,90,0.6)] hover:-translate-y-1.5 hover:shadow-[0_36px_80px_-34px_rgba(11,99,214,0.6)] transition-all duration-500">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{ background: s.c }}
                  >
                    <Icon name={s.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="mt-4 font-display font-bold text-[#0d1b32] leading-tight">{s.title}</h3>
                  <p className="mt-2 text-sm text-[#5b6779] leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SELECTED WORK ================= */}
      <section className="relative py-[clamp(72px,9vw,130px)] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 120% at 12% 0%, #14305e 0%, #0b1b33 52%, #070f20 100%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 halftone opacity-[0.2]" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-[3px] rounded-full aurora-bg" />
              <span className="text-[#57d3ff] text-xs font-bold tracking-[0.28em] uppercase">
                Selected work
              </span>
            </div>
            <h2 className="font-display font-extrabold leading-[1.03] tracking-[-0.03em] text-white text-[clamp(2.15rem,5vw,4.15rem)] uppercase">
              Built for production
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed">
              Not mock-ups. Real systems running inside the VEROLA platform.
            </p>
          </div>

          <div className="mt-11 grid sm:grid-cols-2 gap-5">
            {WORK.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 0.1}>
                <div className="rounded-[26px] border border-white/12 bg-white/[0.05] p-7 h-full hover:border-white/30 hover:bg-white/[0.08] transition-all duration-500">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{ background: w.c }}
                  >
                    <Icon name={w.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 font-display font-bold text-white text-2xl tracking-[-0.02em]">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-white/65 leading-[1.8]">{w.d}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {w.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/18 px-3 py-1 text-[0.72rem] font-semibold text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="py-[clamp(72px,9vw,130px)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeading kicker="Process" title="HOW I WORK" align="center" />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.1}>
                <div className="relative rounded-3xl bg-white border border-[#0b63d6]/12 p-7 h-full shadow-[0_22px_54px_-40px_rgba(16,42,90,0.6)]">
                  <span
                    className="inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white font-display font-extrabold"
                    style={{ background: ["#0b63d6", "#22c1f0", "#ff2e93", "#d98b00"][i] }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display font-extrabold text-xl text-[#0d1b32] tracking-[-0.02em]">
                    {s.t}
                  </h3>
                  <p className="mt-2.5 text-[#5b6779] leading-[1.75] text-[0.95rem]">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="pb-[clamp(72px,10vw,130px)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative rounded-[36px] overflow-hidden px-8 py-16 md:p-20 shadow-[0_60px_120px_-55px_rgba(11,99,214,0.9)]"
            style={{
              background:
                "radial-gradient(90% 130% at 18% 0%, #22c1f0 0%, #0b63d6 42%, #7b2ff7 78%, #ff2e93 100%)",
            }}
          >
            <div className="absolute inset-0 halftone opacity-25" aria-hidden />
            <div className="relative text-center">
              <h2 className="font-display font-extrabold uppercase text-white leading-[1.02] tracking-[-0.03em] text-[clamp(2.15rem,6vw,4.5rem)]">
                Let&apos;s build
                <br />
                something real.
              </h2>
              <p className="mt-5 text-white/80 max-w-xl mx-auto leading-relaxed">
                Have a product, a platform or an idea that needs to be engineered properly?
                Reach out — I answer directly.
              </p>

              <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {socials.map((s, i) =>
                  s.href ? (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl bg-white/14 border border-white/25 p-5 hover:bg-white/24 hover:-translate-y-1 transition-all duration-500 text-start"
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                        style={{ background: s.c }}
                      >
                        <Icon name={s.icon} className="w-5 h-5" />
                      </span>
                      <p className="mt-3 text-white font-semibold">{s.label}</p>
                      <p className="text-white/75 text-sm truncate" dir="ltr">
                        {s.value}
                      </p>
                    </a>
                  ) : (
                    <div key={i} className="rounded-2xl bg-white/8 border border-white/15 p-5 opacity-50">
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                        style={{ background: s.c }}
                      >
                        <Icon name={s.icon} className="w-5 h-5" />
                      </span>
                      <p className="mt-3 text-white font-semibold">{s.label}</p>
                      <p className="text-white/60 text-sm">—</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
