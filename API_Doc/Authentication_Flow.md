## 🔐 Authentication Flow (Better-Auth)

### Complete Registration & Login Flow

┌─────────────┐
│ Sign Up │
│ /api/auth/sign-up │
└──────┬──────┘
│
▼
┌─────────────────┐
│ Account Created │
│ Session Token │
│ Generated │
└──────┬──────────┘
│
▼
┌──────────────────┐
│ Send Email OTP │
│ /api/auth/send-verification-otp │
└──────┬───────────┘
│
▼
┌──────────────────┐
│ Verify Email │
│ /api/auth/verify-otp │
└──────┬───────────┘
│
▼
┌──────────────────┐
│ Email Verified │
│ ✓ Complete │
└──────────────────┘

SUBSEQUENT LOGINS:
┌─────────────┐
│ Sign In │
│ /api/auth/sign-in │
└──────┬──────┘
│
▼
┌──────────────────┐
│ Session Token │
│ Generated │
└──────────────────┘

---