# Upload Environment Variables to Hosting Provider

Guide for uploading your production environment variables to your hosting provider.

---

## 📋 What You Have Ready

✅ **Stripe Publishable Key:** `(your publishable key from Stripe Dashboard)`

✅ **Stripe Webhook Secret:** `(your webhook signing secret from Stripe)`

⏳ **Stripe Secret Key:** Waiting for access (add when available)

---

## 🚀 Option 1: Netlify (Automated Script)

### Quick Upload Using Script

1. **Install Netlify CLI (if not already):**
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```powershell
   netlify login
   ```

3. **Link your site (if not already linked):**
   ```powershell
   cd coins
   netlify link
   ```
   - Select your site from the list
   - Or provide site name: `netlify link --name your-site-name`

4. **Run the upload script:**
   ```powershell
   cd coins
   .\scripts\upload-env-to-netlify.ps1
   ```

5. **When you get the secret key, add it:**
   ```powershell
   netlify env:set STRIPE_SECRET_KEY "sk_live_..."
   ```

6. **Redeploy:**
   ```powershell
   netlify deploy --prod
   ```

### Manual Upload to Netlify

1. **Go to Netlify Dashboard:**
   - https://app.netlify.com
   - Select your site

2. **Navigate to Environment Variables:**
   - Go to **"Site settings" → "Environment variables"**

3. **Add Variables:**
   - Click **"Add a variable"** for each variable
   - Add these two now:

   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Value:** `(your publishable key from Stripe Dashboard)`

   **Variable 2:**
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `(your webhook signing secret from Stripe)`

4. **When you get the secret key:**
   - Add **Variable 3:**
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_live_...` (your secret key)

5. **Redeploy:**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy" → "Deploy site"**

---

## 🚀 Option 2: Vercel

### Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   cd coins
   vercel link
   ```

4. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   # Paste: (your publishable key from Stripe Dashboard)
   
   vercel env add STRIPE_WEBHOOK_SECRET production
   # Paste: (your webhook signing secret from Stripe)
   
   # When you get the secret key:
   # vercel env add STRIPE_SECRET_KEY production
   # Paste: sk_live_...
   ```

### Using Vercel UI

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables:**
   - Go to **"Settings" → "Environment Variables"**

3. **Add Variables:**
   - Click **"Add New"** for each variable
   - Copy values from above
   - Select **"Production"** environment

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on latest deployment

---

## 📝 Environment File Template

I've created `env.production.template` with all your current values. This file:
- ✅ Contains your Stripe publishable key
- ✅ Contains your webhook secret
- ⏳ Has placeholder for secret key (add when you get it)
- 📋 Has placeholders for other variables (database, etc.)

**Location:** `coins/env.production.template`

---

## ✅ Current Status

**Ready to Upload Now:**
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `(your publishable key from Stripe Dashboard)`
- ✅ `STRIPE_WEBHOOK_SECRET` = `(your webhook signing secret from Stripe)`

**Add Later:**
- ⏳ `STRIPE_SECRET_KEY` = `sk_live_...` (when you get access)

---

## 🎯 Next Steps

1. **Upload current variables** to your hosting provider (using methods above)
2. **Redeploy your site** after adding variables
3. **When you get the secret key:**
   - Add `STRIPE_SECRET_KEY` to environment variables
   - Redeploy again
   - Test webhook

---

## 📞 Which Hosting Provider?

**Tell me which hosting provider you're using** (Netlify, Vercel, or other) and I can:
- Provide more specific instructions
- Help you upload the variables
- Create a custom script if needed

---

**Ready to upload?** Use the script or manual method above!
