## 🔐 Authentication Flow

### Complete Registration & Login Flow

┌─────────────┐
│ Sign Up │
│ (Step 1) │
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
│ (Step 2) │
└──────┬───────────┘
│
▼
┌──────────────────┐
│ Verify Email │
│ (Step 3) │
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
│ Username + │
│ Password │
└──────┬──────┘
│
▼
┌──────────────────┐
│ Session Token │
│ Generated │
└──────────────────┘

---