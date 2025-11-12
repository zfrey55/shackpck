# Complete API Setup Walkthrough - Step by Step

## 🎯 Goal

Update your `getChecklist` Cloud Function to support historical inventory queries so each series shows what was ACTUALLY available during that specific week.

---

## 📋 What You're Building

### Current API (Basic):
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe
→ Returns current inventory
```

### Updated API (Historical):
```
/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-04&endDate=2024-11-10
→ Returns inventory from that specific week
```

---

## 🚀 Quick Start (5 Steps)

### Step 1: Open Your Coin Inventory Project
```bash
cd /path/to/your/coin-inventory-project
```

### Step 2: Locate Your Cloud Function
Find the file that contains `getChecklist` function. Probably:
- `functions/index.js` or
- `functions/src/getChecklist.js` or
- Similar location

### Step 3: Add Snapshot System (Choose One Option)

### Step 4: Update getChecklist Function

### Step 5: Test and Deploy

---

## 📊 Step 3: Add Snapshot System (DETAILED)

You need to store daily snapshots of your inventory. Choose one approach:

---

### **Option A: Simple Daily Snapshot (RECOMMENDED - Easiest)**

#### Create a new Cloud Function for snapshots:

```javascript
// functions/src/createSnapshot.js

const admin = require('firebase-admin');
const db = admin.firestore();

exports.createDailySnapshot = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get current inventory
    const inventorySnapshot = await db
      .collection('inventory')
      .where('orgId', '==', 'coin-shack')
      .where('filter', '==', 'shackpack')
      .get();
    
    const coins = [];
    inventorySnapshot.forEach(doc => {
      coins.push(doc.data());
    });
    
    // Save snapshot
    await db.collection('inventory_snapshots').doc(`snapshot-${today}`).set({
      orgId: 'coin-shack',
      snapshotDate: today,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      coins: coins,
      metadata: {
        totalTypes: coins.length,
        totalCoins: coins.reduce((sum, c) => sum + (c.totalQuantity || 0), 0)
      }
    });
    
    console.log(`Created snapshot for ${today}`);
    return { success: true, date: today };
    
  } catch (error) {
    console.error('Snapshot error:', error);
    throw error;
  }
};
```

#### Schedule it to run daily:

**Using Firebase Functions (Scheduled):**

```javascript
// In your functions/index.js
const functions = require('firebase-functions');

exports.dailySnapshot = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('America/New_York') // Your timezone
  .onRun(async (context) => {
    await createDailySnapshot();
  });
