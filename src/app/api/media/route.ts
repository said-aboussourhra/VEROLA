import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(media).orderBy(media.position, media.id);
    return NextResponse.json({
      ok: true,
      items: rows.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        url: m.url,
        category: m.category,
        position: m.position,
        featured: m.featured,
        enabled: m.enabled,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json().catch(() => null);
    const title = String(b?.title ?? "").trim().slice(0, 140);
    const url = String(b?.url ?? "").trim().slice(0, 400);
    if (!title || !url) return NextResponse.json({ error: "title and url required" }, { status: 400 });

    const values = {
      title,
      url,
      description: b?.description ? String(b.description).slice(0, 400) : null,
      category: String(b?.category ?? "hero").slice(0, 40),
      position: Math.max(0, Math.round(Number(b?.position ?? 0))),
      featured: !!b?.featured,
      enabled: b?.enabled === undefined ? true : !!b.enabled,
    };

    if (b?.id) {
      await db.update(media).set(values).where(eq(media.id, Number(b.id)));
      return NextResponse.json({ ok: true, id: Number(b.id) });
    }
    const [row] = await db.insert(media).values(values).returning({ id: media.id });
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ ok: true });
}
