import { cache } from "react";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

/* ============================================================
   Multi-tenant resolver.

   A tenant is matched by, in order:
     1. explicit ?t= / /t/[slug] selection
     2. the custom domain (print.vr.com → domain column)
     3. the subdomain  (print.verola.com → slug "print")
     4. fallback to the platform default (VEROLA)
   ============================================================ */

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

export const PLATFORM: Brand = {
  slug: "verola",
  name: "VEROLA",
  tagline: "Print what you imagine.",
  logoUrl: null,
  domain: "verola.com",
  city: "Casablanca",
  phone: "+212 661 000 000",
  whatsapp: "+212661000000",
  email: "hello@verola.ma",
  brand1: "#0B63D6",
  brand2: "#22C1F0",
  brand3: "#FF2E93",
  accent: "#0B63D6",
  currency: "MAD",
  isDefault: true,
};

const BASE_DOMAINS = new Set([
  "localhost",
  "127.0.0.1",
  "verola.com",
  "www.verola.com",
  "verola.ma",
  "www.verola.ma",
]);

function slugFromHost(host: string | null): string | null {
  if (!host) return null;
  const bare = host.split(":")[0].toLowerCase();
  const parts = bare.split(".");
  if (parts.length < 2) return null;
  // custom domain pointing at a tenant
  return null;
}

export function parseHost(host: string | null): { slug: string | null; isBase: boolean } {
  if (!host) return { slug: null, isBase: true };
  const bare = host.split(":")[0].toLowerCase();
  if (BASE_DOMAINS.has(bare)) return { slug: null, isBase: true };

  const parts = bare.split(".");
  // subdomain of a platform domain
  const isPlatformSub = parts.length >= 3 && BASE_DOMAINS.has(parts.slice(1).join("."));
  if (isPlatformSub) return { slug: parts[0], isBase: false };

  // full custom domain → matched against tenants.domain
  return { slug: null, isBase: false, } as { slug: string | null; isBase: boolean };
}

function rowToBrand(row: {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  domain: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  brand1: string;
  brand2: string;
  brand3: string;
  accent: string;
  currency: string;
}): Brand {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? PLATFORM.tagline,
    logoUrl: row.logoUrl,
    domain: row.domain,
    city: row.city ?? PLATFORM.city,
    phone: row.phone ?? PLATFORM.phone,
    whatsapp: row.whatsapp ?? PLATFORM.whatsapp,
    email: row.email ?? PLATFORM.email,
    brand1: row.brand1,
    brand2: row.brand2,
    brand3: row.brand3,
    accent: row.accent,
    currency: row.currency,
    isDefault: false,
  };
}

export async function loadBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const rows = await db
      .select()
      .from(tenants)
      .where(or(eq(tenants.slug, slug), eq(tenants.domain, slug)))
      .limit(1);
    return rows[0] ? rowToBrand(rows[0]) : null;
  } catch {
    return null;
  }
}

/** Cached per request — used by the root layout to rebrand the shell. */
export const resolveBrand = cache(
  async (opts: { host: string | null; slug?: string | null }): Promise<Brand> => {
    if (opts.slug) {
      const b = await loadBrandBySlug(opts.slug);
      if (b) return b;
    }
    const host = opts.host ?? "";
    const bare = host.split(":")[0].toLowerCase();
    if (!bare || BASE_DOMAINS.has(bare)) return PLATFORM;

    // custom domain first
    const byDomain = await loadBrandBySlug(bare);
    if (byDomain) return byDomain;

    // then subdomain: print.verola.com → "print"
    const parts = bare.split(".");
    if (parts.length >= 2) {
      const sub = parts[0];
      const b = await loadBrandBySlug(sub);
      if (b) return b;
    }
    return PLATFORM;
  },
);

/** CSS variables that rebrand the entire application. */
export function brandCss(b: Brand): string {
  return `:root{--tint-a:${b.brand1};--tint-b:${b.brand2};--tint-c:${b.brand3};--color-violet:${b.accent};--color-cyan:${b.accent};--brand-accent:${b.accent};}`;
}
