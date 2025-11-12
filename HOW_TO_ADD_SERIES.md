# How to Add New Series to Checklist

## Quick Guide

Every week, you need to add a new series to the checklist page. Here's how:

---

## Step 1: Open the Checklist File

Navigate to and open:
```
coins/app/checklist/page.tsx
```

---

## Step 2: Find the SERIES Array

Look for this section near the top of the file (around line 40):

```typescript
const SERIES: SeriesData[] = [
  {
    id: 'series-1-nov-2024',
    name: 'Series 1 - November 2024',
    // ... more data
  }
  // ADD NEW SERIES HERE
];
```

---

## Step 3: Copy the Series Template

Copy this template:

```typescript
{
  id: 'series-X-MONTH-2024',  // Change X to series number, MONTH to month abbreviation
  name: 'Series X - Month 2024',  // Display name for the tab
  startDate: '2024-11-18',  // Monday of the week (YYYY-MM-DD format)
  endDate: '2024-11-24',  // Sunday of the week (YYYY-MM-DD format)
  description: 'Week of November 18-24, 2024',  // Human-readable date range
  cases: [
    {
      id: 'shackpack',
      name: 'ShackPack',
      description: '1x 1/10 oz gold + 9 silver coins',
      goldContent: '1/10 oz Gold'
    },
    {
      id: 'deluxe',
      name: 'ShackPack Deluxe',
      description: '2x 1/10 oz gold + 8 silver coins',
      goldContent: '2x 1/10 oz Gold'
    },
    {
      id: 'xtreme',
      name: 'ShackPack Xtreme',
      description: '1x 1/4 oz gold + 9 silver coins',
      goldContent: '1/4 oz Gold'
    },
    {
      id: 'unleashed',
      name: 'ShackPack Unleashed',
      description: '2x 1/4 oz gold + 8 silver coins',
      goldContent: '2x 1/4 oz Gold'
    },
    {
      id: 'resurgence',
      name: 'ShackPack Resurgence',
      description: '1x 1/2 oz gold + 9 silver coins',
      goldContent: '1/2 oz Gold'
    },
    {
      id: 'transcendent',
      name: 'ShackPack Transcendent',
      description: '1x 1 oz gold + 9 silver coins',
      goldContent: '1 oz Gold'
    },
    {
      id: 'ignite',
      name: 'ShackPack Ignite',
      description: '1x 1/4 oz platinum + 9 silver coins',
      goldContent: '1/4 oz Platinum'
    }
  ]
}
```

---

## Step 4: Update the Values

### Example for Series 2 (Week of Nov 18-24, 2024):

```typescript
{
  id: 'series-2-nov-2024',  // ✅ Changed to series-2
  name: 'Series 2 - November 2024',  // ✅ Changed to Series 2
  startDate: '2024-11-18',  // ✅ Monday of week 2
  endDate: '2024-11-24',  // ✅ Sunday of week 2
  description: 'Week of November 18-24, 2024',  // ✅ Updated description
  cases: [
    // Keep all 7 cases unless you want to exclude some
  ]
}
```

---

## Step 5: Add It to the Array

Paste your new series **after** the existing ones:

```typescript
const SERIES: SeriesData[] = [
  {
    id: 'series-1-nov-2024',
    name: 'Series 1 - November 2024',
    // ... existing series 1
  },
  {
    id: 'series-2-nov-2024',  // ✅ NEW SERIES ADDED HERE
    name: 'Series 2 - November 2024',
    startDate: '2024-11-18',
    endDate: '2024-11-24',
    description: 'Week of November 18-24, 2024',
    cases: [
      // ... all 7 cases
    ]
  }
  // Future series go here
];
```

---

## Step 6: Save and Push

```bash
cd coins
git add app/checklist/page.tsx
git commit -m "Add Series 2 - November 2024"
git push origin main
```

Your site will auto-deploy in 1-2 minutes!

---

## Important Notes:

### ✅ Series Naming Convention:
- **ID:** `series-NUMBER-MONTH-YEAR` (lowercase, dashes)
- **Name:** `Series NUMBER - Month YEAR` (display name)

### ✅ Date Format:
- Use `YYYY-MM-DD` format (e.g., `2024-11-18`)
- Start date = Monday of the week
- End date = Sunday of the week

### ✅ Active Series Indicator:
The system automatically shows a green pulse dot next to the current active series (based on today's date).

### ✅ Excluding Case Types:
If a particular week doesn't include all case types, simply remove that case from the `cases` array:

```typescript
cases: [
  // Only 3 cases available this week
  {
    id: 'shackpack',
    name: 'ShackPack',
    // ...
  },
  {
    id: 'deluxe',
    name: 'ShackPack Deluxe',
    // ...
  },
  {
    id: 'xtreme',
    name: 'ShackPack Xtreme',
    // ...
  }
  // Removed other cases for this series
]
```

---

## Quick Reference: Monthly Series IDs

### November 2024:
- Week 1: `series-1-nov-2024` (Nov 11-17)
- Week 2: `series-2-nov-2024` (Nov 18-24)
- Week 3: `series-3-nov-2024` (Nov 25-Dec 1)
- Week 4: `series-4-nov-2024` (Dec 2-8)

### December 2024:
- Week 1: `series-1-dec-2024`
- Week 2: `series-2-dec-2024`
- Week 3: `series-3-dec-2024`
- Week 4: `series-4-dec-2024`

And so on...

---

## Series Archive

**Important:** Don't delete old series! The system requires each series to remain visible for **at least one year** from its end date.

Old series will automatically appear in the tabs, allowing customers to see historical data.

---

## Testing Locally

Before pushing to production:

```bash
cd coins
npm run dev
```

Visit: `http://localhost:3000/checklist`

1. Check that your new series tab appears
2. Click on it to make sure it loads
3. Test switching between case types
4. Verify dates display correctly

---

## Troubleshooting

### Series not showing up?
- Check for syntax errors (missing comma, bracket, etc.)
- Make sure the series object is inside the `SERIES` array
- Run `npm run dev` locally to see errors

### Wrong dates showing?
- Verify date format is `YYYY-MM-DD`
- Check that startDate comes before endDate

### Case types missing?
- Make sure you included the `cases` array
- Verify each case has `id`, `name`, `description`, and `goldContent`

---

## Need Help?

If you run into issues:
1. Check the browser console for errors
2. Verify your JSON syntax (use a validator)
3. Make sure you saved the file before pushing
4. Try `npm run build` locally to catch errors before deploying

---

**That's it! Adding a new series takes about 2 minutes once you get the hang of it.** 🚀

