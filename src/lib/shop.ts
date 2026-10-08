/* ============================================================
   Single-shop configuration.

   VÉLORA is one printing shop. Everything shop-specific (name,
   contact, address, colours, currency) lives here so it can be
   changed in one place.
   ============================================================ */

export interface Shop {
  name: string;
  tagline: string;
  legalName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  domain: string;
  siteUrl: string;
  currency: string;
  /** Primary print blue, aurora gradient stops and accent. */
  brand1: string;
  brand2: string;
  brand3: string;
  accent: string;
  instagram: string;
  linkedin: string;
}

export const SHOP: Shop = {
  name: "VÉLORA",
  tagline: "Print the Unimaginable",
  legalName: "VÉLORA SARL",
  address: "Derb Ghallef 21, Casablanca",
  city: "Casablanca",
  country: "MA",
  phone: "+212 661 000 000",
  whatsapp: "+212661000000",
  email: "hello@velora.ma",
  domain: "velora.ma",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://velora.ma",
  currency: "MAD",
  brand1: "#0B63D6",
  brand2: "#22C1F0",
  brand3: "#FF2E93",
  accent: "#0B63D6",
  instagram: "https://instagram.com/velora.ma",
  linkedin: "https://linkedin.com/company/velora",
};

/** CSS variables injected into <head> so the aurora palette follows the shop colours. */
export function shopCss(s: Shop = SHOP): string {
  return `:root{--tint-a:${s.brand1};--tint-b:${s.brand2};--tint-c:${s.brand3};--color-violet:${s.accent};--color-cyan:${s.accent};--brand-accent:${s.accent};}`;
}
