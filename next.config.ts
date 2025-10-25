import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CORS configuration
  async headers() {
    return [
      {
        // Apply to all API routes except /api/auth/*
        source: "/api/((?!auth).*)",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "development" 
              ? "http://localhost:*" 
              : "https://trusted-gamma.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With, Cookie",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
