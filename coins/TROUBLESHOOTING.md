# Troubleshooting Guide

## Quick Reference

- **Order Creation Errors**: See "Order Creation Fails" section
- **FedEx Issues**: See "FedEx Label Fails" section
- **Email Issues**: See "Emails Not Received" section
- **Server Logs**: See "How to Find Server Logs" section
- **Build Errors**: See "Build Errors Explained" section
- **Complete Setup**: See `PRODUCTION_SETUP_GUIDE.md`
- **Testing**: See `COMPLETE_TESTING_GUIDE.md`

## Internal Server Error on Homepage

### Possible Causes:
1. **Database Connection Issue**
   - Check if `DATABASE_URL` is set correctly in `.env` or `.env.local`
   - Verify database is accessible

2. **API Route Error**
   - The `/api/series?featured=true` route might be failing
   - Check browser console for specific error messages
   - Check terminal/console for server-side errors

3. **Missing Environment Variables**
   - Ensure all required env vars are set
   - Check `.env` and `.env.local` files

### Fix Steps:

1. **Check Server Logs**
   - Look at the terminal where `npm run dev` is running
   - Look for error messages (usually in red)

2. **Test API Directly**
   - Open: `http://localhost:3000/api/series?featured=true`
   - See what error message appears

3. **Check Database Connection**
   - Verify `DATABASE_URL` in `.env` file
   - Test connection with: `npx prisma db pull`

4. **Clear Build Cache**
   ```powershell
   cd coins
   Remove-Item -Path .next -Recurse -Force
   npm run dev
   ```

## .env File Save Error

### The Error:
"Failed to save '.env': The content of the file is newer."

### Solution:

**Option 1: Reload File**
1. Close the `.env` tab
2. Right-click `.env` in file explorer
3. Click "Reload from Disk"
4. Make changes and save

**Option 2: Overwrite**
1. When error appears, click "Overwrite"
2. Your changes will be saved

**Option 3: Edit Outside Cursor**
1. Close `.env` tab in Cursor
2. Open `.env` in Notepad or another editor
3. Make changes and save
4. Reload in Cursor

### Why This Happens:
- File was modified outside Cursor
- OneDrive sync conflict
- Another process modified the file

## Quick Fixes

### Restart Server:
```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear cache and restart
cd coins
Remove-Item -Path .next -Recurse -Force
npm run dev
```

### Check Environment Variables:
```powershell
cd coins
# Check if .env exists
Test-Path .env
Test-Path .env.local
```

### Test Database:
```powershell
cd coins
npx prisma db pull
```

## Common Errors

### "Cannot find module"
- Run: `npm install`

### "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Verify database is running
- Check network/firewall

### "Port 3000 already in use"
- Stop other Node processes
- Or change port in `package.json`

---

## Order Creation Fails

### Error: "Payment succeeded but order creation failed"

This means the payment went through Stripe, but the order wasn't created in the database.

### Step 1: Check Server Logs

**Look at your terminal where `npm run dev` is running.**

You should see error messages like:
- `Error creating order: ...`
- `Series not found: ...`
- `Database error: ...`

**Copy the exact error message** - this will tell us what's wrong.

### Common Causes

#### 1. Series Not Found in Database

**Error**: `Series specialized_20260212_001 not found`

**Fix**: The series needs to be synced to the database. The code auto-syncs, but if it still fails:
- Check if series exists in inventory app
- Try syncing manually: Visit `/api/sync/series`
- Verify series ID format is correct

#### 2. Database Connection Issue

**Error**: `Database connection failed` or `Prisma error`

**Fix**:
- Check `DATABASE_URL` in `.env.local`
- Verify database is accessible
- Test connection: `npx prisma db pull`
- Check database logs

#### 3. Transaction Failed

**Error**: `Transaction failed` or `Database transaction error`

**Fix**:
- Check database connection
- Verify sufficient database resources
- Check for concurrent transactions
- Review database logs

#### 4. User Identification Issue

**Error**: `User identification required` or `Cannot identify user`

**Fix**:
- For logged-in users: Check session is valid
- For guest checkout: Verify shadow user creation
- Check NextAuth configuration

### Enhanced Error Logging

The order creation API now includes detailed error logging:
- Error message
- Stack trace
- Request body details
- Error codes

**Check server logs for these details** to identify the exact issue.

---

## How to Find Server Logs

### Step-by-Step Guide

#### Step 1: Locate Your Terminal

**Where to look:**
1. **In Cursor/VS Code**: Look at the bottom panel or terminal tab
2. **In PowerShell/Command Prompt**: The window where you ran `npm run dev`
3. **In Windows**: Check your taskbar for terminal windows

#### Step 2: Find the Running Server

**Look for:**
- Text showing: `npm run dev` or `next dev`
- URL like: `http://localhost:3000`
- Messages like: "Ready in X seconds"

#### Step 3: Look for Error Messages

**When you get an error, scroll up in that terminal and look for:**

```
Error creating order: [error message]
Error details: {
  message: "...",
  stack: "...",
  code: "..."
}
```

**Or look for:**
- Red text (errors are usually in red)
- Lines starting with "Error" or "Failed"
- Stack traces (long lines with file paths)

