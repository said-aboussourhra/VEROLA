import { NextResponse } from "next/server";
import { floorSnapshot } from "@/lib/floor/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await floorSnapshot();
    return NextResponse.json({ ok: true, ...snap });
  } catch (e) {
    console.error("floor snapshot failed", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
