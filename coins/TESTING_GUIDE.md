# Complete Testing Guide

Comprehensive guide for testing all features of the Shackpack e-commerce platform.

---

## 🚀 Quick Start

### 1. Start the Server

```bash
cd coins
npm run dev
```

**Wait for:** `Ready in X seconds` and `Local: http://localhost:3000`

### 2. Open Test Dashboard

Navigate to: `http://localhost:3000/test`

This dashboard allows you to test services without using the browser console.

---

## ✅ Pre-Testing Checklist

Before starting, verify your `.env.local` file has:

- [ ] **Feature Flags Enabled:**
  ```
  NEXT_PUBLIC_ENABLE_CHECKOUT=true
  NEXT_PUBLIC_ENABLE_ACCOUNTS=true
  NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true
  ```

- [ ] **Stripe Test Keys:**
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```

- [ ] **SendGrid Configuration:**
  ```
  SENDGRID_API_KEY=SG...
  FROM_EMAIL=noreply@shackpck.com
  FROM_NAME=Shackpack
  ADMIN_EMAIL=your_admin_email@example.com
  ```

- [ ] **FedEx Test Credentials:**
  ```
  FEDEX_API_KEY=l78a47d81574d34ab49087e6b2ebc99d10
  FEDEX_API_SECRET=012e30e3a69d4ecd933fee7bfdcbb320
  FEDEX_ACCOUNT_NUMBER=740561073
  FEDEX_ENVIRONMENT=test
  FEDEX_SHIPPER_NAME=Shackpack
  FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
  FEDEX_SHIPPER_CITY=Boca Raton
  FEDEX_SHIPPER_STATE=FL
  FEDEX_SHIPPER_POSTAL_CODE=33432
  FEDEX_SHIPPER_COUNTRY=US
  FEDEX_SHIPPER_PHONE=your_phone
  ```

- [ ] **Database Connected:** Check server logs for connection status

---

## 📋 Test Scenarios

### Test 1: Service Configuration Tests

**Location:** `http://localhost:3000/test`

#### 1.1 SendGrid Configuration
- Click "Test SendGrid Config"
- **Expected:** `configured: true`, `fromEmail: "noreply@shackpck.com"`

#### 1.2 Email Sending
- Enter your email address
- Click "Send Test Emails"
- **Expected:** Success message, check inbox for 2 emails (customer + admin)

#### 1.3 FedEx Configuration
- Click "Test FedEx Config"
- **Expected:** `configured: true`, `environment: "test"`

#### 1.4 FedEx Label Generation
- Click "Generate Test Label"
- **Expected:** Success with tracking number and label URL

---

### Test 2: Account Creation & Management

#### 2.1 User Registration
1. Navigate to: `http://localhost:3000/auth/register`
2. Fill in:
   - Email: `test@example.com` (use real email)
   - Password: `TestPassword123!`
   - Name: `Test User`
3. Click "Register"

**Expected Results:**
- ✅ Redirected to `/account` page
- ✅ User info displayed correctly
- ✅ User synced to inventory app

#### 2.2 User Login
1. Log out (if logged in)
2. Navigate to: `http://localhost:3000/auth/login`
3. Enter credentials from Test 2.1
4. Click "Sign In"

**Expected Results:**
- ✅ Successfully logged in
- ✅ Redirected to account page
- ✅ Session persists on refresh

#### 2.3 Account Page
1. Navigate to: `http://localhost:3000/account`
2. Check all sections

**Expected Results:**
- ✅ User information displays
- ✅ Order history section (empty initially)
- ✅ Saved addresses section (empty initially)

---

### Test 3: Shopping Cart

#### 3.1 Browse Series
1. Navigate to: `http://localhost:3000/series`
2. Browse available series
3. Click on a series to view details

**Expected Results:**
- ✅ Series list displays
- ✅ Series details page loads
- ✅ "Add to Cart" button visible

#### 3.2 Add to Cart
1. On any series page, click "Add to Cart"
2. Add multiple items (different series or quantities)
3. Click cart icon to view cart

