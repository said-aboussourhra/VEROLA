import path from "path";
import { promises as fs } from "fs";

/**
 * File storage.
 *
 * Local / self-hosted : UPLOAD_DIR  (default <cwd>/data/uploads)
 * Vercel (serverless) : the filesystem is read-only except /tmp.
 *   Set UPLOAD_DIR=/tmp/verola-uploads  for ephemeral storage, or point
 *   STORAGE_DRIVER=blob with BLOB_READ_WRITE_TOKEN for Vercel Blob.
 *
 * The driver is isolated here so swapping in S3 / Blob / Supabase Storage
 * touches exactly one file — nothing else in the app knows where files live.
 */

export type StorageDriver = "fs" | "blob";

export function storageDriver(): StorageDriver {
  return process.env.STORAGE_DRIVER === "blob" ? "blob" : "fs";
}

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
}

export const OK_EXT = new Set(["png", "jpg", "jpeg", "webp", "pdf", "svg", "ai"]);
export const MAX_UPLOAD = 50 * 1024 * 1024;

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
  svg: "image/svg+xml",
  ai: "application/postscript",
};

export function contentTypeFor(name: string): string {
  return TYPES[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}

export const SAFE_NAME = /^u_[a-zA-Z0-9_]+\.[a-z0-9]+$/;

export async function writeUpload(id: string, ext: string, buf: Buffer): Promise<string> {
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${id}.${ext}`), buf);
  return `/api/uploads/${id}.${ext}`;
}

export async function readUpload(name: string): Promise<Buffer> {
  return fs.readFile(path.join(uploadDir(), name));
}
