"use client";

import { useI18n } from "@/lib/i18n";
import { Button, Icon, SectionHeading, Reveal } from "@/components/ui";

const SUS = [
  { v: "100%", l: { en: "FSC-certified paper", fr: "papier certifié FSC", ar: "ورق معتمد FSC" } },
  { v: "100%", l: { en: "soy-based inks", fr: "encres à base de soja", ar: "حبر صويا" } },
  { v: "60%", l: { en: "solar power on the roof", fr: "solaire sur le toit", ar: "طاقة شمسية" } },
  { v: "0", l: { en: "pieces rejected to landfill", fr: "pièces jetées à la benne", ar: "قطعة مرمية" } },
];

export default function AboutPage() {
  const { t, L, lang } = useI18n();
  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-5xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.about.kicker} title={t.about.title} />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {[t.about.p1, t.about.p2, t.about.p3].map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="glass rounded-3xl p-7 h-full">
                <span className="font-display font-extrabold text-4xl aurora-text block mb-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-paper/80 leading-relaxed text-[0.95rem]">{p}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="font-display font-bold text-2xl mb-8 flex items-center gap-3">
              <Icon name="printer" className="w-6 h-6 text-cyan" />
              {lang === "ar" ? "الآلات" : lang === "fr" ? "Les machines" : "The machines"}
            </h3>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {t.about.machines.map((m, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="rounded-3xl border border-white/8 bg-ink-2 p-6 h-full group hover:border-cyan/30 transition-colors">
                  <div className="h-32 rounded-2xl mat-matte relative overflow-hidden mb-5 shine-sweep">
                    <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-6xl text-white/8 group-hover:text-white/15 transition-colors duration-500">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="absolute bottom-3 start-3 end-3 flex gap-1">
                      {[...Array(14)].map((_, j) => (
                        <span key={j} className={`h-1.5 rounded-full ${j % 3 === 0 ? "w-3 bg-cyan/50" : "w-1.5 bg-white/15"}`} />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-display font-bold text-lg">{m.t}</h4>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{m.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="font-display font-bold text-2xl mb-8 flex items-center gap-3">
              <Icon name="leaf" className="w-6 h-6 text-cyan" />
              {t.about.sus}
            </h3>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass rounded-3xl p-6 text-center">
                  <span className="font-display font-extrabold text-4xl aurora-text">{s.v}</span>
                  <p className="mt-2 text-sm text-muted">{L(s.l)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <Button href="/order" size="lg" magnetic>
            {t.nav.cta}
            <Icon name="arrow" className="w-5 h-5 rtl-flip" />
          </Button>
        </div>
      </div>
    </div>
  );
}
