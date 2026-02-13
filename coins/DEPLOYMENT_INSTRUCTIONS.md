# Deployment Instructions

## 🚀 Ready to Deploy

Your code is ready! Follow these steps to push to live.

---

## Step 1: Initialize Git (If Not Already Done)

**If you don't have a git repository yet:**

```bash
cd coins
git init
git add .
git commit -m "Initial commit: Featured series display with feature flags"
```

**If you already have a git repository connected to Netlify:**
- Skip to Step 2

---

## Step 2: Connect to Your Repository

**Option A: Connect Existing Repository to Netlify**

1. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   git remote add origin YOUR_REPO_URL
   git branch -M main
   git push -u origin main
   ```

2. **In Netlify Dashboard:**
   - Go to your site
   - Site settings → Build & deploy
   - Connect to your repository
   - Netlify will auto-deploy on push

**Option B: Manual Deploy via Netlify CLI**

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd coins
   npm run build
   netlify deploy --prod
   ```

---

## Step 3: Set Environment Variables in Netlify

**Critical: Set these before deploying!**

1. **Go to**: Netlify Dashboard → Your Site → Site Settings → Environment Variables

2. **Add/Update these variables:**

```env
# Feature Flags (DISABLE checkout/accounts for now)
NEXT_PUBLIC_ENABLE_CHECKOUT=false
NEXT_PUBLIC_ENABLE_ACCOUNTS=false
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=false

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=your_email@example.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222

# Database (keep existing)
DATABASE_URL=your_production_database_url

# NextAuth (keep existing)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret

# Stripe (keep existing - even if disabled)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# SendGrid (keep existing)
SENDGRID_API_KEY=your_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=your_admin@yourdomain.com

# FedEx (keep existing - even if disabled)
FEDEX_KEY=your_key
FEDEX_PASSWORD=your_password
FEDEX_ACCOUNT_NUMBER=204375301
FEDEX_ENVIRONMENT=production
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US
```

---

## Step 4: Deploy

**If using Git (Recommended):**

```bash
cd coins
git add .
git commit -m "Deploy featured series display with feature flags"
git push
```

**Netlify will automatically:**
- Detect the push
- Build your site
- Deploy to production

**Watch the build in Netlify Dashboard** to ensure it succeeds.

---

## Step 5: Verify Deployment

**After deployment completes:**

1. **Visit your live site**
2. **Check**:
   - ✅ Featured series displays on homepage
   - ✅ "Buy Now" shows "Contact Us to Purchase"
   - ✅ "Add to Cart" shows "Contact Us to Purchase"
   - ✅ Account/Login links are hidden
   - ✅ Contact page works
   - ✅ Series detail pages load
   - ✅ Checklist pages work

---

## What's Deploying

### ✅ New Features:
- Featured series display (from inventory app)
- Series detail pages with full checklist
- Top hits display (1-5 coins)
- Series listing page
- Contact integration

### ❌ Disabled (Waiting):
- Account creation/login
- Shopping cart
- Checkout
- Payment processing
- Order management

**See**: `DEPLOYMENT_SUMMARY.md` for complete details

---

## Troubleshooting

### Build Fails

**Check**:
- All environment variables are set
- Database is accessible
- Node version matches (20+)

**Fix**:
- Check Netlify build logs
- Verify environment variables
- Test build locally: `npm run build`

### Site Shows Errors

**Check**:
- Environment variables are correct
- Database connection works
- API endpoints are accessible

**Fix**:
- Check Netlify function logs
- Verify database URL
- Test API endpoints

---

## Next Steps After Deployment

1. **Continue testing locally** with features enabled
2. **Test Stripe payments** in test mode
3. **Test FedEx labels** in sandbox
4. **Test email notifications**
5. **When ready**: Enable features by setting flags to `true`

---

**Ready? Follow the steps above and deploy!**