**Expected Results:**
- ✅ Items appear in cart
- ✅ Quantities correct
- ✅ Prices calculated correctly
- ✅ Cart persists on page refresh

#### 3.3 Cart Management
1. In cart, try:
   - Update quantities
   - Remove items
   - Clear cart

**Expected Results:**
- ✅ All cart operations work
- ✅ Totals update correctly

---

### Test 4: Checkout Flow (Logged In User)

#### 4.1 Checkout with Saved Address
1. Log in with test account
2. Add items to cart
3. Go to checkout: `http://localhost:3000/checkout`
4. Check if saved address auto-loads (if exists from previous order)

**Expected Results:**
- ✅ Checkout page loads
- ✅ Saved address appears (if exists)
- ✅ Can select from saved addresses dropdown
- ✅ Payment form loads after address entered

#### 4.2 Complete Purchase (Logged In)
1. Fill in/verify shipping address:
   - Full Name: `Test User`
   - Address: `123 Test St`
   - City: `Boca Raton`
   - State: `FL`
   - ZIP: `33432`
   - Phone: `5551234567`
2. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`
3. Click "Pay"

**Expected Results:**
- ✅ Payment processes successfully
- ✅ Redirected to success page (`/checkout/success`)
- ✅ Order confirmation email received
- ✅ Admin notification email received
- ✅ Order appears in account order history
- ✅ Shipping address saved to account
- ✅ FedEx label generated (or fails gracefully if account not authorized)
- ✅ Order synced to inventory app

#### 4.3 Verify Order Details
1. Go to account page: `http://localhost:3000/account`
2. Check order history
3. View order details

**Expected Results:**
- ✅ Order appears in history
- ✅ Order details correct
- ✅ Tracking number displayed (if FedEx label generated)

---

### Test 5: Guest Checkout

#### 5.1 Guest Checkout Flow
1. **Log out** (important - must be logged out)
2. Add items to cart
3. Go to checkout: `http://localhost:3000/checkout`
4. Fill in:
   - Shipping address (same as Test 4.2)
   - Email address: `guest@example.com`
   - Name: `Guest User`
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment

**Expected Results:**
- ✅ Checkout works without account
- ✅ Payment processes successfully
- ✅ Redirected to success page
- ✅ Order confirmation email received
- ✅ Admin notification email received
- ✅ Shadow user created in database
- ✅ User synced to inventory app

#### 5.2 Guest Order Verification
1. Check admin panel or database for order
2. Verify shadow user was created

**Expected Results:**
- ✅ Order exists in database
- ✅ Shadow user created with correct email
- ✅ Order linked to shadow user

---

### Test 6: Address Management

#### 6.1 Save Address (First Order)
1. Log in with test account
2. Complete a purchase (from Test 4.2)
3. Go to account page after order

**Expected Results:**
- ✅ Address automatically saved after first order
- ✅ Address appears in account page
- ✅ Address marked as default

#### 6.2 Manage Addresses
1. Go to account page
2. Complete another order with different address
3. Check if new address is saved

**Expected Results:**
- ✅ Multiple addresses can be saved
- ✅ Default address maintained
- ✅ Addresses appear in checkout dropdown

#### 6.3 Update Address in Checkout
1. Go to checkout
2. Select a saved address
3. Modify the address fields
4. Wait 1 second (auto-save debounce)
5. Complete order

**Expected Results:**
- ✅ Address updates automatically (after 1 second)
- ✅ Updated address saved to account
- ✅ Order uses updated address

---

### Test 7: Email Delivery

#### 7.1 Order Confirmation Email
1. Complete a test order
2. Check email inbox

**Expected Results:**
- ✅ Order confirmation email received
- ✅ Email contains:
  - Order ID
  - Order total
  - Items purchased
  - Tracking number (if available)
  - Loyalty points earned

#### 7.2 Admin Notification Email
1. Complete a test order
2. Check admin email inbox

