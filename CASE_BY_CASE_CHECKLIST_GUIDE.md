# Case-by-Case Checklist System Guide

**⚠️ FOR FUTURE IMPLEMENTATION - DO NOT IMPLEMENT NOW**

This guide explains how to set up a checklist system where each individual case created in your inventory app gets its own dedicated series showing exactly what coins are in that specific case.

---

## 🎯 Overview

### Current System (Weekly Aggregation)
- Groups all cases by week (Monday-Sunday)
- Shows aggregate inventory for that week
- Series name: "Nov 25 - Dec 1, 2024"

### New System (Case-by-Case)
- Each case gets its own individual series
- Shows exact coins in that specific case
- Series name: "ShackPack Base #3 - Dec 2, 2024"
- Real-time creation when case is created in inventory app

---

## 📊 How It Works

### 1. **Series Creation Trigger**
When you create a new case in your inventory app:

```
User Action: Create new case
  ↓
Backend: Save case to database
  ↓
Backend: Generate series metadata
  ↓
Backend: Create checklist entry
  ↓
Frontend: Fetch and display new series automatically
```

### 2. **Series Naming Convention**

**Format**: `{Case Type Name} #{Daily Count} - {Date}`

**Examples**:
- `ShackPack Base #1 - Dec 2, 2024` (first base case created on Dec 2)
- `ShackPack Base #2 - Dec 2, 2024` (second base case created on Dec 2)
- `ShackPack Deluxe #1 - Dec 2, 2024` (first deluxe case created on Dec 2)
- `ShackPack Xtreme #5 - Dec 3, 2024` (fifth xtreme case created on Dec 3)

**Case Type Names**:
- ShackPack Base
- ShackPack Deluxe
- ShackPack Xtreme
- ShackPack Unleashed
- ShackPack Resurgence
- ShackPack Transcendent
- ShackPack Ignite
- ShackPack Eclipse
- ShackPack Radiant

### 3. **Data Structure**

Each series will contain the exact coins from that specific case:

```json
{
  "seriesId": "case_12345",
  "seriesName": "ShackPack Base #3 - Dec 2, 2024",
  "caseType": "base",
  "caseNumber": 3,
  "createdDate": "2024-12-02T14:30:00Z",
  "coins": [
    {
      "coinType": "American Gold Eagle",
      "year": "2023",
      "grade": "MS70",
      "gradingCompany": "NGC"
    },
    {
      "coinType": "Morgan Silver Dollar",
      "year": "1921",
      "grade": "MS64",
      "gradingCompany": "PCGS"
    },
    {
      "coinType": "American Silver Eagle",
      "year": "2022",
      "grade": "MS69",
      "gradingCompany": "NGC"
    }
    // ... 7 more silver coins (total 10 coins per case)
  ]
}
```

---

## 🔧 Backend Implementation Requirements

### Step 1: Update Your Inventory App Database Schema

You'll need to track case creation and associate coins with specific cases:

**New/Updated Tables**:

```sql
-- Cases table
CREATE TABLE cases (
  case_id VARCHAR(50) PRIMARY KEY,
  case_type VARCHAR(50) NOT NULL,  -- 'base', 'deluxe', 'xtreme', etc.
  daily_number INT NOT NULL,       -- 1, 2, 3, etc. (resets daily)
  created_date DATE NOT NULL,
  created_timestamp TIMESTAMP NOT NULL,
  org_id VARCHAR(50) NOT NULL
);

-- Case contents table (links coins to cases)
CREATE TABLE case_contents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id VARCHAR(50) REFERENCES cases(case_id),
  coin_id VARCHAR(50) REFERENCES inventory(id),
  coin_type VARCHAR(200) NOT NULL,
  year VARCHAR(20) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  grading_company VARCHAR(50) NOT NULL
);

-- Index for fast lookups
CREATE INDEX idx_cases_org_date ON cases(org_id, created_date DESC);
CREATE INDEX idx_case_contents ON case_contents(case_id);
```

### Step 2: Create Cloud Function to Generate Case ID

When creating a case in your inventory app:

```typescript
// Cloud Function: generateCaseId
exports.generateCaseId = functions.https.onCall(async (data, context) => {
  const { orgId, caseType } = data;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get count of cases created today for this type
  const snapshot = await db.collection('cases')
    .where('orgId', '==', orgId)
    .where('caseType', '==', caseType)
    .where('createdDate', '==', today)
    .get();
  
  const dailyNumber = snapshot.size + 1;
  const caseId = `${caseType}_${today}_${dailyNumber}`;
  
  return {
    caseId,
    dailyNumber,
    createdDate: today
  };
});
```

