# Stripe Live Integration - Setup Complete ✅

All Stripe production credentials have been configured and are ready to upload.

---

## ✅ What's Been Set Up

### Environment Variables (Ready to Upload)

1. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Value: `(your publishable key from Stripe → Developers → API keys)`
   - Used by: Frontend checkout forms

2. **STRIPE_SECRET_KEY**
   - Value: `(your secret key from Stripe → Developers → API keys)`
   - Used by: Server-side API routes (payment intents, order processing)

3. **STRIPE_WEBHOOK_SECRET**
   - Value: `(your webhook signing secret from Stripe → Developers → Webhooks → your endpoint)`
   - Used by: Webhook endpoint verification

---

## 🚀 Upload to Netlify

### Option 1: Manual Upload via Netlify Dashboard (Easiest)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **"Site settings" → "Environment variables"**
4. Add these three variables (click "Add a variable" for each):

   **Variable 1:**
   - Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Value: `(your publishable key from Stripe → Developers → API keys)`

   **Variable 2:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `(your secret key from Stripe → Developers → API keys)`

   **Variable 3:**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `(your webhook signing secret from Stripe → Developers → Webhooks → your endpoint)`

5. Click **"Save"** for each variable

### Option 2: Automated Script (Requires Netlify CLI Login)

If you prefer using the CLI, first login manually:

```powershell
# From project root (where netlify.toml is)
cd C:\Users\zfrey\OneDrive\Desktop\Shackpck
netlify login
# This will open browser - complete login there

# Then run the script
.\coins\scripts\setup-stripe-production.ps1
```

### Option 2: Manual Upload via Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **"Site settings" → "Environment variables"**
4. Add these three variables:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Value: `(your publishable key from Stripe → Developers → API keys)`

   **Variable 2:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `(your secret key from Stripe → Developers → API keys)`

   **Variable 3:**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `(your webhook signing secret from Stripe → Developers → Webhooks → your endpoint)`

5. Click **"Save"** for each variable

### Option 3: Netlify CLI (Manual)

```powershell
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Link site (if not linked)
cd coins
netlify link

# Set variables
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "(your publishable key from Stripe → Developers → API keys)"
netlify env:set STRIPE_SECRET_KEY "(your secret key from Stripe → Developers → API keys)"
netlify env:set STRIPE_WEBHOOK_SECRET "(your webhook signing secret from Stripe → Developers → Webhooks → your endpoint)"
```

---

## ✅ Verify Webhook Endpoint

After uploading variables, verify your webhook endpoint in Stripe:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Make sure you're in **Live mode** (toggle in top right)
3. Find your webhook endpoint (should be: `https://yourdomain.com/api/webhooks/stripe`)
4. Click on it to view details
5. Verify:
   - ✅ Endpoint URL is correct
   - ✅ Signing secret matches: `(your webhook signing secret from Stripe → Developers → Webhooks → your endpoint)`
   - ✅ Events are selected: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

---

## 🔄 Redeploy Your Site

**IMPORTANT:** After adding environment variables, you must redeploy for changes to take effect.

### Via Netlify Dashboard:
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy" → "Deploy site"**

### Via CLI:
```powershell
netlify deploy --prod
```

---

## 🧪 Test the Integration

### 1. Test Payment Flow

1. Go to your production site
2. Add items to cart
3. Proceed to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
5. Complete the purchase
6. Verify:
   - ✅ Payment succeeds
   - ✅ Order is created
   - ✅ Confirmation email sent (if configured)

### 2. Check Stripe Dashboard

1. Go to [Stripe Dashboard → Payments](https://dashboard.stripe.com/payments)
2. Verify the payment appears
3. Check payment status is "Succeeded"

### 3. Check Webhook Delivery

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Check **"Recent deliveries"** section
4. Verify:
   - ✅ Latest delivery shows green checkmark ✅
   - ✅ Status is "Succeeded"
   - ✅ Response is 200 OK

### 4. Test Webhook Manually

1. In Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select event: `payment_intent.succeeded`
5. Click **"Send test webhook"**
6. Verify delivery succeeds

---

## 📋 Files Updated

- ✅ `env.production.template` - Contains all Stripe keys
- ✅ `scripts/setup-stripe-production.ps1` - Automated upload script
- ✅ `scripts/upload-env-to-netlify.ps1` - Updated with secret key
- ✅ `UPLOAD_ENV_TO_HOSTING.md` - Upload instructions

---

## 🔒 Security Notes

- ✅ All keys are stored in environment variables (not in code)
- ✅ Secret key is never exposed to frontend
- ✅ Webhook signature verification is enabled
- ✅ Production keys are separate from test keys

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook endpoint URL:**
   - Must be: `https://yourdomain.com/api/webhooks/stripe`
   - Must be accessible from internet (not localhost)

2. **Check environment variables:**
   - Verify all 3 variables are set in Netlify
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

3. **Check webhook logs:**
   - Go to Stripe Dashboard → Webhooks → Your endpoint
   - Check "Recent deliveries" for error messages

### Payment Intent Creation Fails

1. **Check `STRIPE_SECRET_KEY` is set:**
   - Must be production key (`sk_live_...`)
   - Must be set in Netlify environment variables

2. **Check API version:**
   - Code uses `apiVersion: '2024-06-20'`
   - This should work with current Stripe API

### Frontend Can't Create Payment Intent

1. **Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set:**
   - Must be production key (`pk_live_...`)
   - Must be accessible from frontend (starts with `NEXT_PUBLIC_`)

---

## ✅ Setup Checklist

- [ ] All 3 Stripe variables uploaded to Netlify
- [ ] Site redeployed after adding variables
- [ ] Webhook endpoint verified in Stripe Dashboard
- [ ] Webhook signing secret matches
- [ ] Test payment completed successfully
- [ ] Webhook delivery verified in Stripe Dashboard
- [ ] Order creation verified in database

---

## 🎉 You're Ready!

Your Stripe live integration is configured and ready to use. After uploading the variables and redeploying, you can start accepting real payments!

**Next Steps:**
1. Upload variables to Netlify (use script or manual method)
2. Redeploy your site
3. Test with a real payment
4. Monitor webhook deliveries

---

**Questions?** Check `STRIPE_PRODUCTION_SETUP.md` for detailed setup guide.