#### Step 4: Copy the Error

**Select and copy:**
- The entire error message
- The stack trace
- Any "Error details" object

#### Step 5: If You Can't Find It

**Option 1: Restart Server**
1. Stop the server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Try the order again
4. Watch the terminal for errors

**Option 2: Clear and Try Again**
1. Clear the terminal (clear command or close/reopen)
2. Restart server
3. Try order again
4. Errors will be fresh and easy to see

### What to Look For

**Common error patterns:**
- `Series not found`
- `Database error`
- `Transaction failed`
- `User identification required`
- `Insufficient packs`

**The error will tell us exactly what's wrong!**

### Quick Test

**To verify you can see logs:**
1. Make a small change to a file
2. Save it
3. You should see "Compiled successfully" in terminal
4. If you see that, you're looking at the right place!

---

## Build Errors Explained

### Why Are There So Many Build Errors?

**TypeScript compiles ALL code**, even if it's disabled at runtime by feature flags. Feature flags only control **runtime behavior**, not **compilation**.

### Feature Flags vs. TypeScript Compilation

**Feature Flags** (like `NEXT_PUBLIC_ENABLE_CHECKOUT=false`):
- ✅ Control what code **runs** at runtime
- ✅ Hide UI elements
- ✅ Redirect users
- ❌ **DO NOT** prevent TypeScript from checking the code
- ❌ **DO NOT** skip compilation of disabled features

**TypeScript Compiler**:
- ✅ Checks **ALL** `.ts` and `.tsx` files in your project
- ✅ Validates types, imports, and syntax
- ✅ Must pass before the build succeeds
- ❌ Doesn't know or care about feature flags

### Why This Happens

**Example Scenario:**

You have a checkout page that's disabled:

```tsx
// app/checkout/page.tsx
export default function CheckoutPage() {
  if (!isCheckoutEnabled()) {
    redirect('/contact'); // Runtime check
    return null;
  }
  // ... rest of checkout code
}
```

**What happens:**
1. ✅ TypeScript compiles this file (checks types, imports, etc.)
2. ✅ Build succeeds if types are correct
3. ✅ At runtime, feature flag redirects users away
4. ❌ If TypeScript finds errors, build fails **even though the page won't be used**

### Why We Can't Skip Compilation

**TypeScript doesn't support conditional compilation.** All files are compiled.

**Best approach:**
- ✅ Fix all TypeScript errors
- ✅ Code is ready when you enable features
- ✅ No surprises when flipping feature flags
- ✅ Better code quality overall

### Benefits of Fixing All Errors Now

1. **No Surprises Later**: When you enable checkout, code already works
2. **Better Code Quality**: Catches errors early
3. **Easier Testing**: Can test locally with features enabled
4. **Faster Feature Rollout**: Just flip the feature flag

---

## FedEx Label Fails

### Common Issues

1. **Invalid Credentials**
   - Check API key and secret
   - Verify account number
   - Confirm environment (test vs production)

2. **Missing Meter Number** (Production)
   - Contact FedEx to get meter number
   - Add to environment variables

3. **Account Number Mismatch**
   - Verify which account number to use
   - Check account linking in FedEx

4. **Address Validation Failed**
   - Verify shipping address format
   - Check address is complete
   - Test with known good address

### Fix Steps

1. **Check FedEx Credentials**:
   - Verify all environment variables are set
   - Test with FedEx test endpoint
   - Check FedEx dashboard for errors

2. **Verify Account Setup**:
   - Confirm account is active
   - Check API access is enabled
   - Verify account linking

3. **Test Label Generation**:
   - Use test endpoint: `/api/test-fedex`
   - Check server logs for errors
   - Verify label is generated

---

## Emails Not Received

### Common Issues

1. **Emails Going to Spam**
   - Authenticate domain in SendGrid
   - Use email from authenticated domain
   - Check spam folder

2. **SendGrid Not Configured**
   - Verify `SENDGRID_API_KEY` is set
   - Check API key is valid
   - Test SendGrid connection

3. **Email Address Issues**
   - Verify `FROM_EMAIL` is correct
   - Check `ADMIN_EMAIL` is set
   - Test email addresses

### Fix Steps

1. **Check SendGrid Configuration**:
   - Verify API key in environment variables
   - Test SendGrid connection
   - Check SendGrid dashboard for errors

2. **Domain Authentication**:
   - Authenticate domain in SendGrid
   - Use email from authenticated domain
   - Wait for verification (24-48 hours)

3. **Test Email Sending**:
   - Use test endpoint: `/api/test-email`
   - Check server logs
   - Verify email is sent

---

## Additional Quick Fixes

### Clear Build Cache
```powershell
cd coins
Remove-Item -Path .next -Recurse -Force
npm run dev
```

### Reinstall Dependencies
```powershell
cd coins
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json
npm install
```

### Reset Database Connection
```powershell
cd coins
npx prisma generate
npx prisma db push
```

### Check Environment Variables
```powershell
cd coins
# Check if files exist
Test-Path .env
Test-Path .env.local

# View (be careful with secrets)
Get-Content .env.local | Select-String "DATABASE_URL"
```
