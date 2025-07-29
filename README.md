# 🚚 Noble SpeedyTrac - Logistics Tracking System

A comprehensive logistics and package tracking web application built with modern technologies, featuring real-time tracking, admin management, payment processing, and a beautiful Canadian autumn-themed UI.

## 🌟 Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure user registration with email verification
  - Registration form with comprehensive user information collection
  - Email verification system with 6-digit verification codes
  - Development mode auto-verification for testing
  - Role-based login (Client/Admin) with dropdown selection
  - JWT token-based session management with 24-hour expiration
  - Persistent login state with localStorage
  - Secure password hashing using bcryptjs

- **Role-Based Access Control**: Separate client and admin user roles
  - Client users: Standard shipping and tracking access
  - Admin users: Full system management capabilities
  - Route protection based on user roles
  - Conditional UI rendering based on user permissions

- **Email Verification**: Automated email verification system with fallback for development
  - SMTP email configuration for production
  - Development mode with manual verification codes
  - Email verification required before login
  - Resend verification functionality

- **Profile Management**: User profile management with contact information
  - User profile page with editable information
  - Contact details management
  - Address and business information
  - Profile picture support

- **Session Management**: JWT-based authentication with persistent sessions
  - Automatic token refresh
  - Secure logout functionality
  - Session timeout handling
  - Cross-tab session synchronization

### 📦 Package Tracking System
- **Real-Time Tracking**: Track packages using unique tracking numbers
  - Public tracking without login requirement
  - Unique tracking number generation (TRK + timestamp + random)
  - Real-time status updates
  - Location-based tracking information

- **Tracking History**: Complete delivery timeline with status updates
  - Chronological tracking events
  - Status change timestamps
  - Location updates with descriptions
  - Delivery confirmation tracking

- **Location Updates**: Real-time location tracking and status changes
  - Current location display
  - Location history tracking
  - Status-based location updates
  - Delivery route visualization

- **Delivery Estimates**: Estimated delivery dates and times
  - Service-based delivery estimates
  - Dynamic delivery date calculation
  - Delivery time windows
  - Status-based estimate updates

- **Status Management**: Multiple delivery statuses
  - Pending: Initial shipment creation
  - In Transit: Package in movement
  - Out for Delivery: Final delivery phase
  - Delivered: Successful delivery
  - Failed: Delivery issues
  - Returned: Package returns

### 🚛 Shipment Management
- **Create Shipments**: Create new shipments with detailed recipient information
  - Comprehensive shipment form with validation
  - Recipient information collection
  - Service type selection
  - Pricing calculation
  - Contact number validation

- **Bulk Shipment Creation**: Create multiple shipments from cart
  - Cart-based bulk operations
  - Batch processing capabilities
  - Individual shipment tracking
  - Bulk status updates

- **Service Types**: Multiple delivery service options
  - Standard: 5-7 business days
  - Express: 2-3 business days
  - Overnight: Next business day
  - Same Day: Same day delivery
  - Custom service types

- **Customer Tariffs**: Predefined rates for different customer types
  - APS, AMD, CTI, StenTech rates
  - FedEx/UPS depot rates
  - ECT, ATF premium rates
  - Tenstorrent, MACKIE specialized rates
  - Building-to-building rates

- **Shipment Numbers**: Unique shipment identification system
  - Auto-generated shipment numbers (SHP + timestamp + random)
  - Shipment number tracking
  - Duplicate prevention
  - Search and filter capabilities

### 🛒 Shopping Cart System
- **Add to Cart**: Add shipment items to cart before checkout
  - Cart item management
  - Quantity controls
  - Price calculations
  - Service type selection

- **Cart Management**: View, edit, and remove items from cart
  - Cart page with item listing
  - Edit shipment details
  - Remove individual items
  - Clear entire cart

- **Bulk Operations**: Process multiple shipments at once
  - Bulk checkout process
  - Batch payment processing
  - Multiple tracking numbers
  - Bulk status updates

- **Price Calculation**: Automatic pricing based on service type and customer tariffs
  - Dynamic pricing calculation
  - Service type multipliers
  - Customer-specific rates
  - Weight-based pricing
  - Distance-based pricing

### 💳 Payment Processing
- **Stripe Integration**: Secure payment processing with Stripe
  - Stripe Payment Intents
  - Secure payment flow
  - Multiple payment methods
  - PCI compliance

- **Multiple Payment Methods**: Support for various payment options
  - Credit/debit cards
  - Digital wallets
  - Bank transfers
  - Future payment method expansion