```

**Or using Google Cloud Scheduler:**
1. Go to Google Cloud Console
2. Cloud Scheduler → Create Job
3. Frequency: `0 0 * * *` (daily at midnight)
4. Target: HTTP → Your function URL
5. Method: POST

---

### **Option B: Manual Snapshot (For Testing)**

Create a button in your inventory app that calls:

```javascript
async function takeSnapshotNow() {
  // Same code as Option A
  // But callable via HTTP endpoint or button click
}
```

---

## 🔧 Step 4: Update getChecklist Function

### Current Function (Basic):

```javascript
exports.getChecklist = functions.https.onRequest(async (req, res) => {
  const { orgId, filter, caseType } = req.query;
  
  // Query current inventory
  const snapshot = await db.collection('inventory')
    .where('orgId', '==', orgId)
    .where('filter', '==', filter)
    .where('caseType', 'array-contains', caseType)
    .get();
  
  const coins = [];
  snapshot.forEach(doc => coins.push(doc.data()));
  
  res.json({
    success: true,
    lastUpdated: new Date().toISOString(),
    checklist: coins
  });
});
```

### Updated Function (With Historical Support):

```javascript
exports.getChecklist = functions.https.onRequest(async (req, res) => {
  const { orgId, filter, caseType, startDate, endDate } = req.query;
  
  // If no dates provided, return CURRENT inventory (backward compatible)
  if (!startDate || !endDate) {
    const snapshot = await db.collection('inventory')
      .where('orgId', '==', orgId)
      .where('filter', '==', filter)
      .where('caseType', 'array-contains', caseType)
      .get();
    
    const coins = [];
    snapshot.forEach(doc => coins.push(doc.data()));
    
    return res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      caseType: caseType,
      isHistorical: false,
      checklist: coins
    });
  }
  
  // If dates provided, return HISTORICAL inventory
  try {
    const historicalCoins = await getHistoricalInventory(
      orgId, 
      filter, 
      caseType, 
      startDate, 
      endDate
    );
    
    return res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      caseType: caseType,
      startDate: startDate,
      endDate: endDate,
      isHistorical: true,
      checklist: historicalCoins
    });
    
  } catch (error) {
    console.error('Error fetching historical inventory:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Add the Historical Query Function:

```javascript
async function getHistoricalInventory(orgId, filter, caseType, startDate, endDate) {
  const coinMap = new Map();
  
  // Get all snapshots in date range
  const snapshotsRef = db.collection('inventory_snapshots')
    .where('orgId', '==', orgId)
    .where('snapshotDate', '>=', startDate)
    .where('snapshotDate', '<=', endDate);
  
  const snapshotsSnapshot = await snapshotsRef.get();
  
  // Process all snapshots
  snapshotsSnapshot.forEach(doc => {
    const snapshot = doc.data();
    
    // Filter coins by case type
    snapshot.coins.forEach(coin => {
      // Check if this coin is eligible for the case type
      if (coin.caseTypes && coin.caseTypes.includes(caseType)) {
        const key = `${coin.name}-${coin.year || 'various'}-${coin.grade || 'various'}`;
        
        // If we haven't seen this coin yet, or this snapshot has more quantity
        if (!coinMap.has(key)) {
          coinMap.set(key, coin);
        } else {
          const existing = coinMap.get(key);
          // Keep the one with higher quantity (max available during period)
          if (coin.totalQuantity > existing.totalQuantity) {
            coinMap.set(key, coin);
          }
        }
      }
    });
  });
  
  // Convert map to array and format for response
  return Array.from(coinMap.values()).map(coin => ({
    name: coin.name,
    years: coin.years || [],
    gradingCompanies: coin.gradingCompanies || [],
    grades: coin.grades || {},
    gradesAvailable: coin.gradesAvailable || [],
    totalQuantity: coin.totalQuantity || 0,
    available: coin.totalQuantity > 0
  }));
}
```

---

## 🧪 Step 5: Testing

### Test 1: Backward Compatibility (No Dates)
```bash
curl "https://your-function-url/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe"
```

**Expected Response:**
```json
{
  "success": true,
  "lastUpdated": "2024-11-12T...",
  "caseType": "deluxe",
  "isHistorical": false,
  "checklist": [ /* current inventory */ ]
}
```

### Test 2: Historical Query (With Dates)
```bash
curl "https://your-function-url/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-04&endDate=2024-11-10"
```

**Expected Response:**
```json
{
  "success": true,
  "lastUpdated": "2024-11-12T...",
  "caseType": "deluxe",
  "startDate": "2024-11-04",
  "endDate": "2024-11-10",
  "isHistorical": true,
  "checklist": [ /* historical inventory */ ]
}
```

---

## 📝 Data Structure Requirements

### Your Inventory Documents Should Include:

```javascript
{
  name: "Morgan Silver Dollar",
  year: "1921",
  grade: "MS64",
  gradingCompany: "NGC",
  totalQuantity: 8,
  caseTypes: ["base", "deluxe", "xtreme"], // Array of eligible case types
  years: ["1921", "1922", "1923"],
  gradingCompanies: ["NGC", "PCGS"],
  gradesAvailable: ["MS64", "MS65"],
  grades: {
    "MS64": 5,
    "MS65": 3
  },
  available: true
}
```

**Critical Field:** `caseTypes` array
- This determines which case types can include this coin
- Example: `["base", "deluxe"]` means coin can appear in Base and Deluxe cases

---

## 🎯 Backfill Last Week's Data

You need at least ONE snapshot for last week. Here's how:

### Option 1: Create Snapshot Manually

Run this once to create snapshot for Nov 4, 2024:

```javascript
async function backfillSnapshot() {
  // Get current inventory (or reconstruct from sales history)
  const inventorySnapshot = await db
    .collection('inventory')
    .where('orgId', '==', 'coin-shack')
    .get();
  
  const coins = [];
  inventorySnapshot.forEach(doc => {
    coins.push(doc.data());
  });
  
  // Save as Nov 4 snapshot
  await db.collection('inventory_snapshots').doc('snapshot-2024-11-04').set({
    orgId: 'coin-shack',
    snapshotDate: '2024-11-04',
    timestamp: new Date('2024-11-04T00:00:00Z'),
    coins: coins,
    metadata: {
      totalTypes: coins.length,
      totalCoins: coins.reduce((sum, c) => sum + (c.totalQuantity || 0), 0),
      note: 'Backfilled snapshot'
    }
  });
  
  console.log('Backfilled Nov 4 snapshot');
}
```

### Option 2: Copy Current as Historical

If you don't have exact historical data, use current inventory as baseline:

```javascript
// Copy current inventory to all past dates
const dates = ['2024-11-04', '2024-11-05', '2024-11-06', /* etc */];

for (const date of dates) {
  await db.collection('inventory_snapshots').doc(`snapshot-${date}`).set({
    orgId: 'coin-shack',
    snapshotDate: date,
    coins: currentInventory, // Use current as baseline
    metadata: { note: 'Backfilled from current' }
  });
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "No snapshots found"
**Solution:** Create at least one snapshot for the date range you're querying

### Issue 2: "Coins missing caseTypes field"
**Solution:** Update your inventory documents to include `caseTypes: ["base", "deluxe", ...]`

### Issue 3: "Returns same data for all weeks"
**Solution:** Make sure snapshots are different for each date (or create unique snapshots)

### Issue 4: "Gold variance not showing"
**Solution:** Ensure gold coins have different quantities in different snapshots

---

## 📋 Complete Checklist

- [ ] Create `createDailySnapshot` function
- [ ] Schedule snapshot to run daily (or manually trigger)
- [ ] Update `getChecklist` to accept `startDate` and `endDate`
- [ ] Add `getHistoricalInventory` function
- [ ] Ensure inventory has `caseTypes` field
- [ ] Test backward compatibility (no dates)
- [ ] Test historical query (with dates)
- [ ] Backfill at least Nov 4-10 snapshot
- [ ] Deploy to production
- [ ] Verify website shows different data for different weeks

---

## 🎯 Expected Timeline

- **Snapshot function:** 30-60 min
- **Update getChecklist:** 30-60 min
- **Testing:** 30 min
- **Backfill data:** 15-30 min
- **Deploy:** 5-10 min

**Total: 2-3 hours**

---

## 🆘 Need Help?

### If you get stuck:

1. **Check Firestore Console**
   - Do snapshots exist in `inventory_snapshots` collection?
   - Do they have the right date format?
   - Do coins have `caseTypes` field?

2. **Check Function Logs**
   - Google Cloud Console → Functions → Your function → Logs
   - Look for errors

3. **Test Directly**
   - Call function in browser
   - Check response format
   - Verify data structure

---

## 🎉 What Success Looks Like

### After Implementation:

1. **Visit checklist page**
2. **Click Series 1 (Nov 4-10)**
3. **Select Deluxe case**
4. **See coins available that week**

5. **Click Series 2 (Nov 11-17)**
6. **Select Deluxe case**
7. **See DIFFERENT coins (if gold varied)**

Each series shows accurate historical data for that week!

---

## 📖 Quick Reference

### Firestore Collections You Need:
```
inventory_snapshots/
  ├─ snapshot-2024-11-04
  ├─ snapshot-2024-11-05
  ├─ snapshot-2024-11-06
  └─ ...
```

### API Parameters:
```
orgId: coin-shack
filter: shackpack
caseType: base|deluxe|xtreme|unleashed|resurgence|transcendent|ignite
startDate: YYYY-MM-DD (optional)
endDate: YYYY-MM-DD (optional)
```

### Response Format:
```json
{
  "success": true,
  "lastUpdated": "...",
  "caseType": "...",
  "startDate": "...",
  "endDate": "...",
  "isHistorical": true,
  "totalTypes": 25,
  "totalCoins": 150,
  "checklist": [...]
}
```

---

**That's it! Once you implement these changes, your historical inventory system will be complete and your website will show accurate data for each series week.** 🚀

---

*For full technical details, see: `API_HISTORICAL_INVENTORY_PROMPT.md`*

