# ShackPack Checklist API Tests

Use these curl commands to verify the live checklist endpoints and snapshot helpers.

```bash
# 1) Fetch all ShackPack-eligible coins (current inventory)
curl "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack"

# 2) Fetch current inventory for the Deluxe case type only
curl "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe"

# 3) Fetch historical Deluxe checklist for Nov 4–10, 2024
curl "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack&caseType=deluxe&startDate=2024-11-04&endDate=2024-11-10"

# 4) Create a specific snapshot (YYYY-MM-DD = target date)
curl -X POST "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/createInventorySnapshot?orgId=coin-shack&date=YYYY-MM-DD"

# 5) Seed the initial launch week snapshots (Nov 4–10, 2024)
curl -X POST "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/backfillInventorySnapshots?orgId=coin-shack"
```

> Tip: Run the backfill endpoint at least once so historical views populate immediately on the website.