- **Payment History**: Complete transaction history and receipts
  - Transaction listing
  - Payment status tracking
  - Receipt generation
  - Payment confirmation emails

- **Payment Status Tracking**: Real-time payment status updates
  - Pending payments
  - Successful payments
  - Failed payments
  - Refund processing

- **Billing Management**: Comprehensive billing address management
  - Billing address collection
  - Address validation
  - Multiple billing addresses
  - Tax calculation support

### 📊 Admin Dashboard
- **User Management**: View and manage all registered users
  - User listing with search and filter
  - User status management (active/inactive)
  - Role assignment and management
  - User profile editing
  - Email verification management

- **Shipment Overview**: Complete shipment tracking and management
  - All shipments listing
  - Shipment status management
  - Driver assignment
  - Notes and comments
  - Bulk status updates

- **Package Management**: Real-time package status updates
  - Package listing with details
  - Status update capabilities
  - Location tracking
  - Delivery notes
  - Signature requirements

- **Statistics Dashboard**: Key performance indicators and analytics
  - User count statistics
  - Shipment volume metrics
  - Package delivery rates
  - Payment processing stats
  - Revenue analytics

- **Status Updates**: Admin can update shipment and package statuses
  - Real-time status changes
  - Status history tracking
  - Automated notifications
  - Status validation

- **Role Management**: User role assignment and management
  - Role assignment interface
  - Permission management
  - Role-based access control
  - Admin user creation

### 📱 Modern UI/UX
- **Canadian Autumn Theme**: Beautiful seasonal color scheme
  - Warm orange and amber color palette
  - Autumn-inspired gradients
  - Seasonal background imagery
  - Cozy visual elements

- **Responsive Design**: Mobile-first responsive layout
  - Mobile-optimized interface
  - Tablet and desktop adaptations
  - Touch-friendly controls
  - Adaptive layouts

- **Glass Morphism**: Modern glassmorphism design elements
  - Frosted glass effects
  - Backdrop blur filters
  - Transparent overlays
  - Modern card designs

- **Loading States**: Skeleton loaders and loading animations
  - Skeleton loading components
  - Loading spinners
  - Progress indicators
  - Smooth transitions

- **Error Boundaries**: Graceful error handling and recovery
  - Error boundary components
  - User-friendly error messages
  - Automatic error recovery
  - Error reporting

- **Smooth Animations**: Subtle transitions and hover effects
  - Hover animations
  - Page transitions
  - Loading animations
  - Interactive feedback

### 🌍 International Support
- **Phone Number Validation**: Comprehensive international phone validation
  - 80+ country support
  - Country-specific validation rules
  - Format validation
  - Length validation

- **Country Codes**: Support for 80+ countries with dial codes
  - Comprehensive country list
  - Dial code display
  - Country flag support
  - Search functionality

- **Format Validation**: Country-specific phone number formats
  - Format pattern matching
  - Visual format display
  - Input formatting
  - Validation feedback

- **Auto-Detection**: Automatic country detection from phone numbers
  - Country code detection
  - Automatic country selection
  - Smart validation
  - User experience optimization

### 🔧 Developer Features
- **Error Boundaries**: React error boundaries for crash prevention
  - Component-level error handling
  - Fallback UI components
  - Error logging
  - Recovery mechanisms

- **Loading States**: Comprehensive loading state management
  - Global loading states
  - Component-specific loading
  - Skeleton loaders
  - Progress tracking

- **Mobile Responsiveness**: Touch-friendly mobile interface
  - Touch-optimized controls
  - Mobile navigation
  - Responsive forms
  - Mobile-specific features

- **TypeScript**: Full TypeScript support for type safety
  - Type definitions
  - Interface declarations
  - Type checking
  - Development tooling

- **API Documentation**: Comprehensive API documentation
  - Endpoint documentation
  - Request/response examples
  - Error handling
  - Authentication details

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0**: Modern React with latest features
- **TypeScript 5.8.3**: Type-safe JavaScript development
- **Vite 7.0.0**: Fast build tool and development server
- **React Router DOM 7.6.3**: Client-side routing
- **React Icons 5.5.0**: Icon library
- **Tailwind CSS**: Utility-first CSS framework (for some components)

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **bcryptjs 3.0.2**: Password hashing
- **jsonwebtoken 9.0.2**: JWT authentication
- **nodemailer 7.0.5**: Email sending
- **cors 2.8.5**: Cross-origin resource sharing

