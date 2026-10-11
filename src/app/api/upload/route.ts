import { NextResponse } from "next/server";
import {
  OK_EXT,
  MAX_UPLOAD,
  SAFE_NAME,
  storageDriver,
  writeUpload,
} from "@/lib/storage";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Checks the first bytes match the claimed type, so renamed files are refused. */
function magicOk(ext: string, buf: Buffer): boolean {
  const head = buf.subarray(0, 12);
  switch (ext) {
    case "png":
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    case "jpg":
    case "jpeg":
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    case "webp":
      return head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP";
    case "pdf":
    case "ai":
      return buf.subarray(0, 1024).includes("%PDF") || buf.subarray(0, 1024).toString("latin1").includes("%!PS");
    case "svg": {
      // SVG is XML: refuse scripts, event handlers and external references
      const text = buf.toString("utf8").toLowerCase();
      return text.includes("<svg") && !/<script|javascript:|\son[a-z]+\s*=|<foreignobject|<iframe|<!entity/.test(text);
    }
    default:
      return false;
  }
}

export async function POST(req: Request) {
  if (rateLimited(`upload:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was sent." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!OK_EXT.has(ext)) {
      return NextResponse.json(
        { error: `This file format is not supported. Use ${[...OK_EXT].join(", ")}.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD) {
      return NextResponse.json(
        { error: "The file is too large. Maximum 50MB." },
        { status: 400 },
      );
    }

    const id = `u_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const safeId = id.replace(/[^a-zA-Z0-9_]/g, "");
    if (!SAFE_NAME.test(`${safeId}.${ext}`)) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (!magicOk(ext, buf)) {
      return NextResponse.json(
        { error: "This file does not match its format. Please export it again and retry." },
        { status: 400 },
      );
    }
    let url: string;
    try {
      url = await writeUpload(safeId, ext, buf);
    } catch (e) {
      console.error("storage write failed", e);
      return NextResponse.json(
        {
          error:
            storageDriver() === "fs"
              ? "Storage is not writable on this host. Set UPLOAD_DIR to a writable path, or STORAGE_DRIVER=blob with BLOB_READ_WRITE_TOKEN."
              : "Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.",
        },
        { status: 507 },
      );
    }

    return NextResponse.json({ ok: true, url, name: file.name, size: file.size }, { status: 201 });
  } catch (e) {
    console.error("upload failed", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
