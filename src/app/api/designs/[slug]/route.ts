import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { downloads, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDesign, designSvg } from "@/lib/designs";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const d = getDesign(slug);
  if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isDownload = _req.nextUrl.searchParams.get("download") === "1";
  const memberPhone = _req.nextUrl.searchParams.get("member");

  if (d.access === "member" && isDownload) {
    if (!memberPhone) {
      return NextResponse.json({ error: "subscription required", access: "member" }, { status: 402 });
    }
    const found = await db.select({ phone: members.phone }).from(members).where(eq(members.phone, memberPhone)).limit(1);
    if (found.length === 0) {
      return NextResponse.json({ error: "not a member", access: "member" }, { status: 402 });
    }
  }

  const svg = designSvg(d);
  if (isDownload) {
    await db.insert(downloads).values({ slug: d.slug, memberPhone: memberPhone ?? null }).catch(() => undefined);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${d.slug}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
