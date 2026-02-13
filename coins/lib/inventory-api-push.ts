// API client for pushing sales data to coin inventory app
// This pushes pack sales from e-commerce site to inventory site

const INVENTORY_API_BASE = process.env.COIN_INVENTORY_API_BASE_URL || 
  'https://us-central1-coin-inventory-8b79d.cloudfunctions.net';

const ORG_ID = 'coin-shack';

export interface PackSaleData {
  seriesId: string; // Series ID from inventory app (or series slug/identifier)
  seriesType: string; // Series type/name
  packsSold: number; // Number of packs sold in this transaction
  saleAmount: number; // Total sale amount in cents
  saleAmountPerPack: number; // Sale amount per pack in cents
  orderId: string; // Order ID from e-commerce site
  timestamp: string; // ISO timestamp of sale
}

export interface PackSaleResponse {
  success: boolean;
  message?: string;
  packsRemaining?: number; // Updated packs remaining count
  error?: string;
}

/**
 * Push pack sale to inventory app
 * Retries up to 3 times on failure, then alerts admin
 */
export async function pushPackSaleToInventory(
  saleData: PackSaleData,
  retryCount: number = 0
): Promise<PackSaleResponse> {
  const MAX_RETRIES = 3;

  try {
    const url = `${INVENTORY_API_BASE}/recordPackSale`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orgId: ORG_ID,
        ...saleData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inventory API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from inventory API');
    }

    return data;
  } catch (error: any) {
    console.error(`Error pushing pack sale to inventory (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

    // Retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return pushPackSaleToInventory(saleData, retryCount + 1);
    }

    // Max retries exceeded - alert admin
    await alertAdminOfFailedPush(saleData, error);
    
    return {
      success: false,
      error: `Failed after ${MAX_RETRIES + 1} attempts: ${error.message}`,
    };
  }
}

/**
 * Alert admin when pack sale push fails after all retries
 */
async function alertAdminOfFailedPush(
  saleData: PackSaleData,
  error: Error
): Promise<void> {
  try {
    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    if (adminEmail) {
      // Use your email service to send alert
      // This is a placeholder - you'll need to implement based on your email service
      console.error('ADMIN ALERT: Failed to push pack sale to inventory', {
        saleData,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      // TODO: Implement actual email sending
      // await sendEmail({
      //   to: adminEmail,
      //   subject: 'URGENT: Failed to Push Pack Sale to Inventory',
      //   body: `...`
      // });
    }
  } catch (alertError) {
    console.error('Failed to alert admin of failed push:', alertError);
  }
}

// User sync interfaces
export interface UserSyncData {
  userId: string; // User ID from e-commerce site
  email: string;
  name?: string | null;
  isShadowUser: boolean;
  createdAt: string; // ISO timestamp
  totalOrders?: number;
  totalSpent?: number; // In cents
  loyaltyPoints?: number;
}

export interface UserSyncResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Push user account to inventory app for CRM tracking
 * Retries up to 3 times on failure, then logs error (non-blocking)
 */
export async function pushUserToInventory(
  userData: UserSyncData,
  retryCount: number = 0
): Promise<UserSyncResponse> {
  const MAX_RETRIES = 3;

  try {
    const url = `${INVENTORY_API_BASE}/syncUser`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orgId: ORG_ID,
        ...userData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inventory API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from inventory API');
    }

    return data;
  } catch (error: any) {
    console.error(`Error pushing user to inventory (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

    // Retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return pushUserToInventory(userData, retryCount + 1);
    }

    // Max retries exceeded - log but don't block user creation
    console.error('Failed to sync user to inventory after all retries:', {
      userData,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: false,
      error: `Failed after ${MAX_RETRIES + 1} attempts: ${error.message}`,
    };
  }
}
