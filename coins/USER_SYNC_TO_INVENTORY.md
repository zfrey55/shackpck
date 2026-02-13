# User Account Sync to Inventory App

## Overview

All user accounts (registered users and shadow users from guest checkout) should be synced to the inventory app for CRM tracking.

---

## Implementation Plan

### 1. Create User Sync Function

**File**: `coins/lib/inventory-api-push.ts` (add new function)

**Function**: `pushUserToInventory(userData)`

**Data to Send**:
- Email
- Name (if available)
- User ID (from e-commerce site)
- Created date
- Is shadow user (guest checkout)
- Total orders count
- Total spent
- Loyalty points

### 2. Sync Points

**When to sync users**:
1. **User registration** → `/api/auth/register`
2. **Shadow user creation** → `/api/orders` (when guest checkout creates shadow user)
3. **User update** → When user updates profile (future)

### 3. Inventory App API Endpoint

**Endpoint**: `POST /syncUser` (needs to be created in inventory app)

**Request**:
```json
{
  "orgId": "coin-shack",
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "isShadowUser": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "totalOrders": 3,
  "totalSpent": 37497,
  "loyaltyPoints": 125
}
```

**Response**:
```json
{
  "success": true,
  "message": "User synced successfully"
}
```

---

## Implementation Steps

1. **Add user sync function** to `lib/inventory-api-push.ts`
2. **Call on user registration** in `/api/auth/register`
3. **Call on shadow user creation** in `/api/orders`
4. **Add retry logic** (same as pack sales)
5. **Handle errors gracefully** (don't block user registration if sync fails)

---

## Next Steps

I'll implement this now. The inventory app will need to create the `/syncUser` endpoint to receive this data.
