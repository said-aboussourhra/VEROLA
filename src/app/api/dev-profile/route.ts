import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { devProfile } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(devProfile).limit(1);
    const d = rows[0];
    return NextResponse.json({
      ok: true,
      profile: d
        ? {
            name: d.name,
            role: d.role,
            about: d.about,
            photo: d.photo,
            whatsapp: d.whatsapp,
            instagram: d.instagram,
            email: d.email,
            skills: d.skills,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json().catch(() => null);
    const values = {
      name: String(b?.name ?? "SA ID").slice(0, 120),
      role: String(b?.role ?? "Web Developer & Digital Creator").slice(0, 160),
      about: b?.about ? String(b.about).slice(0, 2000) : null,
      photo: b?.photo ? String(b.photo).slice(0, 400) : null,
      whatsapp: b?.whatsapp ? String(b.whatsapp).slice(0, 120) : null,
      instagram: b?.instagram ? String(b.instagram).slice(0, 200) : null,
      email: b?.email ? String(b.email).slice(0, 160) : null,
      skills: b?.skills ? String(b.skills).slice(0, 2000) : null,
    };
    const rows = await db.select({ id: devProfile.id }).from(devProfile).limit(1);
    if (rows.length) {
      await db.update(devProfile).set(values).where(eq(devProfile.id, rows[0].id));
    } else {
      await db.insert(devProfile).values(values);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
