import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow login page and auth API through
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("fs_session")?.value;
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    // AUTH_SECRET not set — block everything with a clear error
    return new NextResponse(
      "<h1>Setup required</h1><p>Set AUTH_SECRET and ADMIN_PASSWORD in your environment variables.</p>",
      { status: 503, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!session || session !== secret) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
