# ShackPack Checklist System – Master Guide

This guide covers everything you need to operate, update, and extend the ShackPack checklist system—both the website (already live) and the inventory API (needs historical support).

---

## 1. Current Status Overview

- **Website:** `/checklist` page is live with automated weekly series, case-type tabs, audit-compliant display, and status labels (Available/Limited/Out of Stock).
- **Series Generation:** Automatically creates weekly series starting **November 4, 2024** (system launch week). New weeks generate forever; no manual updates required.
- **API Calls:** Frontend sends requests including `caseType`, `startDate`, and `endDate`. Example:

  ```
  https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist
    ?orgId=coin-shack
    &filter=shackpack
    &caseType=deluxe
    &startDate=2024-11-11
    &endDate=2024-11-17
  ```

- **What’s Missing:** Your Cloud Function currently returns *current* inventory. You must update it to return **historical inventory snapshots** for the requested week.

---

## 2. Quick Action Checklist

1. ✅ **Read Section 3** to understand the API change.
2. ✅ **Copy the prompt in Section 4** into your coin-inventory Cursor project.
3. ✅ **Implement daily snapshots + historical query logic.**
4. ✅ **Test with the curl commands in Section 5.**
5. ✅ **Backfill at least the launch week snapshot.**

Once done, the website will automatically show accurate historical data for every series week.

---

## 3. API Update Requirements

### 3.1. New Query Parameters (optional but recommended)

- `startDate` (`YYYY-MM-DD`) – Week start (Monday)
- `endDate` (`YYYY-MM-DD`) – Week end (Sunday)
- `caseType` – One of `base`, `deluxe`, `xtreme`, `unleashed`, `resurgence`, `transcendent`, `ignite`

### 3.2. Expected Behavior

| Scenario | API Input | Expected Output |
|----------|-----------|-----------------|
| Current inventory | No `startDate` / `endDate` | Return current stock (existing behavior) |
| Historical week | Both dates provided | Return coins that were available **during** that week (in stock, added, or sold) |

### 3.3. Data Requirements

- Track daily snapshots of `inventory` in a Firestore collection like `inventory_snapshots`.
- Each coin document must include:
  - `name`, `years`, `gradingCompanies`, `gradesAvailable`, `grades`
  - `totalQuantity`
  - `caseTypes`: `["base", "deluxe", ...]`

> **Tip:** If you already log sales or inventory adjustments, you can reconstruct historical availability using an event log. Daily snapshots are the simplest and fastest to implement.

---

## 4. Prompt for Coin-Inventory Cursor Project

Copy/paste the text below into your other Cursor workspace. It explains the change and includes sample code.

```
I need to update the getChecklist Cloud Function so it can return historical inventory for a specific week. The website now calls:

  /getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-04&endDate=2024-11-10

Requirements:
1. Accept optional startDate and endDate parameters (YYYY-MM-DD).
2. If dates are omitted → keep current behavior (return current inventory).
3. If dates are provided → return coins that were available during that week.
   - Include coins in stock at the start of the week.
   - Include coins added during the week.
   - Include coins sold during the week.
   - Combine duplicates (same coin name/year/grade).
   - Return the maximum quantity observed that week for availability status.
4. Response should include `startDate`, `endDate`, `caseType`, and `isHistorical: true`.
5. Store daily snapshots of inventory in Firestore (collection: `inventory_snapshots`). Each snapshot should contain all ShackPack-eligible coins and their quantities.
6. Provide a scheduled function (or manual trigger) to create snapshots daily (midnight in Eastern Time).
7. Include utility scripts to backfill the week starting 2024-11-04 using current inventory (temporary baseline).
8. Offer tests (curl commands) to verify both current and historical endpoints.

Implementation hints:
- Create a helper `createDailySnapshot()` storing documents like:
    inventory_snapshots/snapshot-2024-11-11 → { snapshotDate, coins: [...] }
- Update `getChecklist` to query snapshots within startDate-endDate and merge results.
- Use Firestore `where('snapshotDate', '>=', startDate)` to fetch the range.
- Deduplicate coins using `${coin.name}-${coin.year ?? 'various'}-${coin.grade ?? 'various'}` as a key.
- Keep totalQuantity, available, years, gradingCompanies, grades, gradesAvailable fields intact.
- Ensure backwards compatibility so existing callers (without dates) still work.
```

> ✅ After pasting this prompt, follow the assistant’s guidance in that project to modify the Cloud Function.

---

## 5. Detailed Implementation Steps (Backend)

1. **Create Snapshot Function**
   ```javascript
   exports.createDailySnapshot = functions.pubsub
     .schedule('0 0 * * *')                // midnight UTC; adjust timeZone if needed
     .timeZone('America/New_York')
     .onRun(async () => { /* copy snapshot code here */ });
   ```

2. **Update `getChecklist` Function**
   - Parse `startDate`, `endDate`
   - If provided → fetch snapshots in range, merge results, return historical data
   - If not provided → return current inventory (existing logic)

3. **Backfill Launch Week**
   - Run a one-off script to save your current inventory as `snapshot-2024-11-04`
   - Optional: Add more snapshots for the week if you have sales logs

4. **Deploy Functions**
   ```bash
   firebase deploy --only functions:getChecklist,functions:createDailySnapshot
   ```

---

## 6. Testing

### 6.1. Current Inventory (no dates)
```
curl "https://<region>-<project>.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe"
```

### 6.2. Historical Week (with dates)
```
curl "https://<region>-<project>.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-04&endDate=2024-11-10"
```

**Expect:** Different coin sets if availability changed between weeks, and the response should include:
```json
{
  "startDate": "2024-11-04",
  "endDate": "2024-11-10",
  "isHistorical": true,
  ...
}
```

---

## 7. Maintenance Notes

- **Series Automation:** No weekly edits needed; series generate automatically and remain visible for 52+ weeks.
- **Snapshots:** Ensure the scheduled function keeps running. Review logs periodically.
- **Audit Compliance:** Quantities are hidden (status only). Language says “possible contents,” “may appear,” and “contents vary.”
- **Gold Variance:** Each week must reflect actual gold inventory. Keep snapshots accurate.
- **Backups:** Consider exporting snapshots monthly for long-term audit storage.

---

## 8. FAQ

**Q: What if I miss a daily snapshot?**  
A: Run the snapshot function manually for that day (the Cloud Function can accept a `date` parameter for manual replays if you add it).

**Q: Can I use event logs instead of snapshots?**  
A: Yes. Store every inventory/sale event and reconstruct weekly state. It’s more complex but offers a complete audit trail.

**Q: Do I need to update the website again?**  
A: No. Once the API returns historical data, the site automatically shows it—even for future weeks.

---

## 9. File Cleanup Summary

All previous standalone guides (API prompts, status summaries, automation notes) have been consolidated into **this master guide**. Use this single document for everything related to the checklist system.

---

### You’re Ready!
Follow the steps above and the ShackPack checklist will display accurate, historical, audit-compliant data for every weekly series. If you need more help, start by executing the prompt in Section 4 inside your inventory project. Good luck! 🚀


