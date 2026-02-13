import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (uses no-store fetch)
export const dynamic = 'force-dynamic';

// GET /api/debug-inventory - Debug inventory app API connection
export async function GET(request: NextRequest) {
  try {
    const COIN_INVENTORY_API_BASE = process.env.COIN_INVENTORY_API_BASE_URL || 
      'https://us-central1-coin-inventory-8b79d.cloudfunctions.net';
    const ORG_ID = 'coin-shack';
    
    const debug: any = {
      timestamp: new Date().toISOString(),
      apiBase: COIN_INVENTORY_API_BASE,
      orgId: ORG_ID,
      tests: {},
    };

    // Test 1: Direct API call to getFeaturedSeries
    try {
      const url = `${COIN_INVENTORY_API_BASE}/getFeaturedSeries?orgId=${ORG_ID}`;
      debug.tests.directApiCall = {
        url,
        status: 'testing...',
      };

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      debug.tests.directApiCall.status = response.status;
      debug.tests.directApiCall.ok = response.ok;

      if (response.ok) {
        const text = await response.text();
        debug.tests.directApiCall.rawResponse = text;
        
        try {
          const json = JSON.parse(text);
          debug.tests.directApiCall.parsedResponse = json;
          debug.tests.directApiCall.hasSuccess = json.success !== undefined;
          debug.tests.directApiCall.success = json.success;
          debug.tests.directApiCall.hasSeries = json.series !== undefined;
          debug.tests.directApiCall.seriesType = Array.isArray(json.series) ? 'array' : typeof json.series;
          debug.tests.directApiCall.seriesCount = Array.isArray(json.series) ? json.series.length : (json.series ? 1 : 0);
          
          if (Array.isArray(json.series)) {
            debug.tests.directApiCall.series = json.series.map((s: any) => ({
              id: s.id,
              name: s.name,
              isActive: s.isActive,
              isFeatured: s.isFeatured,
              packsRemaining: s.packsRemaining,
              totalPacks: s.totalPacks,
              packsSold: s.packsSold,
            }));
          } else if (json.series) {
            debug.tests.directApiCall.series = [{
              id: json.series.id,
              name: json.series.name,
              isActive: json.series.isActive,
              isFeatured: json.series.isFeatured,
              packsRemaining: json.series.packsRemaining,
              totalPacks: json.series.totalPacks,
              packsSold: json.series.packsSold,
            }];
          }
        } catch (parseError: any) {
          debug.tests.directApiCall.parseError = parseError.message;
          debug.tests.directApiCall.parseErrorStack = parseError.stack;
        }
      } else {
        const errorText = await response.text();
        debug.tests.directApiCall.errorText = errorText;
      }
    } catch (error: any) {
      debug.tests.directApiCall = {
        error: error.message,
        errorName: error.name,
        stack: error.stack,
      };
    }

    // Test 2: Test getSeries endpoint
    try {
      const url = `${COIN_INVENTORY_API_BASE}/getSeries?orgId=${ORG_ID}&active=true`;
      debug.tests.getAllSeries = {
        url,
        status: 'testing...',
      };

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      debug.tests.getAllSeries.status = response.status;
      debug.tests.getAllSeries.ok = response.ok;

      if (response.ok) {
        const text = await response.text();
        debug.tests.getAllSeries.rawResponse = text;
        
        try {
          const json = JSON.parse(text);
          debug.tests.getAllSeries.parsedResponse = json;
          debug.tests.getAllSeries.hasSuccess = json.success !== undefined;
          debug.tests.getAllSeries.success = json.success;
          debug.tests.getAllSeries.hasSeries = json.series !== undefined;
          debug.tests.getAllSeries.seriesType = Array.isArray(json.series) ? 'array' : typeof json.series;
          debug.tests.getAllSeries.seriesCount = Array.isArray(json.series) ? json.series.length : (json.series ? 1 : 0);
        } catch (parseError: any) {
          debug.tests.getAllSeries.parseError = parseError.message;
        }
      } else {
        const errorText = await response.text();
        debug.tests.getAllSeries.errorText = errorText;
      }
    } catch (error: any) {
      debug.tests.getAllSeries = {
        error: error.message,
        errorName: error.name,
        stack: error.stack,
      };
    }

    return NextResponse.json(debug, { status: 200 });
  } catch (error: any) {
    console.error('[debug-inventory] Fatal error:', error);
    return NextResponse.json({
      error: error.message || 'Unknown error',
      errorName: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