### Database
- **Supabase**: PostgreSQL database with real-time features
- **Row Level Security (RLS)**: Database-level security policies
- **Automatic Timestamps**: Created/updated timestamp management
- **Indexes**: Optimized database performance

### Payment Processing
- **Stripe 18.3.0**: Payment processing and management
- **Payment Intents**: Secure payment flow
- **Webhook Support**: Real-time payment status updates

### Development Tools
- **ESLint 9.29.0**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Concurrently**: Run multiple commands simultaneously
- **Vite Plugin React**: React support for Vite

## 📁 Project Structure

```
trackingsite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── server.js          # Main server file
│   ├── supabase.js        # Database helpers
│   ├── schema.sql         # Database schema
│   └── package.json       # Backend dependencies
├── supabase/              # Supabase configuration
│   ├── config.toml        # Supabase config
│   └── migrations/        # Database migrations
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackingsite
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in server directory
   cd server
   cp env.example .env
   ```

   Fill in your environment variables:
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-email-password
   SMTP_FROM=noreply@trackingsite.com
   ```

4. **Database Setup**
   ```bash
   # Run the schema file in your Supabase SQL editor
   # Copy contents from server/schema.sql
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   cd client
   npm run dev:full
   
   # Or start separately:
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-email` - Email verification

### Tracking
- `POST /api/track` - Track package by number
- `GET /api/packages` - Get user's packages
- `POST /api/packages/:id/tracking` - Add tracking history

### Shipments
- `POST /api/ship` - Create single shipment
- `POST /api/ship/bulk` - Create multiple shipments
- `GET /api/shipments` - Get user's shipments
- `POST /api/estimate` - Get shipping estimate

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get user's cart
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Payments
- `POST /api/payments` - Create payment transaction
- `GET /api/payments` - Get payment history
- `POST /api/create-payment-intent` - Create Stripe payment intent

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/shipments` - Get all shipments
- `PUT /api/admin/shipments/:id` - Update shipment
- `GET /api/admin/packages` - Get all packages
- `PUT /api/admin/packages/:id` - Update package
- `GET /api/admin/stats` - Get admin statistics

## 👥 User Types & Access Levels

### 🔐 Guest Users (Not Logged In)
**Available Pages:**
- **Landing Page (`/`)**: 
  - Public package tracking form
  - Company information and services
  - Call-to-action buttons (Estimate, Ship, Register)
  - Specialty delivery areas showcase
  - FAQ page access

**Features:**
- Package tracking without registration
- Shipping estimates
- View company information
- Access to FAQ and support

### 👤 Client Users (Regular Customers)
**Available Pages:**
- **User Dashboard (`/user`)**: 
  - Welcome message and quick actions
  - Package tracking form
  - Create new shipment button
  - Recent shipments overview
  - Quick admin access (if admin role)

- **Profile Page (`/profile`)**: 
  - Personal information management
  - Contact details editing
  - Address and business information
  - Account settings

- **Shipment Page (`/shipment`)**: 
  - Create new shipments
  - Shipment form with validation
  - Service type selection
  - Pricing calculation

- **Cart Page (`/cart`)**: 
  - Shopping cart management
  - Add/edit/remove items
  - Bulk operations
  - Checkout process

- **Payment Page (`/payment`)**: 
  - Payment processing
  - Stripe integration
  - Payment method selection
  - Billing information

- **Payment Success Page (`/payment-success`)**: 
  - Payment confirmation
  - Transaction details
  - Next steps information

- **Order History Page (`/orders`)**: 
  - Complete order history
  - Shipment status tracking
  - Payment history
  - Order details

- **FAQ Page (`/faq`)**: 
  - Frequently asked questions
  - Support information
  - Contact details

**Features:**
- Full shipment creation and management
- Shopping cart functionality
- Payment processing
- Order history and tracking
- Profile management
- Email verification required

### 🛡️ Admin Users (System Administrators)
**Available Pages:**
- **Admin Dashboard (`/admin`)**: 
  - Overview tab with statistics
  - User Management tab
  - Shipment Management tab
  - Package Management tab
  - Tracking Management tab

**Admin Dashboard Tabs:**

1. **Overview Tab**:
   - System statistics and KPIs
   - Recent activity feed
   - Quick action buttons
   - Performance metrics

2. **User Management Tab**:
   - Complete user listing
   - User status management (active/inactive)
   - Role assignment (user/admin)
   - Email verification management
   - User profile editing
   - Search and filter users

