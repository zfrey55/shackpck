# 🚀 Setup Guide for Shackpck Coins Website

## Problem: Node.js Not Recognized

You just installed Node.js, but Windows hasn't loaded it yet. Here's how to fix it:

### Step 1: Restart Your Terminal
**IMPORTANT:** Close ALL PowerShell/Command Prompt/Terminal windows and open a NEW one.

OR

**Restart your computer** (this is the most reliable way to ensure Node.js is properly loaded)

### Step 2: Verify Node.js Installation

Open a **NEW** PowerShell window and run:
```powershell
node --version
npm --version
```

✅ You should see version numbers like `v20.x.x` and `10.x.x`  
❌ If you still see "not recognized", Node.js wasn't installed correctly

### Step 3: Install Node.js Correctly (if needed)

If Step 2 didn't work:

1. **Download Node.js** from: https://nodejs.org/
2. Choose the **LTS version** (Long Term Support) - the left button
3. Run the installer
4. **IMPORTANT:** Click "Next" through all options - keep ALL checkboxes checked
5. Restart your computer
6. Try Step 2 again

### Step 4: Install Project Dependencies

Once Node.js is working, navigate to your project:

```powershell
cd "C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins"
npm install
```

This will install all the required packages. It might take 2-5 minutes.

### Step 5: Start the Development Server

After installation is complete:

```powershell
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 6: View Your Website

Open your web browser and go to:
```
http://localhost:3000
```

Now you should see your website with:
- ✅ Navigation bar at the top
- ✅ All pages working (Home, Shop, Repacks, Checklist, Policy, Contact)
- ✅ No more errors

---

## Common Issues

### "npm is not recognized"
- **Solution:** You need to restart your terminal or computer after installing Node.js

### "Module not found" errors in code
- **Solution:** Run `npm install` in the `coins` folder

### Website doesn't update after making changes
- **Solution:** Save your files in VS Code/Cursor, the dev server auto-reloads
- If it still doesn't update, stop the server (Ctrl+C) and run `npm run dev` again

### Port 3000 is already in use
- **Solution:** Close other development servers or use: `npm run dev -- -p 3001`

---

## File Structure

Your website files are in:
```
C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins\
  ├── app/                 (All your pages)
  │   ├── page.tsx        (Home page)
  │   ├── repacks/        (Repacks page)
  │   ├── checklist/      (Checklist page)
  │   ├── policy/         (Policy page)
  │   ├── contact/        (Contact page)
  │   └── shop/           (Shop pages)
  ├── components/          (Reusable components)
  │   ├── NavBar.tsx      (Navigation bar)
  │   ├── Footer.tsx      (Footer)
  │   └── ...
  └── package.json        (Project dependencies)
```

---

## Need More Help?

If you're still having issues:
1. Make sure you downloaded Node.js from https://nodejs.org/
2. Make sure you chose the LTS version
3. Restart your computer (not just the terminal)
4. Open a NEW PowerShell window
5. Navigate to the coins folder: `cd "C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins"`
6. Run: `node --version` (should work now)
7. Run: `npm install`
8. Run: `npm run dev`

