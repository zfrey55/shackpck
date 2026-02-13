# Troubleshooting Guide

## Quick Reference

- **Order Creation Errors**: See "Order Creation Fails" below
- **FedEx Issues**: See "FedEx Label Fails" below
- **Email Issues**: See "Emails Not Received" below
- **Server Logs**: See `HOW_TO_FIND_SERVER_LOGS.md`
- **Complete Guide**: See `COMPLETE_GUIDE.md`

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
