// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

type UserRole = "ADMIN" | "POS" | "USER";

const routePermissions: Record<string, UserRole[]> = {
  "/admin": ["ADMIN"],
  "/pos": ["POS", "ADMIN"],
  "/dashboard": ["USER", "ADMIN"],
  "/api/admin": ["ADMIN"],
  "/api/pos": ["POS", "ADMIN"],
  "/api/dashboard": ["USER", "ADMIN"],
};

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, searchParams } = req.nextUrl;
  const redirected = req.cookies.get("redirect_done")?.value;


  const callbackUrl = searchParams.get("callbackUrl");


  // ---------------------------------------
  if (pathname === "/login" && token) {
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }

    const redirectPath = getRoleBasedRedirectPath(token.role as UserRole | undefined);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }


  // ---------------------------------------
  const protectedRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );

  if (protectedRoute) {
    const allowedRoles = routePermissions[protectedRoute];

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as UserRole | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      const redirectPath = getRoleBasedRedirectPath(userRole);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }


  // ---------------------------------------
  if (pathname === "/" && token && !redirected) {
    if (!callbackUrl) {
      const redirectPath = getRoleBasedRedirectPath(token.role as UserRole | undefined);
      const response = NextResponse.redirect(new URL(redirectPath, req.url));

      response.cookies.set("redirect_done", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });

      return response;
    }
  }

  return NextResponse.next();
}

function getRoleBasedRedirectPath(role: UserRole | undefined): string {
  if (!role) return "/dashboard";

  switch (role) {
    case "ADMIN":
      return "/admin";
    case "POS":
      return "/pos";
    case "USER":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/pos/:path*",
    "/dashboard/:path*",
  ],
};