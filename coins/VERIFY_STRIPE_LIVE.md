# Verify Stripe Live Integration - Step by Step

Complete guide to verify your Stripe live integration is working correctly.

---

## ✅ Step 1: Verify Environment Variables in Netlify

### Check Variables Are Set

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **"Site settings" → "Environment variables"**
4. Verify these 3 variables exist:

   - ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (full value in Netlify only)
   - ✅ `STRIPE_SECRET_KEY` = `sk_live_...` (full value in Netlify only)
   - ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_...` (full value in Netlify only)

5. **Important:** Make sure you're looking at **Production** environment variables (not Preview or Deploy Preview)

---

## ✅ Step 2: Verify Webhook Endpoint in Stripe Dashboard

### 2.1 Check Webhook Endpoint Exists

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Switch to Live mode** (toggle in top right - should say "Live mode")
3. Go to **"Developers" → "Webhooks"**
4. You should see your webhook endpoint listed

### 2.2 Verify Webhook Endpoint URL

Your webhook endpoint should be:
```
https://yourdomain.com/api/webhooks/stripe
```

**Replace `yourdomain.com` with your actual Netlify domain.**

Common formats:
- `https://yoursite.netlify.app/api/webhooks/stripe`
- `https://www.yourdomain.com/api/webhooks/stripe`
- `https://yourdomain.com/api/webhooks/stripe`

**To find your domain:**
- Go to Netlify Dashboard → Your site → **"Domain settings"**
- Your primary domain is listed there

### 2.3 Verify Webhook Signing Secret

1. Click on your webhook endpoint in Stripe Dashboard
2. Find the **"Signing secret"** section
3. Click **"Reveal"** to show the secret
4. Verify it matches the value of `STRIPE_WEBHOOK_SECRET` in Netlify (reveal signing secret in Stripe and compare)

**If it doesn't match:**
- Copy the correct signing secret from Stripe
- Update `STRIPE_WEBHOOK_SECRET` in Netlify environment variables
- Redeploy your site

### 2.4 Verify Events Are Selected

Your webhook should listen for these events:

**Required:**
- ✅ `payment_intent.succeeded` - When payment completes
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `payment_intent.canceled` - When payment is canceled

**Optional (but recommended):**
- ✅ `charge.refunded` - When refund is processed

**To check/update:**
1. Click on your webhook endpoint
2. Scroll to **"Events"** section
3. Verify these events are listed
4. If missing, click **"Add events"** and select them

---

## ✅ Step 3: Test Webhook Endpoint

### 3.1 Test Using Stripe Dashboard (Easiest)

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"** button
3. Select event: `payment_intent.succeeded`
4. Click **"Send test webhook"**
5. Check the result:
   - ✅ **Green checkmark** = Webhook delivered successfully
   - ❌ **Red X** = Webhook failed (click to see error)

### 3.2 Check Webhook Delivery Logs

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Scroll to **"Recent deliveries"** section
3. You should see recent webhook attempts
4. Click on a delivery to see:
   - Request details
   - Response status (should be 200 OK)
   - Response body
   - Any errors

**What to look for:**
- ✅ Status: `200 OK` = Success
- ✅ Response: `{"received": true}` = Webhook processed correctly
- ❌ Status: `400`, `401`, `500` = Error (check response body for details)

---

## ✅ Step 4: Test Live Payment Processing

### 4.1 Test with Stripe Test Card

**⚠️ Important:** Even in live mode, you can use test cards for testing!

