# Shackpack - Premium Coin & Card Repacks

A modern Next.js e-commerce website for showcasing and managing premium coin and card repack collections with full checkout, order management, and shipping integration.

## 🏗️ Project Structure

### Technology Stack

- **Framework**: Next.js 14.2.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Shipping**: FedEx API
- **Deployment**: Netlify (with Next.js runtime)

### Key Features

- ✅ Series-based repack sales with inventory tracking
- ✅ User accounts and guest checkout
- ✅ Stripe payment integration (cards, Apple Pay, Google Pay)
- ✅ Pack limit enforcement (max 5 packs per user per series)
- ✅ Automated FedEx label generation
- ✅ Loyalty points system
- ✅ Order history and tracking
- ✅ Admin panel for series and order management
- ✅ Email notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Stripe account
- FedEx API account (optional for development)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd coins
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database (development)
   npm run db:push
   
   # OR create migration (production)
   npm run db:migrate
   ```

4. **Create an admin user:**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

## 📋 Setup Checklist

### Required Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your site URL (http://localhost:3000 for dev)
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration
- FedEx API credentials (see `.env.example`)

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select event: `payment_intent.succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Database Setup

The application uses Prisma with PostgreSQL. Key models:

- **User** - Customers and admin users (includes shadow users for guest checkout)
- **Series** - Repack series/runs with inventory tracking
- **Order** - Customer orders
- **OrderItem** - Links orders to series
- **SeriesPurchase** - Tracks user purchases per series for limit enforcement
- **Address** - User shipping addresses

## 🎯 Key Features

### Series Management

- Create series with total pack count
- Track packs sold and remaining
- Display active series on home page
- Enforce pack limits (max 5 per user per series)

### Checkout Flow

1. User adds packs to cart (validated for limits and inventory)
2. Enters shipping address
3. Creates payment intent with Stripe
4. Completes payment
5. Order created and inventory updated atomically
6. FedEx label generated automatically
7. Email notifications sent

### Shipping

- **Free shipping** for account holders
- **$4.99 shipping** for guest checkout
- Automatic FedEx label generation on successful payment
- Tracking numbers stored with orders

### Loyalty Points

- Configurable points per dollar (default: 1 point per dollar)
- Points awarded on successful orders
- Displayed in user account
- Ready for future redemption features

### Admin Panel

Access at `/admin` (admin role required):

- View and manage series
- View all orders
- See order status and tracking
- Manage inventory

## 📁 Directory Structure

```
coins/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── series/       # Series management
│   │   ├── cart/         # Cart validation
│   │   ├── checkout/     # Checkout flow
│   │   ├── orders/       # Order management
│   │   ├── webhooks/     # Stripe webhooks
│   │   └── admin/         # Admin endpoints
│   ├── auth/             # Auth pages (signin, register)
│   ├── account/          # User account pages
│   ├── admin/            # Admin panel
│   ├── checkout/         # Checkout pages
│   ├── series/           # Series detail pages
│   └── ...               # Other pages
├── components/           # React components
├── lib/                  # Utilities
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # NextAuth config
│   ├── fedex.ts         # FedEx integration
│   └── email.ts          # Email notifications
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/             # Utility scripts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes (dev)
- `npm run db:migrate` - Create migration (prod)
- `npm run db:studio` - Open Prisma Studio

### Database Migrations

For production, use migrations:

```bash
npm run db:migrate
```

This creates a migration file that can be reviewed and applied.

## 🚢 Deployment

### Netlify

1. **Install Netlify Next.js plugin** (if not using default):
   - The site should work with Netlify's default Next.js support
   - Or install `@netlify/plugin-nextjs`

2. **Set environment variables** in Netlify dashboard:
   - All variables from `.env.example`
   - Ensure `NEXTAUTH_URL` matches your production domain

3. **Configure database:**
   - Use a managed PostgreSQL service (Supabase, Neon, Railway)
   - Set `DATABASE_URL` in Netlify environment variables

4. **Set up Stripe webhook:**
   - Point to: `https://yourdomain.com/api/webhooks/stripe`
   - Copy webhook secret to Netlify environment variables

### Build Settings

The `netlify.toml` is configured for Next.js. The build command will:
1. Install dependencies
2. Generate Prisma client
3. Build Next.js application

## 🔐 Security

- All secrets stored in environment variables
- Passwords hashed with bcrypt
- CSRF protection via NextAuth
- Input validation with Zod
- Atomic database transactions for inventory
- Stripe handles all payment data (PCI compliant)
- No sensitive data logged or exposed

## 📝 Notes

- The site no longer uses static export (removed to support API routes)
- Guest checkout creates "shadow users" for tracking pack limits
- Inventory updates are atomic to prevent overselling
- FedEx label generation is non-blocking (order succeeds even if label fails)
- Email notifications are optional (configure email service in `.env`)

## 📚 Documentation

**Production Setup Guides**:
- `STRIPE_PRODUCTION_SETUP.md` - Complete Stripe production setup with webhooks
- `FEDEX_PRODUCTION_SETUP.md` - Complete FedEx production setup (after API validation)
- `TESTING_GUIDE.md` - Full testing scenarios
- `TROUBLESHOOTING.md` - Common issues and fixes

**Quick Reference**:
- See `STRIPE_PRODUCTION_SETUP.md` for Stripe production setup
- See `FEDEX_PRODUCTION_SETUP.md` for FedEx production setup
- See `TESTING_GUIDE.md` for testing procedures
- See `TROUBLESHOOTING.md` for debugging common issues

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from your network
- Check Prisma client is generated: `npm run db:generate`

### Stripe Webhook Issues
- Verify webhook secret matches Stripe dashboard
- Check webhook endpoint is accessible
- Review Stripe dashboard for webhook delivery logs

### Build Issues
- Ensure all environment variables are set
- Run `npm run db:generate` before building
- Check Node.js version matches (20+)

## 📄 License

Private - All rights reserved
