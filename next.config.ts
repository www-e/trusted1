import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for Better Auth
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // The async headers() block has been removed to prevent CORS conflicts.
  // CORS is now handled by the middleware for tRPC and by Better-Auth for auth routes.
};

export default nextConfig;