# FedEx Label Generation Setup Guide

## Quick Reference

- **Current Configuration**: See "Current Configuration" section
- **Testing**: See "Testing FedEx Configuration" section
- **Production**: See "Production Setup" section
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Complete Guide**: See `COMPLETE_GUIDE.md`

---

## Overview

FedEx label generation is integrated into the order creation process. When an order is successfully paid, the system automatically:
1. Generates a FedEx shipping label
2. Emails the label to the admin
3. Stores the tracking number and label URL in the order

---

## Why Shipper Address is Required

**The shipper address is the "FROM" address on the shipping label.**

FedEx requires:
- **Shipper Address** (FROM): Your business address where packages ship from
- **Recipient Address** (TO): Customer's shipping address

This is standard for all shipping labels - you need to specify where the package originates.

---

## Meter Number Explained

**What is a Meter Number?**
- A unique identifier assigned by FedEx to your account
- Used for billing and tracking purposes
- Required for some FedEx services

**Do I Need It?**
- **For Testing (Sandbox)**: Usually optional - the API may work without it
- **For Production**: Usually required - FedEx will provide it when you activate your account

**Where to Find It:**
1. Check your FedEx Developer Portal account details
2. Contact FedEx support
3. May be in your FedEx business account dashboard
4. FedEx will provide it when you activate API access

**If You Don't Have It:**
- Testing should still work without it
- You'll need it before going to production
- Contact FedEx to get your meter number

---

## Current Configuration

Your FedEx credentials are configured in `.env.local`:

```env
# FedEx API Credentials
FEDEX_KEY=l78a47d81574d34ab49087e6b2ebc99d10
FEDEX_PASSWORD=l78a47d81574d34ab49087e6b2ebc99d10
FEDEX_ACCOUNT_NUMBER=204375301
FEDEX_METER_NUMBER=  # Add when you have it
FEDEX_ENVIRONMENT=test

# Shipper Information (Your Business Address)
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US
FEDEX_SHIPPER_PHONE=  # Add your phone number

# Package Defaults
FEDEX_DEFAULT_WEIGHT=1
FEDEX_DEFAULT_LENGTH=6
FEDEX_DEFAULT_WIDTH=4
FEDEX_DEFAULT_HEIGHT=2
```

---

## Testing FedEx Configuration

### Step 1: Check Configuration

**GET** `http://localhost:3000/api/test-fedex`

**Expected Response:**
```json
{
  "configured": true,
  "environment": "test",
  "hasKey": true,
  "hasPassword": true,
  "hasAccount": true,
  "hasMeter": false,  // Will be true when you add meter number
  "message": "FedEx is configured. Use POST to test label generation."
}
```

### Step 2: Test Label Generation

**POST** `http://localhost:3000/api/test-fedex`

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "Test Customer",
    "line1": "123 Test Street",
    "city": "Orlando",
    "state": "FL",
    "postalCode": "32801",
    "country": "US",
    "phone": "4071234567"
  },
  "weight": "1.0"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "trackingNumber": "1234567890",
  "labelUrl": "https://...",
  "message": "FedEx label generated successfully"
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": "Error message here",
  "details": { ... }
}
```

---

## Troubleshooting

### Error: "FedEx API credentials not configured"

**Fix:**
- Check `.env.local` has all required variables
- Restart server after adding variables
- Verify no typos in variable names

### Error: "Failed to authenticate with FedEx API"

**Fix:**
- Verify API key and secret are correct
- Check you're using test credentials (not production)
- Verify account number is correct
- Check FedEx API is accessible

### Error: "Invalid shipper address"

**Fix:**
- Verify all shipper fields are filled in `.env.local`
- Check address is valid
- Ensure state code is 2 letters (e.g., FL, CA, NY)
- Restart server after updating

### Error: "Meter number required"

**Fix:**
- Add `FEDEX_METER_NUMBER` to `.env.local`
- Contact FedEx if you don't have one
- For testing, this may be optional

### Label Generated But Invalid

**Fix:**
- Verify shipper address is correct
- Check recipient address is valid
- Ensure package weight/dimensions are reasonable
- Test with FedEx sandbox first

---

## Production Setup

### Before Going Live

1. **Get Production Credentials:**
   - Contact FedEx to activate production API access
   - Get production API key and secret
   - Get your meter number

2. **Update Environment Variables:**
   ```env
   FEDEX_ENVIRONMENT=production
   FEDEX_PRODUCTION=true
   FEDEX_KEY=your_production_key
   FEDEX_PASSWORD=your_production_secret
   ```

3. **Test with Real Address:**
   - Use a real shipping address
   - Verify label is generated
   - Check label is valid in FedEx system
   - Verify tracking number works

4. **Monitor First Orders:**
   - Check labels are generated
   - Verify tracking numbers work
   - Confirm labels are emailed
   - Test error handling

---

## How It Works

### Automatic Label Generation

1. **Order created** → Payment succeeds
2. **FedEx API called** → Generate label
3. **If successful:**
   - Label URL stored in order
   - Tracking number stored in order
   - Label emailed to admin
   - Status = `GENERATED`
4. **If failed:**
   - Error logged
   - Status = `PENDING` or `FAILED`
   - Admin notified via email
   - Can retry manually later

### Error Handling

- **Non-blocking**: Order still completes if FedEx fails
- **Logged**: All errors logged in server
- **Notified**: Admin emailed about failures
- **Retry**: Can regenerate label later

---

## API Endpoints Enabled

You mentioned you have:
- ✅ **Address Validation API** - Can be used to validate addresses before shipping
- ✅ **Ship API** - Used for label generation (currently implemented)

**Future Enhancements:**
- Address validation before checkout
- Rate calculation
- Service type selection

---

## Next Steps

1. ✅ **Credentials configured** - Done
2. ✅ **Shipper address added** - Done
3. ⏳ **Add phone number** - Update `FEDEX_SHIPPER_PHONE` in `.env.local`
4. ⏳ **Get meter number** - Contact FedEx if needed
5. ⏳ **Test configuration** - Use `/api/test-fedex`
6. ⏳ **Test with real order** - Complete checkout
7. ⏳ **Verify label generation** - Check admin email

---

**Ready to test! Start with the test endpoint, then complete a real order.**
