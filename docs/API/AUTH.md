# Trusted Backend API Documentation

## Overview
Authentication system built with **BetterAuth** and **tRPC** for type-safe API routes.

**Base URL (Development):** `http://localhost:3000`  
**Base URL (Production):** `https://trusted-gamma.vercel.app`

---

## Authentication System (BetterAuth)

BetterAuth handles user registration, login, session management, and provides pre-built security features.

### User Data Model
```typescript
{
  id: string;              // CUID format
  deviceId?: string;       // Optional device tracking
  username: string;        // Required, unique
  email: string;          // Required, unique, verified: false
  password: string;       // Hashed by BetterAuth
  name?: string;          // Optional display name
  role: string;           // Default: "user"
  phoneNumber?: string;   // Optional, unique
  secondPhone?: string;   // Optional secondary number
  selfieUrl?: string;     // Profile image URL
  idImageFrontUrl?: string; // ID document front
  idImageBackUrl?: string;  // ID document back
  createdAt: DateTime;    // Auto-generated
  updatedAt: DateTime;    // Auto-updated
}
```

### 1. User Registration
**POST** `/api/auth/callback/email/sign-up`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "name": "John Doe",
  "deviceId": "device-uuid-here",
  "phoneNumber": "+201234567890",
  "secondPhone": "+201234567891"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "cm3x...",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "user",
    "phoneNumber": "+201234567890",
    "createdAt": "2025-10-21T00:00:00.000Z"
  },
  "session": {
    "token": "session-token-here",
    "expiresAt": "2025-11-21T00:00:00.000Z"
  }
}
```

### 2. User Login
**POST** `/api/auth/callback/email/sign-in`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "cm3x...",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  },
  "session": {
    "token": "session-token-here",
    "expiresAt": "2025-11-21T00:00:00.000Z"
  }
}
```

### 3. Sign Out
**POST** `/api/auth/sign-out`

**Headers:**
```
Authorization: Bearer <session-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

### 4. Get Current Session
**GET** `/api/auth/session`

**Headers:**
```
Authorization: Bearer <session-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "cm3x...",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  },
  "session": {
    "expiresAt": "2025-11-21T00:00:00.000Z"
  }
}
```

---

## tRPC API Endpoints

Type-safe API routes built with tRPC. All endpoints require authentication.

**Base URL:** `/api/trpc`

### User Management

#### 1. Get Current User Profile
**Query:** `user.getProfile`

**Headers:**
```
Authorization: Bearer <session-token>
Content-Type: application/json
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "cm3x...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "user",
      "phoneNumber": "+201234567890",
      "secondPhone": "+201234567891",
      "selfieUrl": "https://...",
      "idImageFrontUrl": "https://...",
      "idImageBackUrl": "https://...",
      "createdAt": "2025-10-21T00:00:00.000Z",
      "updatedAt": "2025-10-21T00:00:00.000Z"
    }
  }
}
```

#### 2. Update User Profile
**Mutation:** `user.updateProfile`

**Headers:**
```
Authorization: Bearer <session-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phoneNumber": "+201234567890",
  "secondPhone": "+201234567891",
  "selfieUrl": "https://cloudinary.com/image.jpg",
  "idImageFrontUrl": "https://cloudinary.com/front.jpg",
  "idImageBackUrl": "https://cloudinary.com/back.jpg"
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "cm3x...",
      "name": "John Updated",
      "phoneNumber": "+201234567890",
      "secondPhone": "+201234567891",
      "selfieUrl": "https://cloudinary.com/image.jpg",
      "idImageFrontUrl": "https://cloudinary.com/front.jpg",
      "idImageBackUrl": "https://cloudinary.com/back.jpg",
      "updatedAt": "2025-10-21T01:00:00.000Z"
    }
  }
}
```

#### 3. Get User by ID
**Query:** `user.getUserById`

**Headers:**
```
Authorization: Bearer <session-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "cm3x..."
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "cm3x...",
      "username": "johndoe",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "phoneNumber": "+201234567890",
      "createdAt": "2025-10-21T00:00:00.000Z",
      "updatedAt": "2025-10-21T00:00:00.000Z"
    }
  }
}
```

---

## Integration Examples

### Flutter/Dart Integration

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  static const String baseUrl = 'https://trusted-gamma.vercel.app';
  String? _sessionToken;

  // Register new user
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String username,
    required String name,
    String? deviceId,
    String? phoneNumber,
    String? secondPhone,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/callback/email/sign-up'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'username': username,
        'name': name,
        'deviceId': deviceId,
        'phoneNumber': phoneNumber,
        'secondPhone': secondPhone,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _sessionToken = data['session']['token'];
      return data;
    } else {
      throw Exception('Sign up failed: ${response.body}');
    }
  }

  // Sign in existing user
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/callback/email/sign-in'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _sessionToken = data['session']['token'];
      return data;
    } else {
      throw Exception('Sign in failed: ${response.body}');
    }
  }

  // Get current user profile via tRPC
  Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/trpc/user.getProfile'),
      headers: {
        'Authorization': 'Bearer $_sessionToken',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get profile: ${response.body}');
    }
  }

  // Update user profile via tRPC
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phoneNumber,
    String? secondPhone,
    String? selfieUrl,
    String? idImageFrontUrl,
    String? idImageBackUrl,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/trpc/user.updateProfile'),
      headers: {
        'Authorization': 'Bearer $_sessionToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (name != null) 'name': name,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
        if (secondPhone != null) 'secondPhone': secondPhone,
        if (selfieUrl != null) 'selfieUrl': selfieUrl,
        if (idImageFrontUrl != null) 'idImageFrontUrl': idImageFrontUrl,
        if (idImageBackUrl != null) 'idImageBackUrl': idImageBackUrl,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update profile: ${response.body}');
    }
  }

  // Sign out
  Future<bool> signOut() async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/sign-out'),
      headers: {
        'Authorization': 'Bearer $_sessionToken',
      },
    );

    if (response.statusCode == 200) {
      _sessionToken = null;
      return true;
    } else {
      throw Exception('Sign out failed: ${response.body}');
    }
  }
}
```

