import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check: if there's no session cookie at all, skip rendering
 * protected pages and go straight to login. Real authorisation happens
 * on the API for every request.
 *
 * Only valid when API calls go through this app's /api/v1 proxy (default),
 * because that's what makes the auth cookies visible on this domain.
 */
export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("refresh_token");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/my-courses/:path*", "/course-access/:path*", "/admin/:path*"],
};
