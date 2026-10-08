"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { POSTS } from "@/lib/blog";
import { Badge, Button, Icon, Reveal } from "@/components/ui";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return <PostView slug={slug} />;
}

function PostView({ slug }: { slug: string }) {
  const { t, L, lang } = useI18n();
  const post = POSTS.find((p) => p.slug === slug)!;

  return (
    <article className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-3xl px-4 md:px-6">
        <Reveal>
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors mb-10"
          >
            <Icon name="arrow" className="w-4 h-4 rotate-180 rtl-flip" />
            {t.blog.back}
          </a>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge>{L(post.cat)}</Badge>
            <span>
              {new Date(post.date).toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>
              · {post.min} {t.blog.min}
            </span>
          </div>
          <h1
            className={`mt-6 font-display font-extrabold leading-[1.08] text-paper ${
              lang === "ar" ? "text-3xl md:text-5xl" : "text-[clamp(2rem,5.5vw,4rem)]"
            }`}
          >
            {L(post.title)}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={`relative mt-10 rounded-card overflow-hidden border border-white/8 blog-art ${post.art} h-56`}>
            <div className="absolute inset-0 halftone opacity-40" aria-hidden />
            <div
              className="absolute -bottom-16 end-6 font-display font-extrabold text-[16rem] leading-none text-ink/10 select-none"
              aria-hidden
            >
              {post.glyph}
            </div>
            <div className="absolute bottom-4 start-5">
              <span className="font-display font-bold text-sm tracking-[0.3em] text-ink/60" dir="ltr">
                VÉLORA — {t.blog.kicker.toUpperCase()}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 space-y-7">
            {post.body.map((para, i) => (
              <p
                key={i}
                className={`leading-[1.85] ${
                  i === 0
                    ? "text-xl text-paper/90 first-letter:font-display first-letter:font-extrabold first-letter:text-5xl first-letter:float-start first-letter:me-3 first-letter:aurora-text"
                    : "text-paper/80 text-[1.05rem]"
                }`}
              >
                {L(para)}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-14 glass rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-display font-bold text-xl">{t.hero.kicker}</p>
              <p className="text-sm text-muted mt-1">{t.hero.sub.slice(0, 90)}…</p>
            </div>
            <Button href="/order" magnetic>
              {t.nav.cta}
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
