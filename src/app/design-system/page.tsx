"use client";

import { Badge, Button, Card, EmptyState, Field, Icon, Spinner, SectionHeading, inputCls, inputErrorCls } from "@/components/ui";
import type { BadgeTone, BtnVariant } from "@/components/ui";

/* Living reference for the VEROLA design system. Keep in sync with DESIGN.md. */

const COLORS: { name: string; cls: string; hex: string }[] = [
  { name: "ink", cls: "bg-ink", hex: "#0A0A0F" },
  { name: "ink-2", cls: "bg-ink-2", hex: "#121218" },
  { name: "paper", cls: "bg-paper", hex: "#F7F5F0" },
  { name: "violet", cls: "bg-violet", hex: "#7B2FF7" },
  { name: "cyan", cls: "bg-cyan", hex: "#00F0FF" },
  { name: "magenta", cls: "bg-magenta", hex: "#FF2E93" },
  { name: "gold", cls: "bg-gold", hex: "#D4AF37" },
  { name: "brand", cls: "bg-brand", hex: "#0B63D6" },
  { name: "brand-deep", cls: "bg-brand-deep", hex: "#0B4FB0" },
  { name: "brand-sky", cls: "bg-brand-sky", hex: "#22C1F0" },
  { name: "navy", cls: "bg-navy", hex: "#0D1B32" },
  { name: "surface-soft", cls: "bg-surface-soft", hex: "#F4F7FB" },
  { name: "ink-strong", cls: "bg-ink-strong", hex: "#101828" },
  { name: "ink-body", cls: "bg-ink-body", hex: "#3D4A5C" },
  { name: "ink-muted", cls: "bg-ink-muted", hex: "#5B6779" },
  { name: "ink-faint", cls: "bg-ink-faint", hex: "#98A2B3" },
  { name: "success", cls: "bg-success", hex: "#25D366" },
  { name: "warning", cls: "bg-warning", hex: "#D98B00" },
  { name: "danger", cls: "bg-danger", hex: "#E11D48" },
  { name: "amber", cls: "bg-amber", hex: "#FFC400" },
];

const TYPE: { name: string; cls: string; sample: string }[] = [
  { name: "text-lead", cls: "text-lead", sample: "Print what you imagine" },
  { name: "text-body-sm", cls: "text-body-sm", sample: "Body small — the quick brown fox" },
  { name: "text-small", cls: "text-small", sample: "Small label — 0.8125rem" },
  { name: "text-caption", cls: "text-caption", sample: "Caption — 0.72rem" },
  { name: "text-micro", cls: "text-micro", sample: "Micro — 0.68rem" },
];

const VARIANTS: BtnVariant[] = ["aurora", "primary", "secondary", "glass", "ghost", "danger", "link"];
const TONES: BadgeTone[] = ["neutral", "gold", "brand", "success", "warning", "danger", "info"];

export default function DesignSystemPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 md:px-6 space-y-20">
        <SectionHeading
          kicker="Design system"
          title="VEROLA UI kit"
          sub="Tokens, typography and components used across the platform. Source of truth: src/app/globals.css and src/components/ui.tsx."
        />

        <section aria-labelledby="ds-colors" className="space-y-6">
          <h2 id="ds-colors" className="font-display text-2xl">Colour tokens</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {COLORS.map((c) => (
              <div key={c.name} className="glass rounded-inset overflow-hidden">
                <div className={`h-16 ${c.cls} border-b border-white/10`} />
                <div className="p-3">
                  <p className="text-small font-semibold">{c.name}</p>
                  <p className="text-caption text-muted" dir="ltr">
                    {c.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="ds-type" className="space-y-6">
          <h2 id="ds-type" className="font-display text-2xl">Type scale</h2>
          <Card className="space-y-5">
            <p className="font-display text-5xl uppercase leading-[1.05]">Display heading</p>
            {TYPE.map((t) => (
              <div key={t.name} className="flex flex-wrap items-baseline gap-4">
                <code className="text-caption text-muted w-36" dir="ltr">
                  {t.name}
                </code>
                <span className={t.cls}>{t.sample}</span>
              </div>
            ))}
          </Card>
        </section>

        <section aria-labelledby="ds-radii" className="space-y-6">
          <h2 id="ds-radii" className="font-display text-2xl">Radii & elevation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["rounded-inset", "rounded-tile", "rounded-card", "rounded-panel"].map((r) => (
              <div key={r} className={`glass ${r} h-28 grid place-items-center text-caption text-muted`} dir="ltr">
                {r}
              </div>
            ))}
            {["shadow-lift", "shadow-glow-aurora", "shadow-glow-brand"].map((s) => (
              <div key={s} className={`bg-navy ${s} rounded-tile h-28 grid place-items-center text-caption text-paper`} dir="ltr">
                {s}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="ds-buttons" className="space-y-6">
          <h2 id="ds-buttons" className="font-display text-2xl">Buttons</h2>
          <Card className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              {VARIANTS.map((v) => (
                <Button key={v} variant={v} size="md">
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="glass" ariaLabel="Add">
                <Icon name="plus" />
              </Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
            <Button fullWidth variant="primary">Full width</Button>
          </Card>
        </section>

        <section aria-labelledby="ds-badges" className="space-y-6">
          <h2 id="ds-badges" className="font-display text-2xl">Badges</h2>
          <Card className="flex flex-wrap gap-3">
            {TONES.map((t) => (
              <Badge key={t} tone={t}>
                {t}
              </Badge>
            ))}
          </Card>
        </section>

        <section aria-labelledby="ds-forms" className="space-y-6">
          <h2 id="ds-forms" className="font-display text-2xl">Form fields</h2>
          <Card className="grid md:grid-cols-2 gap-6">
            <Field label="Full name" required hint="As shown on your ID">
              <input className={inputCls} placeholder="Yassine Alaoui" />
            </Field>
            <Field label="Phone" required error="Enter a valid Moroccan number">
              <input className={`${inputCls} ${inputErrorCls}`} aria-invalid="true" dir="ltr" placeholder="+212 6 61 00 00 00" />
            </Field>
            <Field label="Disabled">
              <input className={inputCls} disabled value="Locked" readOnly />
            </Field>
          </Card>
        </section>

        <section aria-labelledby="ds-states" className="space-y-6">
          <h2 id="ds-states" className="font-display text-2xl">Feedback states</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="flex items-center gap-4">
              <Spinner className="w-6 h-6 text-cyan" label="Loading" />
              <p className="text-muted">Loading production queue…</p>
            </Card>
            <Card padded={false}>
              <EmptyState
                title="No orders yet"
                description="Your submitted orders will appear here."
                action={<Button variant="ghost" size="sm">Start a design</Button>}
              />
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
