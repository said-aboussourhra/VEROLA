"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import {
  CATALOG,
  FINISHES,
  calculatePrice,
  formatMAD,
  type ProductId,
  type FinishId,
} from "@/lib/pricing";
import { Button, Icon, Badge, PriceCounter, Field, inputCls, useSound, playPressClick, Reveal } from "./ui";
import { useToast } from "./notify";
import { VerolaMark } from "./logo";
import { pushDeviceCode } from "@/lib/store";

const TXT = {
  en: {
    title: "Place your order",
    sub: "Three quick steps. We take care of the rest.",
    s1: "What are we printing?",
    s2: "The design",
    s3: "Your details",
    next: "Continue",
    back: "Back",
    qty: "Quantity",
    size: "Size",
    finish: "Finish",
    perUnit: "per unit",
    total: "Total",
    eta: "Ready in",
    days: "days",
    tabPick: "Pick a design",
    tabDescribe: "Describe it",
    tabUpload: "Upload my file",
    pickHint: "Tap a design — we adapt it to your size and colors.",
    descLabel: "Describe your design",
    descPh: "Colors, mood, text to include, references…",
    descNote: "Our designer prepares it and sends you a proof before printing.",
    uploadTitle: "Drop your file here",
    uploadSub: "PDF · PNG · JPG · AI · SVG — up to 50MB",
    uploadBtn: "Choose file",
    uploaded: "File received — we preflight it before the press.",
    name: "Full name",
    phone: "Phone (WhatsApp)",
    city: "City",
    address: "Address",
    pay: "Payment",
    payAdvance: "20% advance (CIH)",
    payCod: "Cash on delivery",
    payCard: "Card",
    rib: "CIH Bank · SAID ABOUSSOURHRA",
    ribNo: "RIB",
    copy: "Copy",
    copied: "Copied",
    advance: "Advance due",
    sender: "Sender RIB / full name",
    confirm: "Confirm order",
    placing: "Sending…",
    done: "Order received",
    doneSub: "We just got your job. Keep your code — it tracks everything.",
    code: "Tracking code",
    track: "Track my order",
    again: "New order",
    required: "Required",
    badPhone: "Invalid phone number",
    summary: "Your job",
    product: "Product",
    design: "Design",
    selected: "Selected",
    describeShort: "Custom description",
    uploadShort: "My own file",
  },
  fr: {
    title: "Passez commande",
    sub: "Trois étapes rapides. On s'occupe du reste.",
    s1: "Qu'imprime-t-on ?",
    s2: "Le design",
    s3: "Vos coordonnées",
    next: "Continuer",
    back: "Retour",
    qty: "Quantité",
    size: "Format",
    finish: "Finition",
    perUnit: "l'unité",
    total: "Total",
    eta: "Prêt en",
    days: "jours",
    tabPick: "Choisir un design",
    tabDescribe: "Le décrire",
    tabUpload: "Envoyer mon fichier",
    pickHint: "Touchez un design — on l'adapte à votre format et couleurs.",
    descLabel: "Décrivez votre design",
    descPh: "Couleurs, ambiance, textes, références…",
    descNote: "Notre designer le prépare et vous envoie une épreuve avant impression.",
    uploadTitle: "Déposez votre fichier ici",
    uploadSub: "PDF · PNG · JPG · AI · SVG — 50 Mo max",
    uploadBtn: "Choisir un fichier",
    uploaded: "Fichier reçu — on le vérifie avant la presse.",
    name: "Nom complet",
    phone: "Téléphone (WhatsApp)",
    city: "Ville",
    address: "Adresse",
    pay: "Paiement",
    payAdvance: "Acompte 20 % (CIH)",
    payCod: "Paiement à la livraison",
    payCard: "Carte",
    rib: "Banque CIH · SAID ABOUSSOURHRA",
    ribNo: "RIB",
    copy: "Copier",
    copied: "Copié",
    advance: "Acompte dû",
    sender: "RIB / nom de l'émetteur",
    confirm: "Confirmer la commande",
    placing: "Envoi…",
    done: "Commande reçue",
    doneSub: "Votre job est entre nos mains. Gardez le code, il suit tout.",
    code: "Code de suivi",
    track: "Suivre ma commande",
    again: "Nouvelle commande",
    required: "Requis",
    badPhone: "Numéro invalide",
    summary: "Votre job",
    product: "Produit",
    design: "Design",
    selected: "Choisi",
    describeShort: "Description personnalisée",
    uploadShort: "Mon fichier",
  },
  ar: {
    title: "اطلب الآن",
    sub: "ثلاث خطوات سريعة. والباقي علينا.",
    s1: "ماذا نطبع؟",
    s2: "التصميم",
    s3: "معلوماتك",
    next: "متابعة",
    back: "رجوع",
    qty: "الكمية",
    size: "المقاس",
    finish: "التشطيب",
    perUnit: "للوحدة",
    total: "المجموع",
    eta: "جاهز خلال",
    days: "أيام",
    tabPick: "اختر تصميماً",
    tabDescribe: "صفه لي",
    tabUpload: "أرسل ملفي",
    pickHint: "اضغط على تصميم — نكيّفه مع مقاسك وألوانك.",
    descLabel: "صف تصميمك",
    descPh: "الألوان، الأجواء، النصوص المطلوبة، مراجع…",
    descNote: "مصمّمنا يجهّزه ويرسل لك نموذجاً قبل الطباعة.",
    uploadTitle: "أفلت ملفك هنا",
    uploadSub: "PDF · PNG · JPG · AI · SVG — حتى 50 ميغابايت",
    uploadBtn: "اختر ملفاً",
    uploaded: "الملف وصل — نفحصه قبل المكبس.",
    name: "الاسم الكامل",
    phone: "الهاتف (واتساب)",
    city: "المدينة",
    address: "العنوان",
    pay: "الدفع",
    payAdvance: "تسبيق 20% (CIH)",
    payCod: "الدفع عند الاستلام",
    payCard: "بطاقة",
    rib: "بنك CIH · SAID ABOUSSOURHRA",
    ribNo: "RIB",
    copy: "نسخ",
    copied: "تم النسخ",
    advance: "التسبيق المستحق",
    sender: "RIB / اسم المرسل",
    confirm: "تأكيد الطلب",
    placing: "جارٍ الإرسال…",
    done: "تم استلام طلبك",
    doneSub: "وصلنا عملك. احتفظ بالرمز، فهو يتتبع كل شيء.",
    code: "رمز التتبع",
    track: "تتبّع طلبي",
    again: "طلب جديد",
    required: "مطلوب",
    badPhone: "رقم غير صالح",
    summary: "عملك",
    product: "المنتج",
    design: "التصميم",
    selected: "مختار",
    describeShort: "وصف مخصص",
    uploadShort: "ملفي الخاص",
  },
};

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Oujda", "Kenitra"];