### React/Next.js Integration

```typescript
// lib/auth.ts
import { auth } from '@/server/auth';

export async function signUp(data: {
  email: string;
  password: string;
  username: string;
  name: string;
  deviceId?: string;
  phoneNumber?: string;
  secondPhone?: string;
}) {
  const response = await fetch('/api/auth/callback/email/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Sign up failed');
  }

  return response.json();
}

export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/callback/email/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Sign in failed');
  }

  return response.json();
}

// For tRPC usage in React components
import { trpc } from '@/utils/trpc';

function ProfileComponent() {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const updateProfile = trpc.user.updateProfile.useMutation();

  return (
    <div>
      <h1>{profile?.name}</h1>
      <button
        onClick={() => updateProfile.mutate({
          name: 'Updated Name'
        })}
      >
        Update Profile
      </button>
    </div>
  );
}
```

---

## Security Features

- **Password Hashing**: BetterAuth automatically hashes passwords
- **Session Management**: Secure token-based sessions with expiration
- **CORS Protection**: Configured trusted origins only
- **Input Validation**: Zod schemas for tRPC procedures
- **Type Safety**: Full TypeScript support for all endpoints

---

## Error Handling

All endpoints may return these HTTP status codes:

| Code | Description |
|------|-------------|
| **200** | Success |
| **400** | Bad Request - Invalid input data |
| **401** | Unauthorized - Missing/invalid session token |
| **403** | Forbidden - Insufficient permissions |
| **404** | Not Found - Resource doesn't exist |
| **500** | Internal Server Error - Server-side issue |

**Error Response Format:**
```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "SPECIFIC_ERROR_CODE"
  }
}
```

---

## Database Schema

The authentication system uses PostgreSQL with Prisma ORM:

- **User**: Main user account with profile information
- **Session**: Active user sessions with expiration
- **Account**: OAuth accounts (for future social login)
- **Verification**: Email verification tokens (currently disabled)

All tables include `createdAt` and `updatedAt` timestamps automatically managed by Prisma.