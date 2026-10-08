import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const name = String(b?.name ?? "").trim().slice(0, 80);
    const phone = String(b?.phone ?? "").trim().slice(0, 30);
    if (!name || !/^[+0-9()\s-]{8,}$/.test(phone)) {
      return NextResponse.json({ error: "name and a valid phone are required" }, { status: 400 });
    }
    const existing = await db.select({ phone: members.phone }).from(members).where(eq(members.phone, phone)).limit(1);
    if (existing.length === 0) {
      await db.insert(members).values({ name, phone });
    }
    return NextResponse.json({ ok: true, phone }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(members).orderBy(desc(members.createdAt)).limit(100);
    return NextResponse.json({
      ok: true,
      members: rows.map((m) => ({ name: m.name, phone: m.phone, createdAt: m.createdAt.toISOString() })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
