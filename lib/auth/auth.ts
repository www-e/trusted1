import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import prisma from "@/lib/prisma/client";
import { sendOTPEmail } from "@/lib/services/email.service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // IMPORTANT: Keep these simple, route handler handles CORS
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Even though trustedOrigins doesn't fully work due to bug,
  // we still set it for future compatibility
  trustedOrigins: process.env.NODE_ENV === "development"
    ? ["http://localhost", "http://127.0.0.1"]
    : ["https://trusted-gamma.vercel.app"],
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
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
