import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchFeaturedSeries, fetchSeriesSales, fetchAllSeries } from '@/lib/coin-inventory-api';

// GET /api/sync/series - Sync series data from coin inventory app
// This will be called periodically or manually to keep data in sync
export async function GET(request: NextRequest) {
  try {
    // Fetch featured series from coin inventory app (returns array)
    const featuredSeriesArray = await fetchFeaturedSeries();
    
    if (!featuredSeriesArray || featuredSeriesArray.length === 0) {
      return NextResponse.json(
        { error: 'No featured series found in coin inventory app' },
        { status: 404 }
      );
    }

    // Fetch sales data
    const salesData = await fetchSeriesSales();
    const salesMap = new Map(salesData.map(s => [s.seriesId, s.packsSold]));

    // Process all featured series (or just the first one if you only want one)
    const updatedSeriesList = await Promise.all(
      featuredSeriesArray.map(async (featuredSeries) => {
        // Update or create series in database
        const updatedSeries = await prisma.series.upsert({
          where: { slug: featuredSeries.slug },
          update: {
            name: featuredSeries.name,
            description: featuredSeries.description || null,
            images: featuredSeries.images,
            totalPacks: featuredSeries.totalPacks,
            packsSold: salesMap.get(featuredSeries.id) || featuredSeries.packsSold,
            pricePerPack: featuredSeries.pricePerPack,
            isActive: featuredSeries.isActive,
            isFeatured: featuredSeries.isFeatured,
            coinInventorySeriesId: featuredSeries.id,
            topHits: featuredSeries.topHits ? JSON.stringify(featuredSeries.topHits) : null,
            caseType: featuredSeries.caseType || null,
            displayDate: featuredSeries.displayDate || null,
          },
          create: {
            name: featuredSeries.name,
            slug: featuredSeries.slug,
            description: featuredSeries.description || null,
            images: featuredSeries.images,
            totalPacks: featuredSeries.totalPacks,
            packsSold: salesMap.get(featuredSeries.id) || featuredSeries.packsSold,
            pricePerPack: featuredSeries.pricePerPack,
            isActive: featuredSeries.isActive,
            isFeatured: featuredSeries.isFeatured,
            coinInventorySeriesId: featuredSeries.id,
            topHits: featuredSeries.topHits ? JSON.stringify(featuredSeries.topHits) : null,
            caseType: featuredSeries.caseType || null,
            displayDate: featuredSeries.displayDate || null,
          },
        });

        return {
          ...updatedSeries,
          packsRemaining: updatedSeries.totalPacks - updatedSeries.packsSold,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      series: updatedSeriesList,
    });
  } catch (error: any) {
    console.error('Error syncing series:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync series' },
      { status: 500 }
    );
  }
}

// POST /api/sync/series - Manual sync trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
