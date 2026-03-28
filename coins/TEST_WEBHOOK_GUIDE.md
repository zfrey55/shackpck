# How to Test Your Stripe Webhook

Multiple ways to test your webhook endpoint and verify it's working.

---

## Method 1: Find "Send Test Webhook" Button

The button location can vary depending on your Stripe Dashboard view:

### Option A: From Webhook Endpoint Details

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. **Click on your webhook endpoint** (the URL, not just the list)
3. You should see the endpoint details page
4. Look for:
   - **"Send test webhook"** button (usually at the top right)
   - Or **"Test webhook"** button
   - Or a **"..."** menu with "Send test webhook" option

### Option B: From Recent Deliveries

1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Scroll to **"Recent deliveries"** section
3. Look for a **"Send test webhook"** button near the top of that section

### Option C: If You Don't See the Button

If you don't see a "Send test webhook" button, you might need to:
- Make sure you're in **Live mode** (not Test mode)
- Make sure the webhook endpoint is created and active
- Try refreshing the page

---

## Method 2: Use Stripe CLI (Recommended Alternative)

If you can't find the button, use Stripe CLI to test webhooks:

### Step 1: Install Stripe CLI

**Windows (PowerShell):**
```powershell
# Using Scoop (if you have it)
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
# Download the Windows .exe file
```

**Or use npm:**
```powershell
npm install -g stripe-cli
```

### Step 2: Login to Stripe CLI

```powershell
stripe login
```

This will open your browser to authorize the CLI.

### Step 3: Test Your Webhook

```powershell
# Test payment_intent.succeeded event
stripe trigger payment_intent.succeeded

# Or test with your specific webhook endpoint
stripe events resend evt_1234567890 --webhook-endpoint we_1234567890
```

**Note:** You'll need your webhook endpoint ID. Find it in Stripe Dashboard → Webhooks → Your endpoint (it's in the URL or endpoint details).

---

## Method 3: Make a Real Test Payment (Easiest)

The easiest way to test is to make an actual test payment, which will automatically trigger the webhook:

### Step 1: Go to Your Production Site

1. Open your live site in a browser
2. Add items to cart
3. Proceed to checkout

### Step 2: Use Stripe Test Card

Even in **Live mode**, you can use test cards for testing:

**Test Card:**
- **Card number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Step 3: Complete the Payment

1. Enter the test card details
2. Complete the purchase
3. This will automatically trigger the `payment_intent.succeeded` webhook

### Step 4: Check Webhook Delivery

1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Scroll to **"Recent deliveries"** section
3. You should see a new delivery for `payment_intent.succeeded`
4. Click on it to see:
   - ✅ Status: `200 OK` = Success
   - ✅ Response: `{"received": true}` = Webhook processed correctly

---

## Method 4: Check Webhook Endpoint Status

First, verify your webhook endpoint is set up correctly:

### Step 1: Verify Endpoint Exists

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Make sure you're in **Live mode** (toggle in top right)
3. You should see your webhook endpoint listed
4. If you don't see one, you need to create it first (see below)

### Step 2: Create Webhook Endpoint (If Needed)

If you don't have a webhook endpoint yet:

1. Click **"Add endpoint"** button
2. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
   **Replace `yourdomain.com` with your actual Netlify domain**
   
   To find your domain:
   - Go to Netlify Dashboard → Your site → **"Domain settings"**
   - Your primary domain is listed there
   
   Examples:
   - `https://yoursite.netlify.app/api/webhooks/stripe`
   - `https://www.yourdomain.com/api/webhooks/stripe`

3. Click **"Add endpoint"**

4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`

5. Click **"Add events"** or **"Save"**

6. Copy the **Signing secret** (starts with `whsec_...`)
   - Click on the endpoint
   - Find "Signing secret" section
   - Click "Reveal"
   - Verify it matches the `STRIPE_WEBHOOK_SECRET` you set in hosting (compare to Stripe’s revealed signing secret)

---

## Method 5: Use cURL to Test (Advanced)

If you want to manually test the webhook endpoint:

```powershell
# First, get a test event from Stripe
# Then send it to your endpoint

curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: your_signature_here" \
  -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}'
```

**Note:** This requires generating a proper Stripe signature, which is complex. Use Method 3 (test payment) instead.

---

## ✅ What Success Looks Like

After testing, you should see:

1. **In Stripe Dashboard → Webhooks → Recent deliveries:**
   - ✅ Status: `200 OK`
   - ✅ Response: `{"received": true}`
   - ✅ Event: `payment_intent.succeeded`
   - ✅ Green checkmark ✅

2. **In Your Application:**
   - ✅ Order is created in database
   - ✅ Confirmation email sent (if configured)
   - ✅ No errors in Netlify logs

3. **In Stripe Dashboard → Payments:**
   - ✅ Payment appears with status "Succeeded"

---

## 🔍 Troubleshooting

### "No webhook endpoint found"

**Solution:** Create the webhook endpoint first (Method 4, Step 2)

### "Webhook delivery failed" (400/500 error)

**Check:**
1. Webhook URL is correct (your production domain)
2. `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
3. Site was redeployed after adding environment variables
4. Check Netlify logs for errors

### "Signature verification failed"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` in Netlify matches Stripe Dashboard
2. Make sure there's no extra whitespace
3. Redeploy your site

### Can't find "Send test webhook" button

**Solution:** Use Method 3 (make a test payment) - it's the easiest and most reliable way to test.

---

## 🎯 Recommended Approach

**For quick testing, use Method 3:**
1. Make a test payment on your site
2. Check webhook delivery in Stripe Dashboard
3. Verify order was created

This is the most reliable way to test because it uses the exact same flow as real customers.

---

**Need help?** Check `VERIFY_STRIPE_LIVE.md` for complete verification steps.
