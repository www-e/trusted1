import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware now ONLY handles CORS for tRPC routes.
// Better-Auth handles CORS for its own /api/auth routes internally.

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isDevelopment = process.env.NODE_ENV !== "production";

  // In development, we can be more permissive to support dynamic ports.
  // In production, we should strictly check against a list of allowed origins.
  // Note: Your ALLOWED_ORIGIN env var should be a comma-separated list.
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "").split(",");
  const isAllowedOrigin = allowedOrigins.includes(origin) || (isDevelopment && origin.startsWith("http://localhost:"));

  // Handle preflight requests (OPTIONS)
  if (request.method === "OPTIONS") {
    if (isAllowedOrigin) {
      return new NextResponse(null, {
        status: 204, // No Content
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Cookie",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      });
    }
    // If the origin is not allowed, deny the preflight request.
    return new NextResponse("CORS policy violation", { status: 403 });
  }

  // For actual requests, attach the CORS headers to the response.
  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

// This config ensures the middleware only runs on tRPC routes.
export const config = {
  matcher: "/api/trpc/:path*",
};