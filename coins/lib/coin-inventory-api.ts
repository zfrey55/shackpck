// API client for coin inventory app integration
// This will pull series data and sales information from the coin inventory app

const COIN_INVENTORY_API_BASE = process.env.COIN_INVENTORY_API_BASE_URL || 
  'https://us-central1-coin-inventory-8b79d.cloudfunctions.net';

const ORG_ID = 'coin-shack';

export interface ChecklistCoin {
  coinType: string;
  year: string;
  grade?: string;
  gradingCompany?: string;
  weight?: string | null; // Weight (e.g., "1 oz", "1/10 oz") or null if not available
  cost: number; // Cost in cents
}

export interface CoinInventorySeries {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  totalPacks: number;
  packsSold: number;
  packsRemaining: number;
  pricePerPack: number; // in cents
  isActive: boolean;
  isFeatured: boolean; // New field to identify featured series
  topHits?: TopHit[]; // Top hits (1-5 coins, manually selected based on Cost)
  caseType?: string; // For linking to checklist API
  displayDate?: string; // For linking to checklist API
  checklist?: ChecklistCoin[]; // Full checklist sorted by cost (highest to lowest)
}

export interface TopHit {
  position: number;
  coinType: string;
  year: string;
  grade?: string;
  gradingCompany?: string;
  cost: number; // Cost in cents (from coin's Cost field)
  description: string; // Required - written in inventory app, read-only in e-commerce app
}

export interface SeriesSalesData {
  seriesId: string;
  packsSold: number;
  lastUpdated: string;
}

/**
 * Fetch featured series from coin inventory app
 * Returns array of all active featured series
 */
export async function fetchFeaturedSeries(): Promise<CoinInventorySeries[]> {
  try {
    const url = `${COIN_INVENTORY_API_BASE}/getFeaturedSeries`;
    const fullUrl = `${url}?orgId=${ORG_ID}`;
    console.log('[fetchFeaturedSeries] Calling inventory app API:', fullUrl);
    
    const response = await fetch(fullUrl, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('[fetchFeaturedSeries] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchFeaturedSeries] Failed to fetch featured series:', response.status, errorText);
      
      // Check if it's a Firestore index error
      if (errorText.includes('FAILED_PRECONDITION') && errorText.includes('index')) {
        const urlMatch = errorText.match(/https:\/\/[^\s"]+/);
        if (urlMatch) {
          console.error('[fetchFeaturedSeries] ⚠️  FIRESTORE INDEX REQUIRED:', urlMatch[0]);
          console.error('[fetchFeaturedSeries] The inventory app needs a Firestore index. Click the link above to create it.');
        }
      }
      
      return [];
    }
    
    const data = await response.json();
    console.log('[fetchFeaturedSeries] Raw API response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      console.error('[fetchFeaturedSeries] API returned success: false', data);
      return [];
    }
    
    // Ensure we always return an array
    if (Array.isArray(data.series)) {
      console.log('[fetchFeaturedSeries] Returning array of', data.series.length, 'series');
      return data.series;
    } else if (data.series) {
      // Handle case where API returns single object
      console.log('[fetchFeaturedSeries] Returning single series as array');
      return [data.series];
    }
    
    console.warn('[fetchFeaturedSeries] No series found in response');
    return [];
  } catch (error) {
    console.error('[fetchFeaturedSeries] Error fetching featured series:', error);
    return [];
  }
}

/**
 * Fetch all active series from coin inventory app
 */
export async function fetchAllSeries(): Promise<CoinInventorySeries[]> {
  try {
    // TODO: Update this endpoint once it's created in coin inventory app
    const url = `${COIN_INVENTORY_API_BASE}/getSeries`;
    const response = await fetch(`${url}?orgId=${ORG_ID}&active=true`);
    
    if (!response.ok) {
      console.error('Failed to fetch series:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.series : [];
  } catch (error) {
    console.error('Error fetching series:', error);
    return [];
  }
}

/**
 * Fetch sales data for series (packs sold count)
 * This will be polled periodically to sync inventory
 */
export async function fetchSeriesSales(): Promise<SeriesSalesData[]> {
  try {
    // TODO: Update this endpoint once it's created in coin inventory app
    const url = `${COIN_INVENTORY_API_BASE}/getSeriesSales`;
    const response = await fetch(`${url}?orgId=${ORG_ID}`);
    
    if (!response.ok) {
      console.error('Failed to fetch series sales:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.sales : [];
  } catch (error) {
    console.error('Error fetching series sales:', error);
    return [];
  }
}

/**
 * Sync series data from coin inventory app to local database
 * This will be called periodically or on-demand
 */
export async function syncSeriesFromInventory(): Promise<void> {
  try {
    const featuredSeries = await fetchFeaturedSeries();
    const salesData = await fetchSeriesSales();
    
    // TODO: Update local database with synced data
    // This will be implemented in the API route
    
    if (featuredSeries) {
      // Update or create series in database
      // Update packsSold from sales data
    }
  } catch (error) {
    console.error('Error syncing series:', error);
  }
}
