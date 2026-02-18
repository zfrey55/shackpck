# Start Testing - Step-by-Step Guide

## 🎯 Quick Start

Follow these steps in order to test everything.

---

## Step 1: Verify Configuration

### 1.1 Update `.env.local`

Make sure these are set in `coins/.env.local`:

```env
# Feature Flags (ENABLE FOR TESTING)
NEXT_PUBLIC_ENABLE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true

# Email (Use your authenticated domain)
FROM_EMAIL=noreply@shackpck.com
FROM_NAME=Shackpack
ADMIN_EMAIL=your_admin_email@example.com
SENDGRID_API_KEY=SG.your_key_here

# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# FedEx Test Credentials
FEDEX_API_KEY=your_test_key
FEDEX_API_SECRET=your_test_secret
FEDEX_ACCOUNT_NUMBER=740561073
FEDEX_ENVIRONMENT=test
# ... all shipper info
```

### 1.2 Start the Server

```bash
cd coins
npm run dev
```

**Wait for:** `Ready in X seconds` and `Local: http://localhost:3000`

---

## Step 2: Test Each Service Individually

### 2.1 Test SendGrid (Email)

**Open in browser:**
```
http://localhost:3000/api/test-sendgrid
```

**Expected:**
- ✅ `configured: true`
- ✅ `fromEmail: "noreply@shackpck.com"`
- ✅ `isValidFormat: true`

**If not configured:**
- Check `SENDGRID_API_KEY` in `.env.local`
- Check `FROM_EMAIL` is set
- Restart server after changes

---

### 2.2 Test Email Sending

**Option A: Use Browser Console**

1. Open: `http://localhost:3000`
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ testEmail: 'your_test_email@example.com' })
})
.then(r => r.json())
.then(console.log)
```

**Option B: Use curl/PowerShell**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/test-email" -Method POST -ContentType "application/json" -Body '{"testEmail":"your_test_email@example.com"}'
```

**Expected:**
- ✅ `success: true`
- ✅ Check your email inbox for test emails
- ✅ Check admin email inbox

---

### 2.3 Test FedEx Configuration

**Open in browser:**
```
http://localhost:3000/api/test-fedex
```

**Expected:**
- ✅ `configured: true` (or `hasMeter: false` is OK for test)
- ✅ `environment: "test"`

**If not configured:**
- Check FedEx credentials in `.env.local`
- Verify `FEDEX_ENVIRONMENT=test`

---

### 2.4 Test FedEx Label Generation

**Use Browser Console:**

```javascript
fetch('/api/test-fedex', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shippingAddress: {
      fullName: 'Test User',
      line1: '123 Test St',
      city: 'Test City',
      state: 'FL',
      postalCode: '12345',
      country: 'US'
    }
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected:**
- ✅ `success: true` (or error if test environment has issues)
- ✅ `trackingNumber` returned
- ✅ `labelUrl` returned

**Note:** Test environment may have limitations. This is OK for testing.

---

## Step 3: Test Account Creation

### 3.1 Create a Test Account

1. **Go to:** `http://localhost:3000/auth/register`
2. **Fill in:**
   - Email: `test@example.com` (use a real email you can access)
   - Password: `password123`
   - Name: `Test User`
3. **Click "Register"**

**Expected:**
- ✅ Redirected to `/account`
- ✅ Account page shows user info
- ✅ Check server logs: "User synced to inventory app"

**Verify:**
- Check database: User exists with `isShadowUser: false`
- Check server logs for any errors

---

## Step 4: Test Stripe Payment Flow

### 4.1 Add Items to Cart

1. **Browse series:** `http://localhost:3000/series`
2. **Click "Add to Cart"** on any series
3. **Verify cart shows items**

### 4.2 Go to Checkout

1. **Click cart icon** → "Continue to Cart"
2. **Go to checkout:** `http://localhost:3000/checkout`

### 4.3 Complete Payment

