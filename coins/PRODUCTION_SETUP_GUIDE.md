# Production Setup Guide

## Quick Reference

- **Critical Items**: See "Critical Items" section
- **Environment Variables**: See "Production Environment Variables Summary" section
- **Testing**: See "Production Testing" section
- **Complete Guide**: See `COMPLETE_GUIDE.md`

---

## 🎯 Overview

This guide walks you through **every step** needed to make your Shackpack e-commerce site production-ready. Follow this guide in order before going live.

---

## 📋 Pre-Production Checklist

Before starting, ensure you have:
- [ ] Production domain name
- [ ] Production database (PostgreSQL)
- [ ] Stripe production account
- [ ] FedEx production account
- [ ] SendGrid production account
- [ ] Netlify account (or hosting provider)

---

## Part 1: FedEx Production Setup

### Understanding FedEx Account Numbers

You have two account numbers:
- **Developer Portal Account**: `740561073` - This is your **API/Developer account** for accessing the FedEx API
- **Normal FedEx Account**: `204375301` - This is your **actual billing/shipping account** for charges

**Which to Use:**
- **For API Access**: Use the Developer Portal account (`740561073`) - this is what authenticates with the API
- **For Billing/Shipping**: Use the Normal account (`204375301`) - this is where charges go

**However**, FedEx typically requires you to link your API account to your shipping account. You may need to use `204375301` for both, or configure the link in FedEx.

**Action Required:**
1. Contact FedEx support to confirm which account number to use in the API
2. They may need to link your developer account to your shipping account
3. Get your **Meter Number** - required for production

### Step 1: Get Production FedEx Credentials

1. **Log into FedEx Developer Portal**: https://developer.fedex.com/
2. **Switch to Production Environment**:
   - Go to your project settings
   - Enable production API access
   - Get production API key and secret
3. **Get Meter Number**:
   - Contact FedEx support: 1-800-463-3339
   - Request your meter number for account `204375301`
   - They'll provide it after verifying your account
4. **Verify Account Linking**:
   - Confirm your developer account is linked to shipping account `204375301`
   - Verify billing is set up correctly

### Step 2: Update Production Environment Variables

**In your production environment (Netlify/hosting):**

```env
# FedEx Production Credentials
FEDEX_KEY=your_production_api_key
FEDEX_PASSWORD=your_production_secret
FEDEX_ACCOUNT_NUMBER=204375301  # Your shipping/billing account
FEDEX_METER_NUMBER=your_meter_number  # Required for production
FEDEX_ENVIRONMENT=production

# Shipper Information (Your Business)
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US

# Package Defaults
FEDEX_DEFAULT_WEIGHT=1
FEDEX_DEFAULT_LENGTH=6
FEDEX_DEFAULT_WIDTH=4
FEDEX_DEFAULT_HEIGHT=2
```

**Important Notes:**
- Use **production API credentials** (not test)
- Use **shipping account number** (`204375301`) for billing
- **Meter number is required** for production
- Verify with FedEx which account number to use in API calls

---

## Part 2: Stripe Production Setup

### Understanding Stripe Payment Flow

**Current Implementation:**
1. User completes checkout → Payment Intent created
2. Payment succeeds → Frontend calls `/api/orders` immediately
3. Order created → Emails sent, FedEx label generated

**With Webhooks (Production):**
1. Payment succeeds → Stripe sends webhook to server
2. Webhook handler creates order (backup/reliability)
3. Frontend also creates order (primary method)
4. Both methods ensure order is created even if one fails

**Note:** For testing, webhooks are optional. For production, webhooks are **critical** for reliability.

### Step 1: Get Production Stripe Keys

1. **Log into Stripe Dashboard**: https://dashboard.stripe.com/
2. **Switch to Live Mode** (toggle in top right)
3. **Get Production Keys**:
   - Go to: Developers → API keys
   - Copy **Publishable key** (starts with `pk_live_...`)
   - Copy **Secret key** (starts with `sk_live_...`)
   - **Never share your secret key!**

### Step 2: Set Up Stripe Webhooks (Production - CRITICAL)

**Why Webhooks are Critical for Production:**
- **Reliability**: Automatic retry if order creation fails
- **Backup**: Creates order even if frontend fails
- **Scalability**: Handles high volume better
- **Industry Standard**: Required for production

