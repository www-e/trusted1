# Trusted - Secure Free Fire Account Marketplace

## Project Overview

**Trusted** is a secure marketplace platform designed specifically for buying and selling Free Fire accounts. The platform addresses the critical need for safe, mediated transactions in the gaming account trading space, replacing risky WhatsApp-based peer-to-peer trading with a structured escrow system.

### Core Problem Solved

Traditional Free Fire account trading occurs through unsecured channels like WhatsApp, Discord, or Facebook groups, leading to:
- High risk of scams and fraud
- No transaction mediation
- Lack of buyer/seller protection
- No dispute resolution mechanism
- Identity verification challenges

### Solution Approach

Trusted implements a comprehensive mediated marketplace with:
- **Secure Escrow System**: Funds held until delivery confirmation
- **Identity Verification**: Multi-tier KYC for all users
- **Live Communication**: Real-time chat between all parties
- **Mediated Transactions**: Trusted mediators oversee all transactions
- **Digital Documentation**: Secure storage of verification documents

## Technical Architecture

### Frontend (Mobile)
- **Framework**: Flutter (Cross-platform Android/iOS)
- **Core Features**:
  - Authentication & Profile Management
  - Marketplace Browsing
  - Account Listings
  - Real-time Chat (1:1 and Group)
  - Mediator Dashboard
  - File Upload for Verification

### Backend (Server)
- **Language**: TypeScript
- **Framework**: Node.js + Express
- **Key Components**:
  - RESTful API endpoints
  - WebSocket server for real-time chat
  - File upload handling
  - Payment processing integration
  - Admin panel APIs

### Database & Storage
- **Primary Database**: PostgreSQL (Contabo VPS)
- **File Storage**: VPS-hosted media server
- **Media Support**: Images and videos up to 20MB for chat and verification

### Hosting Infrastructure
- **Primary Server**: Contabo VPS (3 vCPU, 8 GB RAM, 300 GB SSD)
- **Performance Capacity**:
  - 8,000-12,000 monthly active users
  - 400 concurrent users for chat sessions
  - Light media transfer optimization

## Business Model

### User Roles
1. **Regular Users**: Buyers and Sellers
2. **Trusted Mediators**: Transaction overseers with tiered privileges
3. **Admins**: Platform management and oversight

### Trusted Mediator Tiers

| Tier | Features | Helper Limit | Listings | Badge | Pricing |
|------|----------|--------------|----------|-------|---------|
| Trusted + | Entry level mediator | 1 helper | 50 listings | - | Free/Basic |
| Trusted ++ | Invoice dashboard | 4 helpers | 200 listings | Silver | Paid |
| Pro Trusted | Unlimited everything | Unlimited | Unlimited | Gold | Premium |

### Commission Structure
- **Seller**: 90% of transaction value
- **Mediator**: 5% commission
- **Platform**: 5% platform fee

## Escrow System Options

### Option 1: Code-Based Escrow (Recommended for MVP)
- Internal logic handles fund states virtually
- Funds simulated in wallet/pending tables
- Programmatic release on mediator confirmation
- Manual payout settlements

### Option 2: Paymob Integration (Production Scale)
- Real payment processing backbone
- Automatic fund disbursement
- Payment callbacks for release triggers
- Scalable for high-volume transactions

## Core Functional Modules

### 1. Authentication & Identity Verification
- Email/phone verification
- Multi-factor authentication
- Document upload (ID front/back, selfies)
- KYC status management (Pending/Approved/Rejected)

### 2. Marketplace & Listings
- Account listing with screenshots and descriptions
- Price setting and negotiation
- Watchlist functionality
- Mediator selection before purchase

### 3. Payment & Escrow Processing
- Secure payment collection
- Escrow state management
- Automated commission calculation
- Payout processing

### 4. Communication System
- Buyer ↔ Mediator (1:1)
- Seller ↔ Mediator (1:1)
- Group chat (Buyer/Seller/Mediator)
- Media file sharing in chat

### 5. Admin Panel
- User verification management
- Fraud reporting and dispute resolution
- Transaction analytics and reporting
- Payout and commission oversight

## User Data Model

```typescript
interface User {
  id: UUID;
  username: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'trusted' | 'admin';
  phone: string;
  second_phone?: string;
  id_front?: string; // file path
  id_back?: string; // file path
  selfie_front?: string; // file path
  selfie_sides?: string; // file path
  createdAt: timestamp;
  trustedTier: '+' | '++' | 'Pro';
  KYCStatus: 'Pending' | 'Approved' | 'Rejected';
}
```

## Performance & Scalability

### Current Capacity (MVP)
- **Users**: 8,000-12,000 monthly active users
- **Concurrency**: 400 simultaneous chat sessions
- **Media**: Optimized for light file transfers

### Scaling Roadmap

| Stage | User Volume | Scaling Actions |
|-------|-------------|-----------------|
| MVP | 10K users | Single VPS deployment |
| Growth | 20K-50K users | Redis caching + CDN storage |
| Enterprise | 50K-100K users | Multi-VPS distribution |

### Performance Optimizations
- WebSocket optimization for chat
- File upload chunking for large media
- Database query optimization
- Redis caching for frequently accessed data
- Load balancing for high concurrency

## Security Considerations

### Data Protection
- End-to-end encryption for chat messages
- Secure file storage with access controls
- Payment data encryption at rest and in transit
- GDPR compliance for user data

### Fraud Prevention
- Multi-point identity verification
- Transaction monitoring and flagging
- Dispute resolution mechanisms
- Admin oversight tools

## Success Metrics

### MVP Checklist ✅
- [ ] Registration & login system
- [ ] Marketplace listing functionality
- [ ] Mediator assignment process
- [ ] Escrow logic implementation
- [ ] Live 3-way chat system
- [ ] File upload and storage
- [ ] Admin user management
- [ ] Basic fraud management tools

### Growth Milestones
- User acquisition targets
- Transaction volume goals
- Mediator network expansion
- Platform stability metrics