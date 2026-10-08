import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const name = String(b?.name ?? "").trim().slice(0, 80);
    const email = String(b?.email ?? "").trim().toLowerCase().slice(0, 120);
    const phone = b?.phone ? String(b.phone).trim().slice(0, 30) : null;
    const password = String(b?.password ?? "");

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return NextResponse.json(
        { error: "Name, valid email and a password of 8+ characters are required." },
        { status: 400 },
      );
    }
    const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (exists.length) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    const [u] = await db
      .insert(users)
      .values({ name, email, phone, passHash: hashPassword(password) })
      .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role });

    const token = await createSession(u.id);
    const res = NextResponse.json({ ok: true, user: u });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error("register", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
