import { NextResponse } from "next/server";
import { ADMIN_CODE, ADMIN_COOKIE, adminCodeHash } from "@/lib/auth";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 20;
const attempts = new Map<string, { n: number; at: number }>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.at > WINDOW_MS) {
    attempts.set(ip, { n: 1, at: now });
    return false;
  }
  rec.n += 1;
  rec.at = now;
  return rec.n > MAX_ATTEMPTS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const b = await req.json().catch(() => null);
  const code = String(b?.code ?? "").trim();

  // tolerant compare: ignores case and any spacing the browser may add
  const norm = (s: string) => s.replace(/\s+/g, "").toUpperCase();
  if (!ADMIN_CODE) {
    return NextResponse.json({ error: "Admin access is not configured." }, { status: 503 });
  }
  if (!code || norm(code) !== norm(ADMIN_CODE)) {
    return NextResponse.json({ error: "Wrong access code." }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true, role: "admin" });
  res.cookies.set(ADMIN_COOKIE, adminCodeHash(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
