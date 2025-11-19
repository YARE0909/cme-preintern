import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;

  const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

  const isPublic = PUBLIC_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",                    // protect homepage
    "/dashboard/:path*",    // protect all dashboard routes
    "/admin/:path*",        // protect all admin routes
  ],
};
