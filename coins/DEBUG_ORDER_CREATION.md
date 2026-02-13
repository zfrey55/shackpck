# Debug Order Creation Failure

## Error: "Payment succeeded but order creation failed"

This means the payment went through Stripe, but the order wasn't created in the database.

---

## Step 1: Check Server Logs

**Look at your terminal where `npm run dev` is running.**

You should see error messages like:
- `Error creating order: ...`
- `Series not found: ...`
- `Database error: ...`

**Copy the exact error message** - this will tell us what's wrong.

---

## Common Causes

### 1. Series Not Found in Database

**Error**: `Series specialized_20260212_001 not found`

**Fix**: The series needs to be synced to the database. I've updated the code to auto-sync, but if it still fails:
- Check if series exists in inventory app
- Try syncing manually: Visit `/api/sync/series` (if endpoint exists)

### 2. Database Connection Issue

**Error**: `P1000` or `Connection timeout`

**Fix**: 
- Check `DATABASE_URL` in `.env.local`
- Verify database is accessible
- Check Prisma can connect: `npx prisma studio`

### 3. Inventory Validation Failed

**Error**: `Insufficient inventory` or `Only X packs remaining`

**Fix**:
- Check series has available packs
- Verify `packsRemaining > 0` in database

### 4. Transaction Error

**Error**: `Transaction failed` or Prisma errors

**Fix**:
- Check database schema matches Prisma schema
- Run: `npx prisma db push` (if needed)
- Check for constraint violations

---

## Step 2: Check Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for errors** when you click "Complete Order"
4. **Copy any error messages**

---

## Step 3: Test Order Creation Directly

You can test the order creation API directly:

```bash
# Using PowerShell
$body = @{
  paymentIntentId = "pi_test_123"  # Use actual payment intent ID
  items = @(
    @{
      seriesId = "your-series-id"
      quantity = 1
      pricePerPack = 12499
      seriesName = "Test Series"
    }
  )
  shippingAddress = @{
    fullName = "Test User"
    line1 = "123 Test St"
    city = "Test City"
    state = "FL"
    postalCode = "12345"
    country = "US"
  }
  email = "test@example.com"
  name = "Test User"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/orders" -Method POST -ContentType "application/json" -Body $body
```

---

## Quick Fixes to Try

1. **Restart server**: Sometimes fixes transient issues
2. **Check database**: `npx prisma studio` - verify series exist
3. **Check server logs**: Look for specific error messages
4. **Verify payment intent**: Check Stripe dashboard for payment intent

---

**Next Step**: Check your server logs and share the exact error message you see.
