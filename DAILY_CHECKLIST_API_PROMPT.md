# Daily Checklist System - API Implementation Prompt

**Copy everything below this line and paste into your inventory app Cursor project:**

---

# IMPLEMENT DAILY CHECKLIST SYSTEM FOR SHACKPACK WEBSITE

## 🎯 OVERVIEW

I need to build a daily checklist system where cases created in the inventory app automatically appear on the ShackPack website checklist the next day. The website will display checklists by date, with each case shown as an individual series.

## 📋 CORE REQUIREMENTS

### Business Logic
- **Cases created on Day X appear on Day X+1's checklist**
  - Example: Case created Dec 3, 2024 → Appears on Dec 4, 2024 checklist
  
- **Each day can have multiple cases of the same type**
  - ShackPack Base - Series 1, Series 2, Series 3, etc.
  - ShackPack Deluxe - Series 1, Series 2, etc.
  
- **Series numbering is per case type per display date**
  - If 3 base cases created on Dec 3 (for Dec 4), they're numbered 1, 2, 3
  - If 2 deluxe cases created on Dec 3 (for Dec 4), they're numbered 1, 2
  - Each new day, series numbers reset to 1

- **Data retention: 1 year starting December 1, 2025**
  - Store and display checklists from Dec 1, 2025 through Nov 30, 2026
  - After 1 year, archive old data (don't delete, just mark as archived)

### Case Types
- `base` - ShackPack Base (1× 1/10 oz gold + 9 silver)
- `deluxe` - ShackPack Deluxe (2× 1/10 oz gold + 8 silver)
- `xtreme` - ShackPack Xtreme (1× 1/4 oz gold + 9 silver)
- `unleashed` - ShackPack Unleashed (2× 1/4 oz gold + 8 silver)
- `resurgence` - ShackPack Resurgence (1× 1/2 oz gold + 9 silver)
- `transcendent` - ShackPack Transcendent (1× 1 oz gold + 9 silver)
- `ignite` - ShackPack Ignite (1× 1/4 oz platinum + 9 silver)
- `eclipse` - ShackPack Eclipse (1× 1 oz platinum + 9 silver)
- `radiant` - ShackPack Radiant (1× 1/2 oz platinum + 9 silver)

## 🗄️ DATABASE SCHEMA

### 1. Cases Table (Update or Create)

```sql
CREATE TABLE daily_checklist_cases (
  case_id VARCHAR(100) PRIMARY KEY,
  org_id VARCHAR(50) NOT NULL,
  case_type VARCHAR(50) NOT NULL,
  series_number INT NOT NULL,
  
  -- Date tracking
  created_date DATE NOT NULL,           -- When case was created (Dec 3)
  created_timestamp TIMESTAMP NOT NULL, -- Exact time created
  display_date DATE NOT NULL,           -- When it appears on checklist (Dec 4)
  
  -- Metadata
  status VARCHAR(20) DEFAULT 'active',  -- active, sold, archived
  archived BOOLEAN DEFAULT false,
  
  -- Indexes for fast queries
  INDEX idx_display_date (org_id, display_date, case_type),
  INDEX idx_created_date (org_id, created_date),
  INDEX idx_status (status, archived)
);
```

### 2. Case Contents Table (Links coins to cases)

```sql
CREATE TABLE daily_checklist_contents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id VARCHAR(100) REFERENCES daily_checklist_cases(case_id),
  
  -- Coin identification
  coin_id VARCHAR(100),  -- Reference to inventory.id
  
  -- Coin details (denormalized for fast reads)
  coin_type VARCHAR(200) NOT NULL,
  year VARCHAR(20) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  grading_company VARCHAR(50) NOT NULL,
  
  -- Additional metadata
  position INT,  -- Order in case (1-10)
  
  INDEX idx_case (case_id),
  INDEX idx_coin (coin_id)
);
```

## 🔧 IMPLEMENTATION STEPS

### STEP 1: Update Case Creation Flow

When a case is created in the inventory app, we need to:

1. **Calculate display date** (created_date + 1 day)
2. **Determine series number** (count existing cases for that display_date + case_type)
3. **Generate case ID** (format: `{case_type}_{display_date}_{series_number}`)
4. **Save case record** to `daily_checklist_cases`
5. **Link all coins** to case in `daily_checklist_contents`

**Example Function:**
```typescript
async function createDailyChecklistCase(
  orgId: string,
  caseType: string,
  selectedCoins: Coin[]
): Promise<string> {
  
  // 1. Calculate dates
  const createdDate = new Date();
  const displayDate = new Date(createdDate);
  displayDate.setDate(displayDate.getDate() + 1); // Tomorrow
  
  const createdDateStr = createdDate.toISOString().split('T')[0];
  const displayDateStr = displayDate.toISOString().split('T')[0];
  
  // 2. Get series number (count existing cases for this display date + type)
  const existingCases = await db.collection('daily_checklist_cases')
    .where('orgId', '==', orgId)
    .where('displayDate', '==', displayDateStr)
    .where('caseType', '==', caseType)
    .get();
  
  const seriesNumber = existingCases.size + 1;
  
  // 3. Generate case ID
  const caseId = `${caseType}_${displayDateStr.replace(/-/g, '')}_${String(seriesNumber).padStart(3, '0')}`;
  // Example: base_20241204_001
  
  // 4. Save case record
  await db.collection('daily_checklist_cases').doc(caseId).set({
    caseId,
    orgId,
    caseType,
    seriesNumber,
    createdDate: createdDateStr,
    createdTimestamp: createdDate.toISOString(),
    displayDate: displayDateStr,
    status: 'active',
    archived: false
  });
  
  // 5. Link coins to case
  for (let i = 0; i < selectedCoins.length; i++) {
    const coin = selectedCoins[i];
    await db.collection('daily_checklist_contents').add({
      caseId,
      coinId: coin.id,
      coinType: coin.type,
      year: coin.year,
      grade: coin.grade,
      gradingCompany: coin.gradingCompany,
      position: i + 1
    });
  }
  
  // 6. Update inventory status (optional)
  for (const coin of selectedCoins) {
    await db.collection('inventory').doc(coin.id).update({
      status: 'in_daily_case',
      caseId,
      assignedDate: createdDate.toISOString()
    });
  }
  
  return caseId;
}
```

### STEP 2: Create API Endpoint - `getDailyChecklist`

**Endpoint URL**: `https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getDailyChecklist`

**Parameters**:
- `orgId` (required) - Organization ID (e.g., "coin-shack")
- `displayDate` (optional) - Date to fetch (YYYY-MM-DD format). Defaults to today.
- `startDate` (optional) - For date range queries
- `endDate` (optional) - For date range queries

**Response Format**:
```json
{
  "success": true,
  "displayDate": "2024-12-04",
  "totalCases": 8,
  "casesByType": {
    "base": 3,
    "deluxe": 2,
    "xtreme": 1,
    "unleashed": 1,
    "transcendent": 1
  },
  "cases": [
    {
      "caseId": "base_20241204_001",
      "displayName": "ShackPack - Series 1",
      "caseType": "base",
      "caseTypeName": "ShackPack Base",
      "seriesNumber": 1,
      "createdDate": "2024-12-03",
      "createdTimestamp": "2024-12-03T14:30:00Z",
      "displayDate": "2024-12-04",
      "status": "active",
      "totalCoins": 10,
      "coins": [
        {
          "position": 1,
          "coinType": "American Gold Eagle",
          "year": "2023",
          "grade": "MS70",
          "gradingCompany": "NGC"
        },
        {
          "position": 2,
          "coinType": "Morgan Silver Dollar",
          "year": "1921",
          "grade": "MS64",
          "gradingCompany": "PCGS"
        },
        {
          "position": 3,
          "coinType": "American Silver Eagle",
          "year": "2022",
          "grade": "MS69",
          "gradingCompany": "NGC"
        }
        // ... 7 more coins (total 10)
      ]
    },
    {
      "caseId": "base_20241204_002",
      "displayName": "ShackPack - Series 2",
      "caseType": "base",
      "caseTypeName": "ShackPack Base",
      "seriesNumber": 2,
      "displayDate": "2024-12-04",
      "coins": [...]
    },
    {
      "caseId": "deluxe_20241204_001",
      "displayName": "ShackPack Deluxe - Series 1",
      "caseType": "deluxe",
      "caseTypeName": "ShackPack Deluxe",
      "seriesNumber": 1,
      "displayDate": "2024-12-04",
      "coins": [...]
    }
  ]
}
```

**Implementation**:
```typescript
exports.getDailyChecklist = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  const { orgId, displayDate, startDate, endDate } = req.query;
  
  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      error: 'orgId is required' 
    });
  }
  
  try {
    // Default to today if no date provided
    const targetDate = displayDate || new Date().toISOString().split('T')[0];
    
    // Fetch cases for this display date
    let query = db.collection('daily_checklist_cases')
      .where('orgId', '==', orgId)
      .where('displayDate', '==', targetDate)
      .where('archived', '==', false)
      .orderBy('caseType')
      .orderBy('seriesNumber');
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({
        success: true,
        displayDate: targetDate,
        totalCases: 0,
        casesByType: {},
        cases: []
      });
    }
    
    const cases = [];
    const casesByType = {};
    
    for (const doc of snapshot.docs) {
      const caseData = doc.data();
      
      // Count cases by type
      casesByType[caseData.caseType] = (casesByType[caseData.caseType] || 0) + 1;
      
      // Fetch coins for this case
      const coinsSnapshot = await db.collection('daily_checklist_contents')
        .where('caseId', '==', caseData.caseId)
        .orderBy('position')
        .get();
      
      const coins = coinsSnapshot.docs.map(coinDoc => {
        const coinData = coinDoc.data();
        return {
          position: coinData.position,
          coinType: coinData.coinType,
          year: coinData.year,
          grade: coinData.grade,
          gradingCompany: coinData.gradingCompany
        };
      });
      
      // Format case data
      cases.push({
        caseId: caseData.caseId,
        displayName: formatDisplayName(caseData.caseType, caseData.seriesNumber),
        caseType: caseData.caseType,
        caseTypeName: getCaseTypeName(caseData.caseType),
        seriesNumber: caseData.seriesNumber,
        createdDate: caseData.createdDate,
        createdTimestamp: caseData.createdTimestamp,
        displayDate: caseData.displayDate,
        status: caseData.status,
        totalCoins: coins.length,
        coins
      });
    }
    
    res.json({
      success: true,
      displayDate: targetDate,
      totalCases: cases.length,
      casesByType,
      cases
    });
    
  } catch (error) {
    console.error('Error fetching daily checklist:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to format display names
function formatDisplayName(caseType: string, seriesNumber: number): string {
  const typeNames = {
    'base': 'ShackPack',
    'deluxe': 'ShackPack Deluxe',
    'xtreme': 'ShackPack Xtreme',
    'unleashed': 'ShackPack Unleashed',
    'resurgence': 'ShackPack Resurgence',
    'transcendent': 'ShackPack Transcendent',
    'ignite': 'ShackPack Ignite',
    'eclipse': 'ShackPack Eclipse',
    'radiant': 'ShackPack Radiant'
  };
  
  return `${typeNames[caseType] || caseType} - Series ${seriesNumber}`;
}

function getCaseTypeName(caseType: string): string {
  const typeNames = {
    'base': 'ShackPack Base',
    'deluxe': 'ShackPack Deluxe',
    'xtreme': 'ShackPack Xtreme',
    'unleashed': 'ShackPack Unleashed',
    'resurgence': 'ShackPack Resurgence',
    'transcendent': 'ShackPack Transcendent',
    'ignite': 'ShackPack Ignite',
    'eclipse': 'ShackPack Eclipse',
    'radiant': 'ShackPack Radiant'
  };
  
  return typeNames[caseType] || caseType;
}
```

### STEP 3: Create API Endpoint - `getAvailableDates`

This endpoint returns all dates that have checklist data available.

**Endpoint URL**: `https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getAvailableDates`

**Parameters**:
- `orgId` (required)
- `year` (optional) - Filter by year (e.g., 2025)
- `limit` (optional) - Limit number of dates returned

**Response Format**:
```json
{
  "success": true,
  "totalDates": 365,
  "dates": [
    {
      "displayDate": "2024-12-04",
      "totalCases": 8,
      "caseTypes": ["base", "deluxe", "xtreme"]
    },
    {
      "displayDate": "2024-12-05",
      "totalCases": 12,
      "caseTypes": ["base", "deluxe", "xtreme", "unleashed"]
    }
  ]
}
```

**Implementation**:
```typescript
exports.getAvailableDates = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const { orgId, year, limit } = req.query;
  
  if (!orgId) {
    return res.status(400).json({ success: false, error: 'orgId required' });
  }
  
  try {
    let query = db.collection('daily_checklist_cases')
      .where('orgId', '==', orgId)
      .where('archived', '==', false);
    
    // Filter by year if provided
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.where('displayDate', '>=', startDate)
                   .where('displayDate', '<=', endDate);
    }
    
    const snapshot = await query.get();
    
    // Group by display date
    const dateMap = new Map();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.displayDate;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          displayDate: date,
          totalCases: 0,
          caseTypes: new Set()
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalCases++;
      dateData.caseTypes.add(data.caseType);
    });
    
    // Convert to array and sort by date descending (newest first)
    let dates = Array.from(dateMap.values()).map(d => ({
      ...d,
      caseTypes: Array.from(d.caseTypes)
    })).sort((a, b) => b.displayDate.localeCompare(a.displayDate));
    
    // Apply limit if provided
    if (limit) {
      dates = dates.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      totalDates: dates.length,
      dates
    });
    
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### STEP 4: Create Archival Function

Archive data older than 1 year to keep queries fast.

```typescript
exports.archiveOldChecklists = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const cutoffDate = oneYearAgo.toISOString().split('T')[0];
    
    const snapshot = await db.collection('daily_checklist_cases')
      .where('displayDate', '<', cutoffDate)
      .where('archived', '==', false)
      .get();
    
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { archived: true });
    });
    
    await batch.commit();
    
    console.log(`Archived ${snapshot.size} old checklist cases`);
  });
