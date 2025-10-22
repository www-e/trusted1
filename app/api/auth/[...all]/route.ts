import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// Configure route segment config for Next.js 15
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
