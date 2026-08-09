import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "m9_session";

/**
 * Cheap edge guard: bounces obviously-signed-out visitors before a page render.
 * It only checks for cookie *presence* — the authoritative check (validity,
 * expiry, role) happens server-side in the protected layouts, since Prisma
 * cannot run in the edge runtime.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/ai/:path*", "/admin/:path*"],
};
