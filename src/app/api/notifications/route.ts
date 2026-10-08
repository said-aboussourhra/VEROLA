import { NextResponse } from "next/server";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: true, items: [], unread: 0 });
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(or(eq(notifications.userId, u.id), eq(notifications.userId, sql`NULL`)))
      .orderBy(desc(notifications.createdAt))
      .limit(40);
    return NextResponse.json({
      ok: true,
      unread: rows.filter((r) => !r.read).length,
      items: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
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
    const title = String(b?.title ?? "").trim().slice(0, 160);
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    await db.insert(notifications).values({
      userId: b?.userId ? Number(b.userId) : null,
      type: String(b?.type ?? "info").slice(0, 30),
      title,
      body: b?.body ? String(b.body).slice(0, 500) : null,
      href: b?.href ? String(b.href).slice(0, 200) : null,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  try {
    if (b?.all) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(or(eq(notifications.userId, u.id), eq(notifications.userId, sql`NULL`)));
      return NextResponse.json({ ok: true });
    }
    const id = Number(b?.id);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, u.id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
