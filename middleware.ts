// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Bescherm admin pagina's en API routes
  const isAdminPath =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminPath) {
    if (!token || token.role !== "ADMIN") {
      // Redirect voor pagina's, 401 voor API calls
      if (req.nextUrl.pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ message: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      } else {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
