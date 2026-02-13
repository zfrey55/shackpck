# How to Find Server Error Logs

## Step-by-Step Guide

### Step 1: Locate Your Terminal

**Where to look:**
1. **In Cursor/VS Code**: Look at the bottom panel or terminal tab
2. **In PowerShell/Command Prompt**: The window where you ran `npm run dev`
3. **In Windows**: Check your taskbar for terminal windows

### Step 2: Find the Running Server

**Look for:**
- Text showing: `npm run dev` or `next dev`
- URL like: `http://localhost:3000`
- Messages like: "Ready in X seconds"

### Step 3: Look for Error Messages

**When you get the order creation error, scroll up in that terminal and look for:**

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

### Step 4: Copy the Error

**Select and copy:**
- The entire error message
- The stack trace
- Any "Error details" object

### Step 5: If You Can't Find It

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

---

## What to Look For

**Common error patterns:**
- `Series not found`
- `Database error`
- `Transaction failed`
- `User identification required`
- `Insufficient packs`

**The error will tell us exactly what's wrong!**

---

## Quick Test

**To verify you can see logs:**
1. Make a small change to a file
2. Save it
3. You should see "Compiled successfully" in terminal
4. If you see that, you're looking at the right place!

---

**Once you find the error, copy it and share it with me so we can fix it!**