**Steps:**

1. **Create Webhook Endpoint**:
   - Go to: Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen to: `payment_intent.succeeded`

2. **Get Webhook Secret**:
   - After creating endpoint, copy the **Signing secret**
   - Starts with `whsec_...`
   - Add to production environment variables

3. **Test Webhook**:
   - Use Stripe CLI or test payment
   - Verify webhook is received
   - Check order is created

**Testing Without Webhooks:**
- For local testing, webhooks are optional
- Orders are created client-side after payment succeeds
- This works fine for testing but not recommended for production

### Step 3: Update Production Environment Variables

```env
# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Required for production webhooks
```

### Step 4: Configure Stripe Settings

1. **Payment Methods**:
   - Enable: Cards, Apple Pay, Google Pay
   - Configure in: Settings → Payment methods

2. **Business Information**:
   - Update business name, address, phone
   - Required for compliance

3. **Email Receipts** (Optional):
   - Stripe can send receipts automatically
   - Or use your own email system (SendGrid)

---

## Part 3: Database Production Setup

### Step 1: Set Up Production Database

**Recommended Providers:**
- **Supabase** (PostgreSQL): https://supabase.com
- **Neon** (PostgreSQL): https://neon.tech
- **Railway** (PostgreSQL): https://railway.app

**Steps:**

1. **Create Database**:
   - Sign up for provider
   - Create new PostgreSQL database
   - Note the connection string

2. **Get Connection String**:
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Copy for production environment

3. **Run Migrations**:
   ```bash
   # Set DATABASE_URL to production
   export DATABASE_URL="your_production_connection_string"
   
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to production database
   npx prisma db push
   ```

4. **Verify Connection**:
   - Check database is accessible
   - Verify tables created
   - Test connection from production environment

### Step 2: Update Production Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

---

## Part 4: Email (SendGrid) Production Setup

### Step 1: Verify SendGrid Account

1. **Log into SendGrid**: https://app.sendgrid.com/
2. **Check Account Status**:
   - Verify account is active
   - Check sending limits
   - Upgrade plan if needed

### Step 2: Domain Authentication (Recommended)

**Why Domain Authentication:**
- Better email deliverability
- Prevents emails going to spam
- Professional sender reputation

**Steps:**

1. **Add Domain**:
   - Go to: Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Enter your domain (e.g., `shackpck.com`)

2. **Add DNS Records**:
   - SendGrid provides DNS records
   - Add to your domain's DNS settings
   - Wait for verification (can take 24-48 hours)

3. **Verify Domain**:
   - SendGrid will verify DNS records
   - Status will show "Verified"

### Step 3: Update Production Environment Variables

```env
# SendGrid Production
SENDGRID_API_KEY=SG.your_production_api_key
FROM_EMAIL=noreply@yourdomain.com  # Use authenticated domain
ADMIN_EMAIL=your_admin_email@yourdomain.com
```

**Important:**
- Use email from authenticated domain (e.g., `noreply@shackpck.com`)
- Better deliverability than generic email
- Required for production

---

## Part 5: Authentication (NextAuth) Production Setup

### Step 1: Update NextAuth Configuration

**Production Environment Variables:**

```env
# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_random_secret_key  # Generate strong random string
```

**Generate NEXTAUTH_SECRET:**
```bash
# Generate random secret
openssl rand -base64 32
```

### Step 2: Verify Authentication Settings

1. **Check `lib/auth.ts`**:
   - Verify production URL is correct
   - Check session configuration
   - Test login/logout

2. **Test Authentication**:
   - Register new user
   - Login
   - Logout
   - Verify sessions work

---

## Part 6: Deployment (Netlify) Production Setup

### Step 1: Configure Netlify Build Settings

1. **Connect Repository**:
   - Link GitHub/GitLab repository to Netlify
   - Netlify will auto-detect Next.js

