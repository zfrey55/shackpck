# Complete Shackpack Guide

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Guide](#testing-guide)
3. [Production Setup](#production-setup)
4. [Troubleshooting](#troubleshooting)
5. [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account (for payments)
- FedEx API account (for shipping)
- SendGrid account (for emails)

### Installation
```bash
cd coins
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- Database connection string
- Stripe keys
- SendGrid API key
- FedEx credentials
- NextAuth configuration

### Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🧪 Testing Guide

### Pre-Testing Checklist
- [ ] Server running: `npm run dev`
- [ ] Database connected
- [ ] Stripe test keys configured
- [ ] SendGrid API key configured
- [ ] FedEx credentials configured (optional for testing)

### Test Scenarios

**Test 1: Account Creation**
- Register new user
- Verify account created
- Verify user synced to inventory app

**Test 2: Guest Checkout**
- Don't log in
- Add items to cart
- Complete checkout as guest
- Verify order created
- Verify emails sent

**Test 3: Registered User Checkout**
- Log in with account
- Add items to cart
- Complete checkout
- Verify free shipping
- Verify loyalty points added

**Test 4: FedEx Label Generation**
- Complete test order
- Check admin email for label
- Verify tracking number works

**Test 5: Email Notifications**
- Verify customer email received
- Verify admin email received
- Check emails not in spam

**Test 6: Inventory Sync**
- Complete order with specialized series
- Verify pack sale pushed to inventory app
- Verify inventory updated

### Finding Server Logs
**See**: `HOW_TO_FIND_SERVER_LOGS.md` for detailed instructions

**Quick version:**
1. Look at terminal where `npm run dev` is running
2. Scroll up to find error messages
3. Copy full error and stack trace

---

## 🏭 Production Setup

### Critical Items (Must Do Before Launch)

1. **Stripe Webhooks** (REQUIRED)
   - Create webhook endpoint in Stripe Dashboard
   - Get webhook signing secret
   - Add to production environment variables
   - **Why**: Without webhooks, orders may fail if frontend fails

2. **FedEx Meter Number** (REQUIRED)
   - Contact FedEx: 1-800-463-3339
   - Get meter number for account `204375301`
   - Confirm which account number to use in API calls

3. **Domain Authentication** (REQUIRED)
   - Authenticate your domain in SendGrid
   - Use email from authenticated domain
   - Better email deliverability

4. **Production Database** (REQUIRED)
   - Set up production PostgreSQL
   - Run migrations
   - Test connection

5. **All Environment Variables** (REQUIRED)
   - Configure all production variables
   - Never commit secrets to git

### Production Environment Variables

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
FEDEX_KEY=your_production_key
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

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret

# Feature Flags (for partial deployment)
NEXT_PUBLIC_ENABLE_CHECKOUT=true  # Set to false to disable
NEXT_PUBLIC_ENABLE_ACCOUNTS=true  # Set to false to disable
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true  # Set to false to disable
```

**See**: `PRODUCTION_SETUP_GUIDE.md` for complete step-by-step instructions

---

## 🐛 Troubleshooting

### Order Creation Fails

**Symptoms**: "Payment succeeded but order creation failed"

**Fix**:
1. Check server logs for exact error
2. Verify series exists in database
3. Check database connection
4. See `DEBUG_ORDER_CREATION.md` for details

### FedEx Label Fails

**Symptoms**: No tracking number, label not generated

**Fix**:
1. Check FedEx credentials in `.env.local`
2. Verify shipper address is correct
3. Check server logs for FedEx error
4. Test with `/api/test-fedex` endpoint

### Emails Not Received

**Symptoms**: No confirmation emails

**Fix**:
1. Check SendGrid API key in `.env.local`
2. Check spam folder
3. Verify `FROM_EMAIL` is correct
4. Check server logs for email errors

### Series Not Found

**Symptoms**: "Series not found" error

**Fix**:
1. Verify series exists in inventory app
2. Check series is synced to database
3. Verify series ID matches

**See**: `TROUBLESHOOTING.md` for more issues

---

## 🚀 Deployment

### Partial Deployment (Current)

**What's Deployed:**
- Featured series display
- Series detail pages
- Top hits display
- Full checklist
- Contact integration

**What's Disabled:**
- Account creation/login
- Shopping cart
- Checkout
- Payment processing

**Environment Variables for Live Site:**
```env
NEXT_PUBLIC_ENABLE_CHECKOUT=false
NEXT_PUBLIC_ENABLE_ACCOUNTS=false
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=false
NEXT_PUBLIC_CONTACT_EMAIL=your_email@example.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222
```

### Full Deployment (After Testing)

**When ready:**
1. Update environment variables:
   ```env
   NEXT_PUBLIC_ENABLE_CHECKOUT=true
   NEXT_PUBLIC_ENABLE_ACCOUNTS=true
   NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true
   ```
2. Complete production setup (see Production Setup section)
3. Redeploy

**See**: `DEPLOYMENT_SUMMARY.md` for complete deployment details

---

## 📞 Support Contacts

- **FedEx**: 1-800-463-3339
- **Stripe**: https://support.stripe.com
- **SendGrid**: https://support.sendgrid.com
- **Netlify**: https://www.netlify.com/support

---

## 📖 Additional Resources

- **Server Logs**: `HOW_TO_FIND_SERVER_LOGS.md`
- **Order Errors**: `DEBUG_ORDER_CREATION.md`
- **FedEx Setup**: `FEDEX_SETUP_GUIDE.md`
- **Payment Flow**: `STRIPE_PAYMENT_FLOW_EXPLAINED.md`
- **User Sync**: `USER_SYNC_TO_INVENTORY.md`

---

**This guide consolidates all essential information. For specific topics, see the referenced guides.**
