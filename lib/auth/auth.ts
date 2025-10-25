import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import prisma from "@/lib/prisma/client";
import { sendOTPEmail } from "@/lib/services/email.service";

/**
 * Get trusted origins for Better Auth
 * Note: We also handle CORS explicitly in route handlers
 * for better compatibility (see app/api/auth/[...all]/route.ts)
 */
function getTrustedOrigins(): string[] {
  const isDevelopment = process.env.NODE_ENV === "development";
  const origins: string[] = [];
  
  if (isDevelopment) {
    origins.push(
      "http://localhost:3000",
      "http://localhost",      // Better Auth handles port wildcards
      "http://127.0.0.1"
    );
  } else {
    origins.push(
      "https://trusted-gamma.vercel.app",
      process.env.NEXT_PUBLIC_APP_URL || "https://trusted-gamma.vercel.app"
    );
    
    // Vercel preview deployments
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
    
    // Wildcard for all Vercel previews
    origins.push("https://*.vercel.app");
  }
  
  return origins;
}

/**
 * Get base URL for Better Auth
 */
function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  return "http://localhost:3000";
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
  
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60,
    max: 100,
    storage: "memory",
  },
  
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({ to: email, otp, type });
      },
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      allowedAttempts: 3,
      storeOTP: "hashed",
    }),
  ],
});

export type Auth = typeof auth;