type Tab = "pick" | "describe" | "upload";

export function OrderFlow({ initialProduct }: { initialProduct?: string }) {
  const { t, L, lang } = useI18n();
  const T = TXT[lang] ?? TXT.en;
  const toast = useToast();
  const reduced = useReducedMotion();
  const { enabled: soundOn } = useSound();

  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<ProductId>(
    (initialProduct as ProductId) && CATALOG.some((c) => c.id === initialProduct)
      ? (initialProduct as ProductId)
      : "business-cards",
  );
  const p = CATALOG.find((c) => c.id === product)!;
  const [sizeId, setSizeId] = useState(p.sizes[0].id);
  const [finishId, setFinishId] = useState<FinishId>("matte");
  const [qty, setQty] = useState(p.minQty);

  const [tab, setTab] = useState<Tab>("pick");
  const [designSlug, setDesignSlug] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [designs, setDesigns] = useState<{ slug: string; title: Record<string, string> }[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"advance" | "cod" | "card">("advance");
  const [sender, setSender] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const RIB = "230590516317321101540030";

  useEffect(() => {
    fetch("/api/designs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDesigns(d.designs))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const np = CATALOG.find((c) => c.id === product)!;
    setSizeId(np.sizes[0].id);
    setQty(np.minQty);
  }, [product]);

  const bp = calculatePrice({
    product,
    sizeId,
    paperId: p.papers[0].id,
    finishId,
    qty,
    express: false,
    zoneId: "a",
  });
  const advance = Math.round(bp.total * 0.2 * 100) / 100;

  const designLabel = useMemo(() => {
    if (tab === "pick" && designSlug) {
      const d = designs.find((x) => x.slug === designSlug);
      return d ? (d.title?.[lang] ?? d.slug) : designSlug;
    }
    if (tab === "describe") return T.describeShort;
    return fileName ?? T.uploadShort;
  }, [tab, designSlug, designs, lang, fileName, T]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setFileName(f.name);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.ok) {
        setFileUrl(d.url);
        toast.success(T.uploaded, f.name);
      } else {
        toast.error(d.error ?? "—");
      }
    } catch {
      toast.error("—");
    }
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = T.required;
    if (!/^[+0-9()\s-]{8,}$/.test(phone)) errs.phone = T.badPhone;
    if (!address.trim()) errs.address = T.required;
    if (payment === "advance" && !sender.trim()) errs.sender = T.required;
    if (tab === "describe" && desc.trim().length < 8) errs.desc = T.required;
    if (tab === "pick" && !designSlug) errs.desc = T.required;
    if (tab === "upload" && !fileName) errs.desc = T.required;
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error(T.required, t.order.badPhone);
      return;
    }
    setPlacing(true);
    try {
      const artworkName =
        tab === "pick" && designSlug
          ? `design:${designSlug}`
          : tab === "describe"
            ? "custom:description"
            : fileName;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          city,
          address,
          payment,
          ribSender: payment === "advance" ? sender : null,
          artworkUrl: fileUrl,
          notes: tab === "describe" ? desc : null,
          config: {
            product,
            sizeId,
            paperId: p.papers[0].id,
            finishId,
            qty,
            express: false,
            zoneId: "a",
            artworkName,
          },
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCode(d.code);
      pushDeviceCode(d.code);
      if (soundOn) playPressClick();
      toast.push({
        kind: "order",
        title: T.done,
        body: `${T.code}: ${d.code}`,
        href: `/track/${d.code}`,
        hrefLabel: T.track,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("—");
    } finally {
      setPlacing(false);
    }
  };

  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-32 relative">
        <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-[32px] bg-white border border-[#0b63d6]/12 p-10 text-center shadow-[0_50px_100px_-40px_rgba(11,99,214,0.55)]"
        >
          <span className="mx-auto flex w-16 h-16 rounded-full aurora-bg items-center justify-center text-white pulse-glow">
            <Icon name="check" className="w-8 h-8" />
          </span>
          <h1 className="mt-6 font-display font-extrabold text-3xl">{T.done}</h1>
          <p className="mt-3 text-[#5b6779]">{T.doneSub}</p>
          <div className="mt-7 rounded-2xl border border-[#0b63d6]/12 bg-[#f4f7fb] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#98a2b3]">{T.code}</p>
            <p className="mt-1.5 font-display font-extrabold text-3xl aurora-text tracking-widest" dir="ltr">
              {code}
            </p>
          </div>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button href={`/track/${code}`} magnetic className="flex-1">
              {T.track}
              <Icon name="arrow" className="w-4 h-4 rtl-flip" />
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setCode(null);
                setStep(0);
              }}
            >
              {T.again}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "pick", label: T.tabPick, icon: "sparkle" },
    { id: "describe", label: T.tabDescribe, icon: "file" },
    { id: "upload", label: T.tabUpload, icon: "upload" },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen relative">
      <div className="absolute inset-0" aria-hidden style={{ background: "var(--ink-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <VerolaMark className="w-10 h-10" />
            <div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#101828]">{T.title}</h1>
              <p className="text-[#5b6779] text-sm mt-0.5">{T.sub}</p>
            </div>
          </div>
        </Reveal>

        {/* step pills */}
        <div className="flex items-center gap-2 mt-7 mb-8">
          {[T.s1, T.s2, T.s3].map((s, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                i === step
                  ? "aurora-bg text-white shadow-[0_12px_28px_-12px_rgba(11,99,214,0.8)]"
                  : i < step
                    ? "bg-[#e7eef8] text-[#0b63d6]"
                    : "bg-white text-[#98a2b3] border border-[#0b63d6]/12"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[0.7rem]">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* -------- main panel -------- */}
          <div className="rounded-[28px] bg-white border border-[#0b63d6]/12 p-6 md:p-9 shadow-[0_28px_70px_-40px_rgba(16,42,90,0.5)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 && (
                  <div>
                    <h2 className="font-display font-bold text-xl mb-5">{T.s1}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CATALOG.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setProduct(c.id)}
                          className={`rounded-2xl overflow-hidden border-2 text-start transition-all cursor-pointer ${
                            product === c.id
                              ? "border-[#0b63d6] shadow-[0_16px_34px_-16px_rgba(11,99,214,0.7)]"
                              : "border-transparent hover:border-[#0b63d6]/30"
                          }`}
                          aria-pressed={product === c.id}
                        >
                          <img src={c.image} alt="" className="w-full aspect-[4/3] object-cover" />
                          <span className="block px-3 py-2 text-xs font-semibold text-[#101828] truncate">
                            {L(c.name)}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-7 grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm font-medium text-[#3d4a5c] mb-2">{T.size}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.sizes.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSizeId(s.id)}
                              className={`rounded-xl px-3.5 py-2 text-sm font-medium border transition-all cursor-pointer ${
                                sizeId === s.id
                                  ? "bg-[#0b63d6] text-white border-[#0b63d6]"
                                  : "bg-white text-[#5b6779] border-[#0b63d6]/15 hover:border-[#0b63d6]/45"
                              }`}
                              aria-pressed={sizeId === s.id}
                            >
                              {s.name[lang]} <span className="opacity-70 text-xs" dir="ltr">{s.dim}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3d4a5c] mb-2">{T.finish}</p>
                        <div className="flex flex-wrap gap-2">
                          {FINISHES.slice(0, 5).map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setFinishId(f.id)}
                              className={`rounded-xl px-3.5 py-2 text-sm font-medium border transition-all cursor-pointer ${
                                finishId === f.id
                                  ? "bg-[#0b63d6] text-white border-[#0b63d6]"
                                  : "bg-white text-[#5b6779] border-[#0b63d6]/15 hover:border-[#0b63d6]/45"
                              }`}
                              aria-pressed={finishId === f.id}
                            >
                              {L(f.name)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-7">
                      <div className="flex items-end justify-between mb-2">
                        <p className="text-sm font-medium text-[#3d4a5c]">{T.qty}</p>
                        <p className="font-display font-extrabold text-2xl tabular-nums text-[#101828]">
                          {qty.toLocaleString()}
                        </p>
                      </div>
                      <input
                        type="range"
                        min={p.minQty}
                        max={Math.max(p.minQty * 40, 5000)}
                        step={p.step}
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="w-full accent-[#0b63d6] cursor-pointer"
                        aria-label={T.qty}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[1, 2, 5, 10, 25].map((m) => {
                          const v = Math.max(p.minQty, p.minQty * m);
                          return (
                            <button
                              key={m}
                              onClick={() => setQty(v)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                                qty === v
                                  ? "bg-[#0b63d6] text-white border-[#0b63d6]"
                                  : "bg-white text-[#5b6779] border-[#0b63d6]/15"
                              }`}
                            >
                              {v.toLocaleString()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="font-display font-bold text-xl mb-5">{T.s2}</h2>
                    <div className="flex flex-wrap gap-2">
                      {tabs.map((x) => (
                        <button
                          key={x.id}
                          onClick={() => setTab(x.id)}
                          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                            tab === x.id
                              ? "aurora-bg text-white shadow-[0_12px_28px_-12px_rgba(11,99,214,0.8)]"
                              : "bg-white text-[#5b6779] border border-[#0b63d6]/15 hover:border-[#0b63d6]/45"
                          }`}
                          aria-pressed={tab === x.id}
                        >
                          <Icon name={x.icon} className="w-4 h-4" />
                          {x.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      {tab === "pick" && (
                        <>
                          <p className="text-sm text-[#5b6779] mb-4">{T.pickHint}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {designs.map((d) => (
                              <button
                                key={d.slug}
                                onClick={() => {
                                  setDesignSlug(d.slug);
                                  toast.success(T.selected, d.title?.[lang] ?? d.slug);
                                }}
                                className={`relative rounded-2xl overflow-hidden border-2 bg-[#f4f7fb] transition-all cursor-pointer ${
                                  designSlug === d.slug
                                    ? "border-[#0b63d6] shadow-[0_16px_34px_-16px_rgba(11,99,214,0.7)]"
                                    : "border-transparent hover:border-[#0b63d6]/35"
                                }`}
                                aria-pressed={designSlug === d.slug}
                              >
                                <img
                                  src={`/api/designs/${d.slug}`}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-32 object-contain p-2"
                                />
                                <span className="block px-2 pb-2 text-[0.7rem] font-semibold text-[#101828] truncate">
                                  {d.title?.[lang] ?? d.slug}
                                </span>
                                {designSlug === d.slug && (
                                  <span className="absolute top-2 end-2 w-6 h-6 rounded-full aurora-bg text-white flex items-center justify-center">
                                    <Icon name="check" className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {tab === "describe" && (
                        <>
                          <Field label={T.descLabel} error={errors.desc}>
                            <textarea
                              className={`${inputCls} min-h-36 resize-y`}
                              value={desc}
                              placeholder={T.descPh}
                              onChange={(e) => setDesc(e.target.value)}
                            />
                          </Field>
                          <p className="mt-3 flex items-center gap-2 text-sm text-[#5b6779]">
                            <Icon name="sparkle" className="w-4 h-4 text-[#0b63d6]" />
                            {T.descNote}
                          </p>
                        </>
                      )}

                      {tab === "upload" && (
                        <>
                          <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
                            className="hidden"
                            onChange={(e) => void onFile(e.target.files?.[0])}
                          />
                          <button
                            onClick={() => fileRef.current?.click()}
                            className={`w-full rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                              fileName
                                ? "border-[#0b63d6]/60 bg-[#0b63d6]/[0.05]"
                                : "border-[#0b63d6]/25 hover:border-[#0b63d6]/60 hover:bg-[#0b63d6]/[0.04]"
                            }`}
                          >
                            <Icon name="upload" className="w-9 h-9 mx-auto text-[#0b63d6]" />
                            <p className="mt-3 font-semibold text-[#101828]">{fileName ?? T.uploadTitle}</p>
                            <p className="text-sm text-[#5b6779] mt-1">{T.uploadSub}</p>
                            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0b63d6] text-white px-5 py-2.5 text-sm font-semibold">
                              {T.uploadBtn}
                            </span>
                          </button>
                          {fileUrl && (
                            <p className="mt-3 flex items-center gap-2 text-sm text-[#0b63d6]">
                              <Icon name="check" className="w-4 h-4" />
                              {T.uploaded}
                            </p>
                          )}
                          {errors.desc && <p className="mt-2 text-sm text-[#e11d48]">{errors.desc}</p>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-display font-bold text-xl mb-5">{T.s3}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label={T.name} error={errors.name}>
                        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
                      </Field>
                      <Field label={T.phone} error={errors.phone}>
                        <input
                          className={inputCls}
                          dir="ltr"
                          value={phone}
                          placeholder="+212 6 61 00 00 00"
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Field>
                      <Field label={T.city}>
                        <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={T.address} error={errors.address}>
                        <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
                      </Field>
                    </div>

                    <p className="mt-7 text-sm font-medium text-[#3d4a5c] mb-2">{T.pay}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: "advance", label: T.payAdvance, icon: "bank", tag: "20%" },
                        { id: "cod", label: T.payCod, icon: "cash", tag: null },
                        { id: "card", label: T.payCard, icon: "card", tag: null },
                      ] as const).map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setPayment(o.id)}
                          className={`rounded-2xl border-2 p-3.5 text-start transition-all cursor-pointer ${
                            payment === o.id
                              ? "border-[#0b63d6] bg-[#0b63d6]/[0.06]"
                              : "border-[#0b63d6]/15 hover:border-[#0b63d6]/45"
                          }`}
                          aria-pressed={payment === o.id}
                        >
                          <Icon name={o.icon} className="w-5 h-5 text-[#0b63d6]" />
                          <p className="mt-2 text-xs font-semibold leading-snug">{o.label}</p>
                          {o.tag && (
                            <span className="mt-1.5 inline-block rounded-full aurora-bg text-white text-[0.62rem] font-bold px-2 py-0.5">
                              {o.tag}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {payment === "advance" && (
                      <div className="mt-5 rounded-2xl border border-[#0b63d6]/18 bg-[#f4f7fb] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-[#98a2b3]">{T.rib}</p>
                            <p className="mt-1.5 font-mono text-sm text-[#101828] tracking-wider" dir="ltr">
                              {RIB}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(RIB).catch(() => undefined);
                              setCopied(true);
                              toast.success(T.copied, T.ribNo);
                              setTimeout(() => setCopied(false), 1800);
                            }}
                            className="shrink-0 rounded-full bg-[#0b63d6] text-white px-4 py-2 text-xs font-semibold hover:brightness-110 transition cursor-pointer"
                          >
                            {copied ? T.copied : T.copy}
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                          <span className="text-sm text-[#5b6779]">{T.advance}</span>
                          <span className="font-display font-extrabold text-xl tabular-nums">
                            {formatMAD(advance, lang)}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Field label={T.sender} error={errors.sender}>
                            <input
                              className={inputCls}
                              dir="ltr"
                              value={sender}
                              onChange={(e) => setSender(e.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className={step === 0 ? "opacity-40" : ""}
              >
                <Icon name="arrow" className="w-4 h-4 rotate-180 rtl-flip" />
                {T.back}
              </Button>
              {step < 2 ? (
                <Button magnetic onClick={() => setStep(step + 1)}>
                  {T.next}
                  <Icon name="arrow" className="w-4 h-4 rtl-flip" />
                </Button>
              ) : (
                <Button magnetic size="lg" onClick={() => void submit()} disabled={placing}>
                  {placing ? T.placing : T.confirm}
                  {!placing && <Icon name="check" className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>

          {/* -------- summary -------- */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[28px] bg-white border border-[#0b63d6]/12 p-6 shadow-[0_28px_70px_-42px_rgba(16,42,90,0.5)]">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Icon name="printer" className="w-5 h-5 text-[#0b63d6]" />
                {T.summary}
              </h3>

              <div className="mt-4 rounded-2xl overflow-hidden border border-[#0b63d6]/10">
                <img src={p.image} alt="" className="w-full h-32 object-cover" />
              </div>

              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  [T.product, L(p.name)],
                  [T.size, `${p.sizes.find((s) => s.id === sizeId)?.name[lang] ?? ""}`],
                  [T.finish, L(FINISHES.find((f) => f.id === finishId)!.name)],
                  [T.qty, `${qty.toLocaleString()} ${L(p.unit)}`],
                  [T.design, designLabel],
                ].map(([k, v]) => (
                  <li key={k as string} className="flex justify-between gap-3">
                    <span className="text-[#98a2b3]">{k}</span>
                    <span className="text-[#101828] font-medium text-end max-w-[60%] truncate">{v}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-[#0b63d6]/10">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-[#5b6779]">{T.total}</span>
                  <span className="font-display font-extrabold text-3xl text-[#101828]">
                    <PriceCounter value={bp.total} lang={lang} />
                    <span className="text-sm font-normal text-[#98a2b3] ms-1.5">{t.common.mad}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#98a2b3] tabular-nums">
                  {T.perUnit}: {formatMAD(bp.unit, lang)}
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0b63d6]">
                  <Icon name="clock" className="w-4 h-4" />
                  {T.eta} {bp.days} {T.days}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                {FINISHES.slice(0, 4).map((f) => (
                  <Badge key={f.id} className="!bg-[#f4f7fb] !text-[#5b6779] !border-[#0b63d6]/12 text-[0.68rem]">
                    {L(f.name)}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
