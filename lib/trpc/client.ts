import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/lib/trpc/routers/_app";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  
  if (process.env.VERCEL_URL) {
    // SSR should use Vercel URL
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,

      // Pass authentication headers
      headers: async () => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add cookie for Better-Auth session
        if (typeof window !== "undefined") {
          headers["cookie"] = document.cookie;
        }

        return headers;
      },
    }),
  ],
});
