import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";
import { getAllProducts, getCatalog, parseProductInput } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Public: active products. Admins can pass ?all=1 to include inactive ones. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("all") === "1") {
    const u = await currentUser();
    if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ ok: true, items: await getAllProducts() });
  }
  return NextResponse.json({ ok: true, items: await getCatalog() });
}

/** Admin: add a product. It appears on the site immediately. */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const input = parseProductInput(await req.json().catch(() => null));
    const taken = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
    if (taken.length) return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    const [row] = await db.insert(products).values(input).returning();
    return NextResponse.json({ ok: true, item: row }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save the product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
