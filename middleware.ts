import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    if (isAllowedOrigin || process.env.NODE_ENV !== "production") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Cookie",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new NextResponse(null, { status: 403 });
  }

  // For other requests, set CORS headers if origin is allowed
  const response = NextResponse.next();
  if (isAllowedOrigin || process.env.NODE_ENV !== "production") {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: "/api/:path*",
};
