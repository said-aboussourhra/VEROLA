/**
 * Cookie options for session and admin cookies.
 *
 * Over HTTPS the cookie is SameSite=None; Secure, so it still works when the
 * site is shown inside another site's frame (for example the live preview).
 * Over plain HTTP (local development) it stays SameSite=Lax.
 */
export function sessionCookieOptions(req: Request, maxAge: number) {
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const https = proto.split(",")[0].trim() === "https";
  return {
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite: https ? ("none" as const) : ("lax" as const),
    secure: https,
  };
}
