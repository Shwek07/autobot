// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

// Definieer een type voor de roles
type UserRole = "ADMIN" | "POS" | "USER";

// Role-based route configuratie met types
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

  const { pathname } = req.nextUrl;
  const redirected = req.cookies.get("redirect_done")?.value;

  // -------------------------------
  // Redirect logged-in users away from /login
  // -------------------------------
  if (pathname === "/login" && token) {
    const redirectPath = getRoleBasedRedirectPath(token.role as UserRole | undefined);
    const response = NextResponse.redirect(
      new URL(redirectPath, req.url)
    );
    
    response.cookies.set("redirect_done", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  // -------------------------------
  // Check of de huidige route beschermd is
  // -------------------------------
  const protectedRoute = Object.keys(routePermissions).find(route => 
    pathname.startsWith(route)
  );

  // -------------------------------
  // Check toegang voor beschermde routes
  // -------------------------------
  if (protectedRoute) {
    const allowedRoles = routePermissions[protectedRoute];
    
    // Als er geen token is, redirect naar login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check of de user role is toegestaan (met type checking)
    const userRole = token.role as UserRole | undefined;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect naar geschikte pagina op basis van role
      const redirectPath = getRoleBasedRedirectPath(userRole);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // -------------------------------
  // Redirect "/" based on role (once)
  // -------------------------------
  if (pathname === "/" && token && !redirected) {
    const redirectPath = getRoleBasedRedirectPath(token.role as UserRole | undefined);
    const response = NextResponse.redirect(
      new URL(redirectPath, req.url)
    );
    
    response.cookies.set("redirect_done", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

// Helper function met betere type handling
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