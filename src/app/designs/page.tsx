"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button, Icon, SectionHeading, Reveal, Badge, inputCls } from "@/components/ui";

interface DesignMeta {
  slug: string;
  title: { en: string; fr: string; ar: string };
  cat: string;
  access: "free" | "member";
  w: number;
  h: number;
  downloads: number;
}

const CATS: Record<string, { en: string; fr: string; ar: string }> = {
  poster: { en: "Poster", fr: "Affiche", ar: "أفيش" },
  card: { en: "Card", fr: "Carte", ar: "بطاقة" },
  flyer: { en: "Flyer", fr: "Flyer", ar: "فلاير" },
  invite: { en: "Invitation", fr: "Invitation", ar: "دعوة" },
  banner: { en: "Banner", fr: "Bannière", ar: "بانر" },
  label: { en: "Label", fr: "Étiquette", ar: "تبويب" },
};

function useMember() {
  const [member, setMember] = useState<{ name: string; phone: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("velora-member");
      if (raw) setMember(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const save = (m: { name: string; phone: string }) => {
    localStorage.setItem("velora-member", JSON.stringify(m));
    setMember(m);
  };
  return { member, save };
}

export default function DesignsPage() {
  const { t, L, lang } = useI18n();
  const [list, setList] = useState<DesignMeta[]>([]);
  const [filter, setFilter] = useState<"all" | "free" | "member">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const [subDone, setSubDone] = useState(false);
  const [sName, setSName] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sErr, setSErr] = useState("");
  const { member, save } = useMember();

  useEffect(() => {
    fetch("/api/designs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setList(d.designs))
      .catch(() => undefined);
  }, []);

  const items = list.filter((d) => filter === "all" || d.access === filter);

  const download = async (slug: string, memberPhone?: string) => {
    setBusy(slug);
    try {
      const url = `/api/designs/${slug}?download=1${memberPhone ? `&member=${encodeURIComponent(memberPhone)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.access === "member") {
          setSubOpen(slug);
          setSubDone(false);
          return;
        }
        return;
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      setBusy(null);
    }
  };

  const join = async () => {
    setSErr("");
    if (!sName.trim()) setSErr(t.order.required);
    else if (!/^[+0-9()\s-]{8,}$/.test(sPhone)) setSErr(t.order.badPhone);
    else {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sName, phone: sPhone }),
      });
      if (res.ok) {
        save({ name: sName, phone: sPhone });
        setSubDone(true);
        setTimeout(() => {
          setSubOpen(null);
          if (subOpen) void download(subOpen, sPhone);
        }, 1200);
      } else setSErr(t.order.required);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.designs.kicker} title={t.designs.title} sub={t.designs.sub} />
        </Reveal>

        <div className="flex flex-wrap gap-2 mb-10">
          {(["all", "free", "member"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                filter === f ? "aurora-bg text-ink border-transparent" : "border-white/12 text-paper/70 hover:border-cyan/40"
              }`}
              aria-pressed={filter === f}
            >
              {f === "all" ? t.designs.all : f === "free" ? t.designs.free : t.designs.member}
            </button>
          ))}
          {member && (
            <span className="ms-auto inline-flex items-center gap-2 rounded-full bg-cyan/10 text-cyan text-xs font-semibold px-4 py-2">
              <Icon name="check" className="w-3.5 h-3.5" />
              {t.designs.subscribed}
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 4) * 0.06}>
              <div className="group rounded-[24px] border border-white/8 bg-ink-2/60 overflow-hidden hover:border-cyan/40 transition-colors">
                <div className="relative bg-ink/40">
                  <img
                    src={`/api/designs/${d.slug}`}
                    alt={L(d.title)}
                    loading="lazy"
                    className="w-full h-64 object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 start-3">
                    {d.access === "free" ? (
                      <Badge>{t.designs.free}</Badge>
                    ) : (
                      <Badge gold>{t.designs.member}</Badge>
                    )}
                  </span>
                  <span className="absolute top-3 end-3 text-[0.68rem] text-muted tabular-nums">
                    {CATS[d.cat]?.[lang] ?? d.cat}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold">{L(d.title)}</h3>
                    <span className="text-[0.68rem] text-muted tabular-nums shrink-0">
                      {d.downloads} {t.designs.downloads}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {d.w}×{d.h} · {t.designs.by}
                  </p>
                  <Button
                    variant={d.access === "free" ? "aurora" : "glass"}
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => void download(d.slug, member?.phone)}
                    disabled={busy === d.slug}
                  >
                    <Icon name="download" className="w-4 h-4" />
                    {busy === d.slug ? t.designs.downloading : member || d.access === "free" ? t.designs.download : t.designs.subscribe}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-sm text-muted flex items-center gap-2">
            <Icon name="sparkle" className="w-4 h-4 text-cyan" />
            {t.designs.svgNote}
          </p>
        </Reveal>
      </div>

      <AnimatePresence>
        {subOpen && (
          <motion.div
            className="fixed inset-0 z-[140] bg-ink/80 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-[28px] p-8 w-full max-w-md"
              initial={{ scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 14 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            >
              {subDone ? (
                <div className="text-center py-6">
                  <span className="inline-flex w-14 h-14 rounded-full aurora-bg items-center justify-center text-ink mb-4 pulse-glow">
                    <Icon name="check" className="w-7 h-7" />
                  </span>
                  <p className="text-paper font-medium">{t.designs.unlocked}</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-bold text-2xl mb-2">{t.designs.subscribe}</h3>
                  <p className="text-sm text-muted mb-6">{t.designs.subscribeSub}</p>
                  <div className="space-y-4">
                    <input
                      className={inputCls}
                      value={sName}
                      onChange={(e) => setSName(e.target.value)}
                      placeholder={t.designs.name}
                      aria-label={t.designs.name}
                    />
                    <input
                      className={inputCls}
                      dir="ltr"
                      value={sPhone}
                      onChange={(e) => setSPhone(e.target.value)}
                      placeholder="+212 6 61 00 00 00"
                      aria-label={t.designs.phone}
                    />
                    {sErr && <p className="text-sm text-magenta">{sErr}</p>}
                    <Button onClick={() => void join()} className="w-full" magnetic>
                      {t.designs.unlock}
                      <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                    </Button>
                    <button
                      onClick={() => setSubOpen(null)}
                      className="w-full text-center text-xs text-muted hover:text-paper transition-colors py-2 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
