import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const email = String(b?.email ?? "").trim().toLowerCase();
    const password = String(b?.password ?? "");

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        passHash: users.passHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const u = rows[0];
    if (!u || !verifyPassword(password, u.passHash)) {
      return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
    }
    const token = await createSession(u.id);
    const res = NextResponse.json({
      ok: true,
      user: { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error("login", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
