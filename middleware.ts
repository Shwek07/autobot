// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const redirected = req.cookies.get("redirect_done")?.value;

  // -------------------------------
  // Redirect logged-in users away from /login
  // -------------------------------
  if (pathname === "/login" && token) {
    const response = NextResponse.redirect(
      new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", req.url) 
    );

    // Mark that the user has been redirected once
    response.cookies.set("redirect_done", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  }

  // -------------------------------
  // Protect Admin Routes
  // -------------------------------
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // -------------------------------
  // Protect Dashboard Routes
  // -------------------------------
  if (pathname.startsWith("/dashboard")) { 
    if (!token || token.role !== "USER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // -------------------------------
  // Redirect "/" based on role (once)
  // -------------------------------
  if (pathname === "/" && token && !redirected) {
    const response = NextResponse.redirect(
      new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", req.url)
    );

    // Mark that the user has been redirected once
    response.cookies.set("redirect_done", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/dashboard/:path*"], 
};