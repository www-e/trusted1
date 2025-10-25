import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip CORS handling for Better Auth routes as it handles CORS internally
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // In development, allow all origins to avoid dynamic port issues
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    if (isAllowedOrigin || isDevelopment) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": isDevelopment ? "*" : (origin || "*"),
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Cookie",
          "Access-Control-Allow-Credentials": isDevelopment ? "false" : "true", // Credentials false when using *
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new NextResponse(null, { status: 403 });
  }

  // For other requests, set CORS headers
  const response = NextResponse.next();
  if (isAllowedOrigin || isDevelopment) {
    response.headers.set("Access-Control-Allow-Origin", isDevelopment ? "*" : (origin || "*"));
    response.headers.set("Access-Control-Allow-Credentials", isDevelopment ? "false" : "true");
  }
  return response;
}

// Configure which routes use this middleware
// Exclude Better Auth routes as it handles CORS internally
export const config = {
  matcher: "/api/:path*",
  runtime: "nodejs",
};
