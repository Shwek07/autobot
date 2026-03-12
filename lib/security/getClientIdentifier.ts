// lib/security/getClientIdentifier.ts
export function getClientIdentifier(
  req: Request,
  userId?: string | number | null
): string {
  if (userId !== undefined && userId !== null && String(userId).trim() !== "") {
    return `user:${String(userId).trim()}`;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "unknown-ip";

  return `ip:${ip}`;
}