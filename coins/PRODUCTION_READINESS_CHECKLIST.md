# Production Readiness Checklist

## Quick Reference

- **Use this checklist** before going live
- **Complete all items** before production
- **See**: `PRODUCTION_SETUP_GUIDE.md` for detailed steps
- **See**: `COMPLETE_GUIDE.md` for complete documentation

---

## 🎯 Quick Reference

Use this checklist to ensure everything is production-ready before going live.

---

## ✅ Part 1: FedEx Production

### Account Number Clarification

**You have two account numbers:**
- Developer Portal: `740561073` (API access)
- Shipping Account: `204375301` (billing)

**Action Required:**
- [ ] Contact FedEx Support: 1-800-463-3339
- [ ] Ask which account number to use in API calls
- [ ] Get meter number for account `204375301`
- [ ] Confirm account linking (if needed)

**Production Configuration:**
- [ ] `FEDEX_KEY` - Production API key (from developer portal)
- [ ] `FEDEX_PASSWORD` - Production secret (from developer portal)
- [ ] `FEDEX_ACCOUNT_NUMBER` - Confirmed with FedEx (likely `204375301`)
- [ ] `FEDEX_METER_NUMBER` - Received from FedEx
- [ ] `FEDEX_ENVIRONMENT=production`
- [ ] Shipper information complete (address, phone: `5618704222`)

**See**: `FEDEX_ACCOUNT_NUMBER_CLARIFICATION.md` for details

---

## ✅ Part 2: Stripe Production

### Current Status
- ✅ Test payments working
- ⚠️ Webhooks not configured (critical for production)

### Required Actions

**Step 1: Get Production Keys**
- [ ] Log into Stripe Dashboard (Live Mode)
- [ ] Copy production publishable key (`pk_live_...`)
- [ ] Copy production secret key (`sk_live_...`)
- [ ] Add to production environment variables

**Step 2: Set Up Webhooks (CRITICAL)**
- [ ] Create webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Listen to event: `payment_intent.succeeded`
- [ ] Copy webhook signing secret (`whsec_...`)
- [ ] Add `STRIPE_WEBHOOK_SECRET` to production environment
- [ ] Test webhook receives events

**Step 3: Configure Stripe Settings**
- [ ] Enable payment methods (Cards, Apple Pay, Google Pay)
- [ ] Update business information
- [ ] Configure email receipts (optional)

**Production Environment Variables:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # REQUIRED for production
```

**Why Webhooks are Critical:**
- Without webhooks, orders may fail if frontend fails
- Webhooks provide automatic retry
- More reliable at scale
- Industry standard for production

---

## ✅ Part 3: Database Production

### Required Actions
- [ ] Set up production PostgreSQL database (Supabase/Neon/Railway)
- [ ] Get production connection string
- [ ] Run migrations: `npx prisma db push`
- [ ] Verify connection works
- [ ] Test database operations

**Production Environment Variable:**
```env
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

---

## ✅ Part 4: Email (SendGrid) Production

### Required Actions
- [ ] Verify SendGrid account is active
- [ ] Authenticate your domain (recommended)
- [ ] Get production API key
- [ ] Update `FROM_EMAIL` to use authenticated domain

**Domain Authentication:**
- [ ] Add domain in SendGrid
- [ ] Add DNS records to your domain
- [ ] Wait for verification (24-48 hours)
- [ ] Verify domain status

**Production Environment Variables:**
```env
SENDGRID_API_KEY=SG.your_production_key
FROM_EMAIL=noreply@yourdomain.com  # Use authenticated domain
ADMIN_EMAIL=your_admin@yourdomain.com
```

**Why Domain Authentication:**
- Better email deliverability
- Prevents spam folder issues
- Professional sender reputation
- Required for production

---

## ✅ Part 5: Authentication (NextAuth) Production

### Required Actions
- [ ] Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Test authentication works

**Production Environment Variables:**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret
```

---

## ✅ Part 6: Deployment (Netlify) Production

### Required Actions
- [ ] Connect repository to Netlify
- [ ] Configure build settings
- [ ] Add ALL production environment variables
- [ ] Configure custom domain
- [ ] Verify SSL certificate active
- [ ] Test production build

**Environment Variables in Netlify:**
- Add all variables from Parts 1-5
- Never commit secrets to git
- Use Netlify's environment variable interface

---

## ✅ Part 7: Final Verification

### Pre-Launch Testing
- [ ] Test payment with real card (small amount)
- [ ] Verify order creation
- [ ] Check customer email received
- [ ] Check admin email received
- [ ] Verify FedEx label generated
- [ ] Test tracking number works
- [ ] Verify inventory sync works
- [ ] Test user registration
- [ ] Test guest checkout
- [ ] Test authentication

### Security Check
- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enabled
- [ ] Database credentials secure
- [ ] API keys not exposed
- [ ] Webhook signature verification enabled

### Monitoring Setup
- [ ] Error tracking configured (optional: Sentry)
- [ ] Logging set up
- [ ] Uptime monitoring (optional: UptimeRobot)
- [ ] Alerts configured

---

## 📋 Production Environment Variables Summary

**Copy this list and fill in all values:**

```env
# Database
DATABASE_URL=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# SendGrid
SENDGRID_API_KEY=
FROM_EMAIL=
ADMIN_EMAIL=

# FedEx
FEDEX_KEY=
FEDEX_PASSWORD=
FEDEX_ACCOUNT_NUMBER=
FEDEX_METER_NUMBER=
FEDEX_ENVIRONMENT=production
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Other
NODE_ENV=production
```

---

## 🚨 Critical Items (Must Do Before Launch)

1. **Stripe Webhooks** - REQUIRED for production reliability
2. **FedEx Meter Number** - REQUIRED for production labels
3. **Domain Authentication** - REQUIRED for email deliverability
4. **Production Database** - REQUIRED for data storage
5. **All Environment Variables** - REQUIRED for functionality

---

## 📞 Support Contacts

- **FedEx**: 1-800-463-3339
- **Stripe**: https://support.stripe.com
- **SendGrid**: https://support.sendgrid.com
- **Netlify**: https://www.netlify.com/support

---

## ✅ Ready for Production?

**Check all boxes above, then:**
1. Complete all required actions
2. Test everything in production
3. Monitor first few orders closely
4. Have rollback plan ready

**Then you're ready to go live!**

---

**Next Step**: Follow `PRODUCTION_SETUP_GUIDE.md` for detailed step-by-step instructions.
