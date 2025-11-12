# Series Management - Now Automated! 🎉

## ✅ Good News: No More Manual Updates!

Series are now **automatically generated** every week. You don't need to do anything!

---

## What Changed?

### Before:
- ❌ Manually add series every Monday
- ❌ Copy/paste templates
- ❌ Calculate dates by hand
- ❌ Risk of typos

### Now:
- ✅ **Fully automated**
- ✅ Series generate based on current date
- ✅ Zero maintenance required
- ✅ Always accurate

---

## How It Works

The system automatically:

1. **Calculates current week** based on today's date
2. **Generates 4 weeks ahead** (future series)
3. **Archives 52 weeks** of history (1+ year)
4. **Names series correctly** (Series 1, 2, 3, etc.)
5. **Marks active series** with green indicator

### On Monday Morning:
- New series automatically appears
- Old series stay in archive
- Nothing for you to do!

---

## Configuration

All settings in one place: `coins/app/checklist/page.tsx` (line 44)

```typescript
const SERIES_CONFIG = {
  startDate: new Date('2024-11-11'),  // First series Monday
  weeksAhead: 4,                       // How many weeks to show ahead
  archiveWeeks: 52,                    // Keep 1 year of history
  defaultCases: [ /* all 7 cases */ ]  // Which cases in each series
};
```

---

## When You Need to Change Settings

### Change Archive Length
Keep 2 years instead of 1 year:

```typescript
archiveWeeks: 104,  // 52 weeks × 2 years
```

### Show More Future Weeks
Show next 8 weeks instead of 4:

```typescript
weeksAhead: 8,
```

### Remove a Case Type
Edit the `defaultCases` array - remove any case you don't want in future series:

```typescript
defaultCases: [
  { id: 'shackpack', ... },
  { id: 'deluxe', ... },
  // Removed 'ignite' from all future series
]
```

### Reset Series Numbering
Start fresh from a new date:

```typescript
startDate: new Date('2024-12-01'),  // Series restart from Dec 1
```

---

## How to Edit Configuration

### Step 1: Open the file
```
coins/app/checklist/page.tsx
```

### Step 2: Find SERIES_CONFIG (line ~44)
Look for:
```typescript
const SERIES_CONFIG = {
  // Settings here
};
```

### Step 3: Change what you need
Update values, save file

### Step 4: Deploy
```bash
git add coins/app/checklist/page.tsx
git commit -m "Update series configuration"
git push origin main
```

Done! Site auto-deploys in 1-2 minutes.

---

## What Gets Auto-Generated

### Example (if today is Nov 12, 2024):

**Archive (52 weeks back):**
- Series from November 2023 onwards
- All old series still accessible

**Current Week:**
- Series 2 - November 2024 (Nov 11-17) 🟢 ← Active

**Future (4 weeks ahead):**
- Series 3 - November 2024 (Nov 18-24)
- Series 4 - November 2024 (Nov 25-Dec 1)
- Series 1 - December 2024 (Dec 2-8)
- Series 2 - December 2024 (Dec 9-15)

---

## Series Naming Logic

### Automatic Naming:
- **Week 1 of month:** "Series 1 - November 2024"
- **Week 2 of month:** "Series 2 - November 2024"
- **Week 3 of month:** "Series 3 - November 2024"
- Etc.

### ID Format:
- `series-{weekNum}-{month}-{year}`
- Example: `series-2-nov-2024`

### Date Ranges:
- Always Monday to Sunday
- Calculated automatically
- No gaps or overlaps

---

## Testing Changes Locally

Before pushing updates:

```bash
cd coins
npm run dev
```

Visit: `http://localhost:3000/checklist`

**Verify:**
- [ ] Series tabs appear correctly
- [ ] Current week has green indicator
- [ ] Future series show up
- [ ] All 7 case types in each series
- [ ] Dates are accurate

---

## Troubleshooting

### "No series showing"
- Check browser console for errors
- Verify `startDate` is valid: `new Date('YYYY-MM-DD')`
- Make sure `defaultCases` array isn't empty

### "Wrong dates displayed"
- Hard refresh browser (Ctrl+F5)
- Check your computer's date/time is correct
- Verify `startDate` is a Monday

### "Series not updating"
- Series generate client-side based on user's current date
- If it's Monday and new series not showing, clear browser cache

---

## Advanced: Custom Series Override

If you need a specific week to be different (e.g., holiday special):

### In `generateSeries()` function, add logic:

```typescript
// After series.push() in the loop:
if (weekStartDate.toISOString().split('T')[0] === '2024-12-25') {
  // Christmas week - override with special cases
  series[series.length - 1].cases = [
    { id: 'transcendent', name: 'ShackPack Transcendent', ... }
    // Only premium cases available this week
  ];
}
```

---

## Benefits

### Time Saved:
- **Before:** 2-5 minutes every Monday
- **After:** 0 minutes (automated!)
- **Annual savings:** ~2+ hours

### Accuracy:
- ✅ Perfect date calculations
- ✅ No typos
- ✅ Consistent naming
- ✅ Never forget to update

### Scalability:
- ✅ Works forever
- ✅ Handles month/year transitions
- ✅ Archives automatically
- ✅ Always up to date

---

## For More Details

See **`AUTOMATED_SERIES_GUIDE.md`** for:
- Deep dive into how it works
- Advanced configuration options
- Edge cases and handling
- Performance details
- Customization examples

---

## Summary

### What You Do Now: 
**Nothing!** Series automatically generate based on the current date.

### Only Edit Config If:
- Want different archive length (default: 52 weeks)
- Want more/fewer future weeks (default: 4)
- Need to add/remove case types
- Want to reset series numbering

### Location of Config:
`coins/app/checklist/page.tsx` - Lines 44-99

---

**Your weekly series are now fully automated! Set it and forget it.** 🚀

No more Monday morning updates. No more manual date calculations. Just automatic, perfect series every week.

---

*Last Updated: November 12, 2024*
*Status: AUTOMATED ✅*
