"use client";

import { useEffect, useState } from "react";
import { Icon, Button, Badge, inputCls } from "@/components/ui";
import { BrandPreview, BrandSwatches, type Brand } from "@/components/tenant";
import { useToast } from "@/components/notify";

const EMPTY = {
  slug: "",
  name: "",
  tagline: "Print what you imagine.",
  logoUrl: "",
  domain: "",
  city: "",
  phone: "",
  whatsapp: "",
  email: "",
  brand1: "#0B63D6",
  brand2: "#22C1F0",
  brand3: "#FF2E93",
  accent: "#0B63D6",
  currency: "MAD",
};

const PRESETS = [
  { label: "VEROLA Blue", brand1: "#0B63D6", brand2: "#22C1F0", brand3: "#FF2E93", accent: "#0B63D6" },
  { label: "Emerald", brand1: "#047857", brand2: "#34D399", brand3: "#F59E0B", accent: "#059669" },
  { label: "Royal", brand1: "#4C1D95", brand2: "#8B5CF6", brand3: "#EC4899", accent: "#7C3AED" },
  { label: "Sunset", brand1: "#B91C1C", brand2: "#F97316", brand3: "#FACC15", accent: "#EA580C" },
  { label: "Mono Ink", brand1: "#111827", brand2: "#374151", brand3: "#6B7280", accent: "#111827" },
];

export function WhiteLabel() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [list, setList] = useState<{ slug: string; name: string; domain: string | null; active: boolean }[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch("/api/tenants")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.tenant) setList((l) => l);
      })
      .catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  const preview: Brand = {
    slug: form.slug || "your-shop",
    name: form.name || "Your Print Shop",
    tagline: form.tagline,
    logoUrl: form.logoUrl || null,
    domain: form.domain || null,
    city: form.city,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    brand1: form.brand1,
    brand2: form.brand2,
    brand3: form.brand3,
    accent: form.accent,
    currency: form.currency,
    isDefault: false,
  };

  const save = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      toast.error("Missing details", "A slug and a shop name are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error("Not allowed", d.error ?? "Administrator access is required.");
        return;
      }
      toast.success(
        d.created ? "Shop created" : "Shop updated",
        `${form.name} → /t/${form.slug}`,
      );
      load();
    } catch {
      toast.error("Something went wrong.", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-7 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
      {/* form */}
      <div className="rounded-[26px] bg-white border border-[#0b63d6]/12 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-bold text-lg">White-label shop</h3>
          <Badge>Multi-tenant SaaS</Badge>
        </div>
        <p className="mt-1.5 text-sm text-[#5b6779]">
          Every printing shop gets its own name, logo, palette and domain — hosted on VEROLA.
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Shop name</span>
            <input className={inputCls} value={form.name} placeholder="PRINT.VR.COM" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Slug / subdomain</span>
            <input className={inputCls} dir="ltr" value={form.slug} placeholder="print" onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Tagline</span>
            <input className={inputCls} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Logo URL (uploaded file)</span>
            <input className={inputCls} dir="ltr" value={form.logoUrl} placeholder="/api/uploads/u_…png" onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Custom domain</span>
            <input className={inputCls} dir="ltr" value={form.domain} placeholder="print.vr.com" onChange={(e) => setForm({ ...form, domain: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Currency</span>
            <input className={inputCls} dir="ltr" value={form.currency} placeholder="MAD" onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">City</span>
            <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Phone</span>
            <input className={inputCls} dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">WhatsApp</span>
            <input className={inputCls} dir="ltr" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-1">Email</span>
            <input className={inputCls} dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
        </div>

        {/* palette */}
        <div className="mt-6">
          <p className="text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-2">Brand palette</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setForm({ ...form, ...p })}
                className="rounded-full px-3.5 py-2 text-xs font-semibold border border-[#0b63d6]/15 text-[#5b6779] hover:border-[#0b63d6]/45 transition cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: p.brand1 }} />
                  <span className="w-3 h-3 rounded-full -ms-2" style={{ background: p.brand2 }} />
                  <span className="w-3 h-3 rounded-full -ms-2" style={{ background: p.brand3 }} />
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["brand1", "brand2", "brand3", "accent"] as const).map((k) => (
              <label key={k} className="block">
                <span className="block text-[0.68rem] uppercase tracking-wider text-[#98a2b3] mb-1">{k}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-[#0b63d6]/18 cursor-pointer"
                    aria-label={k}
                  />
                  <input
                    dir="ltr"
                    className="flex-1 min-w-0 rounded-lg border border-[#0b63d6]/15 px-2 py-2 text-xs font-mono uppercase"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => void save()} disabled={busy} magnetic>
            <Icon name="check" className="w-4 h-4" />
            {busy ? "Saving…" : "Save shop"}
          </Button>
          <a
            href={form.slug ? `/t/${form.slug}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[#0b63d6] hover:underline"
          >
            Preview /t/{form.slug || "your-shop"} →
          </a>
        </div>
      </div>

      {/* live preview */}
      <div className="space-y-4">
        <div className="rounded-[26px] bg-white border border-[#0b63d6]/12 p-6">
          <p className="text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-3">Live preview</p>
          <BrandPreview brand={preview} />
          <div className="mt-4 flex items-center justify-between">
            <BrandSwatches brand={preview} />
            <span className="text-xs text-[#98a2b3]" dir="ltr">
              {form.domain || `${form.slug || "shop"}.verola.com`}
            </span>
          </div>
        </div>

        <div className="rounded-[26px] bg-white border border-[#0b63d6]/12 p-6">
          <p className="text-[0.72rem] uppercase tracking-wider text-[#98a2b3] mb-3">How resolution works</p>
          <ol className="space-y-2.5 text-sm text-[#5b6779]">
            {[
              "Custom domain (print.vr.com) → matched to tenants.domain",
              "Subdomain (print.verola.com) → matched to tenants.slug",
              "Base domain (verola.com) → the platform brand",
            ].map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0b63d6]/10 text-[#0b63d6] text-[0.68rem] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-[#98a2b3] leading-relaxed">
            The palette is injected as CSS variables on the server, so the whole platform — buttons,
            links, gradients, logo — rebrands instantly with zero code changes per shop.
          </p>
        </div>
      </div>
    </div>
  );
}
