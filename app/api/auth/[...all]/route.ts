import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: baseGet, POST: basePost } = toNextJsHandler(auth);

// CRITICAL: Define allowed origins exactly as browser sends them
const allowedOrigins = new Set([
  // Development
  "http://localhost:3000",
  "http://localhost:8080",  // Flutter web dev server
  "http://127.0.0.1:3000",
  // Add more localhost ports if needed
]);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-CSRF-Token",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

/**
 * Check if origin is allowed
 * IMPORTANT: Must match EXACTLY what browser sends (including port)
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    // In development, allow ANY localhost port
    if (origin.startsWith("http://localhost:")) return true;
    if (origin.startsWith("http://127.0.0.1:")) return true;
  }
  
  // Check exact matches
  if (allowedOrigins.has(origin)) return true;
  
  // Production: check production domain
  if (origin === "https://trusted-gamma.vercel.app") return true;
  if (origin.endsWith(".vercel.app") && origin.startsWith("https://")) return true;
  
  return false;
}

/**
 * Build CORS response
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
 * Wrap handler with CORS
 * This fixes Better Auth's CORS bug in v1.3.6-1.3.7
 */
function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    
    console.log(`[CORS] Request from origin: ${origin}`);
    console.log(`[CORS] Method: ${req.method}`);

    // Check if origin is allowed
    if (!origin || !isOriginAllowed(origin)) {
      console.error(`[CORS] ❌ REJECTED origin: ${origin}`);
      return new Response("CORS not allowed", { status: 403 });
    }
    
    console.log(`[CORS] ✅ ALLOWED origin: ${origin}`);

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      console.log(`[CORS] Handling OPTIONS preflight`);
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

    console.log(`[CORS] Response headers set for ${origin}`);
    
    return response;
  };
}

// Export wrapped handlers with CORS support
export const GET = withCors(baseGet);
export const POST = withCors(basePost);

// Explicit OPTIONS handler (CRITICAL for preflight)
export const OPTIONS = async (req: Request) => {
  const origin = req.headers.get("origin");
  
  console.log(`[CORS] OPTIONS request from: ${origin}`);
  
  if (!origin || !isOriginAllowed(origin)) {
    console.error(`[CORS] ❌ OPTIONS REJECTED: ${origin}`);
    return new Response("CORS not allowed", { status: 403 });
  }
  
  console.log(`[CORS] ✅ OPTIONS ALLOWED: ${origin}`);
  return buildCorsResponse(origin, 204);
};
