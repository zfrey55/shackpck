# How to Find the Server Terminal

## Quick Answer

The server terminal is the **window where you see messages like**:
- `npm run dev`
- `Ready in X seconds`
- `Local: http://localhost:3000`
- Error messages in red

---

## Where to Look

### Option 1: Check Your Open Windows

1. **Look at your taskbar** (bottom of screen)
2. **Find a terminal/PowerShell/Command Prompt window**
3. **Click on it** - you should see the server running

### Option 2: Check Cursor/VS Code

1. **Look at the bottom panel** in Cursor/VS Code
2. **Click the "Terminal" tab** (usually at the bottom)
3. **You should see** the server output there

### Option 3: Start a New Terminal (Easiest)

1. **Open Cursor/VS Code**
2. **Press**: `Ctrl + `` (backtick) - opens terminal
3. **Or**: View → Terminal
4. **Run**: `cd coins` then `npm run dev`
5. **Now you can see all the logs!**

---

## What You Should See

When the server is running, you'll see:

```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
- Ready in X seconds
```

**When you test FedEx**, you'll see error messages like:

```
FedEx OAuth Error: {
  status: 401,
  statusText: 'Unauthorized',
  error: { ... }
}
```

---

## If You Can't Find It

**Just start a new one:**

1. **Open Cursor/VS Code**
2. **Press `Ctrl + ``** (backtick key, above Tab)
3. **Type**: `cd coins`
4. **Press Enter**
5. **Type**: `npm run dev`
6. **Press Enter**

**Now you'll see all the logs!**

---

## Quick Test

**To verify you're looking at the right place:**

1. Make a small change to any file
2. Save it
3. You should see: `Compiled successfully` in the terminal
4. If you see that, you're looking at the right place!

---

## For FedEx Testing

**After you click "Generate Test Label" on the test page:**

1. **Look at the terminal** where `npm run dev` is running
2. **Scroll up** to see the error message
3. **Copy the error** and share it with me

The error will look like:
```
FedEx OAuth Error: {
  status: 401,
  error: { ... }
}
```

This tells us exactly what's wrong with the FedEx credentials!
