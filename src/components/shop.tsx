"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { SHOP, type Shop } from "@/lib/shop";
import { VerolaMark, VerolaWordmark } from "./logo";

const ShopCtx = createContext<Shop>(SHOP);

export function ShopProvider({ children }: { children: ReactNode }) {
  return <ShopCtx.Provider value={SHOP}>{children}</ShopCtx.Provider>;
}

/** The single shop's configuration (name, contact, currency…). */
export function useShop(): Shop {
  return useContext(ShopCtx);
}

/** Shop logo: the VÉLORA mark and wordmark. */
export function ShopLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}) {
  const dims = {
    sm: { mark: "w-8 h-8", word: "h-4" },
    md: { mark: "w-9 h-9", word: "h-[22px]" },
    lg: { mark: "w-12 h-12", word: "h-7" },
  }[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <VerolaMark className={dims.mark} />
      {showWordmark && <VerolaWordmark className={`${dims.word} w-auto`} />}
    </span>
  );
}
