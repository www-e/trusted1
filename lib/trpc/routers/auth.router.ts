import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prisma/client";
import { hash, verify } from "@node-rs/argon2";
import { generateId } from "better-auth";
import { sendOTPEmail } from "@/lib/services/email.service";
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

// Helper: Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
        // Check if username exists
        const existingUsername = await prisma.user.findUnique({
          where: { username: input.username },
        });

        if (existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already exists",
          });
        }

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already exists",
          });
        }

        // Hash password
        const hashedPassword = await hash(input.password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });

        // Create user
        const user = await prisma.user.create({
          data: {
            id: generateId(),
            username: input.username,
            email: input.email,
            password: hashedPassword,
            name: input.name || null,
            phoneNumber: input.phoneNumber || null,
            secondPhone: input.secondPhone || null,
            deviceId: input.deviceId || null,
            emailVerified: false,
            role: "user",
          },
        });

        // Create session
        const sessionToken = generateId(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const session = await prisma.session.create({
          data: {
            id: generateId(),
            token: sessionToken,
            userId: user.id,
            expiresAt,
          },
        });

        return {
          success: true,
          message: "Account created successfully! Please verify your email.",
          user: mapUserToResponse(user),
          session: {
            id: session.id,
            token: session.token,
            expiresAt: session.expiresAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
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
        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: input.username },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid username or password",
          });
        }

        // Verify password
        const isValidPassword = await verify(user.password, input.password);

        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid username or password",
          });
        }

        // Update deviceId if provided
        if (input.deviceId && input.deviceId !== user.deviceId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { deviceId: input.deviceId },
          });
        }

        // Create session
        const sessionToken = generateId(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const session = await prisma.session.create({
          data: {
            id: generateId(),
            token: sessionToken,
            userId: user.id,
            expiresAt,
          },
        });

        const updatedUser = input.deviceId && input.deviceId !== user.deviceId
          ? { ...user, deviceId: input.deviceId }
          : user;

        return {
          success: true,
          message: "Signed in successfully",
          session: {
            user: mapUserToResponse(updatedUser),
            session: {
              id: session.id,
              token: session.token,
              expiresAt: session.expiresAt,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
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
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No account found with this email",
          });
        }

        if (user.emailVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email is already verified",
          });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Hash OTP
        const hashedOTP = await hash(otp, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });

        // Store in verification table
        await prisma.verification.create({
          data: {
            id: generateId(),
            identifier: input.email,
            value: hashedOTP,
            expiresAt,
          },
        });

        // Send email
        await sendOTPEmail({
          to: input.email,
          otp,
          type: "email-verification",
        });

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
        // Find user
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No account found with this email",
          });
        }

        if (user.emailVerified) {
          return {
            success: true,
            message: "Email is already verified",
            emailVerified: true,
          };
        }

        // Find verification record
        const verification = await prisma.verification.findFirst({
          where: {
            identifier: input.email,
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!verification) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code",
          });
        }

        // Verify OTP
        const isValidOTP = await verify(verification.value, input.otp);

        if (!isValidOTP) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid verification code",
          });
        }

        // Update user email verified status
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });

        // Delete verification record
        await prisma.verification.delete({
          where: { id: verification.id },
        });

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
        await prisma.session.delete({
          where: { id: ctx.session.id },
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
