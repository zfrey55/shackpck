# Stripe Production Setup - Complete Guide

Complete step-by-step guide for setting up Stripe in production with webhooks.

---

## 🎯 Overview

This guide walks you through setting up Stripe for production, including:
1. Getting production Stripe keys
2. Setting up webhooks (CRITICAL)
3. Configuring environment variables
4. Testing webhooks
5. Monitoring and maintenance

**Time Required:** 30-45 minutes

---

## 📋 Prerequisites

Before starting, you need:
- ✅ Production domain name (e.g., `yourdomain.com`)
- ✅ Production hosting (Netlify, Vercel, etc.)
- ✅ Stripe account (free to create)
- ✅ Access to your hosting provider's environment variables
- ✅ Access to Stripe Dashboard (may need 2FA for secret key)

---

## Step 1: Get Production Stripe Keys

### 1.1 Log into Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. **Switch to Live mode** (toggle in top right corner)
   - Should say "Live mode" (not "Test mode")
   - This is critical - test keys won't work in production

### 1.2 Get Your API Keys

1. Navigate to **Developers → API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

3. **Copy the Publishable key** - you can get this immediately
   - It's visible without verification

4. **Get the Secret key** - may require verification:
   - Click "Reveal" next to the Secret key
   - If prompted for verification:
     - **Phone/Tablet verification:** Enter your phone number or use authenticator app
     - **Set up 2FA:** Go to Account settings → Security → Two-factor authentication
     - If you don't have access, coordinate with the person who has the security key

**⚠️ Important:**
- Production keys start with `pk_live_` and `sk_live_` (not `pk_test_` or `sk_test_`)
- Never share your Secret key
- Never commit it to git
- Save both keys securely - you'll need them in Step 3

---

## Step 2: Set Up Webhook Endpoint (CRITICAL)

Webhooks are **essential** for production. They ensure:
- ✅ Orders are created even if user closes browser
- ✅ Failed payments are handled automatically
- ✅ Refunds are processed automatically
- ✅ Reliable order fulfillment

**Without webhooks, you risk losing orders if the user closes their browser before the redirect completes.**

### 2.1 Create Webhook Endpoint

1. In Stripe Dashboard (Live mode), go to **Developers → Webhooks**
2. Click **"Add endpoint"** button
3. Enter your production webhook URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
   **Replace `yourdomain.com` with your actual production domain**
   
   Example: If your domain is `shackpack.com`:
   ```
   https://shackpack.com/api/webhooks/stripe
   ```

4. Click **"Add endpoint"**

### 2.2 Select Events to Listen For

After creating the endpoint, you'll see a list of events. Select these:

**Required Events:**
- ✅ `payment_intent.succeeded` - When payment completes successfully
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `charge.refunded` - When refund is processed
- ✅ `payment_intent.canceled` - When payment is canceled

**How to select:**
- Click the checkbox next to each event
- Or type the event name in the search box and select it

5. Click **"Add events"** or **"Save"**

### 2.3 Get Webhook Signing Secret

1. After creating the endpoint, click on it to view details
2. Find the **"Signing secret"** section
3. Click **"Reveal"** to show the secret
4. Copy the secret (starts with `whsec_...`)

**⚠️ Important:**
- Save this secret immediately - you'll need it in Step 3
- You can click "Reveal" again later if needed
- This secret is different from your API keys
- It's used to verify webhooks are actually from Stripe

---

## Step 3: Configure Environment Variables

Add these to your production hosting environment (Netlify, Vercel, etc.).

### 3.1 For Netlify

1. Go to your Netlify Dashboard
2. Select your site
3. Go to **"Site settings" → "Environment variables"**
4. Click **"Add a variable"**
5. Add these three variables:

**Variable 1:**
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** `sk_live_...` (your secret key from Step 1)

**Variable 2:**
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** `pk_live_...` (your publishable key from Step 1)

**Variable 3:**
- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `whsec_...` (your webhook secret from Step 2)

6. Click **"Save"** for each variable

**⚠️ Important:**
- After adding variables, you **must redeploy your site** for changes to take effect
- Go to **"Deploys"** tab and click **"Trigger deploy" → "Deploy site"**

### 3.2 For Vercel

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **"Settings" → "Environment Variables"**
4. Add the same three variables as above
5. Select **"Production"** environment for each
6. Click **"Save"**

### 3.3 Important Notes

- ✅ Use **production** keys (`pk_live_`, `sk_live_`), NOT test keys
- ✅ The webhook secret is different from API keys
- ✅ Never commit these to git
- ✅ After adding variables, **redeploy your site**

---

## Step 4: Test Your Webhook

### 4.1 Test Using Stripe Dashboard (Easiest)

1. Go back to Stripe Dashboard → **"Developers" → "Webhooks"**
2. Click on your webhook endpoint
3. Click the **"Send test webhook"** button
4. Select event: `payment_intent.succeeded`
5. Click **"Send test webhook"**
6. Check the **"Recent deliveries"** section:
   - Should show a successful delivery (green checkmark ✅)
   - If it shows a red X, click on it to see the error

