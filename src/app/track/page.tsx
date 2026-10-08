"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Button, Icon, Reveal, inputCls } from "@/components/ui";

export default function TrackIndexPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState("");

  const go = (c: string) => {
    if (c.trim()) router.push(`/track/${c.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-xl w-full px-4 py-32">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex w-16 h-16 rounded-full glass items-center justify-center text-cyan mb-6">
              <Icon name="pin" className="w-7 h-7" />
            </span>
            <h1 className="font-display font-extrabold uppercase text-[clamp(2rem,6vw,3.5rem)] leading-[1.05] text-paper">
              {t.search.title}
            </h1>
            <p className="mt-4 text-muted">{t.search.sub}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <form
            className="mt-10 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              go(code);
            }}
          >
            <input
              className={`${inputCls} text-center font-mono text-lg tracking-[0.3em]`}
              placeholder={t.search.ph}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label={t.search.title}
              dir="ltr"
            />
            <Button type="submit" size="lg" magnetic>
              {t.search.go}
              <Icon name="arrow" className="w-5 h-5 rtl-flip" />
            </Button>
          </form>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["VLR-2847", "VLR-3102", "VLR-4560"].map((c) => (
              <button
                key={c}
                onClick={() => go(c)}
                className="px-4 py-2 rounded-full border border-white/12 text-sm text-muted hover:text-cyan hover:border-cyan/40 transition-colors font-mono tracking-widest cursor-pointer"
                dir="ltr"
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-muted">
            <a href="/account" className="hover:text-cyan transition-colors">
              {t.account.kicker} →
            </a>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
