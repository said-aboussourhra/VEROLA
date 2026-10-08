"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeading, Reveal } from "@/components/ui";

const COPY = {
  en: [
    { h: "Privacy", b: "We collect only what an order needs: name, phone, address and your artwork. Artwork files are deleted 90 days after delivery unless you ask us to keep them. We never sell data. Cookies are used for language preference and session only." },
    { h: "Terms", b: "Quotes are firm for 72h. Proofing happens automatically on every file; by ordering you approve our standard CMYK conversion (ISO Coated v2) for RGB files. Express 24h applies to files received before 14:00 local time. Refunds on delivery failure are full; production errors are reprinted free within 14 days." },
  ],
  fr: [
    { h: "Confidentialité", b: "Nous ne collectons que ce qu'une commande exige : nom, téléphone, adresse et votre artwork. Les fichiers sont supprimés 90 jours après livraison, sauf demande contraire. Nous ne vendons aucune donnée. Les cookies servent uniquement à la langue et à la session." },
    { h: "Conditions", b: "Les devis sont fermes 72 h. La vérification est automatique ; en commandant, vous validez notre conversion CMJN standard (ISO Coated v2) pour les fichiers RVB. L'express 24 h s'applique aux fichiers reçus avant 14 h 00. Remboursement intégral en cas d'échec de livraison ; les erreurs de production sont re-reprises gratuitement sous 14 jours." },
  ],
  ar: [
    { h: "الخصوصية", b: "نجمع فقط ما يحتاجه الطلب: الاسم والهاتف والعنوان وملفاتك. تُحذف الملفات بعد 90 يوماً من التسليم ما لم تطلب إبقاؤها. لا نبيع البيانات أبداً. تُستخدم الكوكيز للغة والجلسة فقط." },
    { h: "الشروط", b: "العروض سارية 72 ساعة. الفحص تلقائي على كل ملف؛ بتأكيد الطلب توافقون على تحويل CMYK القياسي (ISO Coated v2) لملفات RGB. السريع 24س ينطبق على الملفات قبل 14:00. استرجاع كامل عند فشل التوصيل، وإعادة طباعة مجانية للأخطاء خلال 14 يوماً." },
  ],
};

export default function LegalPage() {
  const { t, lang } = useI18n();
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <SectionHeading
          kicker="VÉLORA"
          title={lang === "ar" ? "الشروط والخصوصية" : lang === "fr" ? "Mentions légales" : "Legal"}
        />
        <div className="space-y-8">
          {COPY[lang].map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <section className="glass rounded-3xl p-8">
                <h3 className="font-display font-bold text-xl mb-3">{s.h}</h3>
                <p className="text-muted leading-relaxed text-[0.95rem]">{s.b}</p>
              </section>
            </Reveal>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted">
          VÉLORA SARL — Derb Ghallef 21, Casablanca · hello@velora.ma · {t.footer.rights}
        </p>
      </div>
    </div>
  );
}
