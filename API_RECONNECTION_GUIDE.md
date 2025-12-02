# API Reconnection Guide - ShackPack Live Inventory Checklist

This guide will help you reconnect the ShackPack checklist page to your live inventory API when you're ready.

---

## 🎯 Overview

Your inventory system has a Cloud Function that provides real-time checklist data with weekly aggregation. This guide walks through reconnecting the frontend to use that API instead of Google Sheets.

---

## 📋 What You'll Need

1. **API Endpoint**: `https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist`
2. **Required Parameters**:
   - `orgId=coin-shack`
   - `caseType` (base, deluxe, xtreme, unleashed, resurgence, transcendent, ignite, eclipse, radiant)
   - `startDate` (YYYY-MM-DD format) - for historical weeks
   - `endDate` (YYYY-MM-DD format) - for historical weeks

3. **API Response Format**:
```json
{
  "success": true,
  "lastUpdated": "2024-12-02T12:00:00Z",
  "weeklyAggregation": true,
  "weekRange": {
    "start": "2024-11-25",
    "end": "2024-12-01"
  },
  "casesCount": 15,
  "coinsFromCasesCount": 120,
  "premiumInventoryCount": 8,
  "checklist": [
    {
      "name": "Morgan Silver Dollar",
      "years": ["1921", "1922"],
      "gradingCompanies": ["NGC", "PCGS"],
      "grades": {"MS64": 5, "MS65": 3},
      "gradesAvailable": ["MS64", "MS65"],
      "totalQuantity": 8,
      "available": true
    }
  ]
}
```

---

## 🔧 Step-by-Step Reconnection

### Step 1: Restore the Modular Code Structure

The previous implementation was organized into separate files for better maintainability:

**Files to restore:**
- `coins/app/checklist/types.ts` - TypeScript interfaces
- `coins/app/checklist/constants.ts` - Case types and configuration
- `coins/app/checklist/utils.ts` - Date formatting utilities
- `coins/app/checklist/api.ts` - API fetch logic
- `coins/app/checklist/series.ts` - Series generation logic
- `coins/app/checklist/hooks/useChecklist.ts` - Custom React hook
- `coins/app/checklist/components/` - UI components

**Quick restore command:**
```bash
# Checkout the last API-connected version
git checkout 48e8a82 -- coins/app/checklist/

# Or restore the entire checklist folder structure
git checkout 48e8a82 -- "coins/app/checklist/*"
```

### Step 2: Update the Main Page Component

Replace `coins/app/checklist/page.tsx` with the API-connected version:

```typescript
"use client";

import { useMemo, useState } from "react";
import type { SeriesData, CaseType } from "./types";
import { generateSeries } from "./series";
import { useChecklist } from "./hooks/useChecklist";
import {
  SeriesTabs,
  CaseTypeSelector,
  ChecklistHeader,
  CoinList,
  LoadingState,
  ErrorState,
  WarningBanner
} from "./components";

export default function ChecklistPage() {
  const seriesList = useMemo(() => generateSeries(), []);
  
  if (seriesList.length === 0 || seriesList[0].cases.length === 0) {
    return (
      <main className="container py-10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>Unable to generate series data. Please refresh the page.</p>
        </div>
      </main>
    );
  }

  const [selectedSeries, setSelectedSeries] = useState<SeriesData>(seriesList[0]);
  const [selectedCase, setSelectedCase] = useState<CaseType>(seriesList[0].cases[0]);
  
  const { data, loading, error, warning, refresh } = useChecklist(selectedCase, selectedSeries);

  const handleSeriesSelect = (series: SeriesData) => {
    setSelectedSeries(series);
    setSelectedCase(series.cases[0]);
  };

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <p className="text-lg text-slate-300">
            Select a series and case type to review the coins that may appear in that case.
          </p>
          <p className="text-sm text-slate-400 italic">
            Possible contents only — coins are not guaranteed in any individual pack.
          </p>
        </header>

        <section className="space-y-4">
          <SeriesTabs
            seriesList={seriesList}
            selectedSeries={selectedSeries}
            onSelectSeries={handleSeriesSelect}
          />
          <CaseTypeSelector
            cases={selectedSeries.cases}
            selectedCase={selectedCase}
            onSelectCase={setSelectedCase}
          />
        </section>

        <ChecklistHeader
          selectedCase={selectedCase}
          selectedSeries={selectedSeries}
          data={data}
          loading={loading}
          onRefresh={refresh}
        />

        {warning && <WarningBanner warning={warning} />}
        {error && <ErrorState error={error} onRetry={refresh} />}
        {loading && !data && <LoadingState />}
        {data && !loading && !error && (
          <CoinList data={data} selectedCase={selectedCase} />
        )}

        <footer className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300 space-y-2">
          <p>
            This checklist shows coins that may appear in ShackPack cases for the selected series week.
            It includes coins from cases created the previous week plus currently available premium coins.
            Actual pack contents vary and specific coins are not guaranteed.
          </p>
          <p className="text-xs text-slate-500">
            Checklist regenerated weekly (every Monday at 1:00 AM Eastern) • No purchase necessary to view.
          </p>
        </footer>
      </div>
    </main>
  );
}
```

### Step 3: Verify API Configuration

Check `coins/app/checklist/api.ts` to ensure the API endpoint is correct:

