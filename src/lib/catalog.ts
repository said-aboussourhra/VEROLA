import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, type ProductRow } from "@/db/schema";
import { DEFAULT_CATALOG, type Product } from "@/lib/pricing";
import { parseProductInput, type ProductInput } from "@/lib/product-input";

export { parseProductInput, type ProductInput };

/* ============================================================
   Server-side product catalogue.

   The catalogue lives in the `products` table and is managed
   from the admin. The built-in DEFAULT_CATALOG seeds the table
   the first time it is read, and is the fallback when the
   database cannot be reached.
   ============================================================ */

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.slug,
    name: r.name,
    tagline: r.tagline,
    unit: r.unit,
    base: r.base,
    minQty: r.minQty,
    step: r.step,
    image: r.image,
    sizes: r.sizes,
    papers: r.papers,
  };
}

let seeding: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      const [{ total }] = await db.select({ total: count() }).from(products);
      if (Number(total) > 0) return;
      await db
        .insert(products)
        .values(
          DEFAULT_CATALOG.map((p, i) => ({
            slug: p.id,
            name: p.name,
            tagline: p.tagline,
            unit: p.unit,
            base: p.base,
            minQty: p.minQty,
            step: p.step,
            image: p.image,
            sizes: p.sizes,
            papers: p.papers,
            position: i,
            active: true,
          })),
        )
        .onConflictDoNothing();
    })().catch((e) => {
      seeding = null; // retry on the next request
      throw e;
    });
  }
  return seeding;
}

/** Products shown on the public site, in admin order. Falls back to the built-in catalogue. */
export async function getCatalog(): Promise<Product[]> {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.position), asc(products.id));
    return rows.length ? rows.map(rowToProduct) : DEFAULT_CATALOG;
  } catch (e) {
    console.error("catalog: falling back to defaults", e);
    return DEFAULT_CATALOG;
  }
}

/** Every product, including inactive ones (admin only). */
export async function getAllProducts(): Promise<ProductRow[]> {
  await ensureSeeded();
  return db.select().from(products).orderBy(asc(products.position), asc(products.id));
}

/** Used by the API to refuse changes that would leave the shop with no products. */
export async function activeCountExcept(id: number): Promise<number> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.active, true));
  return rows.filter((r) => r.id !== id).length;
}

