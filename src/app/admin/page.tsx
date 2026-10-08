"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATALOG, formatMAD } from "@/lib/pricing";
import { Icon, Button, Badge, Reveal, SectionHeading, inputCls } from "@/components/ui";
import { useAuth, useToast } from "@/components/notify";

interface MediaItem {
  id: number;
  title: string;
  description: string | null;
  url: string;
  category: string;
  position: number;
  featured: boolean;
  enabled: boolean;
}

interface AdminOrder {
  code: string;
  job: string | null;
  name: string;
  phone: string;
  city: string | null;
  product: string;
  quantity: number;
  total: number;
  payment: string;
  advanceAmount: number;
  artworkName: string | null;
  note: string | null;
  createdAt: string;
}

const TABS = ["Hero & Media", "Orders", "Notifications", "Developer"] as const;

export default function AdminPage() {
  const { t, L, lang } = useI18n();
  const { user, open: openAuth } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Hero & Media");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({ requests: 0, revenue: 0, advances: 0, members: 0 });
  const [form, setForm] = useState({ title: "", url: "", description: "", category: "hero", position: 0, featured: false, enabled: true });
  const [notif, setNotif] = useState({ title: "", body: "", href: "", type: "order" });
  const [q, setQ] = useState("");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);

  const unlock = async () => {
    setCodeErr("");
    setCodeBusy(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Access granted", "Welcome to the control room.");
        window.location.assign("/admin?unlocked=1");
        return;
      }
      setCodeErr(d.error ?? "Wrong access code.");
    } catch {
      setCodeErr("Connection interrupted. Please try again.");
    } finally {
      setCodeBusy(false);
    }
  };

  const isAdmin = user?.role === "admin";

  const loadMedia = () =>
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMedia(d.items))
      .catch(() => undefined);

  const loadOrders = () =>
    fetch("/api/studio")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setOrders(d.orders);
        setStats(d.stats);
      })
      .catch(() => undefined);

  useEffect(() => {
    loadMedia();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMedia = async () => {
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Hero updated", "The homepage now shows your changes.");
      setForm({ title: "", url: "", description: "", category: "hero", position: 0, featured: false, enabled: true });
      loadMedia();
    } else {
      toast.error("Not allowed", "Sign in with an administrator account.");
    }
  };

  const removeMedia = async (id: number) => {
    await fetch(`/api/media?id=${id}`, { method: "DELETE" }).catch(() => undefined);
    toast.info("Removed", "The item is no longer on the site.");
    loadMedia();
  };

  const sendNotif = async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notif),
    });
    if (res.ok) {
      toast.success("Notification sent", "It appears in the navbar bell.");
      setNotif({ title: "", body: "", href: "", type: "order" });
    } else {
      toast.error("Not allowed", "Sign in with an administrator account.");
    }
  };

  const filtered = orders.filter(
    (o) =>
      !q ||
      o.code.toLowerCase().includes(q.toLowerCase()) ||
      o.name.toLowerCase().includes(q.toLowerCase()) ||
      o.phone.includes(q),
  );

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading
            kicker="Admin CMS"
            title="VEROLA CONTROL ROOM"
            sub="Hero, media, orders, notifications and the developer page — edited here, never in code."
          />
        </Reveal>

        {user?.role !== "admin" ? (
          <div className="mx-auto max-w-md rounded-card bg-white border border-brand/12 p-10 text-center shadow-[0_30px_70px_-46px_rgba(16,42,90,0.6)]">
            <span className="mx-auto flex w-14 h-14 rounded-full aurora-bg items-center justify-center text-white">
              <Icon name="shield" className="w-6 h-6" />
            </span>
            <h2 className="mt-5 font-display font-extrabold text-2xl text-navy">
              SA ID — Control Room
            </h2>
            <p className="mt-2 text-ink-muted text-sm">
              Enter the administrator access code to open the CMS.
            </p>

            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void unlock();
              }}
            >
              <input
                type="password"
                dir="ltr"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                aria-label="Administrator access code"
                className="w-full rounded-2xl border border-brand/18 px-5 py-4 text-center text-xl tracking-[0.5em] font-mono focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
              {codeErr && <p className="text-sm text-danger">{codeErr}</p>}
              <Button type="submit" magnetic size="lg" className="w-full" disabled={codeBusy}>
                {codeBusy ? "Checking…" : "Unlock"}
                {!codeBusy && <Icon name="arrow" className="w-5 h-5 rtl-flip" />}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-caption text-ink-faint">
              <span className="flex-1 h-px bg-brand/12" />
              SA ID · Web Developer
              <span className="flex-1 h-px bg-brand/12" />
            </div>
            <button
              onClick={() => openAuth("login")}
              className="mt-4 text-xs text-brand hover:underline cursor-pointer"
            >
              or sign in with a customer account
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl aurora-bg text-white flex items-center justify-center">
                  <Icon name="shield" className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display font-bold text-navy leading-tight">BAOUCOUS</p>
                  <p className="text-xs text-ink-faint">Administrator</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/auth/admin", { method: "DELETE" }).catch(() => undefined);
                  await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
                  window.location.reload();
                }}
                className="rounded-full border border-danger/25 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger hover:text-white transition cursor-pointer"
              >
                Lock control room
              </button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { v: stats.requests, l: t.studio.sRequests },
                { v: formatMAD(stats.revenue, lang), l: t.studio.sRevenue },
                { v: formatMAD(stats.advances, lang), l: t.studio.sAdvances },
                { v: stats.members, l: t.studio.sMembers },
              ].map((s, i) => (
                <div key={i} className="rounded-3xl bg-white border border-brand/12 p-5 shadow-lift">
                  <p className="font-display font-extrabold text-2xl aurora-text tabular-nums truncate">{s.v}</p>
                  <p className="text-xs text-ink-faint mt-1.5">{s.l}</p>
                </div>
              ))}
            </div>

            {/* tabs */}
            <div className="mt-8 flex flex-wrap gap-2">
              {TABS.map((x) => (
                <button
                  key={x}
                  onClick={() => setTab(x)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
                    tab === x
                      ? "aurora-bg text-white border-transparent"
                      : "bg-white text-ink-muted border-brand/15 hover:border-brand/45"
                  }`}
                  aria-pressed={tab === x}
                >
                  {x}
                </button>
              ))}
            </div>

            {/* HERO & MEDIA */}
            {tab === "Hero & Media" && (
              <div className="mt-7 grid lg:grid-cols-[1fr_1.2fr] gap-6">
                <div className="rounded-tile bg-white border border-brand/12 p-6">
                  <h3 className="font-display font-bold text-lg">Add / update image</h3>
                  <div className="mt-4 space-y-3">
                    <input className={inputCls} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <input className={inputCls} dir="ltr" placeholder="Image URL (or /api/uploads/…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                    <textarea className={`${inputCls} min-h-20`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        {["hero", "portfolio", "mockup", "service"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input type="number" className={inputCls} placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-brand" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                        Featured
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-brand" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
                        Enabled
                      </label>
                    </div>
                    <Button onClick={() => void saveMedia()} magnetic className="w-full">
                      <Icon name="check" className="w-4 h-4" /> Save to site
                    </Button>
                    {!isAdmin && (
                      <p className="text-xs text-warning">
                        You are signed in but not an administrator — saving will be rejected server-side.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-tile bg-white border border-brand/12 p-6">
                  <h3 className="font-display font-bold text-lg">Live media ({media.length})</h3>
                  {media.length === 0 ? (
                    <p className="mt-4 text-sm text-ink-faint">
                      No CMS media yet. The hero falls back to the built-in VEROLA artwork until you add one.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-2.5">
                      {media.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-brand/10 p-3">
                          <img src={m.url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{m.title}</p>
                            <p className="text-xs text-ink-faint truncate">
                              {m.category} · #{m.position} {m.featured && "· featured"} {!m.enabled && "· hidden"}
                            </p>
                          </div>
                          <button
                            onClick={() => void removeMedia(m.id)}
                            className="w-8 h-8 rounded-full border border-danger/25 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition cursor-pointer"
                            aria-label="Delete"
                          >
                            <Icon name="x" className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === "Orders" && (
              <div className="mt-7 rounded-tile bg-white border border-brand/12 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className={`${inputCls} max-w-xs`}
                    placeholder="Search order, name or phone"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Badge>{filtered.length} results</Badge>
                </div>
                {filtered.length === 0 ? (
                  <p className="mt-6 text-sm text-ink-faint text-center py-10">{t.studio.empty}</p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {filtered.map((o) => (
                      <li key={o.code} className="rounded-2xl border border-brand/10 p-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="font-display font-bold aurora-text tracking-widest" dir="ltr">#{o.code}</span>
                          {o.job && <span className="font-mono text-xs text-brand">{o.job}</span>}
                          <span className="text-sm text-ink-subtle">
                            {CATALOG.find((c) => c.id === o.product) ? L(CATALOG.find((c) => c.id === o.product)!.name) : o.product} · {o.quantity.toLocaleString()}
                          </span>
                          <span className="ms-auto font-display font-bold tabular-nums">{formatMAD(o.total, lang)}</span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                          <span>{o.name}</span>
                          <span dir="ltr">{o.phone}</span>
                          {o.city && <span>{o.city}</span>}
                          <span>{o.payment}</span>
                          {o.advanceAmount > 0 && (
                            <span className="text-brand font-semibold">advance {formatMAD(o.advanceAmount, lang)}</span>
                          )}
                          <a href={`/track/${o.code}`} className="text-brand font-semibold hover:underline ms-auto">
                            Track →
                          </a>
                          <a
                            href={`https://wa.me/${o.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-whatsapp font-semibold hover:underline"
                          >
                            WhatsApp
                          </a>
                        </div>
                        {o.note && <p className="mt-2 text-xs text-ink-muted italic">“{o.note}”</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === "Notifications" && (
              <div className="mt-7 rounded-tile bg-white border border-brand/12 p-6 max-w-2xl">
                <h3 className="font-display font-bold text-lg">Broadcast a notification</h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  It lands instantly in the navbar bell for signed-in customers.
                </p>
                <div className="mt-4 space-y-3">
                  <select className={inputCls} value={notif.type} onChange={(e) => setNotif({ ...notif, type: e.target.value })}>
                    {["order", "design", "status", "message", "info"].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                  <input className={inputCls} placeholder="Title" value={notif.title} onChange={(e) => setNotif({ ...notif, title: e.target.value })} />
                  <textarea className={`${inputCls} min-h-24`} placeholder="Message" value={notif.body} onChange={(e) => setNotif({ ...notif, body: e.target.value })} />
                  <input className={inputCls} dir="ltr" placeholder="Link (e.g. /track/VLR-0000)" value={notif.href} onChange={(e) => setNotif({ ...notif, href: e.target.value })} />
                  <Button onClick={() => void sendNotif()} magnetic>
                    <Icon name="zap" className="w-4 h-4" /> Send notification
                  </Button>
                </div>
              </div>
            )}

            {/* WHITE-LABEL SAAS */}

            {/* DEVELOPER */}
            {tab === "Developer" && (
              <div className="mt-7 rounded-tile bg-white border border-brand/12 p-8 max-w-2xl">
                <h3 className="font-display font-bold text-lg">Developer page — BAOUCOUS</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  Name, role, about, photo and contact links (WhatsApp · Instagram · Gmail) are stored in the
                  database and editable directly on the developer page when signed in as an administrator.
                  Nothing is hardcoded — change the identity any time.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/developer" magnetic>
                    Open developer page
                    <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                  </Button>
                  <Button href="/studio" variant="ghost">{t.studio.kicker}</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
