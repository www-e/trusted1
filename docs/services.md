# Backend Services & APIs Documentation

## Service Architecture Overview

### Core Services
```
Backend (Node.js + TypeScript + Express)
├── Authentication Service
├── User Management Service
├── Marketplace Service
├── Escrow Service
├── Chat Service (WebSocket)
├── File Upload Service
├── Payment Service (Paymob Integration)
├── Admin Service
├── Notification Service
└── Analytics Service
```

## API Structure

### Base URL
```
Production: https://api.trusted.com/v1
Development: http://localhost:3000/v1
```

### Authentication
All API endpoints (except public routes) require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

## Service Modules

### 1. Authentication Service

#### Endpoints
```typescript
// Public Routes
POST /auth/register          // User registration
POST /auth/login            // User login
POST /auth/verify-otp       // OTP verification
POST /auth/forgot-password  // Password reset request
POST /auth/reset-password   // Password reset confirmation
POST /auth/refresh-token    // Refresh JWT token

// Protected Routes
GET  /auth/profile          // Get current user profile
PUT  /auth/profile          // Update user profile
POST /auth/logout           // Logout user
POST /auth/change-password  // Change password
```

#### Data Models
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  username: string;
  role: 'user' | 'trusted' | 'admin';
  second_phone?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface OTPRequest {
  email: string;
  otp: string;
  type: 'verification' | 'password_reset';
}
```

### 2. User Management Service

#### Endpoints
```typescript
// User Profile Management
GET    /users/profile/:id           // Get user profile
PUT    /users/profile               // Update current user
GET    /users/search               // Search users
GET    /users/mediators            // List available mediators

// KYC Management
POST   /users/kyc/upload           // Upload KYC documents
GET    /users/kyc/status           // Get KYC status
PUT    /users/kyc/submit           // Submit for review

// Admin Only
GET    /users/admin/list           // List all users
PUT    /users/admin/:id/status     // Update user status
GET    /users/admin/kyc-queue      // KYC review queue
```

#### KYC Document Handling
- **Supported Formats**: JPG, PNG, PDF
- **Max Size**: 5MB per document
- **Storage**: Encrypted VPS storage
- **Validation**: Automated quality checks

### 3. Marketplace Service

#### Endpoints
```typescript
// Listings Management
GET    /marketplace/listings       // Browse listings
POST   /marketplace/listings       // Create listing
GET    /marketplace/listings/:id   // Get listing details
PUT    /marketplace/listings/:id   // Update listing
DELETE /marketplace/listings/:id   // Delete listing

// Search & Filter
GET    /marketplace/search         // Advanced search
GET    /marketplace/categories     // Get categories
GET    /marketplace/filters        // Get available filters

