import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for Better Auth
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Configure headers for CORS (for Flutter app)
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" 
              ? process.env.ALLOWED_ORIGIN || "*"
              : "*", // Allow all origins in development
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With, Cookie",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // 24 hours
          },
        ],
      },
    ];
  },
};

export default nextConfig;
