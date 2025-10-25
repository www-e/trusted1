import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import prisma from "@/lib/prisma/client";
import { sendOTPEmail } from "@/lib/services/email.service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
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

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
    "http://localhost:3000",
    // Add wildcard for dynamic Flutter dev ports in development
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:*"] : []),
  ],

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
