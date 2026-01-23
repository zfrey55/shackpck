# Inventory App Fix Prompt

Copy and paste this into your Inventory App Cursor project:

---

## Fix Series Names and Date Issues

I need to fix three issues in the inventory app:

### 1. Normalize Case Type Values (Case Sensitivity Fix)

**Problem:** Case types are case-sensitive (e.g., "Prominence" vs "prominence"), causing them to appear as different series in the frontend.

**Required Fix:**
- Normalize all `caseType` values to **lowercase** when:
  - Creating new cases
  - Storing cases in the database
  - Returning data from `getAvailableDates` and `getDailyChecklist` endpoints
- Update existing database records to normalize all case types to lowercase
- Ensure the API always returns lowercase `caseType` values

**Test:** After fixing, verify that `getAvailableDates` returns all case types in lowercase (e.g., "prominence" not "Prominence").

---

### 2. Rename Case Types (e.g., "gold indian head" → "aura")

**Problem:** Some case types need to be renamed to their canonical names.

**Required Fix:**
- Update the database to change "gold indian head" (and any variations) to "aura"
- Update any code that creates cases to use "aura" instead of "gold indian head"
- Ensure the API returns the correct `caseType` value ("aura") and appropriate `caseTypeName`

**Note:** If there are other case types that need renaming, please normalize them to their canonical lowercase names as well.

---

### 3. Fix Display Date Calculation (Date Showing Day After)

**Problem:** Cases are appearing on the checklist for the day after they are created, instead of the day they are created.

**Required Fix:**
- Fix the `displayDate` calculation to use the **local date** of when the case was created (not UTC)
- Ensure `displayDate` matches the actual creation date in the user's local timezone
- Check for timezone conversion issues or date offset bugs

**Example fix approach:**
```javascript
// Use local date, not UTC
const createdDateObj = new Date(createdDate);
const year = createdDateObj.getFullYear();
const month = String(createdDateObj.getMonth() + 1).padStart(2, '0');
const day = String(createdDateObj.getDate()).padStart(2, '0');
const displayDate = `${year}-${month}-${day}`;
```

**Test:** Create a case and verify it appears on the checklist for the same day it was created, not the next day.

---

## Response Template

After completing these fixes, please provide a response in this format that I can paste back into the website project:

```
## Inventory App Fixes Completed

### 1. Case Type Normalization
- [ ] All case types normalized to lowercase
- [ ] Database updated with normalized values
- [ ] API endpoints return lowercase case types
- **Test Result:** [Describe test results]

### 2. Case Type Renaming
- [ ] "gold indian head" renamed to "aura"
- [ ] Database updated
- [ ] Code updated to use new names
- **Other renames:** [List any other case types that were renamed]

### 3. Display Date Fix
- [ ] displayDate calculation fixed to use local date
- [ ] Timezone issues resolved
- **Test Result:** [Describe test results - cases now show on correct day]

### Additional Notes:
[Any other relevant information, edge cases handled, etc.]
```

---

**Priority:** Please fix these in order (1, 2, 3) and test each fix before moving to the next.

