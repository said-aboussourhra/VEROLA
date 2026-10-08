import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const numericId = /^\d+$/.test(id) ? Number(id) : null;
    const where = numericId
      ? or(eq(orders.code, id.toUpperCase()), eq(orders.id, numericId))
      : eq(orders.code, id.toUpperCase());
    const [o] = await db.select().from(orders).where(where).limit(1);
    if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      id: o.id,
      code: o.code,
      product: o.product,
      size: o.size,
      paper: o.paper,
      finish: o.finish,
      quantity: o.quantity,
      total: o.total,
      express: o.express,
      payment: o.payment,
      createdAt: o.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
