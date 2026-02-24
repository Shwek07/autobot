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


  //  Redirect logged-in users away from /login
  if (pathname === "/login" && token) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/users/dashboard", req.url));
  }


  // Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }


  // Protect User Routes
  if (pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "USER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }


  // Redirect "/" Based On Role
  if (pathname === "/" && token) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/users/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/users/:path*",
  ],
};
