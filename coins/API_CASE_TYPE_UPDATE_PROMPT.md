# API Case Type Update Prompt

## For Inventory App Cursor Project:

The `getAvailableDates` API endpoint is not returning the following case types in the `caseTypes` array:
- `reign`
- `apex`
- `prominence`
- `currencyclash`

**Issue:** When cases with these case types are created, they are not appearing in the `caseTypes` array returned by `getAvailableDates`, which means they don't show up in the checklist interface.

**Required Fix:**
1. Check the `getAvailableDates` function/endpoint
2. Ensure it includes ALL case types that have cases created, including: `reign`, `apex`, `prominence`, and `currencyclash`
3. Verify that when cases are created with these case types, they are properly included in the `caseTypes` array for their respective `displayDate`

**Test:** After fixing, verify by calling:
```
https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getAvailableDates?orgId=coin-shack
```
And confirm that dates with `reign`, `apex`, `prominence`, or `currencyclash` cases include these values in their `caseTypes` array.

---

## Return Prompt for Website Cursor Project:

After the API has been updated to include `reign`, `apex`, `prominence`, and `currencyclash` in the `getAvailableDates` response, verify that these case types now appear in the checklist-test page at `/checklist-test`. No code changes should be needed as the frontend already supports these case types - they just need to be returned by the API.

