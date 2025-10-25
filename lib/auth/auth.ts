import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import prisma from "@/lib/prisma/client"; // ✅ Fixed import path
import { sendOTPEmail } from "@/lib/services/email.service";

// Helper function to get trusted origins based on environment
function getTrustedOrigins(): string[] {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    // In development, return a wildcard-like pattern for localhost
    // Better Auth will handle localhost ports dynamically
    return [
      "http://localhost:3000", // Next.js dev server
      "http://localhost", // Base localhost
    ];
  }
  
  // In production, only allow specific origins
  return [
    process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app",
    "https://trusted-gamma.vercel.app", // Your production domain
  ];
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // Email provider configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // We're using OTP for verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  
  // Trusted origins for CORS and CSRF protection
  trustedOrigins: getTrustedOrigins(),
  
  // Base URL configuration
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET,
  
  plugins: [
    username(), // Add username support
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({
          to: email,
          otp,
          type,
        });
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
      disableSignUp: false, // Allow automatic sign-up via OTP
      allowedAttempts: 3,
      storeOTP: "hashed", // Store hashed OTP in DB for security
    }),
  ],
});

export type Auth = typeof auth;
