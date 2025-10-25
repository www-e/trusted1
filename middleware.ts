import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // This is the origin making the request (e.g., http://localhost:54821)
  const origin = request.headers.get("origin") ?? "";

  // Get the list of allowed origins from your Vercel environment variables
  const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

  // Check if the request origin is in the allowed list.
  // We use a more flexible check for localhost to support any dynamic port.
  const isAllowedOrigin =
    allowedOrigins.includes(origin) ||
    (origin.startsWith("http://localhost:") && allowedOrigins.includes("http://localhost:*"));

  // 1. Handle Preflight (OPTIONS) Requests
  // This is the most crucial part. We intercept all OPTIONS requests for the API
  // and respond immediately with the correct headers if the origin is allowed.
  if (request.method === "OPTIONS") {
    if (isAllowedOrigin) {
      return new NextResponse(null, {
        status: 204, // No Content
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      });
    }
    // If the origin is not allowed, we block the preflight request.
    return new NextResponse("CORS error: Origin not allowed", { status: 403 });
  }

  // 2. Handle Actual API Requests (GET, POST, etc.)
  // For non-preflight requests, we let them proceed to the respective route handlers
  // (tRPC or Better-Auth), but we still need to attach the CORS headers to the final response.
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

// This config ensures the middleware runs on ALL API routes.
export const config = {
  matcher: "/api/:path*",
};