2. **Build Configuration** (in `netlify.toml`):
   ```toml
   [build]
     base = "coins"
     command = "npm install && npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "20"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Verify Build Settings in Dashboard**:
   - Go to: Site Settings → Build & Deploy
   - Base directory: `coins` (or leave empty if set in netlify.toml)
   - Build command: `npm install && npm run build`
   - Publish directory: Leave empty (plugin handles it)

### Step 2: Add All Production Environment Variables

**In Netlify Dashboard → Site Settings → Environment Variables:**

Add ALL variables from Parts 1-5 of this guide. See "Production Environment Variables Summary" section below.

**Critical Variables:**
- Database URL
- Stripe keys (including webhook secret)
- SendGrid API key
- FedEx credentials (including meter number)
- NextAuth configuration
- Feature flags (if using partial deployment)

**Never commit secrets to git!**

### Step 3: Configure Custom Domain

1. **Add Domain**:
   - Go to: Domain settings
   - Add custom domain
   - Follow DNS setup instructions

2. **SSL Certificate**:
   - Netlify provides free SSL
   - Automatically configured
   - Verify HTTPS works

### Step 4: Deploy to Production

**Option A: Git Push (Recommended)**
```bash
cd coins
git add .
git commit -m "Deploy to production"
git push origin main
```
Netlify will automatically build and deploy.

**Option B: Manual Deploy**
```bash
cd coins
npm run build
netlify deploy --prod
```

### Step 5: Verify Deployment

1. **Check Build Logs**:
   - Monitor Netlify dashboard during build
   - Verify no errors

2. **Test Production Site**:
   - Visit production URL
   - Test all functionality
   - Check server logs in Netlify dashboard

3. **Verify Environment Variables**:
   - All variables are set correctly
   - No missing variables
   - Test endpoints work

---

## Part 7: User Sync to Inventory App (CRM)

### Overview

All user accounts (registered users and shadow users from guest checkout) are automatically synced to the inventory app for CRM tracking.

### How It Works

**When Users Are Synced:**
1. **User Registration** → User synced immediately
2. **Guest Checkout** → Shadow user created and synced
3. **User Updates** → Future: Sync on profile updates

**Data Synced:**
- Email
- Name (if available)
- User ID (from e-commerce site)
- Created date
- Is shadow user (guest checkout)
- Total orders count
- Total spent
- Loyalty points

### Implementation

The sync happens automatically in:
- `/api/auth/register` - Registered users
- `/api/orders` - Shadow users (guest checkout)

**Error Handling:**
- Sync failures don't block user registration or checkout
- Errors are logged but don't affect user experience
- Retry logic is built-in

### Inventory App Endpoint

**Endpoint**: `POST /syncUser` (must exist in inventory app)

**Request Format:**
```json
{
  "orgId": "coin-shack",
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "isShadowUser": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "totalOrders": 3,
  "totalSpent": 37497,
  "loyaltyPoints": 125
}
```

**No Configuration Needed:**
- Sync happens automatically
- Uses same inventory app API base URL
- Same error handling as pack sales sync

---

## Part 8: Production Environment Variables Summary

**Copy this list and fill in all values for Netlify:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG.your_production_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=your_admin@yourdomain.com

# FedEx
FEDEX_KEY=your_production_api_key
FEDEX_PASSWORD=your_production_secret
FEDEX_ACCOUNT_NUMBER=204375301
FEDEX_METER_NUMBER=your_meter_number
FEDEX_ENVIRONMENT=production
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US
FEDEX_DEFAULT_WEIGHT=1
FEDEX_DEFAULT_LENGTH=6
FEDEX_DEFAULT_WIDTH=4
FEDEX_DEFAULT_HEIGHT=2

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret

# Feature Flags (if using partial deployment)
NEXT_PUBLIC_ENABLE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=your_email@yourdomain.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222

# Inventory App API
COIN_INVENTORY_API_BASE_URL=https://us-central1-coin-inventory-8b79d.cloudfunctions.net

# Other
NODE_ENV=production
```

---

## Part 9: Final Production Checklist

### Environment Variables

