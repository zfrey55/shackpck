import { NextRequest, NextResponse } from 'next/server';
import { fetchFeaturedSeries, fetchAllSeries } from '@/lib/coin-inventory-api';

// GET /api/test-inventory - Test inventory app API connection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'featured';

    let result: any = {
      timestamp: new Date().toISOString(),
      testType,
    };

    if (testType === 'featured') {
      console.log('[test-inventory] Fetching featured series...');
      const featuredSeries = await fetchFeaturedSeries();
      console.log('[test-inventory] Received', featuredSeries.length, 'featured series');
      result.featuredSeries = featuredSeries;
      result.count = featuredSeries.length;
      result.series = featuredSeries.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.isActive,
        isFeatured: s.isFeatured,
        packsRemaining: s.packsRemaining || (s.totalPacks - s.packsSold),
        totalPacks: s.totalPacks,
        packsSold: s.packsSold,
        pricePerPack: s.pricePerPack,
        hasTopHits: !!s.topHits && s.topHits.length > 0,
        topHitsCount: s.topHits?.length || 0,
        hasChecklist: !!s.checklist && s.checklist.length > 0,
        checklistCount: s.checklist?.length || 0,
        images: s.images?.length || 0,
        imageUrls: s.images || [],
      }));
    } else {
      console.log('[test-inventory] Fetching all series...');
      const allSeries = await fetchAllSeries();
      console.log('[test-inventory] Received', allSeries.length, 'series');
      result.allSeries = allSeries;
      result.count = allSeries.length;
      result.series = allSeries.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.isActive,
        isFeatured: s.isFeatured,
        packsRemaining: s.packsRemaining || (s.totalPacks - s.packsSold),
        totalPacks: s.totalPacks,
        packsSold: s.packsSold,
        pricePerPack: s.pricePerPack,
        hasTopHits: !!s.topHits && s.topHits.length > 0,
        topHitsCount: s.topHits?.length || 0,
        hasChecklist: !!s.checklist && s.checklist.length > 0,
        checklistCount: s.checklist?.length || 0,
        images: s.images?.length || 0,
        imageUrls: s.images || [],
      }));
    }

    // Filter active featured series
    const activeFeatured = result.series.filter((s: any) => 
      s.isActive && s.isFeatured && s.packsRemaining > 0
    );

    result.activeFeaturedCount = activeFeatured.length;
    result.activeFeatured = activeFeatured;

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