### Step 3: Update Case Creation Logic

When user creates a case in your inventory app:

```typescript
async function createCase(caseType: string, selectedCoins: Coin[]) {
  // 1. Generate case ID and metadata
  const { caseId, dailyNumber, createdDate } = await generateCaseId({
    orgId: 'coin-shack',
    caseType
  });
  
  // 2. Save case to database
  await db.collection('cases').doc(caseId).set({
    caseId,
    caseType,
    dailyNumber,
    createdDate,
    createdTimestamp: new Date(),
    orgId: 'coin-shack',
    status: 'created'
  });
  
  // 3. Link coins to case
  for (const coin of selectedCoins) {
    await db.collection('case_contents').add({
      caseId,
      coinId: coin.id,
      coinType: coin.type,
      year: coin.year,
      grade: coin.grade,
      gradingCompany: coin.gradingCompany
    });
  }
  
  // 4. Update inventory status
  for (const coin of selectedCoins) {
    await db.collection('inventory').doc(coin.id).update({
      status: 'in_case',
      caseId,
      assignedDate: new Date()
    });
  }
  
  return caseId;
}
```

### Step 4: Create New API Endpoint for Case-Based Checklist

**Endpoint**: `getCaseBasedChecklist`

```typescript
// Cloud Function: getCaseBasedChecklist
exports.getCaseBasedChecklist = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const { orgId, caseId, limit } = req.query;
  
  try {
    let query = db.collection('cases')
      .where('orgId', '==', orgId)
      .orderBy('createdTimestamp', 'desc');
    
    // If specific caseId requested, get that case
    if (caseId) {
      const caseDoc = await db.collection('cases').doc(caseId).get();
      if (!caseDoc.exists) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      
      const caseData = caseDoc.data();
      const coins = await getCaseContents(caseId);
      
      return res.json({
        success: true,
        case: formatCaseForChecklist(caseData, coins)
      });
    }
    
    // Otherwise, get list of all cases
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const cases = [];
    
    for (const doc of snapshot.docs) {
      const caseData = doc.data();
      const coins = await getCaseContents(doc.id);
      cases.push(formatCaseForChecklist(caseData, coins));
    }
    
    res.json({
      success: true,
      totalCases: cases.length,
      cases
    });
    
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function getCaseContents(caseId: string) {
  const snapshot = await db.collection('case_contents')
    .where('caseId', '==', caseId)
    .get();
  
  return snapshot.docs.map(doc => doc.data());
}

function formatCaseForChecklist(caseData: any, coins: any[]) {
  const caseTypeNames = {
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
  
  const formattedDate = new Date(caseData.createdDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return {
    caseId: caseData.caseId,
    seriesName: `${caseTypeNames[caseData.caseType]} #${caseData.dailyNumber} - ${formattedDate}`,
    caseType: caseData.caseType,
    caseNumber: caseData.dailyNumber,
    createdDate: caseData.createdDate,
    createdTimestamp: caseData.createdTimestamp,
    coins: coins.map(coin => ({
      coinType: coin.coinType,
      year: coin.year,
      grade: coin.grade,
      gradingCompany: coin.gradingCompany
    }))
  };
}
```

**API Response Example**:

```json
{
  "success": true,
  "totalCases": 150,
  "cases": [
    {
      "caseId": "base_2024-12-02_3",
      "seriesName": "ShackPack Base #3 - Dec 2, 2024",
      "caseType": "base",
      "caseNumber": 3,
      "createdDate": "2024-12-02",
      "createdTimestamp": "2024-12-02T14:30:00Z",
      "coins": [
        {
          "coinType": "American Gold Eagle",
          "year": "2023",
          "grade": "MS70",
          "gradingCompany": "NGC"
        },
        {
          "coinType": "Morgan Silver Dollar",
          "year": "1921",
          "grade": "MS64",
          "gradingCompany": "PCGS"
        }
        // ... 8 more coins
      ]
    },
    {
      "caseId": "base_2024-12-02_2",
      "seriesName": "ShackPack Base #2 - Dec 2, 2024",
      "caseType": "base",
      "caseNumber": 2,
      "createdDate": "2024-12-02",
      "createdTimestamp": "2024-12-02T10:15:00Z",
      "coins": [...]
    }
    // ... more cases
  ]
}
```

---

## 🎨 Frontend Implementation Requirements

### Step 1: Create New Types

```typescript
// coins/app/checklist/types.ts
export interface CaseSeriesData {
  caseId: string;
  seriesName: string;
  caseType: string;
  caseNumber: number;
  createdDate: string;
  createdTimestamp: string;
  coins: CaseCoin[];
}

