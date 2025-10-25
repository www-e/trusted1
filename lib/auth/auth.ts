import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import prisma from "@/lib/prisma/client";
import { sendOTPEmail } from "@/lib/services/email.service";

/**
 * Get trusted origins based on environment
 * Supports:
 * - Development: localhost with any port
 * - Production: specific domain
 * - Vercel Preview: dynamic preview URLs
 */
function getTrustedOrigins(): string[] {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  
  const origins: string[] = [];
  
  if (isDevelopment) {
    // Development: Allow all localhost (Better Auth handles port wildcards automatically)
    origins.push(
      "http://localhost:3000",     // Next.js dev
      "http://localhost",           // Any localhost port (Better Auth auto-handles)
      "http://127.0.0.1"           // Alternative localhost
    );
  }
  
  if (isProduction) {
    // Production domain
    const productionURL = process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app";
    origins.push(productionURL);
    
    // Main production domain
    origins.push("https://trusted-gamma.vercel.app");
    
    // Vercel preview deployments (if VERCEL_URL is set)
    // VERCEL_URL doesn't include protocol, so we add it
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
    
    // Support all Vercel preview URLs with wildcard
    // This allows any preview deployment to work
    origins.push("https://*.vercel.app");
  }
  
  return origins;
}

/**
 * Get base URL for Better Auth
 * Handles Vercel deployments and local development
 */
function getBaseURL(): string {
  // 1. Check explicit environment variable
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  
  // 2. Check VERCEL_URL for deployment (add https://)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 3. Check public app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // 4. Fallback to localhost for development
  return "http://localhost:3000";
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // Base URL - automatically handles Vercel deployments
  baseURL: getBaseURL(),
  
  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Trusted origins - supports wildcards and dynamic origins
  trustedOrigins: getTrustedOrigins(),
  
  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Using OTP instead
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  
  // Advanced security options
  advanced: {
    cookiePrefix: "better-auth",
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",
    // Cross-subdomain cookies (if needed)
    crossSubDomainCookies: {
      enabled: false, // Set to true if you need subdomain support
    },
    // Default cookie attributes
    defaultCookieAttributes: {
      sameSite: "lax", // CSRF protection
      httpOnly: true,  // XSS protection
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    },
  },
  
  // Rate limiting (enabled in production by default)
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60,  // 60 seconds
    max: 100,    // 100 requests per window
    storage: "memory", // Use "database" or "secondary-storage" for distributed systems
  },
  
  // Plugins
  plugins: [
    username(),
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
      disableSignUp: false,
      allowedAttempts: 3,
      storeOTP: "hashed", // Security best practice
    }),
  ],
});

export type Auth = typeof auth;
