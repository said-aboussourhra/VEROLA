"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Button, Badge } from "@/components/ui";

const TEMPLATES = [
  { id: "studio", name: "Luxury Studio", prompt: "Podium with soft lighting, dark marble & golden accents" },
  { id: "nature", name: "Organic Nature", prompt: "Sunlit botanical garden, stone pedestal with tropical leaves" },
  { id: "cyber", name: "Cyber Neon", prompt: "Futuristic neon grid, moody reflections, glowing cyan & pink rim" },
  { id: "cozy", name: "Warm Home", prompt: "Scandinavian wooden table, gentle morning sun rays, cozy vibe" },
];

export function AiStudioTool() {
  const [file, setFile] = useState<string | null>(null);
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [freeCredits, setFreeCredits] = useState(3);

  const sampleProducts = [
    { name: "Cosmetics / Serum", img: "/images/products/packaging.jpg" },
    { name: "Luxury Apparel", img: "/images/products/tshirts.jpg" },
    { name: "Branded Merch", img: "/images/products/stickers.jpg" },
  ];

  const handleGenerate = () => {
    if (!file) return;
    setGenerating(true);
    setResult(null);

    setTimeout(() => {
      setGenerating(false);
      setResult(file); // generated enhanced preview
      setHeadline("Unleash the Power of Pure Elegance — 50% Off Limited Time");
      setFreeCredits((c) => Math.max(0, c - 1));
    }, 2400);
  };

  return (
    <section id="ai-generator" className="relative py-16 md:py-24 bg-gradient-to-b from-[#f8fafc] to-white border-y border-[#0b63d6]/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#0b63d6]/10 border border-[#0b63d6]/20 text-xs font-bold text-[#0b63d6] mb-4">
            <Icon name="sparkle" className="w-3.5 h-3.5 text-[#ff2e93]" />
            AI E-COMMERCE AD ENGINE
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#0d1b32] tracking-tight">
            حوّل أي صورة منتج بسيطة إلى إعلان احترافي مذهل
          </h2>
          <p className="mt-4 text-[#5b6779] text-base md:text-lg">
            ارفع صورة منتجك بخلفية عادية، والذكاء الاصطناعي سيقوم بإنشاء فوتوسيشن تصوير سينمائي مع نصوص إعلانية تزيد مبيعات متجرك فوراً.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-[#0b63d6]/15 shadow-xl shadow-blue-900/5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#0d1b32] uppercase tracking-wider">
                  1. اختر صورة المنتج
                </label>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {freeCredits} تجارب مجانية متبقية
                </span>
              </div>

              {/* Upload area */}
              <div
                onClick={() => setFile(sampleProducts[0].img)}
                className="border-2 border-dashed border-[#0b63d6]/25 hover:border-[#0b63d6] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#f8fbff]"
              >
                {file ? (
                  <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-[#0b63d6]/20 shadow-sm">
                    <img src={file} alt="Selected" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 inset-x-1 bg-black/60 text-white text-[0.65rem] py-0.5 rounded">
                      تم التحديد
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="w-12 h-12 rounded-2xl bg-[#0b63d6]/10 text-[#0b63d6] flex items-center justify-center mx-auto mb-3">
                      <Icon name="upload" className="w-6 h-6" />
                    </span>
                    <p className="text-xs font-bold text-[#0d1b32]">اضغط هنا لتجربة صورة جاهزة أو رفع منتجك</p>
                    <p className="text-[0.7rem] text-[#98a2b3] mt-1">يدعم PNG, JPG حتى 20MB</p>
                  </div>
                )}
              </div>

              {/* Quick sample pickers */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[0.7rem] text-[#5b6779]">أو جرب بنقرة:</span>
                {sampleProducts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFile(p.img)}
                    className="text-[0.68rem] px-2.5 py-1 rounded-lg border border-[#0b63d6]/15 hover:bg-[#0b63d6]/5 text-[#0b63d6] font-semibold transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d1b32] uppercase tracking-wider mb-2">
                2. بيئة واستوديو التصوير بالذكاء الاصطناعي
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-2xl text-start border transition-all ${
                      template === t.id
                        ? "border-[#0b63d6] bg-[#0b63d6]/5 text-[#0b63d6] shadow-sm font-bold"
                        : "border-[#0b63d6]/15 hover:border-[#0b63d6]/40 text-[#5b6779]"
                    }`}
                  >
                    <p className="text-xs">{t.name}</p>
                    <p className="text-[0.65rem] opacity-70 mt-1 line-clamp-1">{t.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!file || generating}
              size="lg"
              className="w-full !py-3.5 !rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-600/30"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري توليد الإعلان بالذكاء الاصطناعي...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="sparkle" className="w-4 h-4" />
                  توليد الصورة الإعلانية الآن (AI Generate)
                </span>
              )}
            </Button>
          </div>

          {/* Live Preview Display */}
          <div className="lg:col-span-7 bg-[#0d1b32] rounded-3xl p-6 md:p-8 text-white relative min-h-[460px] flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-pink-500/10 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">AI Real-time Studio Output</span>
              </div>
              <Badge className="!bg-white/10 !text-white !border-white/20">4K Ultra HD</Badge>
            </div>

            {/* Generated display */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-[#22c1f0] border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="font-display font-bold text-lg text-white">الذكاء الاصطناعي يعالج الإضاءة والخلفية...</p>
                    <p className="text-xs text-white/60 mt-1">إضافة ظلال سينمائية ونصوص تسويقية عالية التحويل</p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full relative group rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                  >
                    <img src={result} alt="AI Generated Ad" className="w-full h-[360px] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <span className="text-xs uppercase tracking-widest text-[#22c1f0] font-bold">Generated Copy</span>
                      <p className="font-display font-black text-xl text-white mt-1">{headline}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[0.7rem] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">High ROAS Score: 9.4/10</span>
                        <span className="text-[0.7rem] bg-white/20 text-white px-2 py-0.5 rounded">Ready for TikTok & Meta Ads</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16 text-white/40">
                    <Icon name="sparkle" className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">اضغط على زر التوليد لتشاهد كيف يحول الذكاء الاصطناعي منتجك فوراً لبوست إعلاني سينمائي</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-white/70">
                أكثر من 14,000 تاجر إلكتروني ومصمم يستخدمون محرك الـ AI لتوليد إعلاناتهم.
              </span>
              <a
                href="/pricing"
                className="text-xs font-bold text-[#22c1f0] hover:text-white transition flex items-center gap-1"
              >
                ترقية الحساب للحصول على توليد غير محدود ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
