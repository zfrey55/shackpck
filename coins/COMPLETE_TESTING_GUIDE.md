# Complete Testing Guide

## 🎯 Overview

This guide covers **all testing scenarios** for the Shackpack e-commerce site, including:
- Account creation (registered users)
- Guest checkout (shadow users)
- Stripe payments
- FedEx label generation
- Email notifications
- Order processing
- Inventory sync

---

## ✅ Pre-Testing Checklist

Before starting, verify:

- [ ] Server is running: `npm run dev`
- [ ] Database is connected (check server logs)
- [ ] Stripe test keys are in `.env.local`
- [ ] SendGrid API key is in `.env.local`
- [ ] FedEx credentials are in `.env.local`
- [ ] Test series exists in database or inventory app

---

## 📋 Test Scenarios

### Test 1: Create Account (Registered User)

**Steps:**
1. Go to: `http://localhost:3000/auth/register`
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
3. Click "Register"
4. Should redirect to `/account`

**Expected Results:**
- ✅ Account created successfully
- ✅ User logged in automatically
- ✅ Redirected to account page
- ✅ User synced to inventory app (check server logs)

**Verify:**
- Check database: User exists with `isShadowUser: false`
- Check server logs: "User synced to inventory app"
- Check inventory app: User should appear in CRM

---

### Test 2: Guest Checkout (Shadow User)

**Steps:**
1. **Don't log in** - stay as guest
2. Add items to cart
3. Go to checkout: `http://localhost:3000/checkout`
4. Fill in shipping address
5. Fill in email and name (for guest)
6. Complete payment with test card: `4242 4242 4242 4242`
7. Complete order

