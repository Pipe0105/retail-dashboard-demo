import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// First line of defense: unauthenticated visitors never reach the dashboard.
// Data-level permissions (which stores a user can see) are enforced again in the queries.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let valid = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      valid = true;
    } catch {
      valid = false;
    }
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/dashboard") && !valid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if ((pathname === "/login" || pathname === "/") && valid) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname === "/" && !valid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/login", "/dashboard/:path*"] };
