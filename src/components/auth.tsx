"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Icon, Button } from "@/components/ui";
import { VerolaMark, VerolaWordmark } from "@/components/logo";
import { useAuth, useToast } from "@/components/notify";
import { useI18n } from "@/lib/i18n";

type Mode = "login" | "register";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  en: {
    loginTitle: "Welcome back.",
    loginSub: "Sign in to follow your orders, saved designs and messages.",
    regTitle: "Create your account.",
    regSub: "Save designs, track production and reorder in one click.",
    name: "Full name",
    phone: "Phone (WhatsApp)",
    email: "Email address",
    password: "Password",
    confirm: "Confirm password",
    show: "Show",
    hide: "Hide",
    remember: "Remember me",
    forgot: "Forgot password?",
    signIn: "Sign in",
    signUp: "Create account",
    switching: "Already have an account?",
    switchingTo: "No account yet?",
    switchToLogin: "Sign in",
    switchToRegister: "Create one",
    or: "or continue with",
    google: "Google",
    googleNote: "Requires Google OAuth credentials in .env",
    terms: "I agree to the Terms & Privacy Policy",
    rights: "You keep the rights to every file you upload.",
    errName: "Please enter your name.",
    errEmail: "Enter a valid email address.",
    errPhone: "Enter a valid phone number.",
    errPass: "Use at least 8 characters.",
    errPassMatch: "Passwords do not match.",
    errTerms: "Please accept the terms first.",
    strength: ["Too short", "Weak", "Fair", "Good", "Strong"],
    bullets: [
      { t: "Live order tracking", d: "From preflight to delivery, in real time." },
      { t: "Saved designs", d: "Continue editing any design later." },
      { t: "Direct messages", d: "Talk to the studio inside each order." },
    ],
    studio: "Premium digital printing studio",
  },
  fr: {
    loginTitle: "Bon retour.",
    loginSub: "Connectez-vous pour suivre vos commandes, designs et messages.",
    regTitle: "Créez votre compte.",
    regSub: "Enregistrez vos designs, suivez la production et recommandez en un clic.",
    name: "Nom complet",
    phone: "Téléphone (WhatsApp)",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirm: "Confirmer le mot de passe",
    show: "Afficher",
    hide: "Masquer",
    remember: "Se souvenir de moi",
    forgot: "Mot de passe oublié ?",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    switching: "Vous avez déjà un compte ?",
    switchingTo: "Pas encore de compte ?",
    switchToLogin: "Se connecter",
    switchToRegister: "Créer-en un",
    or: "ou continuer avec",
    google: "Google",
    googleNote: "Nécessite les identifiants Google OAuth dans .env",
    terms: "J'accepte les Conditions & la Politique de confidentialité",
    rights: "Vous gardez les droits sur chaque fichier envoyé.",
    errName: "Veuillez saisir votre nom.",
    errEmail: "Saisissez une adresse e-mail valide.",
    errPhone: "Saisissez un numéro valide.",
    errPass: "Utilisez au moins 8 caractères.",
    errPassMatch: "Les mots de passe ne correspondent pas.",
    errTerms: "Veuillez d'abord accepter les conditions.",
    strength: ["Trop court", "Faible", "Moyen", "Bon", "Fort"],
    bullets: [
      { t: "Suivi en direct", d: "Du preflight à la livraison, en temps réel." },
      { t: "Designs enregistrés", d: "Reprenez l'édition plus tard." },
      { t: "Messages directs", d: "Échangez avec l'atelier dans chaque commande." },
    ],
    studio: "Studio d'impression numérique premium",
  },
  ar: {
    loginTitle: "مرحباً بعودتك.",
    loginSub: "سجّل الدخول لتتابع طلباتك وتصاميمك ورسائلك.",
    regTitle: "أنشئ حسابك.",
    regSub: "احفظ تصاميمك، تابع الإنتاج، وأعد الطلب بنقرة واحدة.",
    name: "الاسم الكامل",
    phone: "الهاتف (واتساب)",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirm: "تأكيد كلمة المرور",
    show: "إظهار",
    hide: "إخفاء",
    remember: "تذكّرني",
    forgot: "نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    switching: "لديك حساب بالفعل؟",
    switchingTo: "لا تملك حساباً؟",
    switchToLogin: "سجّل الدخول",
    switchToRegister: "أنشئ واحداً",
    or: "أو تابع عبر",
    google: "Google",
    googleNote: "يتطلب مفاتيح Google OAuth في .env",
    terms: "أوافق على الشروط وسياسة الخصوصية",
    rights: "تحتفظ بحقوق كل ملف ترفعه.",
    errName: "يرجى إدخال اسمك.",
    errEmail: "أدخل بريداً إلكترونياً صحيحاً.",
    errPhone: "أدخل رقم هاتف صحيحاً.",
    errPass: "استخدم 8 أحرف على الأقل.",
    errPassMatch: "كلمتا المرور غير متطابقتين.",
    errTerms: "يرجى الموافقة على الشروط أولاً.",
    strength: ["قصيرة جداً", "ضعيفة", "متوسطة", "جيدة", "قوية"],
    bullets: [
      { t: "تتبّع مباشر", d: "من الفحص حتى التوصيل، لحظة بلحظة." },
      { t: "تصاميم محفوظة", d: "أكمل التحرير لاحقاً في أي وقت." },
      { t: "رسائل مباشرة", d: "تحدّث مع الاستوديو داخل كل طلب." },
    ],
    studio: "استوديو طباعة رقمية فاخر",
  },
};

