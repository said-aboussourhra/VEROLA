import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";
import { PLATFORM, resolveBrand, type Brand } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/** Current brand for this host (or ?slug= for a specific tenant). */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const host = req.headers.get("host");
  try {
    if (slug) {
      const rows = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
      const r = rows[0];
      return NextResponse.json({
        ok: true,
        tenant: r
          ? {
              slug: r.slug,
              name: r.name,
              tagline: r.tagline,
              logoUrl: r.logoUrl,
              domain: r.domain,
              city: r.city,
              phone: r.phone,
              whatsapp: r.whatsapp,
              email: r.email,
              brand1: r.brand1,
              brand2: r.brand2,
              brand3: r.brand3,
              accent: r.accent,
              currency: r.currency,
              active: r.active,
            }
          : null,
      });
    }
    const brand: Brand = await resolveBrand({ host });
    return NextResponse.json({ ok: true, tenant: brand });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true, tenant: PLATFORM });
  }
}

/** Create or update a white-label tenant. */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json().catch(() => null);
    const slug = String(b?.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
    const name = String(b?.name ?? "").trim().slice(0, 120);
    if (!slug || !name) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }
    const hex = (v: unknown, fb: string) =>
      typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim().toUpperCase() : fb;

    const values = {
      slug,
      name,
      tagline: b?.tagline ? String(b.tagline).slice(0, 180) : null,
      logoUrl: b?.logoUrl ? String(b.logoUrl).slice(0, 400) : null,
      domain: b?.domain ? String(b.domain).trim().toLowerCase().slice(0, 120) : null,
      city: b?.city ? String(b.city).slice(0, 80) : null,
      phone: b?.phone ? String(b.phone).slice(0, 40) : null,
      whatsapp: b?.whatsapp ? String(b.whatsapp).slice(0, 40) : null,
      email: b?.email ? String(b.email).slice(0, 120) : null,
      brand1: hex(b?.brand1, "#0B63D6"),
      brand2: hex(b?.brand2, "#22C1F0"),
      brand3: hex(b?.brand3, "#FF2E93"),
      accent: hex(b?.accent, "#0B63D6"),
      currency: b?.currency ? String(b.currency).slice(0, 8) : "MAD",
      active: b?.active === undefined ? true : !!b.active,
      ownerUserId: u && u.id > 0 ? u.id : null,
    };

    const existing = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (existing.length) {
      await db.update(tenants).set(values).where(eq(tenants.id, existing[0].id));
      return NextResponse.json({ ok: true, slug, updated: true });
    }
    await db.insert(tenants).values(values);
    return NextResponse.json({ ok: true, slug, created: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  await db.delete(tenants).where(eq(tenants.slug, slug));
  return NextResponse.json({ ok: true });
}