**Expected Results:**
- ✅ Payment succeeds
- ✅ Order created
- ✅ Shadow user created (if email doesn't exist)
- ✅ Shadow user synced to inventory app
- ✅ Customer email sent
- ✅ Admin email sent
- ✅ FedEx label generated (if configured)

**Verify:**
- Check database: Order exists
- Check database: Shadow user exists with `isShadowUser: true`
- Check email inbox: Order confirmation received
- Check admin email: Order notification received
- Check Stripe dashboard: Payment appears
- Check inventory app: Shadow user appears in CRM

---

### Test 3: Registered User Checkout

**Steps:**
1. Log in with account from Test 1
2. Add items to cart
3. Go to checkout
4. Shipping address should be pre-filled (if saved)
5. Complete payment
6. Complete order

**Expected Results:**
- ✅ Free shipping (logged-in users)
- ✅ Payment succeeds
- ✅ Order created
- ✅ Customer email sent
- ✅ Admin email sent
- ✅ FedEx label generated
- ✅ Loyalty points added

**Verify:**
- Check database: Order exists
- Check database: User loyalty points increased
- Check email: Order confirmation received
- Check Stripe dashboard: Payment appears

---

### Test 4: FedEx Label Generation

**Prerequisites:**
- FedEx credentials configured in `.env.local`
- Shipper address configured

**Steps:**
1. Complete any checkout (Test 2 or 3)
2. Check server logs for FedEx response
3. Check admin email for label link

**Expected Results:**
- ✅ FedEx label generated
- ✅ Tracking number in order
- ✅ Label URL in admin email
- ✅ Label downloadable

**Verify:**
- Check database: `fedexTrackingNumber` and `fedexLabelUrl` populated
- Check admin email: Label link works
- Check FedEx tracking: Tracking number works

**If FedEx Fails:**
- Order should still complete
- Error logged in server
- Admin notified in email
- Can retry label generation later

---

### Test 5: Email Notifications

**Test Customer Email:**
1. Complete an order
2. Check customer email inbox
3. Verify email contains:
   - Order number
   - Order items
   - Total amount
   - Shipping address
   - Tracking number (if FedEx worked)

**Test Admin Email:**
1. Complete an order
2. Check admin email inbox
3. Verify email contains:
   - Order number
   - Customer details
   - Order items
   - Shipping address
   - FedEx label link (if generated)
   - Tracking number

**Expected Results:**
- ✅ Customer email sent
- ✅ Admin email sent
- ✅ Emails not in spam
- ✅ All order details correct

---

### Test 6: Inventory Sync

**Test Pack Sale Push:**
1. Complete an order with specialized series
2. Check server logs for inventory push
3. Check inventory app for sale record

**Expected Results:**
- ✅ Pack sale pushed to inventory app
- ✅ Inventory updated (packs remaining decreased)
- ✅ Profit calculated in inventory app

**If Push Fails:**
- ✅ Retries automatically (3 times)
- ✅ Admin alerted (logged)
- ✅ Order still completes

---

### Test 7: Cart Functionality

**Test Adding Items:**
1. Browse series
2. Add to cart
3. Verify cart shows items
4. Adjust quantities
5. Remove items

**Expected Results:**
- ✅ Items added to cart
- ✅ Quantities update correctly
- ✅ Cart persists (localStorage)
- ✅ Cart dropdown works

---

### Test 8: Series Display

**Test Featured Series:**
1. Go to homepage
2. Verify featured series displays
3. Check:
   - Series name
   - Price
   - Packs remaining
   - Top hits
   - Images

**Test Series Detail Page:**
1. Click "Learn More" or series name
2. Verify:
   - Full description
   - Top hits with descriptions
   - Full checklist
   - "Buy Now" button

**Expected Results:**
- ✅ Series data loads from inventory app
- ✅ All information displays correctly
- ✅ Images load properly

---

## 🔍 Verification Steps

### Check Database

**Using Prisma Studio:**
```bash
npx prisma studio
```

**Check:**
- Users table: Registered and shadow users
- Orders table: All orders
- OrderItems table: Order line items
- Series table: Series data

### Check Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. Verify:
   - Payment intents created
   - Payments succeeded
   - Customers created
   - Amounts correct

### Check Server Logs

**Look for:**
- ✅ "Order created successfully"
- ✅ "User synced to inventory app"
- ✅ "FedEx label generated"
- ✅ "Email sent successfully"
- ❌ Any error messages

### Check Email Inboxes

- Customer email: Order confirmation
- Admin email: Order notification with label

---

## 🐛 Common Issues

### Order Creation Fails

**Symptoms:** "Payment succeeded but order creation failed"

**Fix:**
1. Check server logs for exact error
2. Verify series exists in database
3. Check database connection
4. See `DEBUG_ORDER_CREATION.md`

### FedEx Label Fails

**Symptoms:** No tracking number, label not generated

**Fix:**
1. Check FedEx credentials in `.env.local`
2. Verify shipper address is correct
3. Check server logs for FedEx error
4. Test with `/api/test-fedex` endpoint

### Emails Not Received

**Symptoms:** No confirmation emails

**Fix:**
1. Check SendGrid API key in `.env.local`
2. Check spam folder
3. Verify `FROM_EMAIL` is correct
4. Check server logs for email errors

### Inventory Sync Fails

**Symptoms:** Packs not updating in inventory app

**Fix:**
1. Check inventory app API is accessible
2. Verify `recordPackSale` endpoint exists
3. Check server logs for push errors
4. Verify series ID matches

---

## 📊 Test Results Template

Use this to track your testing:

```
Test Date: ___________
Tester: ___________

Test 1: Account Creation
[ ] Pass [ ] Fail
Notes: ___________

Test 2: Guest Checkout
[ ] Pass [ ] Fail
Notes: ___________

Test 3: Registered User Checkout
[ ] Pass [ ] Fail
Notes: ___________

Test 4: FedEx Labels
[ ] Pass [ ] Fail
Notes: ___________

Test 5: Email Notifications
[ ] Pass [ ] Fail
Notes: ___________

Test 6: Inventory Sync
[ ] Pass [ ] Fail
Notes: ___________

Test 7: Cart Functionality
[ ] Pass [ ] Fail
Notes: ___________

Test 8: Series Display
[ ] Pass [ ] Fail
Notes: ___________

Overall Status: [ ] Ready for Production [ ] Needs Fixes
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Review all test results**
2. **Fix any issues found**
3. **Re-test fixed issues**
4. **Document any known limitations**
5. **Prepare for production deployment**

**Before going to production, see:**
- `PRODUCTION_SETUP_GUIDE.md` - Complete production setup instructions
- `PRODUCTION_READINESS_CHECKLIST.md` - Quick checklist for production readiness

---

## 📚 Related Documentation

- `DEBUG_ORDER_CREATION.md` - Troubleshoot order errors
- `STRIPE_PAYMENT_FLOW_EXPLAINED.md` - Payment flow details
- `FEDEX_SETUP_GUIDE.md` - FedEx configuration
- `TROUBLESHOOTING.md` - General troubleshooting

---

**Ready to test? Start with Test 1 and work through each scenario!**
