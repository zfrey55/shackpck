# Quick Upload: Stripe Variables to Netlify

**Fastest way to upload your Stripe production variables.**

---

## 🚀 Quick Steps (2 minutes)

### 1. Go to Netlify Dashboard

Open: https://app.netlify.com

### 2. Select Your Site

Click on your site name

### 3. Go to Environment Variables

Click: **"Site settings"** → **"Environment variables"**

### 4. Add These 3 Variables

Click **"Add a variable"** for each:

#### Variable 1:
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** `(your publishable key from Stripe Dashboard)`

#### Variable 2:
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** `(your secret key from Stripe Dashboard)`

#### Variable 3:
- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `(the signing secret shown on your Stripe webhook endpoint)`

### 5. Save Each Variable

Click **"Save"** after adding each one

### 6. Redeploy Your Site

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Done!

Your Stripe integration is now live. Test it by making a purchase on your site.

---

## 🔍 Verify It Worked

1. **Check Netlify:**
   - Go to Site settings → Environment variables
   - Verify all 3 variables are listed

2. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Verify webhook endpoint is configured
   - Check signing secret matches: `(the signing secret shown on your Stripe webhook endpoint)`

3. **Test Payment:**
   - Make a test purchase on your site
   - Check Stripe Dashboard → Payments for the transaction

---

**That's it!** 🎉