3. **Shipment Management Tab**:
   - All shipments listing
   - Shipment status updates
   - Driver assignment
   - Notes and comments
   - Shipment details editing
   - Bulk status updates

4. **Package Management Tab**:
   - All packages listing
   - Package status management
   - Location tracking updates
   - Delivery notes
   - Signature requirements
   - Package details editing

5. **Tracking Management Tab**:
   - Comprehensive tracking overview
   - Package status tracking
   - Location history
   - Delivery timeline
   - Status update capabilities

**Features:**
- Complete system administration
- User management and role assignment
- Shipment and package oversight
- Real-time status updates
- System statistics and analytics
- Bulk operations
- Advanced search and filtering

### 🔄 Page Access Matrix

| Page | Guest | Client | Admin |
|------|-------|--------|-------|
| Landing Page (`/`) | ✅ | ✅ | ✅ |
| User Dashboard (`/user`) | ❌ | ✅ | ✅ |
| Profile Page (`/profile`) | ❌ | ✅ | ✅ |
| Shipment Page (`/shipment`) | ❌ | ✅ | ✅ |
| Cart Page (`/cart`) | ❌ | ✅ | ✅ |
| Payment Page (`/payment`) | ❌ | ✅ | ✅ |
| Payment Success (`/payment-success`) | ❌ | ✅ | ✅ |
| Order History (`/orders`) | ❌ | ✅ | ✅ |
| FAQ Page (`/faq`) | ✅ | ✅ | ✅ |
| Admin Dashboard (`/admin`) | ❌ | ❌ | ✅ |
| Package Tracking (`/track/:id`) | ✅ | ✅ | ✅ |

### 🔐 Authentication Flow

1. **Guest User Journey**:
   - Access landing page
   - Use public tracking
   - Register for account
   - Verify email
   - Login as client

2. **Client User Journey**:
   - Login with credentials
   - Access user dashboard
   - Create shipments
   - Manage cart and payments
   - Track orders

3. **Admin User Journey**:
   - Login with admin credentials
   - Access admin dashboard
   - Manage users and shipments
   - Update system statuses
   - View analytics

## 🎨 UI Components

### Core Components
- **Header**: Navigation with user menu and authentication
  - User role display
  - Conditional menu items
  - Logout functionality
  - Responsive navigation

- **TrackingForm**: Package tracking interface
  - Public tracking form
  - Real-time validation
  - Tracking number input
  - Results display

- **ShipModal**: Shipment creation modal
  - Comprehensive shipment form
  - Service type selection
  - Pricing calculation
  - Validation and submission

- **LoginModal**: Authentication modal with role selection
  - Username/password login
  - Role selection dropdown (Client/Admin)
  - Email verification
  - Error handling

- **PhoneInput**: International phone number input with validation
  - Country code selection
  - Phone number validation
  - Format display
  - Auto-detection

- **AdminDashboard**: Comprehensive admin management interface
  - Tabbed interface
  - Data tables
  - Status management
  - Statistics display

### Utility Components
- **SkeletonLoader**: Loading state components
  - Text skeleton
  - Card skeleton
  - Table skeleton
  - Button skeleton

- **ErrorBoundary**: Error handling and recovery
  - Error display
  - Recovery options
  - Error logging
  - Fallback UI

- **ActionButtons**: Call-to-action buttons
  - Estimate button
  - Ship button
  - Register button
  - Hover effects

- **PaymentMethod**: Payment processing interface
  - Stripe integration
  - Payment form
  - Validation
  - Confirmation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Role-Based Access**: Admin and user role separation
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive form validation
- **CORS Protection**: Cross-origin request protection

## 📱 Mobile Responsiveness

- **Responsive Design**: Mobile-first approach
- **Touch-Friendly**: Optimized for touch devices
- **Flexible Layout**: Adaptive grid and flexbox layouts
- **Optimized Images**: Responsive image handling

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Deploy to your Node.js hosting service
```

### Environment Variables
Ensure all environment variables are set in your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Email: info@noblespeedytrac.com
- Phone: +1 (555) 123-4567

## 🔄 Version History

- **v1.0.0**: Initial release with core tracking functionality
- **v1.1.0**: Added admin dashboard and role-based access
- **v1.2.0**: Implemented payment processing with Stripe
- **v1.3.0**: Added international phone validation
- **v1.4.0**: Enhanced UI with Canadian autumn theme
- **v1.5.0**: Added error boundaries and loading states

---

**Built with ❤️ for Noble SpeedyTrac Inc.** 