```typescript
const API_BASE = "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist";

export async function fetchChecklist(
  caseType: string,
  startDate: string,
  endDate: string
): Promise<ChecklistResponse> {
  const params = new URLSearchParams({
    orgId: "coin-shack",
    filter: "shackpack",
    caseType,
    startDate,
    endDate
  });

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch checklist");
  return response.json();
}
```

### Step 4: Update Series Configuration

Check `coins/app/checklist/constants.ts` for current settings:

```typescript
export const SERIES_CONFIG = {
  archiveWeeks: 52, // Show current week + 52 past weeks
  defaultCases: [
    { id: "base", name: "ShackPack", description: "...", goldContent: "1/10 oz Gold" },
    { id: "deluxe", name: "ShackPack Deluxe", description: "...", goldContent: "2× 1/10 oz Gold" },
    { id: "xtreme", name: "ShackPack Xtreme", description: "...", goldContent: "1/4 oz Gold" },
    { id: "unleashed", name: "ShackPack Unleashed", description: "...", goldContent: "2× 1/4 oz Gold" },
    { id: "resurgence", name: "ShackPack Resurgence", description: "...", goldContent: "1/2 oz Gold" },
    { id: "transcendent", name: "ShackPack Transcendent", description: "...", goldContent: "1 oz Gold" },
    { id: "ignite", name: "ShackPack Ignite", description: "...", goldContent: "1/4 oz Platinum" },
    { id: "eclipse", name: "ShackPack Eclipse", description: "...", goldContent: "1 oz Platinum" },
    { id: "radiant", name: "ShackPack Radiant", description: "...", goldContent: "1/2 oz Platinum" }
  ]
};
```

### Step 5: Test the Connection

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/checklist`

2. **API Testing** (from command line):
   ```bash
   # Current week
   curl "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&caseType=base&startDate=2024-11-25&endDate=2024-12-01"

   # Historical week
   curl "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&caseType=base&startDate=2024-11-04&endDate=2024-11-10"
   ```

3. **Browser DevTools**:
   - Open Network tab
   - Click through series/cases
   - Verify API calls are successful (200 status)
   - Check response data format

### Step 6: Deploy

```bash
# Commit changes
git add coins/app/checklist/
git commit -m "Reconnect checklist to live inventory API"

# Push to production
git push origin main
```

---

## 🎨 How It Works

### UI Structure
1. **Series Tabs** - Week ranges (Current Week, Nov 25-Dec 1, etc.)
2. **Case Type Buttons** - All 9 case types (Base, Deluxe, Xtreme, etc.)
3. **Coin List** - Shows coins that may appear in selected case for that week

### Data Flow
1. User selects a series (week range)
2. User selects a case type
3. `useChecklist` hook fetches data from API with `startDate` and `endDate`
4. API returns weekly aggregation:
   - Coins from cases created previous week
   - Current premium inventory
5. UI displays coins as simple bullet list

### Weekly Automation
- **Current Week**: Always shows as first series
- **Series Generation**: Automatically creates week ranges going back 52 weeks
- **API Updates**: Backend regenerates data every Monday at 1 AM Eastern
- **No Manual Updates**: Everything is automatic

---

## ⚠️ Important Notes

### Audit Compliance
The system is designed to be audit-compliant:
- ✅ No prices shown
- ✅ No exact quantities (just "Available", "Limited", "Out of Stock")
- ✅ Disclaimers present
- ✅ "May appear" language used throughout
- ✅ No guaranteed contents

### Backend Requirements
Your API must support:
1. `startDate` and `endDate` parameters for historical weeks
2. Weekly aggregation logic (previous week cases + current premium inventory)
3. Snapshot system for historical accuracy
4. Scheduled function running every Monday at 1 AM

### Git Commit References
- **Last API version**: `48e8a82` (Optimized modular structure)
- **Google Sheets version**: `6b05706` (Current simple embed)
- **Full commit history**: See `git log coins/app/checklist/page.tsx`

---

## 🚀 Quick Reconnect Command

If everything is set up in your API, just run:

```bash
# Restore the entire API-connected checklist system
git checkout 48e8a82 -- coins/app/checklist/

# Commit and push
git add coins/app/checklist/
git commit -m "Restore live API checklist system"
git push origin main
```

---

## 📞 Troubleshooting

### Issue: "Unable to generate series data"
- Check that `SERIES_CONFIG` in `constants.ts` is correct
- Verify `generateSeries()` function exists in `series.ts`

### Issue: API calls failing
- Verify API endpoint URL in `api.ts`
- Check CORS settings on Cloud Function
- Test API directly with curl command

### Issue: Historical data empty
- Run backfill script on backend:
  ```bash
  curl -X POST "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/backfillInventorySnapshots?orgId=coin-shack"
  ```

### Issue: Wrong coins showing
- Verify weekly aggregation logic in backend
- Check that `startDate`/`endDate` are being sent correctly
- Ensure Monday-Sunday week calculation is correct

---

## 📚 Additional Resources

- **Backend API Project**: Check your inventory system Cursor project
- **Cloud Function Logs**: Firebase Console → Functions
- **Frontend Logs**: Browser DevTools Console
- **Git History**: `git log --oneline coins/app/checklist/`

---

**Last Updated**: December 2, 2024  
**API Version**: Weekly Aggregation (Monday regeneration)  
**Restore Commit**: `48e8a82`

