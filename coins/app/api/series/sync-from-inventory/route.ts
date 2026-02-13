import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchFeaturedSeries, fetchAllSeries } from '@/lib/coin-inventory-api';

// GET /api/series/sync-from-inventory - Sync all series from inventory app
// This can be called periodically to keep data in sync
export async function GET(request: NextRequest) {
  try {
    // Fetch all series from inventory app
    const allSeries = await fetchAllSeries();
    const featuredSeries = await fetchFeaturedSeries();
    
    // Combine and deduplicate
    const seriesMap = new Map<string, any>();
    
    // Add all series
    allSeries.forEach(series => {
      seriesMap.set(series.id, series);
    });
    
    // Add featured series (may overlap)
    featuredSeries.forEach(series => {
      seriesMap.set(series.id, series);
    });
    
    const syncedCount = seriesMap.size;
    const errors: string[] = [];
    
    // Sync each series to database
    for (const series of seriesMap.values()) {
      try {
        await prisma.series.upsert({
          where: { slug: series.slug },
          update: {
            name: series.name,
            description: series.description || null,
            images: series.images,
            totalPacks: series.totalPacks,
            packsSold: series.packsSold,
            packsRemaining: series.packsRemaining || (series.totalPacks - series.packsSold),
            pricePerPack: series.pricePerPack,
            isActive: series.isActive,
            isFeatured: series.isFeatured,
            coinInventorySeriesId: series.id,
            caseType: series.caseType || null,
            displayDate: series.displayDate || null,
            topHits: series.topHits ? (series.topHits as any) : null,
          },
          create: {
            name: series.name,
            slug: series.slug,
            description: series.description || null,
            images: series.images,
            totalPacks: series.totalPacks,
            packsSold: series.packsSold,
            packsRemaining: series.packsRemaining || (series.totalPacks - series.packsSold),
            pricePerPack: series.pricePerPack,
            isActive: series.isActive,
            isFeatured: series.isFeatured,
            coinInventorySeriesId: series.id,
            caseType: series.caseType || null,
            displayDate: series.displayDate || null,
            topHits: series.topHits ? (series.topHits as any) : null,
          },
        });
      } catch (error: any) {
        errors.push(`Failed to sync ${series.name}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      synced: syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error syncing series:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync series' },
      { status: 500 }
    );
  }
}
