## 📱 Flutter Integration

### Dependencies (pubspec.yaml)
```yaml
dependencies:
  flutter_dotenv: ^5.0.2
  better_auth_flutter: ^0.0.1  # For Better-Auth integration
  trpc_client_flutter: ^0.0.1  # If using tRPC
```

### Environment Setup (lib/env.dart)
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static Future<void> init() async {
    await dotenv.load(fileName: ".env");
  }

  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'https://trusted-gamma.vercel.app/api/trpc';
  static String get betterAuthUrl => dotenv.env['BETTER_AUTH_URL'] ?? 'https://trusted-gamma.vercel.app/api/auth';
  static int get apiTimeoutSeconds => int.parse(dotenv.env['API_TIMEOUT_SECONDS'] ?? '10');
  static int get apiMaxRetries => int.parse(dotenv.env['API_MAX_RETRIES'] ?? '2');
  static String get environment => dotenv.env['ENVIRONMENT'] ?? 'development';
  static bool get useCertificatePinning => dotenv.env['USE_CERTIFICATE_PINNING'] == 'true';
}
```

### Auth Service (lib/services/auth_service.dart)
```dart
import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'env.dart';

class AuthService {
  late BetterAuthClient _client;

  AuthService() {
    _client = BetterAuthClient(baseURL: Env.betterAuthUrl);
  }

  Future<SignUpResponse> signUp({
    required String email,
    required String password,
    String? name,
    String? username,
  }) async {
    return await _client.signUp.email({
      email: email,
      password: password,
      name: name,
      username: username,
    });
  }

  Future<SignInResponse> signIn({
    required String username,
    required String password,
  }) async {
    return await _client.signIn.email({
      username: username,
      password: password,
    });
  }

  Future<void> sendOTP(String email) async {
    await _client.sendVerificationOTP(email: email);
  }

  Future<void> verifyOTP(String email, String otp) async {
    await _client.verifyOTP(email: email, otp: otp);
  }

  Future<Session?> getSession() async {
    return await _client.getSession();
  }

  Future<void> signOut() async {
    await _client.signOut();
  }
}
```

## 📡 API Endpoints

### Authentication (Better-Auth)

**Note:** Authentication is now handled by Better-Auth for better mobile integration. Use the Better-Auth client in Flutter for seamless auth.

#### 1. Sign Up

**Endpoint:** `POST /api/auth/sign-up`

**Description:** Creates a new user account with email, password, and optional profile information. Uses Better-Auth with email OTP verification.

**Request Body:**

{
"email": "john@example.com",
"password": "SecurePass123!",
"name": "John Doe",
"username": "johndoe"
}

**Required Fields:**
- `email` (string, valid email format)
- `password` (string, min 8 chars)

**Optional Fields:**
- `name` (string)
- `username` (string)

**Response (200 OK):**

{
"user": {
"id": "clxyz123abc",
"email": "john@example.com",
"emailVerified": false,
"name": "John Doe",
"username": "johndoe",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z"
}
}

**Error Response (409 Conflict):**

{
"error": {
"code": "CONFLICT",
"message": "Username already exists"
}
}

**Error Response (409 Conflict):**

{
"error": {
"code": "CONFLICT",
"message": "Email already exists"
}
}

---

#### 2. Sign In

**Endpoint:** `POST /api/auth/sign-in`

**Description:** Authenticates user with username/email and password.

**Request Body:**

{
"username": "johndoe",
"password": "SecurePass123!"
}

**Required Fields:**
- `username` (string) or `email` (string)
- `password` (string)

**Response (200 OK):**

{
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": true,
"name": "John Doe",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z"
}
}

**Error Response (401 Unauthorized):**

{
"error": {
"code": "UNAUTHORIZED",
"message": "Invalid username or password"
}
}

---

### 3. Send Email Verification OTP

**Endpoint:** `POST /api/auth/send-verification-otp`

**Description:** Sends a 6-digit OTP code to the user's email for verification.

**Request Body:**

{
"email": "john@example.com"
}

**Required Fields:**
- `email` (string, valid email)

**Response (200 OK):**

{
"success": true,
"message": "Verification code sent to your email",
"email": "john@example.com",
"expiresIn": 300
}

**Notes:**
- OTP expires in 5 minutes (300 seconds)
- OTP is 6 digits
- Check spam folder if not received

**Error Response (404 Not Found):**

{
"error": {
"code": "NOT_FOUND",
"message": "No account found with this email"
}
}

**Error Response (400 Bad Request):**

{
"error": {
"code": "BAD_REQUEST",
"message": "Email is already verified"
}
}

---

### 4. Verify Email OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the email using the OTP code sent to user's email.

**Request Body:**

{
"email": "john@example.com",
"otp": "123456"
}

**Required Fields:**
- `email` (string)
- `otp` (string, 6 digits)

**Response (200 OK):**

{
"success": true,
"message": "Email verified successfully",
"emailVerified": true
}

**Error Response (400 Bad Request):**

{
"error": {
"code": "BAD_REQUEST",
"message": "Invalid or expired verification code"
}
}

**Error Response (401 Unauthorized):**

{
"error": {
"code": "UNAUTHORIZED",
"message": "Invalid verification code"
}
}

---

### 5. Get Current User (Protected)

**Endpoint:** `GET /api/auth/session`

**Description:** Retrieves the current authenticated user's profile and session data.

**Authentication:** Handled by Better-Auth (cookies or headers)

**Response (200 OK):**

{
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": true,
"name": "John Doe",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z"
}
}

**Error Response (401 Unauthorized):**

{
"error": {
"code": "UNAUTHORIZED",
"message": "You must be logged in to access this resource"
}
}

---

### 7. Update Profile (Protected)

**Endpoint:** `POST /api/trpc/auth.updateProfile`

**Description:** Updates user's profile information (name, phone numbers).

**Authentication:** Required (Bearer Token)

**Request Body:**

{
"name": "John Updated Doe",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321"
}

**Optional Fields:**
- `name` (string)
- `phoneNumber` (string)
- `secondPhone` (string)

**Response (200 OK):**

{
"result": {
"data": {
"success": true,
"message": "Profile updated successfully",
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": true,
"name": "John Updated Doe",
"role": "user",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321",
"deviceId": "flutter-device-uuid",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:15:00.000Z"
}
}
}
}

---

### 6. Sign Out (Protected)

**Endpoint:** `POST /api/auth/sign-out`

**Description:** Invalidates the current session and logs out the user.

**Authentication:** Handled by Better-Auth

**Response (200 OK):**

{
"success": true,
"message": "Signed out successfully"
}

---