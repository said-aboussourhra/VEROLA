import { NextResponse } from "next/server";
import {
  OK_EXT,
  MAX_UPLOAD,
  SAFE_NAME,
  storageDriver,
  writeUpload,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
