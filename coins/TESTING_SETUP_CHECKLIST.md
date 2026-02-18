# Testing Setup Checklist

## ✅ Quick Setup for Local Testing

### Step 1: Update `.env.local` with Test Configuration

Make sure your `coins/.env.local` file has these settings:

```env
# ============================================
# FEATURE FLAGS - ENABLE FOR TESTING
# ============================================
NEXT_PUBLIC_ENABLE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true

# ============================================
# DATABASE
# ============================================
DATABASE_URL=your_database_connection_string

# ============================================
# NEXTAUTH (Authentication)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# ============================================
# STRIPE TEST KEYS
# ============================================
# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# Webhook secret not needed for testing (optional)
STRIPE_WEBHOOK_SECRET=

# ============================================
# SENDGRID (Email)
# ============================================
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@shackpck.com
FROM_NAME=Shackpack
ADMIN_EMAIL=your_admin_email@example.com

# ============================================
# FEDEX TEST CREDENTIALS
# ============================================
# Get from: https://developer.fedex.com/
FEDEX_API_KEY=your_test_api_key
FEDEX_API_SECRET=your_test_secret
FEDEX_ACCOUNT_NUMBER=740561073
FEDEX_METER_NUMBER=
FEDEX_ENVIRONMENT=test

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

# ============================================
# INVENTORY APP API
# ============================================
COIN_INVENTORY_API_BASE_URL=https://us-central1-coin-inventory-8b79d.cloudfunctions.net

# ============================================
# CONTACT INFORMATION
# ============================================
NEXT_PUBLIC_CONTACT_EMAIL=your_email@example.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222
```

### Step 2: Verify Your Configuration

**Check each section:**

- [ ] **Feature Flags**: All set to `true` for testing
- [ ] **Database**: `DATABASE_URL` is set and working
- [ ] **Stripe**: Test keys are from Stripe Dashboard (test mode)
- [ ] **SendGrid**: API key is set, `FROM_EMAIL=noreply@shackpck.com`
- [ ] **FedEx**: Test credentials are set, `FEDEX_ENVIRONMENT=test`
- [ ] **NextAuth**: `NEXTAUTH_URL=http://localhost:3000`

### Step 3: Start the Development Server

```bash
cd coins
npm run dev
```

**Wait for:**
- ✅ "Ready in X seconds"
- ✅ "Local: http://localhost:3000"

### Step 4: Verify Server is Running

1. Open browser: `http://localhost:3000`
2. Check for errors in terminal
3. Verify homepage loads

---

## 🧪 Testing Order

Follow this order for systematic testing:

1. **Account Creation** (Test 1
2. **FedEx Label Generation** (Test 2)
3. **Stripe Payment Flow** (Test 3)
4. **End-to-End: Registered User Checkout** (Test 4)
5. **End-to-End: Guest Checkout** (Test 5)

---

## 📝 Notes

- **Stripe Test Cards**: Use `4242 4242 4242 4242` for successful payments
- **FedEx Test**: Uses sandbox environment, labels won't be real
- **Email**: Will send to actual email addresses (use test emails)
- **Database**: Make sure you're using a test database, not production

---

## 🚨 Common Issues

**If features are disabled:**
- Check feature flags are set to `true` in `.env.local`
- Restart server after changing `.env.local`

**If Stripe fails:**
- Verify you're using TEST keys (pk_test_ and sk_test_)
- Check Stripe Dashboard is in Test Mode

**If FedEx fails:**
- Verify `FEDEX_ENVIRONMENT=test`
- Check API credentials are correct
- Meter number not required for test environment

**If emails don't send:**
- Verify SendGrid API key is correct
- Check `FROM_EMAIL` is set correctly
- Check SendGrid dashboard for errors