1. **Fill in shipping address**
2. **Use Stripe test card:** `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
3. **Click "Pay"**

**Expected:**
- ✅ Payment succeeds
- ✅ Redirected to `/checkout/success`
- ✅ Order confirmation shown

**Verify:**
- Check Stripe Dashboard (test mode): Payment appears
- Check server logs: Order created
- Check database: Order exists
- Check emails: Order confirmation received

---

## Step 5: Test Guest Checkout

### 5.1 Log Out

1. **Go to account page**
2. **Click "Sign Out"**

### 5.2 Guest Checkout

1. **Add items to cart** (as guest)
2. **Go to checkout**
3. **Fill in:**
   - Email: `guest@example.com`
   - Name: `Guest User`
   - Shipping address
4. **Complete payment** with test card

**Expected:**
- ✅ Payment succeeds
- ✅ Shadow user created
- ✅ Order created
- ✅ Emails sent
- ✅ Check server logs: "Shadow user synced to inventory app"

**Verify:**
- Check database: Shadow user exists with `isShadowUser: true`
- Check database: Order exists
- Check emails: Both customer and admin emails received

---

## Step 6: Verify Everything

### 6.1 Check Database

**Verify:**
- ✅ Users created (registered and shadow)
- ✅ Orders created
- ✅ Order items correct
- ✅ Tracking numbers (if FedEx worked)

### 6.2 Check Emails

**Verify:**
- ✅ Customer emails received
- ✅ Admin emails received
- ✅ Emails not in spam
- ✅ All order details correct
- ✅ Tracking numbers in emails (if FedEx worked)

### 6.3 Check Stripe Dashboard

**Verify:**
- ✅ Payments appear in test mode
- ✅ Payment amounts correct
- ✅ Customer emails match

### 6.4 Check Server Logs

**Look for:**
- ✅ "Order created successfully"
- ✅ "User synced to inventory app"
- ✅ "Email sent successfully"
- ✅ "FedEx label generated" (if FedEx worked)
- ❌ Any errors (fix these before production)

---

## 🚨 Troubleshooting

### Features Not Working

**Check:**
- Feature flags are `true` in `.env.local`
- Server restarted after changing `.env.local`
- Browser cache cleared

### Stripe Payment Fails

**Check:**
- Using TEST keys (pk_test_ and sk_test_)
- Stripe Dashboard is in Test Mode
- Test card number is correct: `4242 4242 4242 4242`

### Emails Not Received

**Check:**
- SendGrid API key is correct
- `FROM_EMAIL=noreply@shackpck.com` is set
- Check spam folder
- Check SendGrid dashboard for errors

### FedEx Label Fails

**Check:**
- `FEDEX_ENVIRONMENT=test`
- All FedEx credentials are set
- Test environment may have limitations (this is OK)

### Order Creation Fails

**Check:**
- Database is connected
- Server logs for specific error
- Series exists in database or inventory app

---

## ✅ Testing Complete Checklist

- [ ] SendGrid configured and tested
- [ ] Emails sending correctly
- [ ] FedEx configured (test environment)
- [ ] Account creation works
- [ ] Stripe payments work (test mode)
- [ ] Registered user checkout works
- [ ] Guest checkout works
- [ ] Shadow users created correctly
- [ ] Orders created in database
- [ ] Emails received (customer and admin)
- [ ] Inventory sync working (check logs)
- [ ] No errors in server logs

---

## 🚀 Next Steps

Once all tests pass:

1. **Review server logs** for any warnings
2. **Fix any issues** found during testing
3. **Test edge cases:**
   - Multiple items in cart
   - Pack limit enforcement
   - Invalid payment cards
4. **Prepare for production:**
   - See `PRODUCTION_SETUP_GUIDE.md`
   - Set up production credentials
   - Configure webhooks
   - Set up monitoring

---

**Ready to start? Begin with Step 1!**
