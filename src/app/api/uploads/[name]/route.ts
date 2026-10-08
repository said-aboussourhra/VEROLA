import { NextResponse } from "next/server";
import { SAFE_NAME, contentTypeFor, readUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;

  // never serve anything that is not a generated upload handle
  if (!SAFE_NAME.test(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const buf = await readUpload(name);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentTypeFor(name),
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
