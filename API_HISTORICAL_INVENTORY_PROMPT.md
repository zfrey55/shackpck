# API Update: Historical Inventory Snapshots for Series Checklists

## 🎯 Critical Requirement

The ShackPack checklist needs to show **historical inventory** for each series week, not current inventory. This means:

- Series starting 11/4/24 → Show what was in stock during 11/4-11/10
- Series starting 11/11/24 → Show what was in stock during 11/11-11/17
- Each series shows coins available THAT week (including sold items)

---

## Problem with Current API

**Current Behavior:**
```
getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe
→ Returns CURRENT inventory only
```

**Needed Behavior:**
```
getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-11&endDate=2024-11-17
→ Returns inventory snapshot for that date range
```

---

## New API Parameters Required

### Add Date Range Parameters:

**startDate** (optional):
- Format: `YYYY-MM-DD`
- Example: `2024-11-11`
- Meaning: Start of series week (Monday)

**endDate** (optional):
- Format: `YYYY-MM-DD`
- Example: `2024-11-17`
- Meaning: End of series week (Sunday)

### API Call Examples:

**Current inventory (no dates):**
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe
```

**Historical inventory for specific week:**
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-11&endDate=2024-11-17
```

---

## What "Historical Inventory" Means

For the date range Nov 11-17, 2024, include coins that:

1. **Were in stock at start date** (Nov 11)
2. **Came into stock during the week** (added Nov 11-17)
3. **Were sold during the week** (sold Nov 11-17)
4. **Combinations of above**

### Example Scenarios:

**Scenario 1: Coin in stock all week**
- Nov 11: 10 Morgan Dollars in stock
- Nov 17: 10 Morgan Dollars still in stock
- **Result:** Show Morgan Dollar with status "Available"

**Scenario 2: Coin sold during week**
- Nov 11: 5 Peace Dollars in stock
- Nov 15: All 5 sold
- Nov 17: 0 Peace Dollars in stock
- **Result:** Show Peace Dollar (it WAS available during that series)

**Scenario 3: Coin added during week**
- Nov 11: 0 Silver Eagles
- Nov 14: Received 20 Silver Eagles
- Nov 17: 20 Silver Eagles in stock
- **Result:** Show Silver Eagle

**Scenario 4: New coin type added**
- Nov 11: No Gold Buffalo coins at all
- Nov 13: Added Gold Buffalo to inventory (8 coins)
- Nov 17: 8 Gold Buffalo in stock
- **Result:** Show Gold Buffalo

---

## Database Query Logic

### Firestore Query (Pseudocode):

```javascript
async function getHistoricalChecklist(orgId, filter, caseType, startDate, endDate) {
  const coins = [];
  
  // Query 1: Coins in stock at start date
  const startSnapshot = await db.collection('inventory')
    .where('orgId', '==', orgId)
    .where('filter', '==', filter)
    .where('caseType', '==', caseType)
    .where('quantity', '>', 0)
    .where('date', '<=', startDate)
    .get();
  
  // Query 2: Coins added during date range
  const addedSnapshot = await db.collection('inventory')
    .where('orgId', '==', orgId)
    .where('filter', '==', filter)
    .where('caseType', '==', caseType)
    .where('addedDate', '>=', startDate)
    .where('addedDate', '<=', endDate)
    .get();
  
  // Query 3: Coins sold during date range (from sales history)
  const soldSnapshot = await db.collection('sales')
    .where('orgId', '==', orgId)
    .where('saleDate', '>=', startDate)
    .where('saleDate', '<=', endDate)
    .get();
  
  // Merge all unique coins
  const coinMap = new Map();
  
  // Process all queries and deduplicate
  [...startSnapshot.docs, ...addedSnapshot.docs, ...soldSnapshot.docs].forEach(doc => {
    const coin = doc.data();
    const key = `${coin.name}-${coin.year}-${coin.grade}`;
    
    if (!coinMap.has(key)) {
      coinMap.set(key, coin);
    }
  });
  
  return Array.from(coinMap.values());
}
```

