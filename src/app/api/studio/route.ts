import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, members, jobs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [orderRows, memberRows, agg] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(40),
      db.select().from(members).orderBy(desc(members.createdAt)).limit(100),
      db
        .select({
          n: sql<number>`count(*)`,
          total: sql<number>`coalesce(sum(${orders.total}), 0)`,
          advance: sql<number>`coalesce(sum(${orders.advanceAmount}), 0)`,
        })
        .from(orders),
    ]);
    const jobCodes = await db.select({ code: jobs.code, orderCode: jobs.orderCode }).from(jobs).limit(200);
    const jobByOrder = Object.fromEntries(jobCodes.map((j) => [j.orderCode, j.code]));

    return NextResponse.json({
      ok: true,
      stats: {
        requests: agg[0]?.n ?? 0,
        revenue: Math.round((agg[0]?.total ?? 0) * 100) / 100,
        advances: Math.round((agg[0]?.advance ?? 0) * 100) / 100,
        members: memberRows.length,
      },
      orders: orderRows.map((o) => ({
        code: o.code,
        job: jobByOrder[o.code] ?? null,
        name: o.name,
        phone: o.phone,
        email: o.email,
        city: o.city,
        address: o.address,
        product: o.product,
        size: o.size,
        paper: o.paper,
        finish: o.finish,
        quantity: o.quantity,
        total: o.total,
        express: o.express,
        payment: o.payment,
        advanceAmount: o.advanceAmount,
        ribSender: o.ribSender,
        artworkName: o.artworkName,
        artworkUrl: o.artworkUrl,
        receipt: o.receipt,
        note: o.note,
        createdAt: o.createdAt.toISOString(),
      })),
      members: memberRows.map((m) => ({
        name: m.name,
        phone: m.phone,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
