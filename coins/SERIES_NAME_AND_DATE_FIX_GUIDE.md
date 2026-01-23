# Series Name and Date Fix Guide

## Issue 1: Series Name Case Sensitivity

### Problem
Some series are showing as different series because of case sensitivity (e.g., "Prominence" vs "prominence"). This happens because the API returns case-sensitive `caseType` values, and the frontend treats them as different keys.

### Best Solution: Fix in Inventory App/API ✅ **RECOMMENDED**

**Location:** In the inventory app where cases are created and stored

**What to do:**
1. Normalize all `caseType` values to lowercase (or a consistent case) when:
   - Creating new cases
   - Storing cases in the database
   - Returning data from API endpoints (`getAvailableDates`, `getDailyChecklist`)

2. Update existing data in the database to normalize all case types to lowercase

**Why this is best:**
- Fixes the root cause
- Ensures data consistency
- Prevents future issues
- No frontend workarounds needed

### Temporary Solution: Frontend Normalization

If you can't fix it in the API immediately, we can add normalization in the frontend. However, this is less ideal because:
- It's a workaround, not a fix
- May cause issues if the API returns inconsistent casing
- Requires maintaining normalization logic

---

## Issue 2: Series Name Renaming (e.g., "gold indian head" → "Aura")

### Problem
Some series need to be renamed (e.g., "gold indian head" should display as "Aura").

### Best Solution: Fix in Inventory App/API ✅ **RECOMMENDED**

**Location:** In the inventory app where cases are created

**What to do:**
1. Update the `caseType` value in the database from "gold indian head" to "aura" (or whatever the canonical ID should be)
2. Update any code that creates cases to use the new canonical name
3. Ensure the API returns the correct `caseType` and `caseTypeName` values

**Alternative:** If you want to keep the database value as "gold indian head" but display it as "Aura":
- Update the `caseTypeName` field in the API response
- Add a mapping in the frontend's `CASE_TYPE_DISPLAY_NAMES` (see below)

### Frontend Display Mapping

If you need a quick display fix while waiting for the API update, you can add to `CASE_TYPE_DISPLAY_NAMES` in:
- `coins/app/checklist/page.tsx`
- `coins/components/ContactForm.tsx`

Example:
```typescript
const CASE_TYPE_DISPLAY_NAMES: Record<string, string> = {
  // ... existing entries
  'gold indian head': 'Aura',
  'gold-indian-head': 'Aura', // if it uses hyphens
  // ... etc
};
```

**Note:** This only fixes the display name, not the underlying `caseType` value used for filtering/grouping.

---

## Issue 3: Date Showing Day After Creation

### Problem
Cases are appearing on the checklist for the day after they are created, instead of the day they are created.

### Best Solution: Fix in Inventory App/API ✅ **REQUIRED**

**Location:** In the inventory app where `displayDate` is calculated

**What to do:**
1. Check how `displayDate` is calculated when cases are created
2. Likely causes:
   - Using UTC time instead of local time
   - Adding a day offset
   - Timezone conversion issues
3. Fix the calculation to use the creation date's **local date** (not UTC)
4. Ensure `displayDate` matches the date the case was actually created

**Example fix (pseudo-code):**
```javascript
// WRONG - might be doing this:
const displayDate = new Date(createdDate).toISOString().split('T')[0]; // Uses UTC

// CORRECT - should do this:
const createdDateObj = new Date(createdDate);
const year = createdDateObj.getFullYear();
const month = String(createdDateObj.getMonth() + 1).padStart(2, '0');
const day = String(createdDateObj.getDate()).padStart(2, '0');
const displayDate = `${year}-${month}-${day}`; // Uses local date
```

**Why this must be fixed in the API:**
- The frontend only displays what the API returns
- The `displayDate` field is set when cases are created
- Frontend cannot fix incorrect dates from the API

---

## Summary

| Issue | Best Fix Location | Can Frontend Fix? |
|-------|------------------|-------------------|
| Case sensitivity (Prominence vs prominence) | Inventory App/API | Temporary workaround only |
| Series renaming (gold indian head → Aura) | Inventory App/API | Display name only |
| Date showing day after | Inventory App/API | No - must fix in API |

---

## Next Steps

1. **For case sensitivity:** Update the inventory app to normalize all `caseType` values to lowercase
2. **For renaming:** Update the inventory app to use canonical case type names (e.g., "aura" instead of "gold indian head")
3. **For dates:** Fix the `displayDate` calculation in the inventory app to use local date instead of UTC

If you need temporary frontend fixes while waiting for API updates, I can implement those, but the proper fix should be in the inventory app/API.

