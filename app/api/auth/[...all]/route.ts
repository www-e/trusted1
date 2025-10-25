import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: baseGet, POST: basePost } = toNextJsHandler(auth);

/**
 * Get allowed origins based on environment
 * This matches our Better Auth config exactly
 */
function getAllowedOrigins(): Set<string> {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    // Development: allow all localhost origins
    // We'll use dynamic checking instead of a static list
    return new Set([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      // Add more if needed, but we'll check dynamically for any port
    ]);
  }
  
  // Production origins
  return new Set([
    "https://trusted-gamma.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app",
  ]);
}

/**
 * Check if origin is allowed
 * Supports dynamic localhost ports in development
 */
function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Development: allow any localhost port
  if (isDevelopment) {
    if (origin.startsWith("http://localhost:")) return true;
    if (origin.startsWith("http://127.0.0.1:")) return true;
  }
  
  // Production: check exact matches
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.has(origin)) return true;
  
  // Vercel preview deployments
  if (origin.endsWith(".vercel.app") && origin.startsWith("https://")) {
    return true;
  }
  
  return false;
}

/**
 * CORS headers configuration
 */
const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-CSRF-Token",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Build CORS response with proper headers
 */
function buildCorsResponse(
  origin: string, 
  status: number, 
  body: BodyInit | null = null
): Response {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Origin": origin,
    },
  });
}

/**
 * Wrap handler with CORS support
 * This is the critical fix for Better Auth CORS issues
 */
function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin") ?? "";

    // Check if origin is allowed
    if (!isOriginAllowed(origin)) {
      console.error(`[CORS] Rejected origin: ${origin}`);
      return new Response("CORS not allowed", { status: 403 });
    }

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      return buildCorsResponse(origin, 204);
    }

    // Handle actual request
    const res = await handler(req);

    // Clone response and add CORS headers
    const response = new Response(res.body, res);
    
    // Set CORS headers
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    response.headers.set("Access-Control-Allow-Origin", origin);

    return response;
  };
}

// Export wrapped handlers with CORS support
export const GET = withCors(baseGet);
export const POST = withCors(basePost);
export const OPTIONS = async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  
  if (!isOriginAllowed(origin)) {
    return new Response("CORS not allowed", { status: 403 });
  }
  
  return buildCorsResponse(origin, 204);
};
