"use client";

import { useI18n } from "@/lib/i18n";
import { POSTS } from "@/lib/blog";
import { Badge, Icon, SectionHeading, Reveal } from "@/components/ui";

export default function BlogPage() {
  const { t, L, lang } = useI18n();

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading kicker={t.blog.kicker} title={t.blog.title} sub={t.blog.sub} />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <a href={`/blog/${p.slug}`} className="block group h-full">
                <div className={`relative rounded-[28px] overflow-hidden border border-white/8 blog-art ${p.art}`}>
                  <div className="h-48 relative">
                    <div className="absolute inset-0 halftone opacity-40" aria-hidden />
                    <div className="absolute -bottom-10 end-2 font-display font-extrabold text-[11rem] leading-none text-ink/10 select-none group-hover:scale-110 transition-transform duration-700 origin-bottom">
                      {p.glyph}
                    </div>
                    <span className="absolute top-4 start-4">
                      <Badge>{L(p.cat)}</Badge>
                    </span>
                    <div className="absolute inset-0 aurora-bg opacity-0 group-hover:opacity-10 transition-opacity duration-700" aria-hidden />
                  </div>
                  <div className="p-6 bg-ink-2/60 backdrop-blur-sm">
                    <p className="text-xs text-muted mb-2">
                      {new Date(p.date).toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {p.min} {t.blog.min}
                    </p>
                    <h3 className="font-display font-bold text-xl leading-snug group-hover:text-cyan transition-colors">
                      {L(p.title)}
                    </h3>
                    <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">{L(p.excerpt)}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan">
                      {t.blog.read}
                      <Icon name="arrow" className="w-4 h-4 rtl-flip group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
