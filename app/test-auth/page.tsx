"use client";

import { useState } from "react";
import { trpcClient } from "@/lib/trpc/client";

type AuthStep = "signup" | "signin" | "verify-email" | "success";

export default function AuthTestPage() {
  // Current step
  const [step, setStep] = useState<AuthStep>("signup");

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Sign in fields (separate for clarity)
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Session data
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
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
  } | null>(null);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setName("");
    setPhoneNumber("");
    setSecondPhone("");
    setOtp("");
    setSignInUsername("");
    setSignInPassword("");
    setError("");
    setSuccess("");
    setSessionToken(null);
    setUserData(null);
    setStep("signup");
  };

  // ==================== SIGN UP ====================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await trpcClient.auth.signUp.mutate({
        username,
        email,
        password,
        name: name || undefined,
        phoneNumber: phoneNumber || undefined,
        secondPhone: secondPhone || undefined,
      });

      setSuccess(result.message);
      setSessionToken(result.session.token);
      setUserData(result.user);

      // Auto-navigate to verify email
      setTimeout(() => {
        setStep("verify-email");
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== SIGN IN ====================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await trpcClient.auth.signIn.mutate({
        username: signInUsername,
        password: signInPassword,
      });

      setSuccess(result.message);
      setSessionToken(result.session.session.token);
      setUserData(result.session.user);
      setStep("success");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== SEND EMAIL VERIFICATION OTP ====================
  const handleSendVerificationOTP = async () => {
    if (!email && !userData?.email) {
      setError("Email address is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await trpcClient.auth.sendEmailVerificationOTP.mutate({
        email: email || userData!.email,
      });

      setSuccess(result.message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== VERIFY EMAIL OTP ====================
  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await trpcClient.auth.verifyEmailOTP.mutate({
        email: email || userData!.email,
        otp,
      });

      setSuccess(result.message);
      
      // Update user data to reflect email verification
      if (userData) {
        setUserData({ ...userData, emailVerified: true });
      }

      setTimeout(() => {
        setStep("success");
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== SIGN OUT ====================
  const handleSignOut = async () => {
    setLoading(true);
    setError("");

    try {
      await trpcClient.auth.signOut.mutate({});
      setSuccess("Signed out successfully!");
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign out.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            {step === "signup" && "🚀 Create Account"}
            {step === "signin" && "🔐 Sign In"}
            {step === "verify-email" && "📧 Verify Email"}
            {step === "success" && "✅ Dashboard"}
          </h1>
          <p className="text-blue-100">
            {step === "signup" && "Join us with your unique username"}
            {step === "signin" && "Welcome back! Sign in with your username"}
            {step === "verify-email" && "Verify your email to secure your account"}
            {step === "success" && "You're successfully authenticated"}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">⚠️ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <p className="font-medium">✅ Success</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* ==================== SIGN UP FORM ==================== */}
          {step === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, and underscores only</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Second Phone */}
              <div>
                <label htmlFor="secondPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Second Phone Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="secondPhone"
                  type="tel"
                  value={secondPhone}
                  onChange={(e) => setSecondPhone(e.target.value)}
                  placeholder="+0987654321"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("signin")}
                    className="text-purple-600 hover:text-purple-800 font-semibold transition"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ==================== SIGN IN FORM ==================== */}
          {step === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="signInUsername" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="signInUsername"
                  type="text"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signInPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="signInPassword"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Switch to Sign Up */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Do not have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("signup")}
                    className="text-purple-600 hover:text-purple-800 font-semibold transition"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ==================== VERIFY EMAIL FORM ==================== */}
          {step === "verify-email" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-5xl mb-3">📧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We have sent a 6-digit verification code to:
                  <br />
                  <span className="font-semibold text-gray-900">{email || userData?.email}</span>
                </p>
                <button
                  onClick={handleSendVerificationOTP}
                  disabled={loading}
                  className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend Code"}
                </button>
              </div>

              <form onSubmit={handleVerifyEmailOTP} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-3xl font-mono tracking-widest text-gray-900"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 text-lg"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("success")}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition text-sm"
                >
                  Skip for now (verify later)
                </button>
              </form>
            </div>
          )}

          {/* ==================== SUCCESS / DASHBOARD ==================== */}
          {step === "success" && userData && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-500 text-white rounded-full p-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-800 text-center mb-2">
                  Welcome, {userData.name || userData.username}! 🎉
                </h2>
                <p className="text-green-600 text-center text-sm">
                  Your account is active and ready to use
                </p>
              </div>

              {/* Email Verification Status */}
              {!userData.emailVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Email not verified
                      </p>
                      <button
                        onClick={() => setStep("verify-email")}
                        className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 font-semibold underline"
                      >
                        Verify your email now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Profile Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Username</p>
                    <p className="text-sm font-semibold text-gray-900">{userData.username}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{userData.email}</p>
                  </div>
                  
                  {userData.name && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
                    </div>
                  )}
                  
                  {userData.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900">{userData.phoneNumber}</p>
                    </div>
                  )}
                  
                  {userData.secondPhone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Second Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{userData.secondPhone}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                    <p className="text-sm font-semibold text-gray-900">{userData.role}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                    <p className="text-xs font-mono text-gray-900 break-all">{userData.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Verified</p>
                    <p className="text-sm font-semibold">
                      {userData.emailVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600">⚠ Not Verified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Token Card */}
              {sessionToken && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Session Token (For Flutter)
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                      {sessionToken}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use this token in the Authorization header: <code className="bg-gray-200 px-1 py-0.5 rounded">Bearer {sessionToken.slice(0, 20)}...</code>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Signing Out..." : "Sign Out"}
                </button>

                <button
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Test Another Flow
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
          <p>Comprehensive Auth System: Sign Up • Sign In • Email Verification</p>
        </div>
      </div>
    </div>
  );
}
