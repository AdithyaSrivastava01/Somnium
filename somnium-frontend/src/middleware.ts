import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: Server-side session validation middleware
// This runs on EVERY request to protected routes to verify session cookies

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth pages without session check
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Check if we have session cookies
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const hasTokens = !!(accessToken || refreshToken);

  // Landing page (/) logic: always show landing page, let client decide
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes (/dashboard/*): require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!hasTokens) {
      // No tokens, redirect to auth
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      url.searchParams.set("session_expired", "true");

      const redirectResponse = NextResponse.redirect(url);
      // Ensure cookies are deleted
      redirectResponse.cookies.delete("access_token");
      redirectResponse.cookies.delete("refresh_token");

      return redirectResponse;
    }
    // Has tokens, allow access
    return NextResponse.next();
  }

  // All other routes: allow
  return NextResponse.next();
}

// Apply middleware to all dashboard and root routes
export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
