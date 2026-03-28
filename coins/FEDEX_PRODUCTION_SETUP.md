# FedEx Production Setup - Complete Guide

Complete guide for setting up FedEx API for production after passing API validation.

---

## 🎯 Overview

This guide walks you through:
1. Understanding FedEx account structure
2. Passing API validation (label submission)
3. Getting production credentials
4. Configuring production environment
5. Testing production labels

**Prerequisites:** You must pass FedEx API validation before using production credentials.

---

## 📋 Part 1: Understanding FedEx Accounts

### Account Types

You have two FedEx account numbers:

1. **Developer Portal Account:** `740561073`
   - Used for API access and authentication
   - This is your developer/test account

2. **Production Shipping Account:** `204375301`
   - Your actual billing/shipping account
   - Where shipping charges are billed
   - Used for production shipping

### Which Account to Use

**For Production API:**
- Use your **Production Shipping Account** (`204375301`)
- FedEx will link your API access to this account
- This is where charges will be billed

**Important:** Contact FedEx support to confirm account linking and get your Meter Number.

---

## 📋 Part 2: API Validation Process

Before using production credentials, you must pass FedEx's API validation.

### Step 1: Generate Test Labels

1. **Use test credentials** (current setup)
2. **Generate test labels:**
   - Go to `http://localhost:3000/test`
   - Select **ZPLII** format
   - Generate a test label
   - Print the label

3. **Print Requirements:**
   - Print at 300 DPI minimum (your Zebra ZD 421 is fine)
   - Use 4x6 inch labels
   - Ensure barcodes are clear and scannable

### Step 2: Scan Labels

1. **Scan the printed label:**
   - Use a scanner set to **600 DPI minimum**
   - Save as PDF or TIFF
   - Ensure barcode is clear and scannable

2. **Label Quality Requirements:**
   - Barcodes must scan correctly
   - Text must be clear and readable
   - No defects, smudging, or distortion
   - Label must be exactly 4x6 inches

### Step 3: Submit to FedEx

1. **Go to FedEx Developer Portal:**
   - https://developer.fedex.com
   - Log in with your developer account

2. **Move Project to Production:**
   - Find your project
   - Click "Move to Production" or "Request Production Access"
   - Follow the prompts

3. **Add Production Account:**
   - Add your production account number: `204375301`
   - Link it to your project

4. **Get Production Client ID:**
   - After approval, you'll get a new Client ID
   - This is different from your test Client ID

5. **Submit Labels:**
   - Fill out the Label Cover Sheet (provided by FedEx)
   - Email scanned labels to: `label@fedex.com`
   - Include required information:
     - Your account number
     - Project information
     - Label images (scanned at 600 DPI)

6. **Wait for Approval:**
   - FedEx reviews labels (3-5 business days)
   - You'll receive email notification
   - Once approved, you can use production credentials

---

## 📋 Part 3: Get Production Credentials

After passing validation, get your production credentials:

### Step 1: Get Production Client ID and Secret

1. **Go to FedEx Developer Portal:**
   - https://developer.fedex.com
   - Log in with your developer account

2. **Navigate to your Production Project:**
   - Find your project (should now be in "Production")
   - Click on it

3. **Get Credentials:**
   - **Client ID** (API Key) - starts with `l7a...` or similar
   - **Client Secret** (API Secret) - provided after approval
   - Copy both - you'll need them in Step 4

### Step 2: Get Meter Number

1. **Contact FedEx Support:**
   - Call: 1-800-463-3339
   - Or contact your FedEx account representative
   - Request your **Meter Number** for account `204375301`

2. **Meter Number:**
   - Required for production API calls
   - Unique to your account
   - Usually 9 digits

### Step 3: Confirm Account Number

**Use your Production Shipping Account:**
- Account Number: `204375301`
- This is where charges will be billed
- Confirm with FedEx that this is the correct account for production

---

## 📋 Part 4: Configure Production Environment

### Step 1: Update Environment Variables

Add these to your production hosting environment (Netlify, Vercel, etc.):

**For Netlify:**
1. Go to **Site settings → Environment variables**
2. Add/update these variables:

```env
# FedEx Production Credentials
FEDEX_KEY=l7a... (your production Client ID)
FEDEX_PASSWORD=... (your production Client Secret)
FEDEX_ACCOUNT_NUMBER=204375301
FEDEX_METER_NUMBER=... (your meter number)
FEDEX_ENVIRONMENT=production
# OR
FEDEX_PRODUCTION=true
```

