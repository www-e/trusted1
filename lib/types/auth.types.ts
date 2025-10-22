import { z } from "zod";

// ==================== VALIDATION SCHEMAS ====================

// Sign Up Schema
export const signUpSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  secondPhone: z.string().optional(),
  deviceId: z.string().optional(),
});

// Sign In Schema
export const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  deviceId: z.string().optional(),
});

// Send Email Verification OTP Schema
export const sendEmailVerificationOTPSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
});

// Verify Email OTP Schema
export const verifyEmailOTPSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  secondPhone: z.string().optional(),
});

// Sign Out Schema
export const signOutSchema = z.object({
  sessionToken: z.string().optional(),
});

// ==================== RESPONSE TYPES ====================

export interface UserResponse {
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
}

export interface SessionResponse {
  user: UserResponse;
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  };
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  user: UserResponse;
  session: SessionResponse["session"];
}

export interface SignInResponse {
  success: boolean;
  message: string;
  session: SessionResponse;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  email: string;
  expiresIn: number; // seconds
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  emailVerified: boolean;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserResponse;
}
