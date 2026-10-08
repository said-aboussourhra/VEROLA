import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  CATALOG,
  calculatePrice,
  FINISHES,
  type FinishId,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    if (!b) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const name = String(b.name ?? "").trim().slice(0, 120);
    const phone = String(b.phone ?? "").trim().slice(0, 30);
    const email = (b.email ? String(b.email).trim().slice(0, 120) : null) as string | null;
    const city = (b.city ? String(b.city).trim().slice(0, 60) : null) as string | null;
    const address = (b.address ? String(b.address).trim().slice(0, 240) : null) as string | null;
    const notes = (b.notes ? String(b.notes).trim().slice(0, 500) : null) as string | null;
    const payment = ["advance", "cod", "card", "bank"].includes(b.payment) ? b.payment : "cod";
    const ribSender = (b.ribSender ? String(b.ribSender).trim().slice(0, 120) : null) as string | null;
    const artworkUrl = (b.artworkUrl ? String(b.artworkUrl).slice(0, 300) : null) as string | null;
    const receipt = (b.receipt ? String(b.receipt).slice(0, 300) : null) as string | null;
    const cfg = b.config ?? {};

    if (!name || !phone) {
      return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
    }

    const product = CATALOG.find((c) => c.id === cfg.product);
    if (!product) {
      return NextResponse.json({ error: "unknown product" }, { status: 400 });
    }

    const sizeId = product.sizes.some((s) => s.id === cfg.sizeId) ? cfg.sizeId : product.sizes[0].id;
    const paperId = product.papers.some((p) => p.id === cfg.paperId) ? cfg.paperId : product.papers[0].id;
    const finishId: FinishId = FINISHES.some((f) => f.id === cfg.finishId)
      ? (cfg.finishId as FinishId)
      : "matte";
    const qty = Math.min(50000, Math.max(product.minQty, Math.round(Number(cfg.qty) || product.minQty)));
    const zoneId = ["a", "b", "c"].includes(cfg.zoneId) ? cfg.zoneId : "a";
    const express = !!cfg.express;

    const bp = calculatePrice({ product: product.id, sizeId, paperId, finishId, qty, express, zoneId });
    const advanceAmount =
      payment === "advance" ? Math.round(bp.total * 0.2 * 100) / 100 : 0;
    if (payment === "advance" && !ribSender) {
      return NextResponse.json({ error: "sender RIB/name required for advance" }, { status: 400 });
    }

    let code = "";
    for (let i = 0; i < 8; i++) {
      code = `VLR-${Math.floor(1000 + Math.random() * 9000)}`;
      const dup = await db
        .select({ code: orders.code })
        .from(orders)
        .where(eq(orders.code, code))
        .limit(1);
      if (dup.length === 0) break;
    }

    const [row] = await db
      .insert(orders)
      .values({
        code,
        name,
        phone,
        email,
        city,
        address,
        zone: zoneId,
        payment,
        product: product.id,
        size: sizeId,
        paper: paperId,
        finish: finishId,
        quantity: qty,
        unitPrice: bp.unit,
        subtotal: bp.subtotal,
        vat: bp.vat,
        delivery: bp.delivery,
        total: bp.total,
        express,
        artworkName: cfg.artworkName ? String(cfg.artworkName).slice(0, 120) : null,
        artworkUrl,
        advanceAmount,
        ribSender,
        receipt,
        note: notes,
      })
      .returning();

    // queue a production job on the press floor
    const jbCode = `JB-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await db.insert(jobs).values({
        code: jbCode,
        orderCode: row.code,
        product: product.id,
        sheets: qty,
      });
    } catch (e) {
      console.error("job enqueue failed", e);
    }

    return NextResponse.json({ ok: true, id: row.id, code: row.code, job: jbCode }, { status: 201 });
  } catch (e) {
    console.error("order create failed", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
