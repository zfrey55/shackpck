import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (uses no-store fetch)
export const dynamic = 'force-dynamic';

// GET /api/simple-test - Simple test of inventory app API
export async function GET(request: NextRequest) {
  try {
    const url = 'https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getFeaturedSeries?orgId=coin-shack';
    
    console.log('[simple-test] Calling:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
    });
    
    console.log('[simple-test] Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { raw: errorText };
      }
      
      // Check if it's a Firestore index error
      const isIndexError = errorText.includes('FAILED_PRECONDITION') && errorText.includes('index');
      let indexUrl = null;
      if (isIndexError) {
        const urlMatch = errorText.match(/https:\/\/[^\s"]+/);
        if (urlMatch) {
          indexUrl = urlMatch[0];
        }
      }
      
      return NextResponse.json({
        error: 'Inventory app API returned error',
        status: response.status,
        statusText: response.statusText,
        errorDetails: errorJson,
        isIndexError: isIndexError,
        indexUrl: indexUrl,
        message: isIndexError 
          ? 'The inventory app needs a Firestore index. Click the link above to create it.'
          : 'The inventory app API returned an error. Check the errorDetails for more info.',
      });
    }
    
    const text = await response.text();
    console.log('[simple-test] Response text length:', text.length);
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError: any) {
      return NextResponse.json({
        error: 'Failed to parse JSON',
        responseText: text.substring(0, 500),
        parseError: parseError.message,
      });
    }
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      hasSuccess: json.success !== undefined,
      success: json.success,
      hasSeries: json.series !== undefined,
      seriesType: Array.isArray(json.series) ? 'array' : typeof json.series,
      seriesCount: Array.isArray(json.series) ? json.series.length : (json.series ? 1 : 0),
      rawResponse: json,
    });
  } catch (error: any) {
    console.error('[simple-test] Fatal error:', error);
    return NextResponse.json({
      error: error?.message || 'Unknown error',
      errorName: error?.name,
      errorStack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, { status: 500 });
  }
}