7. **Check your server logs:**
   - Go to your hosting provider's logs (Netlify Functions, Vercel Logs, etc.)
   - Look for webhook processing logs
   - Verify the webhook was received

### 4.2 Verify in Your Application

1. Make a test purchase on your site
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete the payment
4. **Close browser immediately after payment** (to test webhook)
5. Check your database/orders - the order should still be created (webhook processed it)

---

## Step 5: Monitor Webhooks

### 5.1 Set Up Email Notifications

1. In Stripe Dashboard → **"Developers" → "Webhooks"**
2. Click on your endpoint
3. Enable **"Email notifications"** for webhook failures
4. Stripe will email you if webhooks fail

### 5.2 Regular Monitoring

**Check weekly:**
- Go to **"Developers" → "Webhooks"**
- Review recent deliveries
- Look for failed deliveries (red X)
- Investigate any failures

### 5.3 Webhook Retries

Stripe automatically retries failed webhooks:
- **Immediate:** 5 minutes
- **Then:** 1 hour
- **Then:** 6 hours
- **Then:** 12 hours
- **Then:** 24 hours

Your webhook endpoint should be **idempotent** (safe to process the same event multiple times).

---

## 🔒 Security: Webhook Signature Verification

Your webhook endpoint already verifies signatures automatically. This ensures:
- ✅ Webhooks are actually from Stripe
- ✅ Data hasn't been tampered with
- ✅ Replay attacks are prevented

**The code handles this automatically** - you just need to provide the `STRIPE_WEBHOOK_SECRET` (which you did in Step 3).

---

## 📊 Webhook Events Handled

Your webhook endpoint currently handles:

### `payment_intent.succeeded`
- **When:** Payment completes successfully
- **Action:** 
  - Creates/updates order in database
  - Generates FedEx shipping label
  - Sends order confirmation email
  - Updates user loyalty points
- **Fallback:** If client-side order creation fails, webhook ensures order is created

### `payment_intent.payment_failed`
- **When:** Payment fails (declined card, insufficient funds, etc.)
- **Action:** Logs failure (can be extended to send notifications)

### `charge.refunded`
- **When:** Refund is processed
- **Action:** Can be extended to update order status

### `payment_intent.canceled`
- **When:** Payment is canceled
- **Action:** Logs cancellation

---

## ⚠️ Common Issues & Solutions

### Issue: Webhook Not Receiving Events

**Check:**
1. ✅ Webhook endpoint URL is correct (matches your domain)
2. ✅ Endpoint is accessible (not behind firewall)
3. ✅ Events are selected in Stripe Dashboard
4. ✅ Webhook secret is correct in environment variables
5. ✅ Site has been redeployed after adding environment variables

### Issue: Webhook Signature Verification Fails

**Check:**
1. ✅ `STRIPE_WEBHOOK_SECRET` is set correctly
2. ✅ Secret matches the one in Stripe Dashboard
3. ✅ No extra whitespace in secret (copy carefully)
4. ✅ Using the correct secret for Live mode (not Test mode)

### Issue: Orders Not Created from Webhook

**Check:**
1. ✅ Webhook endpoint is processing events (check logs)
2. ✅ Check server logs for errors
3. ✅ Verify database connection
4. ✅ Check order creation logic in webhook handler

### Issue: "No signature" Error

**Check:**
1. ✅ Webhook is being sent to correct endpoint
2. ✅ Stripe is sending the webhook (check Stripe Dashboard)
3. ✅ Your server is receiving the request

---

## ✅ Production Checklist

Before going live, verify:

- [ ] Production Stripe keys obtained (`pk_live_`, `sk_live_`)
- [ ] Webhook endpoint created in Stripe Dashboard (Live mode)
- [ ] Webhook signing secret copied (`whsec_...`)
- [ ] Environment variables added to hosting provider
- [ ] Site redeployed after adding environment variables
- [ ] Webhook endpoint tested (using Stripe Dashboard)
- [ ] Webhook logs show successful deliveries
- [ ] Test order created via webhook
- [ ] Email notifications enabled for webhook failures

---

## 🚀 After Going Live

### First Week

1. **Monitor daily:**
   - Check Stripe Dashboard for webhook deliveries
   - Review server logs for errors
   - Verify orders are being created

2. **Test real payments:**
   - Make a small test purchase
   - Verify order is created
   - Check emails are sent

### Ongoing

1. **Weekly checks:**
   - Review webhook delivery success rate
   - Check for any failures
   - Monitor order creation

2. **Monthly review:**
   - Review Stripe Dashboard analytics
   - Check for any payment issues
   - Verify webhook reliability

---

## 📞 Support & Resources

- **Stripe Support:** https://support.stripe.com
- **Stripe Webhook Docs:** https://stripe.com/docs/webhooks
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## 🎯 Quick Reference

**Your Webhook Endpoint:**
```
https://yourdomain.com/api/webhooks/stripe
```

**Required Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Required Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `payment_intent.canceled`

---

**Last Updated:** January 2025
