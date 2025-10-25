import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prisma/client";
import {
  signUpSchema,
  signInSchema,
  sendEmailVerificationOTPSchema,
  verifyEmailOTPSchema,
  updateProfileSchema,
  signOutSchema,
  type SignUpResponse,
  type SignInResponse,
  type SendOTPResponse,
  type VerifyOTPResponse,
  type SessionResponse,
  type UpdateProfileResponse,
  type UserResponse,
} from "@/lib/types/auth.types";

// Helper: Map Prisma User to UserResponse
function mapUserToResponse(user: {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  role: string;
  phoneNumber: string | null;
  secondPhone: string | null;
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    role: user.role,
    phoneNumber: user.phoneNumber,
    secondPhone: user.secondPhone,
    deviceId: user.deviceId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authRouter = router({
  // ==================== SIGN UP ====================
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }): Promise<SignUpResponse> => {
      try {
        // Call Better-Auth signUp route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            name: input.name,
            username: input.username,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.user) {
          throw new TRPCError({
            code: "CONFLICT",
            message: result.error?.message || "Failed to create account",
          });
        }

        // Update user with additional fields
        const user = await prisma.user.update({
          where: { id: result.user.id },
          data: {
            phoneNumber: input.phoneNumber,
            secondPhone: input.secondPhone,
            deviceId: input.deviceId,
            role: "user",
          },
        });

        return {
          success: true,
          message: "Account created successfully! Please verify your email.",
          user: mapUserToResponse(user),
          session: {
            id: result.session?.id || "",
            token: result.session?.token || "",
            expiresAt: result.session?.expiresAt || new Date(),
            ipAddress: null,
            userAgent: null,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Sign Up Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account",
        });
      }
    }),

  // ==================== SIGN IN ====================
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input }): Promise<SignInResponse> => {
      try {
        // Call Better-Auth signIn route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: input.username,
            password: input.password,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error?.message || "Invalid username or password",
          });
        }

        // Update deviceId if provided
        if (input.deviceId) {
          await prisma.user.update({
            where: { id: result.user.id },
            data: { deviceId: input.deviceId },
          });
        }

        // Fetch updated user
        const updatedUser = await prisma.user.findUnique({
          where: { id: result.user.id },
        });

        return {
          success: true,
          message: "Signed in successfully",
          session: {
            user: mapUserToResponse(updatedUser!),
            session: {
              id: result.session?.id || "",
              token: result.session?.token || "",
              expiresAt: result.session?.expiresAt || new Date(),
              ipAddress: null,
              userAgent: null,
            },
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Sign In Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sign in",
        });
      }
    }),

  // ==================== SEND EMAIL VERIFICATION OTP ====================
  sendEmailVerificationOTP: publicProcedure
    .input(sendEmailVerificationOTPSchema)
    .mutation(async ({ input }): Promise<SendOTPResponse> => {
      try {
        // Call Better-Auth send verification OTP route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/send-verification-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input.email,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error?.message || "Failed to send verification code",
          });
        }

        return {
          success: true,
          message: "Verification code sent to your email",
          email: input.email,
          expiresIn: 300, // 5 minutes
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Send Email Verification OTP Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification code",
        });
      }
    }),

  // ==================== VERIFY EMAIL OTP ====================
  verifyEmailOTP: publicProcedure
    .input(verifyEmailOTPSchema)
    .mutation(async ({ input }): Promise<VerifyOTPResponse> => {
      try {
        // Call Better-Auth verify OTP route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input.email,
            otp: input.otp,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error?.message || "Invalid verification code",
          });
        }

        return {
          success: true,
          message: "Email verified successfully",
          emailVerified: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Verify Email OTP Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify email",
        });
      }
    }),

  // ==================== GET CURRENT USER (PROTECTED) ====================
  getMe: protectedProcedure.query(async ({ ctx }): Promise<SessionResponse> => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      user: mapUserToResponse(user),
      session: {
        id: ctx.session.id,
        token: ctx.session.token,
        expiresAt: ctx.session.expiresAt,
        ipAddress: ctx.session.ipAddress ?? null,
        userAgent: ctx.session.userAgent ?? null,
      },
    };
  }),

  // ==================== UPDATE PROFILE (PROTECTED) ====================
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }): Promise<UpdateProfileResponse> => {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            name: input.name,
            phoneNumber: input.phoneNumber,
            secondPhone: input.secondPhone,
          },
        });

        return {
          success: true,
          message: "Profile updated successfully",
          user: mapUserToResponse(updatedUser),
        };
      } catch (error) {
        console.error("Update Profile Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // ==================== SIGN OUT (PROTECTED) ====================
  signOut: protectedProcedure
    .input(signOutSchema)
    .mutation(async ({ ctx }): Promise<{ success: boolean; message: string }> => {
      try {
        // Call Better-Auth signOut route
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-out`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return {
          success: true,
          message: "Signed out successfully",
        };
      } catch (error) {
        console.error("Sign Out Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sign out",
        });
      }
    }),
});
