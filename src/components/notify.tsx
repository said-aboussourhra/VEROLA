"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button, Icon, inputCls } from "./ui";

/* ================= TOASTS ================= */

export type ToastKind = "success" | "error" | "info" | "order";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
  href?: string;
  hrefLabel?: string;
}

interface ToastCtx {
  push: (t: Omit<Toast, "id">) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setItems((s) => s.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++seq;
      setItems((s) => [...s.slice(-3), { ...t, id }]);
      setTimeout(() => remove(id), t.href ? 8000 : 5200);
    },
    [remove],
  );

  const api = useMemo<ToastCtx>(
    () => ({
      push,
      success: (title, body) => push({ kind: "success", title, body }),
      error: (title, body) => push({ kind: "error", title, body }),
      info: (title, body) => push({ kind: "info", title, body }),
    }),
    [push],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <Toaster items={items} onClose={remove} />
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast outside provider");
  return c;
}

const KIND: Record<ToastKind, { color: string; icon: string }> = {
  success: { color: "#0b7fd4", icon: "check" },
  error: { color: "#e11d48", icon: "x" },
  info: { color: "#0b63d6", icon: "sparkle" },
  order: { color: "#d98b00", icon: "printer" },
};

function Toaster({ items, onClose }: { items: Toast[]; onClose: (id: number) => void }) {
  return (
    <div
      className="fixed z-[250] bottom-5 start-5 flex flex-col gap-3 w-[min(360px,calc(100vw-2.5rem))]"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const k = KIND[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -26, scale: 0.95 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="toast-card"
            >
              <span className="toast-icon" style={{ background: k.color }}>
                <Icon name={k.icon} className="w-4 h-4 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[0.9rem] leading-snug text-ink-strong">{t.title}</p>
                {t.body && <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t.body}</p>}
                {t.href && (
                  <a
                    href={t.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    {t.hrefLabel ?? "Open"}
                    <Icon name="arrow" className="w-3.5 h-3.5 rtl-flip" />
                  </a>
                )}
              </div>
              <button
                onClick={() => onClose(t.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-ink-faint hover:text-ink-strong transition-colors cursor-pointer"
                aria-label="Close"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ================= ACCOUNT ================= */

export interface AccountUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface AuthCtx {
  user: AccountUser | null;
  open: (mode?: "login" | "register") => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [mode, setMode] = useState<null | "login" | "register">(null);
  const toast = useToast();
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    toast.info(t.order.success.title.replace("ON THE PRESS.", "Signed out"), t.footer.made);
  };

  return (
    <AuthContext.Provider
      value={{ user, open: (m = "login") => setMode(m), logout }}
    >
      {children}
      <AuthPanel mode={mode} setMode={setMode} onUser={setUser} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}

function AuthPanel({
  mode,
  setMode,
  onUser,
}: {
  mode: null | "login" | "register";
  setMode: (m: null | "login" | "register") => void;
  onUser: (u: AccountUser | null) => void;
}) {
  const { t } = useI18n();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode) {
      setErr("");
      setBusy(false);
    }
  }, [mode]);

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      const isReg = mode === "register";
      const res = await fetch(isReg ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error ?? "—");
        return;
      }
      onUser(d.user);
      setMode(null);
      toast.success(
        isReg ? t.designs.unlocked : t.cart.doneTitle,
        `${d.user.name} · ${d.user.email}`,
      );
      setName("");
      setPassword("");
    } catch {
      setErr("—");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div
            className="absolute inset-0 bg-ink-strong/45 backdrop-blur-sm"
            onClick={() => setMode(null)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="auth-card relative w-full max-w-md p-8"
            initial={{ scale: 0.94, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 18 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => setMode(null)}
              className="absolute top-4 end-4 w-8 h-8 rounded-full flex items-center justify-center text-ink-faint hover:text-ink-strong cursor-pointer"
              aria-label="Close"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>

            <h2 className="font-display font-extrabold text-2xl">
              {mode === "register" ? t.account.title : t.account.search.replace(t.account.searchPh, "").trim() || "Sign in"}
            </h2>
            <p className="text-sm text-ink-muted mt-1">{t.account.sub}</p>

            <div className="mt-6 space-y-3">
              {mode === "register" && (
                <>
                  <input
                    className={inputCls}
                    placeholder={t.designs.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label={t.designs.name}
                  />
                  <input
                    className={inputCls}
                    dir="ltr"
                    placeholder={t.designs.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-label={t.designs.phone}
                  />
                </>
              )}
              <input
                className={inputCls}
                dir="ltr"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              <input
                className={inputCls}
                dir="ltr"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              {err && <p className="text-sm text-danger">{err}</p>}
              <Button onClick={() => void submit()} disabled={busy} magnetic className="w-full" size="lg">
                {mode === "register" ? t.designs.unlock : "Sign in"}
              </Button>
            </div>

            <p className="mt-5 text-center text-sm text-ink-muted">
              {mode === "register" ? "Already have an account?" : "No account yet?"}{" "}
              <button
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="font-semibold text-brand hover:underline cursor-pointer"
              >
                {mode === "register" ? "Sign in" : "Create one"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
