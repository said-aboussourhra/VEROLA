import { scryptSync, randomBytes, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";

export const SESSION_COOKIE = "verola_sid";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const test = scryptSync(plain, salt, 64);
  const ref = Buffer.from(key, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ token: hashToken(token), userId, expiresAt });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, hashToken(token)));
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

/* ---- admin unlock code (SA ID) ---- */
export const ADMIN_CODE = process.env.ADMIN_CODE || "SAID2002";
export const ADMIN_COOKIE = "verola_admin";

export function adminCodeHash(): string {
  return createHash("sha256").update(`verola::${ADMIN_CODE}`).digest("hex");
}

/** Role gate for the admin CMS. Configured with env, never client-side. */
export function isAdmin(u: SessionUser | null): boolean {
  if (!u) return false;
  if (u.role === "admin") return true;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(u.email.toLowerCase());
}

export async function currentUser(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();

    // admin unlock code grants a full admin identity
    const gate = jar.get(ADMIN_COOKIE)?.value;
    if (gate && gate === adminCodeHash()) {
      return { id: 0, name: "SA ID", email: "admin@verola.local", phone: null, role: "admin" };
    }

    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, hashToken(token)))
      .limit(1);
    const u = rows[0];
    if (!u || u.expiresAt.getTime() < Date.now()) return null;
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role };
  } catch {
    return null;
  }
}