---

## Inventory Tracking Requirements

To make this work, you need to track:

### 1. Inventory Snapshots
**Collection:** `inventory_snapshots`

**Document Structure:**
```javascript
{
  orgId: 'coin-shack',
  date: '2024-11-11',
  coins: [
    {
      name: 'Morgan Silver Dollar',
      year: '1921',
      grade: 'MS64',
      quantity: 8,
      caseTypes: ['base', 'deluxe', 'xtreme'],
      // ... other fields
    }
  ]
}
```

**Strategy:**
- Take daily snapshot at midnight
- Or snapshot on demand when inventory changes
- Query snapshots for date range

### 2. Inventory History Log
**Collection:** `inventory_history`

**Document Structure:**
```javascript
{
  orgId: 'coin-shack',
  coinId: 'morgan-1921-ms64',
  timestamp: '2024-11-15T14:30:00Z',
  action: 'sold', // or 'added', 'updated'
  quantityBefore: 8,
  quantityAfter: 3,
  caseTypes: ['base', 'deluxe'],
  // ... other fields
}
```

**Strategy:**
- Log every inventory change
- Query logs for date range
- Reconstruct what was available

### 3. Sales History (Recommended)
**Collection:** `sales`

**Document Structure:**
```javascript
{
  orgId: 'coin-shack',
  saleDate: '2024-11-15',
  caseType: 'deluxe',
  coinsSold: [
    {
      name: 'Morgan Silver Dollar',
      year: '1921',
      grade: 'MS64',
      quantity: 2
    }
  ]
}
```

---

## Recommended Implementation

### Option 1: Daily Snapshots (Easiest)

**Pros:**
- Simple to implement
- Fast queries
- Clear audit trail

**Cons:**
- More storage (one snapshot per day)
- Need cron job for daily snapshots

**Implementation:**
1. Every night at midnight, take snapshot of current inventory
2. Store in `inventory_snapshots` collection
3. For date range query, get snapshots for those dates
4. Merge and deduplicate coins

### Option 2: Event Sourcing (Best for Audit)

**Pros:**
- Complete audit trail
- Can reconstruct ANY point in time
- No missed data

**Cons:**
- More complex queries
- Requires event logging

**Implementation:**
1. Log every inventory change as an event
2. Log every sale as an event
3. Query events in date range
4. Reconstruct inventory state

### Option 3: Hybrid (Recommended)

**Pros:**
- Fast queries (snapshots)
- Complete audit (event log)
- Best of both worlds

**Cons:**
- Need both systems

**Implementation:**
1. Take daily snapshots
2. Log all inventory events
3. Use snapshots for queries
4. Use event log for audit/verification

---

## API Response Format

### Keep Current Format, Add Historical Info:

```json
{
  "success": true,
  "lastUpdated": "2024-11-11T00:00:00Z",
  "caseType": "deluxe",
  "startDate": "2024-11-11",
  "endDate": "2024-11-17",
  "isHistorical": true,
  "totalTypes": 25,
  "totalCoins": 150,
  "checklist": [
    {
      "name": "Morgan Silver Dollar",
      "years": ["1921", "1922"],
      "gradingCompanies": ["NGC", "PCGS"],
      "grades": {"MS64": 5, "MS65": 3},
      "gradesAvailable": ["MS64", "MS65"],
      "totalQuantity": 8,
      "available": true,
      "historicalNote": "In stock during this series"
    },
    {
      "name": "Peace Dollar",
      "years": ["1922"],
      "gradingCompanies": ["PCGS"],
      "grades": {"MS63": 0},
      "gradesAvailable": ["MS63"],
      "totalQuantity": 0,
      "available": false,
      "historicalNote": "Sold out during this series"
    }
  ]
}
```

---

## Backward Compatibility

### If no date parameters provided:
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe
```
→ Return CURRENT inventory (existing behavior)

### If date parameters provided:
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-11&endDate=2024-11-17
```
→ Return HISTORICAL inventory for that week

