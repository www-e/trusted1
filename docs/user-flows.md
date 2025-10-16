# End-to-End User Flows Documentation

## User Flow Diagrams

### Flow Legend
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Start  │───▶│ Action  │───▶│  End    │
└─────────┘    └─────────┘    └─────────┘

Decision Points: ◇
System Actions: ◆
User Actions: ●
API Calls: ⚡
External Services: 🔗
```

## 1. New User Registration Flow

### Regular User Registration
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Welcome     │───▶│  Role Selection │───▶│ Registration│
│   Screen    │    │ (Buyer/Seller/  │    │   Form      │
│             │    │    Mediator)    │    │             │
└─────────────┘    └─────────────────┘    └─────────────┘
                                                  │
┌─────────────┐    ┌─────────────────┐    ┌──────▼──────┐
│ Email/OTP   │◀───│  Email Sent     │◀───│  Form       │
│ Verification│    │  Confirmation   │    │ Validation  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │
       └───────────────────────┘
```

**Technical Implementation:**
- ● User selects role and fills registration form
- ⚡ POST `/auth/register` - Create user account
- ◆ Generate and send OTP via email/SMS
- ● User enters OTP for verification
- ⚡ POST `/auth/verify-otp` - Verify and activate account
- ◆ Redirect to profile completion or marketplace

### Mediator Registration (Additional Steps)
```
Regular Registration ───▶ KYC Document Upload ───▶ Admin Review ───▶ Approval/Rejection
```

**KYC Process:**
1. ● Upload ID documents (front, back, selfie)
2. ⚡ POST `/users/kyc/upload` - Submit documents
3. ◆ Documents stored securely with encryption
4. ● Admin reviews documents via admin panel
5. ◆ Admin approves/rejects with feedback
6. ● User receives notification of status

## 2. Account Listing Flow (Seller)

### Creating a New Listing
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ My Listings │───▶│ Create Listing  │───▶│ Account     │
│   Screen    │    │    Form         │    │   Details   │
└─────────────┘    └─────────────────┘    └─────────────┘
                                                  │
┌─────────────┐    ┌─────────────────┐    ┌──────▼──────┐
│ Screenshot  │◀───│  Image Upload   │◀───│  Form       │
│   Upload    │    │  (Multiple)     │    │ Validation  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   Pricing   │◀───│  Price Setting  │◀───│  Category   │
│   & Desc    │    │  & Description  │    │ Selection   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │
       └───────────────────────┘
```

**Technical Flow:**
1. ● Navigate to "My Listings" → "Create New"
2. ● Fill account details form (level, items, etc.)
3. ● Upload screenshots (multiple images supported)
4. ⚡ POST `/upload/files` - Upload images to server
5. ● Set price and detailed description
6. ● Select appropriate category and tags
7. ● Preview listing before publish
8. ⚡ POST `/marketplace/listings` - Create listing
9. ◆ Listing appears in marketplace with "active" status

### Listing Management
```
Active Listing ───▶ Edit ───▶ Update Details ───▶ Save Changes
                     │
                     ▼
                Mark as Sold ───▶ Transaction Complete
```

## 3. Purchase Flow (Buyer)

### Browsing and Selection
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Marketplace │───▶│  Search/Filter  │───▶│ Account     │
│   Home      │    │   Listings      │    │   Details   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Watchlist   │◀───│  Add to         │◀───│  Purchase   │
│ Management  │    │  Watchlist      │    │   Button    │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Transaction Initiation
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Account     │───▶│ Mediator        │───▶│ Payment     │
│   Details   │    │  Selection      │    │   Screen    │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Transaction │◀───│  Create         │◀───│  Escrow     │
│   Progress  │    │  Transaction    │    │   Lock      │
└─────────────┘    └─────────────────┘    └─────────────┘
```

**Technical Implementation:**
1. ● Browse marketplace and select account
2. ● Add to watchlist (optional)
3. ● Click "Purchase" button
4. ● Select preferred mediator from available list
5. ● Review order summary and pricing
6. ● Complete payment (Paymob integration)
7. ⚡ POST `/payments/create-order` - Process payment
8. ⚡ POST `/escrow/transactions` - Create escrow transaction
9. ◆ Funds locked in escrow, transaction created

## 4. Mediation Flow (Trusted Mediator)

### Transaction Assignment
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Dashboard   │───▶│ New             │───▶│ Transaction │
│   Home      │    │ Transactions    │    │   Details   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Chat        │◀───│  Review         │◀───│  Accept/    │
│ Initiation  │    │  Transaction    │    │  Decline    │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Active Mediation Process
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Group Chat  │───▶│  Verify         │───▶│ Account     │
│  Creation   │    │  Account        │    │   Exchange  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Delivery    │◀───│  Confirm        │◀───│  Escrow     │
│ Confirmation│    │  Receipt        │    │   Release   │
└─────────────┘    └─────────────────┘    └─────────────┘
```

**Mediation Steps:**
1. ● New transaction appears in mediator dashboard
2. ● Review buyer, seller, and account details
3. ● Accept or decline transaction assignment
4. ● Initiate group chat with buyer and seller
5. ● Oversee account credential exchange
6. ● Verify delivery and buyer satisfaction
7. ● Confirm successful transaction
8. ⚡ POST `/escrow/approve/{id}` - Approve release
9. ◆ Funds released: 90% to seller, 5% to mediator, 5% to platform

## 5. Chat Communication Flow

### 1:1 Chat Between Users
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Messages    │───▶│ Conversation    │───▶│ Message     │
│   Inbox     │    │   List          │    │   Composer  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Real-time   │◀───│  Send Message   │◀───│  WebSocket  │
│  Updates    │    │  (Text/Media)   │    │ Connection  │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Group Chat (Tripartite)
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Transaction │───▶│ Create Group    │───▶│ Add         │
│   Chat      │    │   Chat          │    │ Participants│
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Message     │◀───│  Group          │◀───│  Real-time  │
│  History    │    │  Communication  │    │   Sync      │
└─────────────┘    └─────────────────┘    └─────────────┘
```