**Expected Results:**
- ✅ Admin notification email received
- ✅ Email contains:
  - Order details
  - Customer information
  - Shipping address
  - FedEx tracking (if available)

#### 7.3 Email Deliverability
1. Check spam folder
2. Verify sender is `noreply@shackpck.com`

**Expected Results:**
- ✅ Emails not in spam (if domain authenticated)
- ✅ Sender name shows as "Shackpack"

---

### Test 8: FedEx Label Generation

#### 8.1 Test Label Generation
1. Go to: `http://localhost:3000/test`
2. Click "Generate Test Label"

**Expected Results:**
- ✅ Label generated successfully
- ✅ Tracking number returned
- ✅ Label URL returned
- ✅ Can download label PDF

#### 8.2 Label in Order Flow
1. Complete a test order
2. Check order in database/admin panel

**Expected Results:**
- ✅ FedEx label generated (or fails gracefully)
- ✅ Tracking number saved to order
- ✅ Label URL saved to order
- ✅ Order status updated

**Note:** If account is not authorized, label generation will fail but order will still complete successfully.

---

### Test 9: Error Handling

#### 9.1 Invalid Payment
1. Go to checkout
2. Use declined test card: `4000 0000 0000 0002`
3. Try to complete payment

**Expected Results:**
- ✅ Payment error displayed
- ✅ Order not created
- ✅ User can retry with different card

#### 9.2 Empty Cart
1. Clear cart
2. Try to go to checkout

**Expected Results:**
- ✅ Redirected to home page
- ✅ Error message displayed

#### 9.3 Network Errors
1. Disconnect internet
2. Try to complete checkout

**Expected Results:**
- ✅ Error message displayed
- ✅ User can retry when connection restored

---

### Test 10: Inventory Sync

#### 10.1 User Sync
1. Create a new account or complete guest checkout
2. Check inventory app CRM

**Expected Results:**
- ✅ User appears in inventory app
- ✅ User data is correct
- ✅ Shadow users marked appropriately

#### 10.2 Order Sync
1. Complete a test order
2. Check inventory app for pack sales

**Expected Results:**
- ✅ Pack sales synced to inventory app
- ✅ Quantities correct
- ✅ Series IDs match

---

## 🎯 Quick Test Checklist

Use this for rapid testing:

- [ ] Server running (`npm run dev`)
- [ ] Test dashboard accessible (`/test`)
- [ ] SendGrid configured
- [ ] Email sending works
- [ ] FedEx configured
- [ ] FedEx label generation works
- [ ] Account registration works
- [ ] User login works
- [ ] Shopping cart works
- [ ] Checkout (logged in) works
- [ ] Guest checkout works
- [ ] Address management works
- [ ] Order emails received
- [ ] Orders appear in account
- [ ] Inventory sync working

---

## 📝 Test Results Summary

After completing all tests, document:

**Date:** _______________

**Passed:** ___ / ___

**Failed Tests:**
1. 
2. 
3. 

**Notes:**
- 

---

## 🔧 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 3000 is in use
- Verify `node_modules` installed: `npm install`
- Check for syntax errors in code

**Database connection errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check database is running
- Verify connection string format

**Stripe errors:**
- Verify test keys are correct
- Check keys start with `pk_test_` and `sk_test_`
- Ensure keys are in `.env.local`

**FedEx errors:**
- Verify credentials are correct
- Check `FEDEX_ENVIRONMENT=test`
- Ensure all shipper info is filled in

**Email not sending:**
- Verify `SENDGRID_API_KEY` is correct
- Check `FROM_EMAIL` is verified in SendGrid
- Check spam folder

---

## 🚀 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Re-test** failed scenarios
3. **Prepare for production:**
   - See `FEDEX_PRODUCTION_VALIDATION.md` for FedEx setup
   - See `PRODUCTION_SETUP_COMPLETE.md` for Stripe setup
   - See `PRODUCTION_READY_CHECKLIST.md` for complete checklist

---

**Last Updated:** January 2025
