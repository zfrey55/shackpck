import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchFeaturedSeries, fetchAllSeries } from '@/lib/coin-inventory-api';

// Force dynamic rendering (uses no-store fetch and Prisma)
export const dynamic = 'force-dynamic';

// GET /api/series - Get all active series
// If featured=true, fetches from inventory app API directly
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    const featuredOnly = searchParams.get('featured') === 'true';
    const fromInventory = searchParams.get('fromInventory') === 'true';

    // If fetching featured series, try inventory app API first
    if (featuredOnly || fromInventory) {
      try {
        console.log('[API /series] Fetching from inventory app, featuredOnly:', featuredOnly);
        const inventorySeries = featuredOnly 
          ? await fetchFeaturedSeries() 
          : await fetchAllSeries();
        
        console.log('[API /series] Inventory app returned', inventorySeries?.length || 0, 'series');
        
        if (inventorySeries && inventorySeries.length > 0) {
          // Filter by active if needed
          const filtered = activeOnly 
            ? inventorySeries.filter(s => {
                const packsRemaining = s.packsRemaining || (s.totalPacks - s.packsSold);
                const isActive = s.isActive && packsRemaining > 0;
                console.log(`[API /series] Series ${s.name}: isActive=${s.isActive}, isFeatured=${s.isFeatured}, packsRemaining=${packsRemaining}, willInclude=${isActive}`);
                return isActive;
              })
            : inventorySeries;
          
          console.log('[API /series] Returning', filtered.length, 'filtered series');
          return NextResponse.json(filtered);
        } else {
          console.log('[API /series] No series returned from inventory app, falling back to database');
        }
      } catch (error: any) {
        console.error('[API /series] Error fetching from inventory app, falling back to database:', error?.message || error);
        console.error('[API /series] Error stack:', error?.stack);
        // Fall through to database query
      }
    }

    // Fallback to database query
    const where: any = {};
    if (activeOnly) where.isActive = true;
    if (featuredOnly) where.isFeatured = true;

    const series = await prisma.series.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: featuredOnly ? { createdAt: 'desc' } : { createdAt: 'desc' },
    });

    // Calculate packsRemaining for each series and parse topHits (also support legacy top5Coins)
    const seriesWithRemaining = series.map((s) => {
      let topHits = null;
      if (s.topHits) {
        topHits = typeof s.topHits === 'string' ? JSON.parse(s.topHits) : s.topHits;
      } else if ('top5Coins' in s && (s as any).top5Coins) {
        // Legacy support for top5Coins — use a safe cast since the TS type does not declare it
        const legacy = (s as any).top5Coins;
        topHits = typeof legacy === 'string' ? JSON.parse(legacy) : legacy;
      }
      
      return {
        ...s,
        packsRemaining: s.totalPacks - s.packsSold,
        topHits,
      };
    });

    // If featured only, return array (not single object)
    if (featuredOnly) {
      return NextResponse.json(seriesWithRemaining);
    }

    return NextResponse.json(seriesWithRemaining);
  } catch (error: any) {
    console.error('Error fetching series:', error?.message || error);
    // Return empty array instead of error to prevent page crash
    return NextResponse.json([]);
  }
}

// POST /api/series - Create a new series (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, images, totalPacks, pricePerPack, isActive } = body;

    if (!name || !slug || !totalPacks || !pricePerPack) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const series = await prisma.series.create({
      data: {
        name,
        slug,
        description,
        images: images || [],
        totalPacks,
        packsSold: 0,
        pricePerPack: Math.round(pricePerPack * 100), // Convert to cents
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      ...series,
      packsRemaining: series.totalPacks - series.packsSold,
    });
  } catch (error: any) {
    console.error('Error creating series:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Series with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}
