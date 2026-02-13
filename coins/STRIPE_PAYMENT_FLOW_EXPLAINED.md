# Stripe Payment Flow Explained

## Quick Reference

- **Current Flow**: See "Current Implementation" section
- **With Webhooks**: See "With Webhooks" section
- **Production Setup**: See `PRODUCTION_SETUP_GUIDE.md`
- **Complete Guide**: See `COMPLETE_GUIDE.md`

---

## Current Implementation (Without Webhooks)

### How It Works Now

1. **User fills checkout form** → Shipping address entered
2. **Payment intent created** → `/api/checkout/create-intent`
   - Creates Stripe Payment Intent
   - Returns `clientSecret` to frontend
3. **User enters payment details** → Card info in Stripe Elements
4. **Payment confirmed** → `stripe.confirmPayment()` called
   - Payment processed by Stripe
   - Returns `paymentIntent` object
5. **Order created immediately** → `/api/orders` called from frontend
   - Verifies payment intent status = 'succeeded'
   - Creates order in database
   - Sends emails
   - Generates FedEx label
   - Pushes to inventory app

### Flow Diagram

```
User → Checkout Form → Create Payment Intent → Enter Card → Confirm Payment
                                                                    ↓
                                                          Payment Succeeds
                                                                    ↓
                                            Frontend calls /api/orders
                                                                    ↓
                                    Verify Payment → Create Order → Send Emails
```

---

## With Webhooks (Recommended for Production)

### How It Would Work

1. **User completes payment** → Same as above
2. **Payment succeeds** → Stripe sends webhook to your server
3. **Webhook handler** → `/api/webhooks/stripe`
   - Verifies webhook signature
   - Creates order
   - Sends emails
   - Generates FedEx label
4. **Frontend** → Still creates order as backup
   - Or just redirects to success page

### Flow Diagram

```
User → Payment Succeeds → Stripe sends webhook
                                    ↓
                        Webhook handler creates order
                                    ↓
                        Frontend redirects to success
```

---

## Impact of Not Using Webhooks

### Current Approach (No Webhooks)

**Pros:**
- ✅ Simpler setup (no CLI needed for testing)
- ✅ Works immediately
- ✅ Order created right after payment
- ✅ Good for testing and small scale

**Cons:**
- ⚠️ **Relies on frontend** - if user closes browser, order might not create
- ⚠️ **No backup** - if API call fails, order might be lost
- ⚠️ **Race conditions** - payment succeeds but order fails
- ⚠️ **Not scalable** - at high volume, frontend calls might fail
- ⚠️ **No retry mechanism** - if order creation fails, no automatic retry

### With Webhooks

**Pros:**
- ✅ **Reliable** - Stripe retries if webhook fails
- ✅ **Backup** - Even if frontend fails, webhook creates order
- ✅ **Scalable** - Handles high volume better
- ✅ **Idempotent** - Can safely retry without duplicates
- ✅ **Production-ready** - Industry standard approach

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires webhook endpoint configuration
- ⚠️ Need to handle webhook signature verification

---

## Recommendation

### For Testing (Current)
- ✅ **Current approach is fine** - works well for testing
- ✅ No webhooks needed initially

### For Production
- ⚠️ **Should add webhooks** - for reliability and scale
- ⚠️ **Keep frontend order creation** - as backup/optimistic update
- ⚠️ **Handle duplicates** - check if order already exists before creating

---

## How to Check Stripe Dashboard

### View Payment Intents

1. **Go to**: https://dashboard.stripe.com/test/payments
2. **You'll see**:
   - All payment intents
   - Status (succeeded, failed, etc.)
   - Amount
   - Customer (if created)
   - Metadata

### View Customers

1. **Go to**: https://dashboard.stripe.com/test/customers
2. **You'll see**:
   - All customers created
   - Payment methods saved
   - Payment history

### View Events (Webhooks)

1. **Go to**: https://dashboard.stripe.com/test/events
2. **You'll see**:
   - All Stripe events
   - Webhook delivery status
   - Event details

### Check Specific Payment

1. **Find payment intent ID** (from your order or logs)
2. **Search in Stripe Dashboard**
3. **View details**:
   - Payment status
   - Amount
   - Customer
   - Shipping address
   - Metadata

---

## Current Payment Flow Details

### Step-by-Step

1. **Frontend**: User clicks "Complete Order"
2. **Frontend**: Calls `stripe.confirmPayment()`
3. **Stripe**: Processes payment
4. **Stripe**: Returns `paymentIntent` with status
5. **Frontend**: Checks `paymentIntent.status === 'succeeded'`
6. **Frontend**: Calls `/api/orders` with:
   - `paymentIntentId`
   - `items`
   - `shippingAddress`
   - `email`
   - `name`
7. **Backend**: Verifies payment intent with Stripe
8. **Backend**: Creates order in database
9. **Backend**: Sends emails
10. **Backend**: Generates FedEx label
11. **Backend**: Pushes to inventory app
12. **Frontend**: Redirects to success page

### What Happens if Order Creation Fails?

**Current behavior:**
- Payment is already processed (money taken)
- Order is NOT created
- User sees error message
- **Manual intervention needed** - admin must create order manually

**With webhooks:**
- Payment processed
- Webhook retries automatically
- Order eventually created
- More reliable

---

## Adding Webhooks (When Ready)

### Benefits
- Automatic retry on failure
- Backup order creation
- Better reliability
- Production-ready

### Setup Required
1. Install Stripe CLI (for local testing)
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Add webhook secret to `.env.local`
4. Configure production webhook in Stripe Dashboard

### Implementation
- Webhook creates order if frontend fails
- Frontend still creates order (optimistic)
- Check for duplicates before creating

---

**For now, the current approach works for testing. For production, we should add webhooks for reliability.**