```

## 🧪 TESTING

### Test Case 1: Create Single Case
1. Create a base case on Dec 3, 2024
2. Expected: Case appears on Dec 4, 2024 as "ShackPack - Series 1"
3. Verify API: `getDailyChecklist?orgId=coin-shack&displayDate=2024-12-04`

### Test Case 2: Create Multiple Cases Same Type
1. Create 3 base cases on Dec 3, 2024
2. Expected: Dec 4 shows Series 1, 2, 3
3. Verify series numbers are correct

### Test Case 3: Create Multiple Types
1. Create 2 base, 1 deluxe, 1 xtreme on Dec 3
2. Expected: Dec 4 shows all with correct names and series numbers

### Test Case 4: Next Day Reset
1. Create base case on Dec 3 (Series 1 on Dec 4)
2. Create base case on Dec 4 (Series 1 on Dec 5)
3. Verify series numbers reset per day

### Test Case 5: Available Dates
1. Create cases on multiple dates
2. Call `getAvailableDates`
3. Verify all dates returned

## 📊 EXAMPLE DATA FLOW

**Scenario: Creating cases throughout the day**

**Dec 3, 2024 - 10:00 AM:**
- Create ShackPack Base case
- Result: `base_20241204_001` (Series 1 on Dec 4)

**Dec 3, 2024 - 11:30 AM:**
- Create ShackPack Base case
- Result: `base_20241204_002` (Series 2 on Dec 4)

**Dec 3, 2024 - 2:00 PM:**
- Create ShackPack Deluxe case
- Result: `deluxe_20241204_001` (Series 1 on Dec 4)

**Dec 3, 2024 - 4:00 PM:**
- Create ShackPack Base case
- Result: `base_20241204_003` (Series 3 on Dec 4)

**Dec 4, 2024 - Website Checklist Shows:**
```
December 4, 2024

