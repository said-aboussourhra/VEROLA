import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { currentUser, isAdmin } from "@/lib/auth";
import { activeCountExcept, parseProductInput } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function idOf(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Admin: update a product (including turning it on or off). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = idOf((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const input = parseProductInput(await req.json().catch(() => null));
    if (!input.active && (await activeCountExcept(id)) === 0) {
      return NextResponse.json({ error: "Keep at least one active product on the site." }, { status: 400 });
    }
    const clash = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, input.slug))
      .limit(1);
    if (clash.length && clash[0].id !== id) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
    const [row] = await db.update(products).set(input).where(eq(products.id, id)).returning();
    if (!row) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save the product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Admin: delete a product. The last remaining active product cannot be removed. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = idOf((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [current] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!current) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (current.active && (await activeCountExcept(id)) === 0) {
    return NextResponse.json({ error: "Keep at least one active product on the site." }, { status: 400 });
  }
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}
