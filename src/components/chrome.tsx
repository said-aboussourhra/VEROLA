"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button, Icon, WhatsAppIcon, useSound } from "./ui";
import { VerolaMark, VerolaWordmark } from "./logo";
import { useAuth, useToast } from "./notify";
import { CATALOG, FINISHES, calculatePrice, formatMAD } from "@/lib/pricing";
import { useCart, pushDeviceCode, type CartItem } from "@/lib/store";
import { WHATSAPP_URL } from "@/lib/data";

/* ================= NAVBAR ================= */

export function Navbar() {
  const { t, lang, setLang, theme, toggleTheme } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const cartCount = useCart((s) => s.items.length);
  const { user, open: openAuth, logout } = useAuth();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || cartOpen ? "hidden" : "";
  }, [open, cartOpen]);

  const links = [
    { href: "/customize", label: "Customizer" },
    { href: "/#products", label: t.nav.products },
    { href: "/order", label: t.nav.configurator },
    { href: "/designs", label: t.designs.kicker },
    { href: "/floor", label: t.floor.kicker },
    { href: "/portfolio", label: t.nav.portfolio },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/about", label: t.nav.about },
    { href: "/blog", label: t.blog.kicker },
  ];

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-[80] transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <nav
          className={`mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4 rounded-full transition-all duration-500 ${
            scrolled ? "glass mx-4 md:mx-6 px-5 md:px-7 py-2.5" : "py-3 px-2 md:px-4 bg-transparent"
          }`}
          aria-label="Main"
        >
          <a href="/" className="flex items-center gap-2.5" aria-label="VEROLA home">
            <VerolaMark className="w-9 h-9" />
            <VerolaWordmark className="h-[22px] w-auto" />
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-paper/70 hover:text-cyan transition-colors relative group">
                {l.label}
                <span className="absolute -bottom-1 inset-x-0 h-px aurora-bg scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center rounded-full border border-white/10 p-0.5 text-xs font-semibold" role="group" aria-label={t.common.lang}>
              {(["ar", "fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${lang === l ? "aurora-bg text-ink" : "text-muted hover:text-paper"}`}
                  aria-pressed={lang === l}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-paper/70 hover:text-cyan transition-colors cursor-pointer"
              aria-label={t.common.theme}
              aria-pressed={theme === "dark"}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-white/10 text-paper/60 hover:text-cyan transition-colors cursor-pointer"
              aria-label={`${t.common.sound}: ${soundOn ? "on" : "off"}`}
              aria-pressed={soundOn}
            >
              <Icon name={soundOn ? "volume" : "volumeOff"} className="w-4 h-4" />
            </button>

            <Bell />

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-paper/80 hover:text-cyan transition-colors cursor-pointer"
              aria-label={t.cart.title}
            >
              <Icon name="cart" className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full aurora-bg text-ink text-[0.65rem] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="flex items-center gap-2 rounded-full border border-white/10 ps-1.5 pe-3 py-1.5">
                  <span className="w-7 h-7 rounded-full aurora-bg text-ink flex items-center justify-center font-bold text-xs">
                    {user.name[0]?.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold max-w-24 truncate">{user.name}</span>
                </span>
                <button
                  onClick={() => void logout()}
                  className="text-xs text-muted hover:text-danger transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Button href="/login" variant="glass" size="sm" className="hidden md:inline-flex">
                  <Icon name="pin" className="w-4 h-4" />
                  Sign in
                </Button>
                <Button href="/signup" variant="ghost" size="sm" className="hidden xl:inline-flex">
                  Sign up
                </Button>
              </>
            )}

            <Button href="/order" size="sm" magnetic className="hidden lg:inline-flex">
              {t.nav.cta}
            </Button>

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-paper cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={t.nav.menu}
              aria-expanded={open}
            >
              <Icon name={open ? "x" : "menu"} className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[75] bg-ink/95 backdrop-blur-2xl lg:hidden">
          <div className="h-full flex flex-col justify-center px-8 gap-2">
            {links.map((l, i) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-display uppercase text-4xl py-3 text-paper hover:text-cyan transition-colors">
                {l.label}
              </a>
            ))}
            <a href="/account" onClick={() => setOpen(false)} className="font-display uppercase text-4xl py-3 text-paper hover:text-cyan transition-colors">
              {t.account.kicker}
            </a>
            <div className="flex items-center gap-3 mt-8">
              {(["ar", "fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${lang === l ? "aurora-bg text-ink border-transparent" : "border-white/15 text-muted"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Button href="/order" size="lg" magnetic className="mt-6 w-full">
              {t.nav.cta}
            </Button>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

/* ================= CART DRAWER ================= */

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, L, lang } = useI18n();
  const { items, remove, clear } = useCart();
  const [checking, setChecking] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);

  const totals = items.map((it) => {
    const product = CATALOG.find((c) => c.id === it.product)!;
    const bp = calculatePrice({
      product: it.product,
      sizeId: it.sizeId,
      paperId: it.paperId,
      finishId: it.finishId,
      qty: it.qty,
      express: it.express,
      zoneId: it.zoneId,
    });
    return { item: it, product, bp };
  });
  const grand = totals.reduce((s, x) => s + x.bp.total, 0);

  const checkout = async () => {
    setChecking(true);
    const out: string[] = [];
    for (const { item } of totals) {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "VÉLORA cart order",
            phone: "+212661000000",
            city: "Casablanca",
            address: "Cart checkout",
            payment: "cod",
            notes: `Cart line: ${item.product} × ${item.qty}`,
            config: {
              product: item.product,
              sizeId: item.sizeId,
              paperId: item.paperId,
              finishId: item.finishId,
              qty: item.qty,
              express: item.express,
              zoneId: item.zoneId,
              artworkName: item.artworkName,
            },
          }),
        });
        const d = await res.json();
        if (res.ok && d.code) {
          out.push(d.code);
          pushDeviceCode(d.code);
        }
      } catch {
        /* continue with the rest */
      }
    }
    setCodes(out);
    clear();
    setChecking(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <aside
            className="drawer-panel absolute top-0 bottom-0 end-0 w-full max-w-md glass !bg-ink-2/95 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="font-display font-bold text-xl flex items-center gap-3">
                <Icon name="cart" className="w-5 h-5 text-cyan" />
                {t.cart.title}
                {items.length > 0 && <span className="text-sm text-muted tabular-nums">({items.length})</span>}
              </h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-paper/70 hover:text-magenta transition-colors cursor-pointer" aria-label="Close">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {codes.length > 0 ? (
              <div className="p-8 space-y-6 overflow-y-auto">
                <span className="inline-flex w-14 h-14 rounded-full aurora-bg items-center justify-center text-ink pulse-glow">
                  <Icon name="check" className="w-7 h-7" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-paper">{t.cart.doneTitle}</h3>
                  <p className="mt-2 text-muted text-sm">{t.cart.doneSub}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-[0.2em] mb-3">{t.cart.codes}</p>
                  <ul className="space-y-2">
                    {codes.map((c) => (
                      <li key={c} className="flex items-center justify-between">
                        <span className="font-display font-bold aurora-text tracking-widest" dir="ltr">{c}</span>
                        <a href={`/track/${c}`} className="text-xs text-cyan flex items-center gap-1">
                          {t.account.track}
                          <Icon name="arrow" className="w-3.5 h-3.5 rtl-flip" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={onClose} className="w-full">
                  {t.nav.cta}
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center flex-1 flex flex-col items-center justify-center gap-5">
                <span className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted">
                  <Icon name="cart" className="w-7 h-7" />
                </span>
                <p className="text-muted max-w-60">{t.cart.empty}</p>
                <Button href="/order" magnetic onClick={onClose}>
                  {t.cart.emptyCta}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {totals.map(({ item, product, bp }) => (
                    <div key={item.id} className="glass rounded-2xl p-4 flex gap-3">
                      <img src={product.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{L(product.name)}</p>
                        <p className="text-xs text-muted mt-0.5 truncate">
                          {bp.size.name[lang]} · {bp.paper.name[lang]} · {L(bp.finish.name)}
                        </p>
                        <p className="text-xs text-muted mt-0.5 tabular-nums">
                          {item.qty.toLocaleString()} {L(product.unit)}
                          {item.express && <span className="text-cyan ms-2">⚡ {t.cart.expressTag}</span>}
                        </p>
                        <p className="font-semibold text-sm mt-1 tabular-nums">{formatMAD(bp.total, lang)}</p>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="self-start w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-magenta transition-colors cursor-pointer"
                        aria-label={t.cart.remove}
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={clear} className="w-full text-center text-xs text-muted hover:text-magenta transition-colors py-2 cursor-pointer">
                    {t.cart.clear}
                  </button>
                </div>
                <div className="p-6 border-t border-white/8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{t.cart.total}</span>
                    <span className="font-display font-extrabold text-2xl tabular-nums">{formatMAD(grand, lang)}</span>
                  </div>
                  <Button onClick={checkout} disabled={checking} magnetic className="w-full" size="lg">
                    {checking ? t.cart.checking : t.cart.checkout}
                  </Button>
                </div>
              </>
            )}
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= WHATSAPP FLOAT + PANEL ================= */

export function WhatsAppFloat() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const actions = [
    { label: t.nav.cta, href: "/order", ext: false, icon: "printer" as const },
    {
      label: `${t.order.finish} + ${t.order.qty} → price`,
      href: WHATSAPP_URL,
      ext: true,
      icon: "sparkle" as const,
    },
    { label: t.search.title, href: "/track", ext: false, icon: "pin" as const },
  ];

  return (
    <div className="fixed bottom-6 end-6 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-4 w-72"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-whatsapp/15 text-whatsapp flex items-center justify-center">
                <WhatsAppIcon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-sm">{t.common.whatsapp}</p>
                <p className="text-xs text-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                  24/7
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {actions.map((a, i) =>
                a.ext ? (
                  <a key={i} href={a.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm hover:border-cyan/50 hover:text-cyan transition-colors">
                    <Icon name={a.icon} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{a.label}</span>
                  </a>
                ) : (
                  <a key={i} href={a.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm hover:border-cyan/50 hover:text-cyan transition-colors">
                    <Icon name={a.icon} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{a.label}</span>
                  </a>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t.common.whatsapp}
        aria-expanded={open}
            className="w-14 h-14 rounded-full glass flex items-center justify-center text-whatsapp hover:scale-110 transition-transform duration-300 pulse-glow"
      >
        {open ? <Icon name="x" className="w-6 h-6" /> : <WhatsAppIcon className="w-6 h-6" />}
      </button>
    </div>
  );
}

/* ================= FOOTER ================= */

export function Footer() {
  const { t, L } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="relative border-t border-white/8 mt-8">
      <div className="absolute inset-x-0 top-0 h-px aurora-bg opacity-60" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <a href="/" className="inline-flex items-center gap-3">
            <VerolaMark className="w-12 h-12" />
            <VerolaWordmark className="h-7 w-auto" />
          </a>
          <p className="mt-4 text-muted max-w-sm">{t.footer.tagline}</p>
          <div className="mt-8">
            <p className="text-sm font-semibold text-paper/80 mb-3">{t.footer.newsTitle}</p>
            {done ? (
              <p className="text-cyan text-sm flex items-center gap-2">
                <Icon name="check" className="w-4 h-4" />
                {t.footer.subscribed}
              </p>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes("@")) setDone(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.newsPlaceholder}
                  className="flex-1 min-w-0 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-sm placeholder:text-muted/60 focus:border-cyan/60 focus:outline-none"
                  aria-label={t.footer.newsPlaceholder}
                />
                <Button type="submit" size="sm" magnetic>
                  {t.footer.subscribe}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted mb-5">{t.footer.colStudio}</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="/about" className="text-paper/70 hover:text-cyan transition-colors">{t.nav.about}</a></li>
            <li><a href="/portfolio" className="text-paper/70 hover:text-cyan transition-colors">{t.nav.portfolio}</a></li>
            <li><a href="/pricing" className="text-paper/70 hover:text-cyan transition-colors">{t.nav.pricing}</a></li>
            <li><a href="/designs" className="text-paper/70 hover:text-cyan transition-colors">{t.designs.kicker}</a></li>
            <li><a href="/floor" className="text-paper/70 hover:text-cyan transition-colors">{t.floor.kicker}</a></li>
            <li><a href="/blog" className="text-paper/70 hover:text-cyan transition-colors">{t.blog.kicker}</a></li>
            <li><a href="/account" className="text-paper/70 hover:text-cyan transition-colors">{t.account.kicker}</a></li>
            <li><a href="/login" className="text-paper/70 hover:text-cyan transition-colors">Sign in / Sign up</a></li>
            <li><a href="/studio" className="text-paper/70 hover:text-cyan transition-colors">{t.studio.kicker}</a></li>
            <li><a href="/admin" className="text-paper/70 hover:text-cyan transition-colors">Admin CMS</a></li>
            <li><a href="/developer" className="text-paper/70 hover:text-cyan transition-colors">BAOUCOUS</a></li>
            <li><a href="/legal" className="text-paper/70 hover:text-cyan transition-colors">{t.footer.rights}</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted mb-5">{t.footer.colProducts}</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {CATALOG.map((c) => (
              <li key={c.id}>
                <a href={`/order?product=${c.id}`} className="text-paper/70 hover:text-cyan transition-colors">
                  {L(c.name)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted mb-5">{t.footer.colHelp}</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="/#faq" className="text-paper/70 hover:text-cyan transition-colors">FAQ</a></li>
            <li><a href="/track" className="text-paper/70 hover:text-cyan transition-colors">{t.search.title}</a></li>
            <li><a href="/track/VLR-2847" className="text-paper/70 hover:text-cyan transition-colors">VLR-2847</a></li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-paper/70 hover:text-cyan transition-colors flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {t.common.whatsapp}
              </a>
            </li>
            <li>
              <a href="mailto:hello@velora.ma" className="text-paper/70 hover:text-cyan transition-colors flex items-center gap-2">
                <Icon name="mail" className="w-4 h-4" />
                hello@velora.ma
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} VÉLORA. {t.footer.rights}</span>
          <span className="flex items-center gap-2">
            <Icon name="droplet" className="w-3.5 h-3.5 text-violet" />
            {t.footer.made} —{" "}
            <a href="/developer" className="font-semibold text-paper/70 hover:text-cyan transition-colors" dir="ltr">
              Designed &amp; Developed by BAOUCOUS
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export type { CartItem };

/* ================= NOTIFICATION BELL ================= */

interface BellItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

function Bell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BellItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setItems(d.items ?? []);
        setUnread(d.unread ?? 0);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => undefined);
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-paper/80 hover:text-cyan transition-colors cursor-pointer"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Icon name="bell" className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full aurora-bg text-ink text-[0.62rem] font-bold flex items-center justify-center tabular-nums pulse-glow">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-12 w-[min(340px,calc(100vw-2rem))] glass rounded-3xl p-3 shadow-2xl">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button onClick={() => void markAll()} className="text-xs text-cyan hover:underline cursor-pointer">
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-muted px-2 py-6 text-center">You&apos;re all caught up.</p>
          ) : (
            <ul className="space-y-1.5 max-h-80 overflow-y-auto">
              {items.slice(0, 12).map((n) => (
                <li key={n.id}>
                  <a
                    href={n.href ?? "#"}
                    onClick={() => setOpen(false)}
                    className={`flex gap-2.5 rounded-2xl px-3 py-2.5 hover:bg-white/5 transition-colors ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        background:
                          n.type === "order"
                            ? "#0b63d6"
                            : n.type === "design"
                              ? "#ff2e93"
                              : n.type === "status"
                                ? "#22c1f0"
                                : "#d98b00",
                      }}
                    >
                      <Icon
                        name={
                          n.type === "order"
                            ? "printer"
                            : n.type === "design"
                              ? "sparkle"
                              : n.type === "status"
                                ? "truck"
                                : "file"
                        }
                        className="w-4 h-4"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-snug">{n.title}</span>
                      {n.body && <span className="block text-micro text-muted leading-snug line-clamp-2">{n.body}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
