# Deploy to Live Environment

## 🚀 Quick Deployment Steps

### Step 1: Set Environment Variables in Netlify

1. **Go to**: Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. **Add/Update these variables**:

```env
# Feature Flags (DISABLE checkout/accounts for now)
NEXT_PUBLIC_ENABLE_CHECKOUT=false
NEXT_PUBLIC_ENABLE_ACCOUNTS=false
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=false

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=your_email@example.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222

# Keep all existing environment variables (database, etc.)
```

### Step 2: Commit and Push Changes

**If using Git:**

```bash
cd coins
git add .
git commit -m "Add featured series display with feature flags for partial deployment"
git push
```

**Netlify will auto-deploy** when you push to your main branch.

### Step 3: Verify Deployment

1. **Wait for Netlify build to complete** (check Netlify dashboard)
2. **Visit your live site**
3. **Verify**:
   - ✅ Featured series displays on homepage
   - ✅ "Buy Now" shows "Contact Us to Purchase"
   - ✅ Account/Login links hidden
   - ✅ Contact page works

---

## 📋 What's Deploying

### ✅ New Features:
- Featured series display
- Series detail pages
- Top hits display
- Full checklist
- Contact integration

### ❌ Disabled (Waiting):
- Account creation/login
- Shopping cart
- Checkout
- Payment processing

**See**: `DEPLOYMENT_SUMMARY.md` for complete details

---

## 🔄 After Deployment

### Continue Testing Locally:
- Keep features enabled in `.env.local` for testing
- Test account creation
- Test Stripe payments
- Test FedEx labels
- Test email notifications

### When Ready to Enable:
1. Update Netlify environment variables (set flags to `true`)
2. Redeploy
3. All features will be live!

---

**Ready? Set the environment variables in Netlify and push your changes!**