export interface CaseCoin {
  coinType: string;
  year: string;
  grade: string;
  gradingCompany: string;
}

export interface CaseChecklistResponse {
  success: boolean;
  totalCases: number;
  cases: CaseSeriesData[];
}
```

### Step 2: Create API Fetch Function

```typescript
// coins/app/checklist/api.ts
const API_BASE = "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getCaseBasedChecklist";

export async function fetchCaseBasedChecklist(
  limit?: number
): Promise<CaseChecklistResponse> {
  const params = new URLSearchParams({
    orgId: "coin-shack"
  });
  
  if (limit) {
    params.append('limit', limit.toString());
  }

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch checklist");
  return response.json();
}

export async function fetchSpecificCase(
  caseId: string
): Promise<{ success: boolean; case: CaseSeriesData }> {
  const params = new URLSearchParams({
    orgId: "coin-shack",
    caseId
  });

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch case");
  return response.json();
}
```

### Step 3: Create UI Components

```typescript
// coins/app/checklist/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { CaseSeriesData } from "./types";
import { fetchCaseBasedChecklist } from "./api";

export default function ChecklistPage() {
  const [cases, setCases] = useState<CaseSeriesData[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseSeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      const data = await fetchCaseBasedChecklist(100); // Show last 100 cases
      setCases(data.cases);
      if (data.cases.length > 0) {
        setSelectedCase(data.cases[0]); // Select most recent case
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={loadCases} />;

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gold">ShackPack Case Checklists</h1>
          <p className="text-lg text-slate-300">
            View exact contents of each individual ShackPack case
          </p>
        </header>

        {/* Case Series Navigation */}
        <nav className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-200">Select a Case</h2>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {cases.map(caseData => (
              <button
                key={caseData.caseId}
                onClick={() => setSelectedCase(caseData)}
                className={`
                  text-left px-4 py-3 rounded border transition-colors
                  ${selectedCase?.caseId === caseData.caseId
                    ? 'bg-gold text-slate-900 border-gold'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-gold'
                  }
                `}
              >
                {caseData.seriesName}
              </button>
            ))}
          </div>
        </nav>

        {/* Case Contents Display */}
        {selectedCase && (
          <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">
              {selectedCase.seriesName}
            </h2>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Case ID: {selectedCase.caseId} • 
                Created: {new Date(selectedCase.createdTimestamp).toLocaleString()}
              </p>
              
              <h3 className="text-lg font-semibold text-slate-200">
                Coins in This Case ({selectedCase.coins.length}):
              </h3>
              
              <ul className="space-y-2">
                {selectedCase.coins.map((coin, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <span className="text-gold">•</span>
                    <div>
                      <span className="font-semibold">{coin.coinType}</span>
                      <span className="text-slate-400 ml-2">
                        {coin.year} • {coin.gradingCompany} {coin.grade}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <footer className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300 space-y-2">
          <p>
            This checklist shows the exact coins that were included in each specific ShackPack case.
            Each case is unique and contents vary.
          </p>
          <p className="text-xs text-slate-500">
            Cases listed in chronological order (newest first) • No purchase necessary to view
          </p>
        </footer>
      </div>
    </main>
  );
}
```

---

## 📝 Implementation Prompt for Your API Project

**Copy this into your inventory app Cursor project when you're ready to implement:**

```
I need to implement a case-by-case checklist system for ShackPack. Here's what I need:

## Requirements:

1. **Database Schema Updates**:
   - Create `cases` table to track each case created
   - Create `case_contents` table to link coins to specific cases
   - Track daily case numbers per case type (resets daily)

2. **Case Creation Flow**:
   - When I create a case, generate a unique case ID
   - Format: `{caseType}_{date}_{dailyNumber}` (e.g., "base_2024-12-02_3")
   - Track which coins go into each case
   - Update inventory status to "in_case"

3. **Series Naming**:
   - Format: "{Case Type Name} #{Daily Number} - {Date}"
   - Example: "ShackPack Base #3 - Dec 2, 2024"
   - Daily numbers reset at midnight (first case of day is #1)

4. **New API Endpoint**: `getCaseBasedChecklist`
   - Parameters: `orgId` (required), `caseId` (optional), `limit` (optional)
   - Returns list of cases with exact coins in each
   - For each coin, return: `coinType`, `year`, `grade`, `gradingCompany`
   - Order: Most recent cases first

5. **API Response Format**:
```json
{
  "success": true,
  "totalCases": 150,
  "cases": [
    {
      "caseId": "base_2024-12-02_3",
      "seriesName": "ShackPack Base #3 - Dec 2, 2024",
      "caseType": "base",
      "caseNumber": 3,
      "createdDate": "2024-12-02",
      "createdTimestamp": "2024-12-02T14:30:00Z",
      "coins": [
        {
          "coinType": "American Gold Eagle",
          "year": "2023",
          "grade": "MS70",
          "gradingCompany": "NGC"
        }
      ]
    }
  ]
}
```

## Case Types:
- base, deluxe, xtreme, unleashed, resurgence, transcendent, ignite, eclipse, radiant

Please implement:
1. Database schema changes
2. Case ID generation function
3. Updated case creation logic to track coins
4. New getCaseBasedChecklist Cloud Function
5. Any necessary database migrations

Reference the full implementation guide in CASE_BY_CASE_CHECKLIST_GUIDE.md for detailed specifications.
```

---

## 🔄 How Data Flows

### Creating a Case:
1. User selects coins in inventory app
2. User clicks "Create ShackPack Base Case"
3. System checks: How many base cases created today? (e.g., 2)
4. System generates: `base_2024-12-02_3` (this will be case #3)
5. System saves case record
6. System links all selected coins to this case
7. System updates coin statuses to "in_case"

### Viewing Checklist:
1. User visits `/checklist` on website
2. Frontend calls: `getCaseBasedChecklist?orgId=coin-shack&limit=100`
3. API returns last 100 cases created
4. Frontend displays as list: "ShackPack Base #3 - Dec 2, 2024"
5. User clicks a case
6. Frontend displays exact coins in that case with Year, Type, Grade, Company

---

## 🎯 Key Differences from Current System

| Feature | Current (Weekly Aggregation) | New (Case-by-Case) |
|---------|----------------------------|-------------------|
| **Series Creation** | Automatic (every Monday) | On-demand (when case created) |
| **Series Name** | "Nov 25 - Dec 1, 2024" | "ShackPack Base #3 - Dec 2, 2024" |
| **Data Shown** | Aggregated weekly inventory | Exact coins in specific case |
| **Number of Series** | 52 (one per week) | Unlimited (one per case) |
| **Update Frequency** | Weekly | Real-time |
| **Coin Info** | Aggregated types/grades | Exact coin details |

---

## 💡 Benefits

1. **Transparency**: Customers can see exactly what's in each case
2. **Traceability**: Every case has a unique ID and creation date
3. **Real-time**: Checklist updates immediately when case is created
4. **Audit-Friendly**: Complete record of what went into each case
5. **Flexibility**: Can show recent cases or search by case ID

---

## ⚠️ Important Considerations

### Audit Compliance
Even with exact coin listings, you should:
- ✅ Still use "may contain" language
- ✅ NOT show prices or values
- ✅ NOT guarantee specific coins in future cases
- ✅ Include disclaimer that each case is unique

### Performance
- With many cases, consider pagination
- Default to showing last 100 cases
- Add search/filter functionality later
- Cache case data on frontend

### Privacy
- Consider whether to show sold vs. available cases
- May want to hide case IDs from public view
- Could show only "available" cases

---

## 🚀 Implementation Timeline Suggestion

When you're ready to implement:

1. **Week 1**: Backend database schema and case creation updates
2. **Week 2**: New API endpoint and testing
3. **Week 3**: Frontend UI implementation
4. **Week 4**: Testing, refinement, deployment

---

## 📚 Related Files

When implementing:
- Backend: Update your inventory app
- Frontend: `coins/app/checklist/page.tsx`
- API: Create new Cloud Function `getCaseBasedChecklist`
- Database: Add `cases` and `case_contents` tables

---

**Status**: 📋 Documentation Only - Ready for Future Implementation
**Created**: December 2, 2024
**Current System**: Google Sheets embed (can revert to weekly aggregation API using `API_RECONNECTION_GUIDE.md`)