1. Go to your production site
2. Add items to cart
3. Proceed to checkout
4. Use Stripe test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/25`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `12345`)
5. Complete the purchase

### 4.2 Verify Payment in Stripe Dashboard

1. Go to [Stripe Dashboard → Payments](https://dashboard.stripe.com/payments)
2. Make sure you're in **Live mode**
3. You should see your test payment
4. Click on it to see details:
   - ✅ Status: "Succeeded"
   - ✅ Amount: Correct
   - ✅ Customer: Email/name from checkout

### 4.3 Verify Webhook Was Triggered

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Check **"Recent deliveries"** section
4. You should see a new delivery for `payment_intent.succeeded`
5. Verify:
   - ✅ Status: `200 OK`
   - ✅ Response: `{"received": true}`
   - ✅ Event: `payment_intent.succeeded`

### 4.4 Verify Order Was Created

**Check your database/order system:**
- Order should be created in your database
- Order confirmation email should be sent (if configured)
- Inventory should be updated (if configured)

**To check:**
- Look at your application's order management system
- Check database for new order records
- Check email inbox for confirmation (if configured)

---

## ✅ Step 5: Test Real Payment (Optional)

**⚠️ Only do this if you want to test with a real payment!**

1. Use a real credit card (you'll be charged)
2. Make a small test purchase ($1-5)
3. Verify payment appears in Stripe Dashboard
4. Verify webhook is triggered
5. Verify order is created

**Note:** You can refund the test payment in Stripe Dashboard if needed.

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events

**Problem:** Webhook shows no deliveries or all deliveries fail

**Solutions:**
1. **Check webhook URL is correct:**
   - Must be your production domain (not localhost)
   - Must be accessible from internet
   - Must be: `https://yourdomain.com/api/webhooks/stripe`

2. **Check environment variables:**
   - Verify `STRIPE_WEBHOOK_SECRET` is set in Netlify
   - Verify it matches Stripe Dashboard signing secret
   - Redeploy after updating variables

3. **Check Netlify logs:**
   - Go to Netlify Dashboard → Your site → **"Functions"** tab
   - Check for errors in webhook handler
   - Look for 400/500 errors

4. **Test webhook endpoint directly:**
   - Use Stripe Dashboard → Webhooks → Send test webhook
   - Check response in "Recent deliveries"

### Payment Intent Creation Fails

**Problem:** Frontend can't create payment intent

**Solutions:**
1. **Check `STRIPE_SECRET_KEY` is set:**
   - Must be in Netlify environment variables
   - Must be production key (`sk_live_...`)
   - Site must be redeployed after adding

2. **Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set:**
   - Must be accessible from frontend
   - Must be production key (`pk_live_...`)

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

### Webhook Returns 400/500 Error

**Problem:** Webhook delivery shows error status

**Solutions:**
1. **Check webhook signature verification:**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
   - Check Netlify logs for signature verification errors

2. **Check webhook handler code:**
   - Verify `/api/webhooks/stripe/route.ts` is deployed
   - Check for syntax errors or missing dependencies

3. **Check database connection:**
   - Verify `DATABASE_URL` is set in Netlify
   - Check database is accessible from Netlify

---

## ✅ Verification Checklist

Use this checklist to verify everything is working:

- [ ] All 3 Stripe environment variables are set in Netlify
- [ ] Site has been redeployed after adding variables
- [ ] Webhook endpoint exists in Stripe Dashboard (Live mode)
- [ ] Webhook URL is correct (your production domain)
- [ ] Webhook signing secret matches Netlify environment variable
- [ ] Required events are selected (`payment_intent.succeeded`, etc.)
- [ ] Test webhook delivery succeeds (200 OK)
- [ ] Test payment completes successfully
- [ ] Payment appears in Stripe Dashboard
- [ ] Webhook is triggered for test payment
- [ ] Order is created in database/system
- [ ] No errors in Netlify logs

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Test webhook delivery shows `200 OK` in Stripe Dashboard
2. ✅ Test payment completes successfully on your site
3. ✅ Payment appears in Stripe Dashboard → Payments
4. ✅ Webhook delivery appears in Stripe Dashboard → Webhooks
5. ✅ Order is created in your system/database
6. ✅ No errors in Netlify function logs

---

## 📞 Need Help?

If something isn't working:

1. **Check Netlify logs:**
   - Netlify Dashboard → Your site → **"Functions"** tab
   - Look for error messages

2. **Check Stripe webhook logs:**
   - Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
   - Click on failed deliveries to see error details

3. **Check browser console:**
   - Open DevTools (F12) on your site
   - Check Console and Network tabs for errors

4. **Review documentation:**
   - `STRIPE_PRODUCTION_SETUP.md` - Complete setup guide
   - `TROUBLESHOOTING.md` - Common issues and fixes

---

**Ready to test?** Start with Step 1 and work through each step!