- [ ] `DATABASE_URL` - Production database
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Production key
- [ ] `STRIPE_SECRET_KEY` - Production key
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret
- [ ] `SENDGRID_API_KEY` - Production key
- [ ] `FROM_EMAIL` - Authenticated domain email
- [ ] `ADMIN_EMAIL` - Admin notification email
- [ ] `FEDEX_KEY` - Production API key
- [ ] `FEDEX_PASSWORD` - Production secret
- [ ] `FEDEX_ACCOUNT_NUMBER` - Confirmed with FedEx
- [ ] `FEDEX_METER_NUMBER` - Received from FedEx
- [ ] `FEDEX_ENVIRONMENT=production`
- [ ] `NEXTAUTH_URL` - Production domain
- [ ] `NEXTAUTH_SECRET` - Strong random secret

### Configuration

- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook secret added
- [ ] SendGrid domain authenticated
- [ ] FedEx account linked and verified
- [ ] Database migrations run
- [ ] Custom domain configured
- [ ] SSL certificate active

### Testing

- [ ] Test payment with real card (small amount)
- [ ] Verify order creation
- [ ] Check customer email received
- [ ] Check admin email received
- [ ] Verify FedEx label generated
- [ ] Test tracking number works
- [ ] Verify inventory sync works
- [ ] Test user registration
- [ ] Test guest checkout
- [ ] Test authentication

### Security

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enabled
- [ ] Database credentials secure
- [ ] API keys rotated if needed
- [ ] Webhook signature verification enabled

---

## Part 8: Production Testing

### Test 1: Small Real Payment

1. **Use Real Card** (small amount, e.g., $1.00)
2. **Complete Checkout**:
   - Add test item
   - Complete payment
   - Verify order created
3. **Verify**:
   - Payment in Stripe dashboard
   - Order in database
   - Emails sent
   - FedEx label generated (if applicable)

### Test 2: Webhook Verification

1. **Check Stripe Dashboard**:
   - Go to: Developers → Webhooks
   - View webhook events
   - Verify `payment_intent.succeeded` received
2. **Verify Order Created**:
   - Check database for order
   - Verify order details correct

### Test 3: Email Deliverability

1. **Send Test Emails**:
   - Complete test order
   - Check customer email
   - Check admin email
2. **Verify**:
   - Emails not in spam
   - All details correct
   - Links work

### Test 4: FedEx Production

1. **Generate Test Label**:
   - Complete test order
   - Verify label generated
   - Check tracking number
2. **Verify**:
   - Label is valid
   - Tracking works in FedEx system
   - Charges to correct account

---

## Part 9: Monitoring & Maintenance

### Set Up Monitoring

1. **Error Tracking**:
   - Consider Sentry or similar
   - Monitor production errors
   - Set up alerts

2. **Logging**:
   - Check Netlify logs regularly
   - Monitor API errors
   - Track failed payments

3. **Uptime Monitoring**:
   - Use UptimeRobot or similar
   - Monitor site availability
   - Set up alerts

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review failed orders
- **Quarterly**: Rotate API keys
- **As Needed**: Update dependencies

---

## 🚨 Important Notes

### FedEx Account Numbers

**Action Required:**
1. **Contact FedEx Support**: 1-800-463-3339
2. **Ask**: Which account number to use in API calls
3. **Confirm**: Developer account (`740561073`) vs Shipping account (`204375301`)
4. **Get**: Meter number for production
5. **Verify**: Account linking is correct

**Likely Answer:**
- Use shipping account (`204375301`) for billing
- Developer account may be for API access only
- FedEx will clarify which to use

### Stripe Webhooks

**Critical for Production:**
- Without webhooks, orders may fail silently
- Frontend-only order creation is unreliable
- Webhooks provide automatic retry
- **Must be configured before going live**

### Domain Authentication

**For Email Deliverability:**
- Authenticate your domain in SendGrid
- Use emails from authenticated domain
- Prevents spam folder issues
- Required for production

---

## 📞 Support Contacts

- **FedEx Support**: 1-800-463-3339
- **Stripe Support**: https://support.stripe.com
- **SendGrid Support**: https://support.sendgrid.com
- **Netlify Support**: https://www.netlify.com/support

---

## ✅ Ready for Production?

Once you've completed all steps:

1. ✅ All environment variables set
2. ✅ All services configured
3. ✅ All tests passing
4. ✅ Webhooks working
5. ✅ Domain authenticated
6. ✅ Monitoring set up

**Then you're ready to go live!**

---

**Next Step**: Follow this guide step-by-step, then we'll test everything together.
