## 📡 API Endpoints

### 1. Sign Up

**Endpoint:** `POST /api/trpc/auth.signUp`

**Description:** Creates a new user account with username, email, password, and optional profile information.

**Request Body:**

{
"username": "johndoe",
"email": "john@example.com",
"password": "SecurePass123!",
"name": "John Doe",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321",
"deviceId": "flutter-device-uuid"
}

**Required Fields:**
- `username` (string, 3-20 chars, alphanumeric + underscore)
- `email` (string, valid email format)
- `password` (string, min 8 chars)

**Optional Fields:**
- `name` (string)
- `phoneNumber` (string)
- `secondPhone` (string)
- `deviceId` (string, recommended for multi-device management)

**Response (200 OK):**

{
"result": {
"data": {
"success": true,
"message": "Account created successfully! Please verify your email.",
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": false,
"name": "John Doe",
"role": "user",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321",
"deviceId": "flutter-device-uuid",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z",
"ipAddress": null,
"userAgent": null
}
}
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

### 2. Sign In

**Endpoint:** `POST /api/trpc/auth.signIn`

**Description:** Authenticates user with username and password.

**Request Body:**

{
"username": "johndoe",
"password": "SecurePass123!",
"deviceId": "flutter-device-uuid"
}

**Required Fields:**
- `username` (string)
- `password` (string)

**Optional Fields:**
- `deviceId` (string)

**Response (200 OK):**

{
"result": {
"data": {
"success": true,
"message": "Signed in successfully",
"session": {
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": true,
"name": "John Doe",
"role": "user",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321",
"deviceId": "flutter-device-uuid",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z",
"ipAddress": null,
"userAgent": null
}
}
}
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

**Endpoint:** `POST /api/trpc/auth.sendEmailVerificationOTP`

**Description:** Sends a 6-digit OTP code to the user's email for verification.

**Request Body:**

{
"email": "john@example.com"
}

**Required Fields:**
- `email` (string, valid email)

**Response (200 OK):**

{
"result": {
"data": {
"success": true,
"message": "Verification code sent to your email",
"email": "john@example.com",
"expiresIn": 300
}
}
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

**Endpoint:** `POST /api/trpc/auth.verifyEmailOTP`

**Description:** Verifies the email using the OTP code sent to user's email.

**Note:** If the email is already verified, the endpoint returns success without requiring OTP verification.

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
"result": {
"data": {
"success": true,
"message": "Email verified successfully",
"emailVerified": true
}
}
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

**Endpoint:** `GET /api/trpc/auth.getMe`

**Description:** Retrieves the current authenticated user's profile and session data.

**Authentication:** Required (Bearer Token)

**Headers:**

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**Response (200 OK):**

{
"result": {
"data": {
"user": {
"id": "clxyz123abc",
"username": "johndoe",
"email": "john@example.com",
"emailVerified": true,
"name": "John Doe",
"role": "user",
"phoneNumber": "+1234567890",
"secondPhone": "+0987654321",
"deviceId": "flutter-device-uuid",
"createdAt": "2025-10-22T18:00:00.000Z",
"updatedAt": "2025-10-22T18:00:00.000Z"
},
"session": {
"id": "session123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expiresAt": "2025-10-29T18:00:00.000Z",
"ipAddress": "192.168.1.1",
"userAgent": "Flutter/3.0"
}
}
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

### 6. Update Profile (Protected)

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

### 7. Sign Out (Protected)

**Endpoint:** `POST /api/trpc/auth.signOut`

**Description:** Invalidates the current session and logs out the user.

**Authentication:** Required (Bearer Token)

**Request Body:**

{
"sessionToken": "optional-token-if-not-in-header"
}

**Response (200 OK):**

{
"result": {
"data": {
"success": true,
"message": "Signed out successfully"
}
}
}

---