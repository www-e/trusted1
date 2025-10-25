import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Check if origin is allowed for CORS
 * Supports:
 * - Development: any localhost
 * - Production: specific domains + Vercel previews
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Development: allow all localhost origins
  if (isDevelopment) {
    if (origin.startsWith("http://localhost")) return true;
    if (origin.startsWith("http://127.0.0.1")) return true;
  }
  
  // Production: check against allowed origins
  if (isProduction) {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app",
      "https://trusted-gamma.vercel.app",
    ];
    
    // Check exact match
    if (allowedOrigins.includes(origin)) return true;
    
    // Check Vercel preview deployments (*.vercel.app)
    if (origin.endsWith(".vercel.app") && origin.startsWith("https://")) {
      return true;
    }
    
    // If VERCEL_URL is set, allow it
    if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
      return true;
    }
  }
  
  return false;
}

/**
 * Set CORS headers on response
 */
function setCORSHeaders(response: NextResponse, origin: string): void {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  
  // IMPORTANT: Skip CORS handling for /api/auth/* routes
  // Better Auth handles its own CORS based on trustedOrigins
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Handle CORS for other API routes (like tRPC)
  if (pathname.startsWith("/api/")) {
    // Check if origin is allowed
    const originAllowed = origin && isAllowedOrigin(origin);
    
    // Handle preflight (OPTIONS) requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 }); // 204 No Content
      
      if (originAllowed) {
        setCORSHeaders(response, origin);
      }
      
      return response;
    }
    
    // Handle actual requests
    const response = NextResponse.next();
    
    if (originAllowed) {
      setCORSHeaders(response, origin);
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    // Exclude static files and internal Next.js routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
