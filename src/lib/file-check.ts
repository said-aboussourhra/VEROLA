/** Checks the first bytes match the claimed type, so renamed files are refused. */
export function magicOk(ext: string, buf: Buffer): boolean {
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