// Watchlist
POST   /marketplace/watchlist      // Add to watchlist
DELETE /marketplace/watchlist/:id  // Remove from watchlist
GET    /marketplace/watchlist      // Get watchlist
```

#### Listing Data Model
```typescript
interface Listing {
  id: UUID;
  seller_id: UUID;
  title: string;
  description: string;
  price: number;
  currency: string;
  game_account_details: {
    level: number;
    items: string[];
    screenshots: string[]; // file URLs
  };
  status: 'active' | 'sold' | 'paused' | 'draft';
  category: string;
  tags: string[];
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 4. Escrow Service

#### Endpoints
```typescript
// Transaction Management
POST   /escrow/transactions        // Create transaction
GET    /escrow/transactions/:id    // Get transaction details
PUT    /escrow/transactions/:id/status // Update status

// Mediator Actions
POST   /escrow/approve/:id         // Mediator approve
POST   /escrow/reject/:id          // Mediator reject
POST   /escrow/release/:id         // Release funds

// Admin Actions
GET    /escrow/admin/transactions  // Admin transaction overview
POST   /escrow/admin/intervene/:id // Manual intervention
```

#### Escrow States
```typescript
enum EscrowStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  DELIVERY_PENDING = 'delivery_pending',
  DELIVERY_CONFIRMED = 'delivery_confirmed',
  FUNDS_RELEASED = 'funds_released',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}
```

### 5. Chat Service (WebSocket)

#### WebSocket Events
```typescript
// Connection
CONNECT: 'connect'
DISCONNECT: 'disconnect'

// Message Events
SEND_MESSAGE: 'send_message'
RECEIVE_MESSAGE: 'receive_message'
TYPING_START: 'typing_start'
TYPING_END: 'typing_end'

// File Upload
UPLOAD_START: 'upload_start'
UPLOAD_PROGRESS: 'upload_progress'
UPLOAD_COMPLETE: 'upload_complete'

// Group Chat
CREATE_GROUP: 'create_group'
JOIN_GROUP: 'join_group'
LEAVE_GROUP: 'leave_group'
```

#### REST API for Chat
```typescript
// Chat Management
GET    /chat/conversations         // List conversations
GET    /chat/conversations/:id     // Get conversation
POST   /chat/conversations         // Create conversation
DELETE /chat/conversations/:id     // Archive conversation

// Messages
GET    /chat/messages/:conversation_id // Get messages
POST   /chat/messages              // Send message
PUT    /chat/messages/:id          // Edit message (if allowed)
DELETE /chat/messages/:id          // Delete message
```

### 6. File Upload Service

#### Endpoints
```typescript
// General Upload
POST   /upload/files               // Upload single/multiple files
GET    /upload/files/:id           // Get file info
DELETE /upload/files/:id           // Delete file

// Chat Media
POST   /upload/chat-media          // Upload chat media
GET    /upload/chat-media/:id      // Get chat media

// KYC Documents
POST   /upload/kyc-documents       // Upload KYC docs
GET    /upload/kyc-documents/:id   // Get KYC document
```

#### Upload Configuration
- **Max File Size**: 20MB for chat media, 5MB for documents
- **Supported Types**:
  - Images: JPG, PNG, GIF, WebP
  - Videos: MP4, MOV, AVI (chat only)
  - Documents: PDF, JPG, PNG (KYC only)
- **Storage**: VPS with automatic cleanup
- **Security**: Virus scanning, metadata stripping

### 7. Payment Service (Paymob Integration)

#### Endpoints
```typescript
// Payment Processing
POST   /payments/create-order      // Create payment order
GET    /payments/order/:id         // Get order status
POST   /payments/webhook           // Paymob webhook handler

// Payouts
POST   /payments/payout            // Initiate payout
GET    /payments/payouts           // List payouts
GET    /payments/payouts/:id       // Get payout details

// Wallet Management
GET    /payments/wallet            // Get wallet balance
GET    /payments/transactions      // List transactions
```

#### Paymob Integration
```typescript
interface PaymobConfig {
  api_key: string;
  hmac_secret: string;
  webhook_secret: string;
  environment: 'test' | 'production';
}
```

### 8. Admin Service

#### Endpoints
```typescript
// Dashboard Analytics
GET    /admin/dashboard            // Overview statistics
GET    /admin/analytics            // Detailed analytics

// User Management
GET    /admin/users                // List users with filters
PUT    /admin/users/:id            // Update user
DELETE /admin/users/:id            // Deactivate user

// Transaction Management
GET    /admin/transactions         // List all transactions
POST   /admin/transactions/:id/intervene // Manual intervention

// Dispute Management
GET    /admin/disputes             // List disputes
POST   /admin/disputes/:id/resolve // Resolve dispute

// System Management
GET    /admin/system/health        // System health check
POST   /admin/system/maintenance   // Toggle maintenance mode
```

### 9. Notification Service

#### Endpoints
```typescript
// Notification Management
GET    /notifications              // List notifications
PUT    /notifications/:id/read     // Mark as read
DELETE /notifications/:id          // Delete notification

// Push Notifications
POST   /notifications/register     // Register device token
DELETE /notifications/unregister   // Unregister device
```

#### Notification Types
```typescript
enum NotificationType {
  TRANSACTION_UPDATE = 'transaction_update',
  NEW_MESSAGE = 'new_message',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  KYC_APPROVED = 'kyc_approved',
  DISPUTE_CREATED = 'dispute_created',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}
```

## Database Schema Overview

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  second_phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  trusted_tier VARCHAR(10) DEFAULT '+',
  kyc_status VARCHAR(20) DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Listings Table
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  game_account_details JSONB,
  status VARCHAR(20) DEFAULT 'active',
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  mediator_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  amount DECIMAL(10,2) NOT NULL,
  escrow_status VARCHAR(30) NOT NULL,
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

## Middleware & Security

### Authentication Middleware
- JWT token validation
- Role-based access control
- Rate limiting per endpoint

### Security Headers
- CORS configuration
- Helmet security headers
- Input sanitization
- SQL injection prevention

### Rate Limiting
```typescript
// Per endpoint limits
const rateLimits = {
  '/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15min
  '/auth/register': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  '/upload/*': { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
};
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `VALID_001`: Validation error
- `PAY_001`: Payment failed
- `ESCROW_001`: Invalid escrow state
- `FILE_001`: Upload failed

## Performance Considerations

### Caching Strategy
- Redis for session storage
- Database query caching
- Static file CDN integration
- API response caching

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- Archive old data

### Scalability Measures
- Horizontal scaling preparation
- Load balancing configuration
- Database read replicas
- Async job processing