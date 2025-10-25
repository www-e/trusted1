import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to check if origin is allowed
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    // In development, allow all localhost origins (any port)
    if (origin.startsWith("http://localhost")) return true;
  }
  
  // In production, check against allowed origins
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app",
    "https://trusted-gamma.vercel.app",
  ];
  
  return allowedOrigins.includes(origin);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  
  // IMPORTANT: Skip CORS handling for /api/auth/* routes
  // Let Better Auth handle its own CORS
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Handle CORS for other API routes (like tRPC)
  if (pathname.startsWith("/api/")) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 });
      
      if (origin && isAllowedOrigin(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With, Cookie"
        );
        response.headers.set("Access-Control-Max-Age", "86400");
      }
      
      return response;
    }
    
    // Handle actual requests
    const response = NextResponse.next();
    
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
