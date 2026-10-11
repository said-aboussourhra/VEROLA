"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui";

/**
 * Live colour preview for a product. Recolours the product artwork with a
 * multiply tint, so the customer sees the chosen colour before ordering.
 * Preview only: the swatch never changes price or the saved order.
 */
export const PREVIEW_COLORS = [
  { id: "none", hex: "", label: { en: "Original", fr: "Original", ar: "الأصلي" } },
  { id: "white", hex: "#ffffff", label: { en: "White", fr: "Blanc", ar: "أبيض" } },
  { id: "ivory", hex: "#f3ead6", label: { en: "Ivory", fr: "Ivoire", ar: "عاجي" } },
  { id: "blue", hex: "#0B63D6", label: { en: "Blue", fr: "Bleu", ar: "أزرق" } },
  { id: "pink", hex: "#FF2E93", label: { en: "Pink", fr: "Rose", ar: "وردي" } },
  { id: "gold", hex: "#FFC400", label: { en: "Gold", fr: "Or", ar: "ذهبي" } },
  { id: "black", hex: "#111111", label: { en: "Black", fr: "Noir", ar: "أسود" } },
] as const;

export function ColorPreview({ image, alt, href }: { image: string; alt: string; href?: string }) {
  const { L } = useI18n();
  const [colorId, setColorId] = useState<(typeof PREVIEW_COLORS)[number]["id"]>("none");
  const active = PREVIEW_COLORS.find((c) => c.id === colorId)!;

  return (
    <div className="space-y-4">
      <div className="relative rounded-panel overflow-hidden border border-white/10 bg-white">
        <img src={image} alt={alt} className="w-full aspect-[4/3] object-cover" loading="lazy" />
        {active.hex && (
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-500"
            style={{ background: active.hex, mixBlendMode: "multiply", opacity: 0.85 }}
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={L({ en: "Preview colour", fr: "Couleur d'aperçu", ar: "لون المعاينة" })}>
        {PREVIEW_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={colorId === c.id}
            aria-label={L(c.label)}
            title={L(c.label)}
            onClick={() => setColorId(c.id)}
            className={`h-9 min-w-9 px-2 rounded-full border text-xs transition-transform cursor-pointer ${
              colorId === c.id ? "border-cyan scale-110" : "border-white/20"
            }`}
            style={{ background: c.hex || "transparent" }}
          >
            {c.hex ? "" : <span className="px-1 text-muted">{L(c.label)}</span>}
          </button>
        ))}
      </div>

      {href && (
        <a
          href={href}
          className="inline-flex items-center gap-2 text-sm text-cyan hover:text-paper transition-colors"
        >
          {L({ en: "Design it with this preview", fr: "Créer avec cet aperçu", ar: "صمّم بهذه المعاينة" })}
          <Icon name="arrow" className="w-4 h-4 rtl-flip" />
        </a>
      )}
    </div>
  );
}
