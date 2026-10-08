"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { VerolaMark, VerolaWordmark } from "./logo";

export interface Brand {
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  domain: string | null;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  brand1: string;
  brand2: string;
  brand3: string;
  accent: string;
  currency: string;
  isDefault: boolean;
}

const Ctx = createContext<Brand | null>(null);

export function TenantProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <Ctx.Provider value={brand}>{children}</Ctx.Provider>;
}

export function useTenant(): Brand {
  return useContext(Ctx) as Brand;
}

/**
 * White-label logo.
 * Falls back to the VEROLA vector mark when the tenant has no uploaded logo.
 */
export function BrandLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}) {
  const brand = useTenant();
  const dims = {
    sm: { mark: "w-8 h-8", word: "h-4" },
    md: { mark: "w-9 h-9", word: "h-[22px]" },
    lg: { mark: "w-12 h-12", word: "h-7" },
  }[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className={`${dims.mark} object-contain`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <VerolaMark className={dims.mark} />
      )}
      {showWordmark &&
        (brand.isDefault ? (
          <VerolaWordmark className={`${dims.word} w-auto`} />
        ) : (
          <span
            className="font-display font-extrabold tracking-[-0.03em] leading-none"
            style={{
              fontSize: size === "lg" ? "1.55rem" : size === "md" ? "1.15rem" : "0.95rem",
              background: `linear-gradient(122deg, ${brand.brand2}, ${brand.accent})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {brand.name}
          </span>
        ))}
    </span>
  );
}

/** Live brand palette preview used in the admin. */
export function BrandPreview({ brand }: { brand: Brand }) {
  return (
    <div
      className="rounded-3xl overflow-hidden border border-[#0b63d6]/12"
      style={{
        background: `linear-gradient(135deg, ${brand.brand1} 0%, ${brand.brand2} 52%, ${brand.brand3} 100%)`,
      }}
    >
      <div className="px-6 py-8 flex items-center gap-4">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt="" className="w-12 h-12 object-contain rounded-xl bg-white/20" />
        ) : (
          <span className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-display font-extrabold text-xl">
            {brand.name.slice(0, 1)}
          </span>
        )}
        <div>
          <p className="text-white font-display font-extrabold text-2xl leading-tight">{brand.name}</p>
          <p className="text-white/80 text-sm">{brand.tagline}</p>
        </div>
      </div>
    </div>
  );
}

/** Small swatch row. */
export function BrandSwatches({ brand }: { brand: Brand }) {
  const cols = [brand.brand1, brand.brand2, brand.brand3, brand.accent];
  return (
    <div className="flex gap-2">
      {cols.map((c, i) => (
        <span
          key={i}
          className="w-9 h-9 rounded-xl border border-black/10 shadow-inner"
          style={{ background: c }}
          title={c}
        />
      ))}
    </div>
  );
}

/** Helper for pages that need the currency label. */
export function useCurrency(): string {
  const b = useTenant();
  return useMemo(() => b.currency || "MAD", [b.currency]);
}
