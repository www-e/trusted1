# Frontend Pages & Screens Documentation

## Flutter Application Architecture

### Navigation Structure
```
Main Tabs:
├── Marketplace (Home)
├── My Listings
├── Messages (Chat)
├── Profile
└── Mediator Dashboard (Conditional)
```

### Authentication Flow
#### 1. Onboarding Screens
- **Welcome Screen**
  - App branding and value proposition
  - "Get Started" CTA button
  - Terms of Service and Privacy Policy links

- **Role Selection Screen**
  - User type selection (Buyer/Seller/Mediator)
  - Role benefits explanation
  - Dynamic UI based on selection

#### 2. Authentication Screens
- **Login Screen**
  - Email/phone input
  - Password field with show/hide
  - Forgot password link
  - Social login options (if applicable)
  - Sign up redirect

- **Registration Screen**
  - Multi-step form wizard
  - Basic info (name, email, phone)
  - Password creation with strength indicator
  - Role-specific fields
  - Email verification step

- **OTP Verification Screen**
  - SMS/Email code input
  - Resend functionality with timer
  - Auto-advance on completion

- **Password Reset Screen**
  - Email input for reset link
  - Success confirmation

### Profile Management
#### 1. Profile Screens
- **Profile View Screen**
  - Avatar and basic info display
  - Account statistics (listings, purchases, ratings)
  - Edit profile button
  - Logout option

- **Edit Profile Screen**
  - Avatar upload with cropping
  - Name, bio, contact info editing
  - Notification preferences
  - Privacy settings

#### 2. Identity Verification Screens
- **KYC Upload Screen**
  - Document type selection
  - ID front/back photo capture
  - Selfie photo with instructions
  - Real-time image quality validation
  - Upload progress indicator

- **Verification Status Screen**
  - Current KYC status display
  - Pending documents list
  - Rejection reasons (if applicable)
  - Re-upload functionality

### Marketplace Module
#### 1. Main Marketplace Screens
- **Marketplace Home Screen**
  - Search bar with filters
  - Category tabs (All, Featured, Recent)
  - Account listings grid/list view
  - Pull-to-refresh functionality
  - Floating search button

- **Search & Filter Screen**
  - Advanced search options
  - Price range slider
  - Account level filters
  - Sort options (price, date, popularity)
  - Active filters display

- **Account Details Screen**
  - Hero image carousel
  - Account specifications (level, items, etc.)
  - Seller information
  - Price and purchase options
  - Add to watchlist button

#### 2. Listing Management Screens
- **My Listings Screen**
  - Active listings with status
  - Draft/saved listings
  - Performance analytics
  - Create new listing button

- **Create Listing Screen**
  - Multi-step listing wizard
  - Account details form
  - Screenshot upload (multiple images)
  - Pricing and description
  - Category selection
  - Preview before publish

- **Edit Listing Screen**
  - Same as create but pre-populated
  - Change status (active/paused/sold)
  - Update price/description

### Communication System
#### 1. Chat Overview Screens
- **Messages Inbox Screen**
  - Chat threads list
  - Unread message indicators
  - Search conversations
  - Archive/mute options

- **Chat Thread Screen**
  - Message history
  - Real-time message sending
  - Media attachment button
  - Typing indicators
  - Online status

#### 2. Group Chat Screens
- **Group Chat Creation Screen**
  - Participant selection
  - Chat purpose selection
  - Initial message setup

- **Group Chat Management Screen**
  - Participant list
  - Chat settings
  - Leave group option
  - Admin controls (for mediators)

### Mediator-Specific Screens
#### 1. Mediator Dashboard Screens
- **Mediator Home Dashboard**
  - Active transactions overview
  - Pending approvals
  - Earnings summary
  - Performance metrics

- **Transaction Management Screen**
  - Transaction details view
  - Buyer/seller information
  - Chat history access
  - Approve/reject actions
  - Escrow release controls

- **Mediator Analytics Screen**
  - Transaction volume charts
  - Earnings breakdown
  - Rating and reviews
  - Performance comparisons

#### 2. Helper Management Screens (Tier ++ and Pro)
- **Helper Assignment Screen**
  - Available helpers list
  - Assignment controls
  - Workload distribution

- **Helper Performance Screen**
  - Individual helper metrics
  - Transaction success rates
  - Earnings distribution

### Transaction Flow Screens
#### 1. Purchase Process Screens
- **Mediator Selection Screen**
  - Available mediators list
  - Mediator profiles and ratings
  - Selection criteria
  - Availability status

- **Payment Screen**
  - Order summary
  - Payment method selection
  - Escrow confirmation
  - Security badges

- **Transaction Progress Screen**
  - Real-time status updates
  - Chat access during transaction
  - Delivery confirmation wait

#### 2. Post-Transaction Screens
- **Transaction Complete Screen**
  - Success confirmation
  - Receipt/download
  - Rate mediator/buyer/seller
  - Leave review option

- **Dispute Resolution Screen**
  - Dispute filing form
  - Evidence upload
  - Admin contact options

### Admin Panel Screens (Web View)
#### 1. User Management Screens
- **User Overview Screen**
  - User search and filtering
  - Registration trends
  - Account status management

- **Verification Queue Screen**
  - Pending verifications
  - Document review tools
  - Approve/reject with reasons

#### 2. Transaction Oversight Screens
- **Transaction Monitor Screen**
  - Real-time transaction tracking
  - Fraud detection alerts
  - Manual intervention tools

- **Dispute Management Screen**
  - Active disputes list
  - Resolution tools
  - Communication logs

### Supporting Screens
#### 1. Utility Screens
- **Settings Screen**
  - App preferences
  - Notification settings
  - Privacy controls
  - Account deletion

- **Help & Support Screen**
  - FAQ sections
  - Contact support form
  - Live chat support (if available)

- **Notifications Screen**
  - Message notifications
  - Transaction updates
  - System announcements

#### 2. Error & Loading Screens
- **Error States**
  - Network error screens
  - Payment failure screens
  - Generic error with retry

- **Loading States**
  - Skeleton screens for lists
  - Progress indicators for uploads
  - Transaction processing overlays

## Screen Relationships & Navigation Flow

### User Journey Maps

#### New User Flow
```
Welcome → Role Selection → Registration → OTP → KYC Upload → Profile Setup → Marketplace
```

#### Purchase Flow
```
Marketplace → Account Details → Mediator Selection → Payment → Transaction Progress → Completion
```

#### Listing Flow
```
My Listings → Create Listing → Screenshot Upload → Pricing → Preview → Publish
```

#### Mediation Flow
```
Mediator Dashboard → Transaction Details → Chat Review → Approve/Reject → Earnings Update
```

## State Management Considerations

### Local State
- Form inputs and validation
- UI state (loading, errors)
- Temporary data (drafts, cache)

### Global State
- User authentication status
- Active transactions
- Unread message counts
- App-wide settings

### Navigation State
- Deep linking support
- Back button handling
- Tab state persistence

## Performance Optimizations

### Screen-Specific Optimizations
- **Lists**: Virtual scrolling for large datasets
- **Images**: Lazy loading and caching
- **Chat**: Message pagination and real-time updates
- **Media**: Progressive loading for large files

### Memory Management
- Image cache limits
- Chat history cleanup
- Background task handling
- Screen disposal on navigation