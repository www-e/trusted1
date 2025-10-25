import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL: DO NOT handle /api/auth/* routes here
  // Let the route handler do it
  if (pathname.startsWith("/api/auth")) {
    console.log(`[Middleware] Skipping /api/auth route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Handle other API routes if needed
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    console.log(`[Middleware] Handling ${pathname} from origin: ${origin}`);
    
    // Your tRPC CORS handling here...
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