┌─ ShackPack - Series 1 ─────────────┐
│ [10 coins with details]            │
└────────────────────────────────────┘

┌─ ShackPack - Series 2 ─────────────┐
│ [10 coins with details]            │
└────────────────────────────────────┘

┌─ ShackPack - Series 3 ─────────────┐
│ [10 coins with details]            │
└────────────────────────────────────┘

┌─ ShackPack Deluxe - Series 1 ──────┐
│ [10 coins with details]            │
└────────────────────────────────────┘
```

## ✅ DEPLOYMENT CHECKLIST

- [ ] Database tables created (`daily_checklist_cases`, `daily_checklist_contents`)
- [ ] Indexes added for performance
- [ ] Case creation function updated to call `createDailyChecklistCase`
- [ ] `getDailyChecklist` Cloud Function deployed
- [ ] `getAvailableDates` Cloud Function deployed
- [ ] `archiveOldChecklists` scheduled function deployed
- [ ] CORS enabled on all endpoints
- [ ] Test data created and verified
- [ ] API responses match expected format
- [ ] Error handling implemented
- [ ] Logging added for debugging

## 🔒 IMPORTANT NOTES

1. **Date Calculations**: Always use UTC for date calculations to avoid timezone issues
2. **Series Numbering**: Series numbers are PER case type PER display date
3. **Data Retention**: Keep data for 1 year starting Dec 1, 2025
4. **Performance**: Add database indexes for fast queries
5. **Real-time**: Website should auto-refresh or poll every 30-60 seconds
6. **Error Handling**: Return proper error messages if case creation fails
7. **Validation**: Ensure exactly 10 coins per case before saving

## 📞 QUESTIONS TO RESOLVE

1. Should series numbers include sold cases or only active ones?
2. What happens if a case is deleted - does it affect series numbering?
3. Should we support backdating cases (creating for past dates)?
4. What timezone should we use for midnight cutoff (ET, UTC)?
5. Should coins remain in inventory after being added to a case?

---

## 🎯 SUCCESS CRITERIA

When implementation is complete:
- ✅ Cases created on Day X appear on Day X+1 checklist
- ✅ Series numbering is correct per type per day
- ✅ API returns all cases with complete coin details
- ✅ Available dates API lists all dates with data
- ✅ Data is retained for 1 year
- ✅ Old data is archived automatically
- ✅ CORS is configured for website access
- ✅ All endpoints tested and working

---

**END OF PROMPT - Paste everything above into your inventory app Cursor project**