---

## Gold Inventory Variance

**Why This Matters:**
- Gold quantities vary week to week
- Week 1: Might have 1oz Gold Eagles
- Week 2: Might only have 1/10oz Gold
- Historical accuracy is CRITICAL

**Example:**
```
Series 1 (Nov 4-10):
- American Gold Eagle 1oz: 5 in stock
- American Gold Buffalo 1/10oz: 0 in stock

Series 2 (Nov 11-17):
- American Gold Eagle 1oz: 0 in stock (sold out)
- American Gold Buffalo 1/10oz: 8 in stock (new shipment)
```

Each series checklist must reflect what was ACTUALLY available that week.

---

## Implementation Steps

### Step 1: Add Inventory Snapshot System
1. Create `inventory_snapshots` collection
2. Take daily snapshot (or on-demand)
3. Store complete inventory state

### Step 2: Update Cloud Function
1. Add `startDate` and `endDate` parameters
2. Query snapshots for date range
3. Merge and deduplicate coins
4. Return with `isHistorical: true` flag

### Step 3: Test Historical Queries
```bash
# Current inventory
curl "...getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe"

# Historical inventory
curl "...getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-11&endDate=2024-11-17"
```

### Step 4: Backfill Historical Data (if needed)
- If you have sales history, reconstruct past weeks
- If not, start fresh from last week

---

## Database Schema Example

### Collection: `inventory_snapshots`

```javascript
{
  id: 'snapshot-2024-11-11',
  orgId: 'coin-shack',
  snapshotDate: '2024-11-11T00:00:00Z',
  coins: [
    {
      id: 'coin-123',
      name: 'Morgan Silver Dollar',
      year: '1921',
      grade: 'MS64',
      gradingCompany: 'NGC',
      quantity: 8,
      caseTypes: ['base', 'deluxe', 'xtreme'],
      available: true
    },
    // ... more coins
  ],
  metadata: {
    totalTypes: 25,
    totalCoins: 150,
    capturedAt: '2024-11-11T00:05:00Z'
  }
}
```

---

## Testing Checklist

- [ ] API accepts `startDate` and `endDate` parameters
- [ ] Returns current inventory when no dates provided
- [ ] Returns historical inventory when dates provided
- [ ] Includes coins sold during date range
- [ ] Includes coins added during date range
- [ ] Response includes `isHistorical` flag
- [ ] Response includes date range in JSON
- [ ] Works with all `caseType` values
- [ ] Backward compatible with existing calls

---

## Priority: HIGH

This is critical for:
1. **Audit compliance** - Historical accuracy required
2. **Customer trust** - Show what WAS available
3. **Gold variance** - Reflect actual gold availability
4. **Legal protection** - Prove what was offered when

---

## Questions to Consider

1. **How far back do you need historical data?**
   - Just from last week (when system went live)?
   - Or reconstruct earlier weeks from sales history?

2. **Snapshot frequency?**
   - Daily snapshots (recommended)
   - Weekly snapshots (simpler)
   - Real-time event sourcing (complex)

3. **Storage concerns?**
   - How long to keep snapshots?
   - Archive old snapshots?

4. **Sales integration?**
   - Do you want to show "X sold during this series"?
   - Or just show availability status?

---

## Deliverables Needed

1. **Cloud Function Update**
   - Add date parameter handling
   - Query historical snapshots
   - Merge and return results

2. **Snapshot System**
   - Daily cron job to capture snapshots
   - Or real-time snapshot on inventory changes

3. **Data Migration**
   - Backfill last week's snapshot (starting point)
   - Set up ongoing snapshot process

---

## Timeline Estimate

- **Snapshot system:** 2-4 hours
- **API updates:** 2-3 hours
- **Testing:** 1-2 hours
- **Total:** 5-9 hours development time

---

**Once this is implemented, the ShackPack website will automatically show accurate historical checklists for each series week, reflecting what was ACTUALLY available during that time period.**

Let me know if you have questions or need clarification on any part of this implementation!