function strengthOf(p: string): number {
  if (p.length < 8) return 0;
  let s = 1;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
}

export function AuthPage({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion();
  const { user, open: openAuth } = useAuth();
  const { lang } = useI18n();
  const [mode, setMode] = useState<Mode>(initialMode);
  const T = COPY[lang] ?? COPY.en;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [googleNote, setGoogleNote] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /** Studio access code → straight into the admin control room. */
  const adminUnlock = async () => {
    setAdminMsg(null);
    if (!adminCode.trim()) {
      setAdminMsg({ ok: false, text: "Enter the access code." });
      return;
    }
    setAdminBusy(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setAdminMsg({ ok: true, text: "Access granted — opening the control room…" });
        toast.success("Access granted", "Redirecting to the admin control room.");
        setTimeout(() => {
          window.location.assign("/admin");
        }, 350);
        return;
      }
      setAdminMsg({ ok: false, text: d.error ?? "Wrong access code." });
    } catch {
      setAdminMsg({ ok: false, text: "Connection interrupted. Please try again." });
    } finally {
      setAdminBusy(false);
    }
  };

  useEffect(() => {
    if (user) router.replace("/account");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const strength = useMemo(() => strengthOf(pass), [pass]);
  const strengthLabel = T.strength[strength === 0 && pass ? 0 : strength] ?? "";
  const strengthColor = ["#e11d48", "#e11d48", "#d98b00", "#0b63d6", "#16a34a"][
    pass ? strength : 0
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (mode === "register" && !name.trim()) next.name = T.errName;
    if (mode === "register" && !/^[+0-9()\s-]{8,}$/.test(phone)) next.phone = T.errPhone;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = T.errEmail;
    if (pass.length < 8) next.pass = T.errPass;
    if (mode === "register" && pass !== confirm) next.confirm = T.errPassMatch;
    if (mode === "register" && !terms) next.terms = T.errTerms;
    setErrs(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const res = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password: pass }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErrs({ form: d.error ?? "Something went wrong. Please try again." });
        return;
      }
      toast.success(
        mode === "register" ? "Account created" : "Signed in",
        `${d.user.name} · ${d.user.email}`,
      );
      router.replace("/account");
    } catch {
      setErrs({ form: "Connection interrupted. Your details are kept on this device." });
    } finally {
      setBusy(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: {
      type?: string;
      dir?: "ltr" | "rtl";
      ph?: string;
      err?: string;
      trailing?: React.ReactNode;
      autoComplete?: string;
    } = {},
  ) => (
    <label className="block">
      <span className="block text-[0.78rem] font-semibold text-ink-body mb-1.5">{label}</span>
      <div className="relative">
        <input
          type={opts.type ?? "text"}
          dir={opts.dir}
          value={value}
          placeholder={opts.ph}
          autoComplete={opts.autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-2xl border px-4 py-3.5 text-body-sm bg-white transition-all duration-200 focus:outline-none focus:ring-2 ${
            opts.trailing ? "pe-20" : ""
          } ${
            opts.err
              ? "border-danger/50 focus:border-danger focus:ring-danger/15"
              : "border-brand/18 focus:border-brand focus:ring-brand/15"
          }`}
        />
        {opts.trailing && (
          <span className="absolute end-2 top-1/2 -translate-y-1/2">{opts.trailing}</span>
        )}
      </div>
      {opts.err && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[0.78rem] text-danger">
          <Icon name="x" className="w-3.5 h-3.5" />
          {opts.err}
        </span>
      )}
    </label>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      {/* ---------- brand panel ---------- */}
      <aside className="relative overflow-hidden px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between min-h-[320px] lg:min-h-screen">
        <div className="absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 90% at 18% 12%, #1a86e8 0%, #0b52c4 46%, #082a86 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(46% 42% at 88% 20%, rgba(255,46,147,0.55), transparent 70%), radial-gradient(42% 40% at 12% 92%, rgba(34,193,240,0.5), transparent 72%), radial-gradient(30% 30% at 74% 88%, rgba(255,196,0,0.42), transparent 72%)",
            }}
          />
          <div className="absolute inset-0 halftone opacity-25" />
        </div>

        <a href="/" className="relative inline-flex items-center gap-3">
          <VerolaMark className="w-11 h-11" />
          <VerolaWordmark className="h-6 w-auto" mono />
        </a>

        <div className="relative py-10">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-white/70 text-xs font-semibold tracking-[0.32em] uppercase"
          >
            {T.studio}
          </motion.p>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="mt-4 font-display font-extrabold text-white leading-[1.02] tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4.25rem)" }}
          >
            Print what
            <br />
            you imagine.
          </motion.h1>

          <ul className="mt-9 space-y-4">
            {T.bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={reduced ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.28 + i * 0.11, ease: EASE }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 w-8 h-8 rounded-xl bg-white/16 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <Icon name={["truck", "layers", "phone"][i]} className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-white font-semibold text-body-sm">{b.t}</span>
                  <span className="block text-white/65 text-[0.85rem] leading-relaxed">{b.d}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/55 text-xs leading-relaxed max-w-xs">
          {T.rights}
        </p>
      </aside>

      {/* ---------- form panel ---------- */}
      <main className="relative flex items-center justify-center px-5 py-14 lg:px-16 bg-white">
        <div className="w-full max-w-[440px]">
          {/* mode switch */}
          <div className="inline-flex items-center rounded-full bg-[#f2f6fc] p-1 relative">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrs({});
                }}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
                  mode === m ? "text-white" : "text-ink-muted hover:text-navy"
                }`}
                aria-pressed={mode === m}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-pill"
                    className="absolute inset-0 rounded-full aurora-bg"
                    transition={{ duration: 0.38, ease: EASE }}
                  />
                )}
                <span className="relative z-10">
                  {m === "login" ? "Sign in" : "Sign up"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <h2 className="mt-8 font-display font-extrabold text-[clamp(1.9rem,3.6vw,2.65rem)] leading-[1.06] tracking-[-0.03em] text-navy">
                {mode === "login" ? T.loginTitle : T.regTitle}
              </h2>
              <p className="mt-2.5 text-ink-muted leading-relaxed">
                {mode === "login" ? T.loginSub : T.regSub}
              </p>

              <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
                {mode === "register" && (
                  <>
                    {field(T.name, name, setName, {
                      err: errs.name,
                      autoComplete: "name",
                      ph: "SA ID",
                    })}
                    {field(T.phone, phone, setPhone, {
                      dir: "ltr",
                      err: errs.phone,
                      autoComplete: "tel",
                      ph: "+212 6 61 00 00 00",
                    })}
                  </>
                )}

                {field(T.email, email, setEmail, {
                  dir: "ltr",
                  type: "email",
                  err: errs.email,
                  autoComplete: "email",
                  ph: "you@example.com",
                })}

                {field(T.password, pass, setPass, {
                  type: showPass ? "text" : "password",
                  dir: "ltr",
                  err: errs.pass,
                  autoComplete: mode === "login" ? "current-password" : "new-password",
                  ph: "••••••••",
                  trailing: (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/8 transition cursor-pointer"
                    >
                      {showPass ? T.hide : T.show}
                    </button>
                  ),
                })}

                {/* strength meter */}
                {mode === "register" && pass && (
                  <div>
                    <div className="h-1.5 rounded-full bg-[#e8eef7] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: strengthColor }}
                        animate={{ width: `${((pass ? strength : 0) + 1) * 20}%` }}
                        transition={{ duration: 0.35, ease: EASE }}
                      />
                    </div>
                    <p className="mt-1.5 text-caption font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}

                {mode === "register" &&
                  field(T.confirm, confirm, setConfirm, {
                    type: "password",
                    dir: "ltr",
                    err: errs.confirm,
                    autoComplete: "new-password",
                    ph: "••••••••",
                  })}

                {mode === "login" ? (
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 accent-brand"
                      />
                      <span className="text-sm text-ink-muted">{T.remember}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(T.forgot, "Password reset is configured in the email service layer.")
                      }
                      className="text-sm font-semibold text-brand hover:underline cursor-pointer"
                    >
                      {T.forgot}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-brand"
                      />
                      <span className="text-sm text-ink-muted leading-relaxed">{T.terms}</span>
                    </label>
                    {errs.terms && (
                      <span className="mt-1.5 flex items-center gap-1.5 text-[0.78rem] text-danger">
                        <Icon name="x" className="w-3.5 h-3.5" />
                        {errs.terms}
                      </span>
                    )}
                  </div>
                )}

                {errs.form && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-sm text-[#b4236a]">
                    <Icon name="sparkle" className="w-4 h-4 mt-0.5 shrink-0" />
                    {errs.form}
                  </div>
                )}

                <Button type="submit" disabled={busy} magnetic size="lg" className="w-full">
                  {busy ? "…" : mode === "login" ? T.signIn : T.signUp}
                  {!busy && <Icon name="arrow" className="w-5 h-5 rtl-flip" />}
                </Button>
              </form>

              <div className="mt-7 flex items-center gap-3">
                <span className="flex-1 h-px bg-brand/12" />
                <span className="text-caption uppercase tracking-[0.18em] text-ink-faint">{T.or}</span>
                <span className="flex-1 h-px bg-brand/12" />
              </div>

              <button
                onClick={() => setGoogleNote(true)}
                className="mt-5 w-full flex items-center justify-center gap-3 rounded-2xl border border-brand/18 py-3.5 font-semibold text-navy hover:border-brand/45 hover:bg-brand/[0.04] transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                  <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
                  <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3Z" />
                  <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 0 0 1.8 7.1l3.8 3C6.5 7.4 9 4.8 12 4.8Z" />
                </svg>
                {T.google}
              </button>

              {googleNote && (
                <p className="mt-2.5 text-center text-caption text-ink-faint">{T.googleNote}</p>
              )}

              <p className="mt-8 text-center text-sm text-ink-muted">
                {mode === "login" ? T.switchingTo : T.switching}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setErrs({});
                  }}
                  className="font-semibold text-brand hover:underline cursor-pointer"
                >
                  {mode === "login" ? T.switchToRegister : T.switchToLogin}
                </button>
              </p>

              <button
                onClick={() => openAuth("login")}
                className="mt-3 block w-full text-center text-xs text-ink-faint hover:text-brand transition cursor-pointer"
              >
                ← verola.ma
              </button>

              {/* ---- administrator access ---- */}
              <div className="mt-8 rounded-2xl border border-brand/12 bg-[#f7fafd] p-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center">
                    <Icon name="shield" className="w-4.5 h-4.5 w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">Administrator access</p>
                    <p className="text-caption text-ink-faint">Enter the studio access code</p>
                  </div>
                </div>

                <form
                  className="mt-3.5 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void adminUnlock();
                  }}
                >
                  <input
                    type="password"
                    dir="ltr"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="••••••••"
                    aria-label="Administrator access code"
                    className="flex-1 min-w-0 rounded-xl border border-brand/18 bg-white px-3.5 py-2.5 text-sm text-center tracking-[0.35em] font-mono focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                  />
                  <button
                    type="submit"
                    disabled={adminBusy}
                    className="rounded-xl bg-navy text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#16294a] transition cursor-pointer disabled:opacity-60"
                  >
                    {adminBusy ? "…" : "Open"}
                  </button>
                </form>

                {adminMsg && (
                  <p
                    className={`mt-2.5 text-xs flex items-center gap-1.5 ${
                      adminMsg.ok ? "text-brand" : "text-danger"
                    }`}
                  >
                    <Icon name={adminMsg.ok ? "check" : "x"} className="w-3.5 h-3.5" />
                    {adminMsg.text}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
