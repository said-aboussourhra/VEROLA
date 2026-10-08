import { NextResponse } from "next/server";
import { db } from "@/db";
import { downloads } from "@/db/schema";
import { DESIGNS } from "@/lib/designs";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select({ slug: downloads.slug, n: count() }).from(downloads).groupBy(downloads.slug);
    const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r.n]));
    return NextResponse.json({
      ok: true,
      designs: DESIGNS.map((d) => ({
        slug: d.slug,
        title: d.title,
        cat: d.cat,
        access: d.access,
        w: d.w,
        h: d.h,
        palette: d.palette,
        downloads: bySlug[d.slug] ?? 0,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
