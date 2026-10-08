import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TrackClient } from "@/components/track";

export const metadata = { title: "Track your order — VÉLORA" };

export interface TrackData {
  id: number;
  product: string;
  sizeId: string;
  paperId: string;
  finishId: string;
  qty: number;
  total: number;
  express: boolean;
  payment: string;
  createdAt: string;
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: TrackData | null = null;
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.code, id.toUpperCase()))
      .limit(1);
    const o = rows[0];
    if (o) {
      data = {
        id: o.id,
        product: o.product,
        sizeId: o.size,
        paperId: o.paper,
        finishId: o.finish,
        qty: o.quantity,
        total: o.total,
        express: o.express,
        payment: o.payment,
        createdAt: o.createdAt.toISOString(),
      };
    }
  } catch {
    data = null;
  }
  return <TrackClient code={id.toUpperCase()} data={data} />;
}
