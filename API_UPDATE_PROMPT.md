# API Update Prompt for Coin Inventory Project

## Context
I need the `getChecklist` Cloud Function to support filtering by **case type** so the ShackPack website can display separate checklists for each case (ShackPack, Deluxe, Xtreme, etc.).

---

## Requirements

### Current API Endpoint:
```
https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist
?orgId=coin-shack
&filter=shackpack
```

### Needed Enhancement:
Add a `caseType` parameter to filter coins by specific case type.

### New API Parameters:
```
https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist
?orgId=coin-shack
&filter=shackpack
&caseType=deluxe  // NEW PARAMETER
```

---

## Case Type Values:

The API should accept these `caseType` values:
1. `base` or `shackpack` - Base ShackPack (1x 1/10 oz gold + 9 silver)
2. `deluxe` - ShackPack Deluxe (2x 1/10 oz gold + 8 silver)
3. `xtreme` - ShackPack Xtreme (1x 1/4 oz gold + 9 silver)
4. `unleashed` - ShackPack Unleashed (2x 1/4 oz gold + 8 silver)
5. `resurgence` - ShackPack Resurgence (1x 1/2 oz gold + 9 silver)
6. `transcendent` - ShackPack Transcendent (1x 1 oz gold + 9 silver)
7. `ignite` - ShackPack Ignite (1x 1/4 oz platinum + 9 silver)

---

## Expected Behavior:

### When `caseType` is NOT provided:
- Return ALL ShackPack-eligible coins (current behavior)

### When `caseType` IS provided:
- Return only coins that could appear in THAT specific case type
- Filter based on your inventory tagging system

---

## Response Format:

Keep the same JSON structure, just filter the checklist array:

```json
{
  "success": true,
  "lastUpdated": "2024-11-11T...",
  "caseType": "deluxe",  // NEW: echo back the case type
  "totalTypes": 15,
  "totalCoins": 85,
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
    // ... only coins eligible for ShackPack Deluxe
  ]
}
```

---

## Implementation Notes:

1. **Backward Compatible**: If no `caseType` is provided, return all coins (current behavior)

2. **Case Sensitivity**: Make `caseType` parameter case-insensitive

3. **Error Handling**: If invalid `caseType` is provided, return all coins with a warning:
   ```json
   {
     "success": true,
     "warning": "Invalid caseType 'xyz', returning all coins",
     ...
   }
   ```

4. **CORS**: Keep CORS enabled (already working)

---

## Database/Firestore Changes:

If your coins are stored in Firestore, you might want to add a field to each coin document:

```javascript
{
  name: "Morgan Silver Dollar",
  // ... other fields ...
  eligibleCases: ["base", "deluxe", "xtreme", "unleashed", "resurgence", "transcendent"],
  // This array indicates which cases this coin can appear in
}
```

Then filter based on this field:

```javascript
// Pseudocode in your Cloud Function
if (caseType) {
  coins = coins.filter(coin => 
    coin.eligibleCases && coin.eligibleCases.includes(caseType)
  );
}
```

---

## Testing:

After implementing, test these URLs:

1. All coins (no filter):
   ```
   getChecklist?orgId=coin-shack&filter=shackpack
   ```

2. Deluxe case only:
   ```
   getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe
   ```

3. Base case only:
   ```
   getChecklist?orgId=coin-shack&filter=shackpack&caseType=base
   ```

4. Invalid case type (should return all with warning):
   ```
   getChecklist?orgId=coin-shack&filter=shackpack&caseType=invalid
   ```

---

## Why This is Needed:

The ShackPack website needs to display **separate tabs** for each case type:
- Users click "ShackPack Deluxe" tab
- Website calls API with `caseType=deluxe`
- Display shows ONLY coins eligible for Deluxe cases
- Shows exact quantities available for that case type

This provides transparency and helps customers understand what they might receive in each specific case type.

---

## Priority: HIGH

This is needed for the new series-based checklist system launching this week.

---

**Please implement this enhancement to the getChecklist Cloud Function. Let me know when it's deployed so I can test it!**