**Chat Technical Flow:**
1. ● WebSocket connection established on app launch
2. ● Join relevant chat rooms/conversations
3. ● Real-time message sending and receiving
4. ● File upload for media sharing
5. ● Typing indicators and online status
6. ● Message persistence in database
7. ● Push notifications for background messages

## 6. Dispute Resolution Flow

### Dispute Initiation
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Transaction │───▶│ Report Issue    │───▶│ Dispute     │
│   Problem   │    │   Button        │    │   Form      │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Evidence    │◀───│  Describe       │◀───│  Category   │
│  Upload     │    │  Problem        │    │ Selection   │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Admin Resolution Process
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Admin       │───▶│ Review Dispute  │───▶│ Investigate │
│ Dashboard   │    │   Details       │    │   Evidence  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Resolution  │◀───│  Communicate    │◀───│  Decision   │
│ Decision    │    │  with Parties   │    │   Making    │
└─────────────┘    └─────────────────┘    └─────────────┘
```

**Dispute Flow:**
1. ● User reports issue during/after transaction
2. ● Fill dispute form with details and evidence
3. ⚡ POST `/disputes/create` - Create dispute record
4. ● Admin notified and reviews case
5. ● Admin investigates with all parties
6. ● Admin makes final decision
7. ● Funds redistributed based on resolution
8. ● All parties notified of outcome

## 7. Admin Management Flows

### User Verification Management
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ KYC Queue   │───▶│ Document        │───▶│ Verification│
│ Dashboard   │    │   Review        │    │   Decision  │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ User        │◀───│  Approve/       │◀───│  Send       │
│ Notification│    │  Reject         │    │ Notification│
└─────────────┘    └─────────────────┘    └─────────────┘
```

### System Monitoring
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Admin       │───▶│ System          │───▶│ Performance │
│ Dashboard   │    │   Health        │    │   Metrics   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Alerts      │◀───│  Monitor        │◀───│  Issue      │
│ Management  │    │  Transactions   │    │ Detection   │
└─────────────┘    └─────────────────┘    └─────────────┘
```

## 8. Payment Flow Integration

### Code-Based Escrow (MVP)
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Payment     │───▶│ Virtual Wallet  │───▶│ Escrow      │
│   Received  │    │   Creation      │    │   Lock      │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Funds       │◀───│  Mediator       │◀───│  Release    │
│ Release     │    │  Approval       │    │   Process   │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Paymob Integration (Production)
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Paymob      │───▶│ Payment         │───▶│ Webhook     │
│   Payment   │    │   Processing    │    │   Handler   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Payout      │◀───│  API Callback   │◀───│  Fund       │
│ Processing  │    │   Processing    │    │ Distribution│
└─────────────┘    └─────────────────┘    └─────────────┘
```

## 9. File Upload Flows

### Chat Media Upload
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Attach File │───▶│ File Selection  │───▶│ Upload      │
│   Button    │    │   (Gallery/     │    │   Progress  │
│             │    │    Camera)      │    │             │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Media       │◀───│  Compression    │◀───│  Storage    │
│ Sent        │    │   & Validation  │    │   & CDN     │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### KYC Document Upload
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Document    │───▶│ Image Capture   │───▶│ Quality     │
│   Type      │    │   / Selection   │    │   Check     │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Upload      │◀───│  Secure         │◀───│  Admin      │
│ Complete    │    │   Storage       │    │   Review    │
└─────────────┘    └─────────────────┘    └─────────────┘
```

## 10. Error Handling Flows

### Network Error Recovery
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Action      │───▶│ Network Error   │───▶│ Retry       │
│   Failed    │    │   Detected      │    │   Logic     │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Offline     │◀───│  Queue Action   │◀───│  Sync When  │
│   Queue     │    │   for Later     │    │   Online    │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Payment Failure Handling
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Payment     │───▶│ Failure         │───▶│ Alternative │
│   Failed    │    │   Detection     │    │   Methods   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ User        │◀───│  Support        │◀───│  Manual     │
│ Notification│    │   Contact       │    │ Resolution  │
└─────────────┘    └─────────────────┘    └─────────────┘
```

## Critical Path Analysis

### High-Risk User Flows
1. **Payment Processing** - Direct financial impact
2. **Escrow Release** - Fund distribution critical
3. **Account Credential Exchange** - High-value asset transfer
4. **Dispute Resolution** - Legal and financial implications

### Performance-Critical Flows
1. **Real-time Chat** - Sub-second message delivery
2. **File Upload** - Large media handling
3. **Payment Processing** - Instant confirmation
4. **Dashboard Loading** - Mediator decision speed

### Security-Critical Flows
1. **Authentication** - Account access control
2. **KYC Verification** - Identity validation
3. **Payment Data** - Financial information protection
4. **File Storage** - Document security

## User Experience Optimization

### Loading States
- Skeleton screens for list loading
- Progress indicators for file uploads
- Real-time status updates for transactions
- Optimistic UI updates for instant feedback

### Offline Support
- Queue actions when offline
- Sync when connection restored
- Inform users of offline limitations
- Cache important data locally

### Accessibility
- Screen reader support
- Large touch targets
- High contrast options
- Keyboard navigation support