**For Vercel:**
1. Go to **Settings → Environment Variables**
2. Add the same variables as above
3. Select **"Production"** environment

### Step 2: Update Shipper Information (If Needed)

Make sure your shipper information is correct:

```env
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US
```

### Step 3: Redeploy Your Site

**⚠️ Important:**
- After adding/updating environment variables, **redeploy your site**
- Go to **"Deploys"** tab and click **"Trigger deploy" → "Deploy site"**

---

## 📋 Part 5: Test Production Labels

### Step 1: Test Label Generation

1. **Go to your production site:**
   - Navigate to your test page (if available)
   - Or use the checkout flow

2. **Generate a test label:**
   - Use a real shipping address
   - Generate a label
   - Verify it's created successfully

3. **Check the label:**
   - Download and open the label
   - Verify it's 4x6 inches
   - Check barcode quality
   - Verify all information is correct

### Step 2: Verify in FedEx Dashboard

1. **Log into FedEx Ship Manager:**
   - https://www.fedex.com/en-us/shipping/ship-manager.html
   - Log in with your production account

2. **Check shipments:**
   - Look for the test shipment
   - Verify tracking number
   - Check label status

### Step 3: Test Real Shipment (Optional)

1. **Create a real test order:**
   - Use a real shipping address
   - Generate a label
   - Print and affix to package

2. **Ship the package:**
   - Drop off at FedEx location
   - Or schedule pickup
   - Verify tracking works

---

## ⚠️ Important Notes

### Account Number Confusion

You may see references to account `740561073` (developer account). For production:
- **Use account `204375301`** (production shipping account)
- This is where charges are billed
- Confirm with FedEx support if unsure

### Meter Number

- **Required for production** (optional for test)
- Get from FedEx support
- Unique to your account
- Usually 9 digits

### Environment Variable Names

Your code accepts multiple variable names:
- `FEDEX_KEY` or `FEDEX_API_KEY` (for Client ID)
- `FEDEX_PASSWORD` or `FEDEX_API_SECRET` (for Client Secret)
- `FEDEX_ENVIRONMENT=production` or `FEDEX_PRODUCTION=true`

---

## 🔒 Security

- ✅ Never commit FedEx credentials to git
- ✅ Use environment variables only
- ✅ Rotate credentials if compromised
- ✅ Monitor API usage in FedEx Developer Portal

---

## ⚠️ Common Issues

### Issue: "Invalid Credentials" Error

**Check:**
1. ✅ Using production Client ID and Secret (not test)
2. ✅ Account number is correct (`204375301`)
3. ✅ Meter number is set (required for production)
4. ✅ Environment is set to `production`

### Issue: "Account Not Linked" Error

**Check:**
1. ✅ Account number matches your production account
2. ✅ Account is linked in FedEx Developer Portal
3. ✅ Contact FedEx support to verify linking

### Issue: Labels Not Generating

**Check:**
1. ✅ All credentials are set correctly
2. ✅ Environment variables are deployed
3. ✅ Check server logs for errors
4. ✅ Verify API validation was passed

---

## ✅ Production Checklist

Before using production:

- [ ] API validation passed (labels submitted and approved)
- [ ] Production Client ID obtained
- [ ] Production Client Secret obtained
- [ ] Meter Number obtained from FedEx
- [ ] Account number confirmed (`204375301`)
- [ ] Environment variables set in hosting provider
- [ ] Site redeployed after adding variables
- [ ] Test label generated successfully
- [ ] Label verified (4x6 inches, clear barcode)

---

## 📞 Support & Resources

- **FedEx Developer Portal:** https://developer.fedex.com
- **FedEx Support:** 1-800-463-3339
- **FedEx Ship Manager:** https://www.fedex.com/en-us/shipping/ship-manager.html
- **Label Validation Email:** label@fedex.com

---

## 🎯 Quick Reference

**Production Account Number:**
```
204375301
```

**Required Environment Variables:**
```env
FEDEX_KEY=l7a... (production Client ID)
FEDEX_PASSWORD=... (production Client Secret)
FEDEX_ACCOUNT_NUMBER=204375301
FEDEX_METER_NUMBER=... (from FedEx support)
FEDEX_ENVIRONMENT=production
```

**Label Submission:**
- Email: `label@fedex.com`
- Format: PDF or TIFF
- Resolution: 600 DPI minimum
- Size: 4x6 inches

---

**Last Updated:** January 2025
