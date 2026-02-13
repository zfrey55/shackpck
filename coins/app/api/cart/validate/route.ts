import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchAllSeries, fetchFeaturedSeries } from '@/lib/coin-inventory-api';

// POST /api/cart/validate - Validate cart and check pack limits
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { items } = body; // Array of { seriesId, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart items' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const validatedItems: any[] = [];

    for (const item of items) {
      const { seriesId, quantity } = item;

      if (!seriesId || !quantity || quantity < 1 || quantity > 5) {
        errors.push(`Invalid quantity for series ${seriesId}`);
        continue;
      }

      // Check if this is an inventory app series ID (starts with "specialized_" or matches inventory format)
      const isInventorySeriesId = seriesId.startsWith('specialized_') || seriesId.includes('_');
      
      let series: any = null;
      
      if (isInventorySeriesId) {
        // Try to find in local DB by coinInventorySeriesId first
        series = await prisma.series.findFirst({
          where: { coinInventorySeriesId: seriesId },
        });
        
        // If not in local DB, fetch from inventory app API
        if (!series) {
          try {
            const allSeries = await fetchAllSeries();
            const inventorySeries = allSeries.find(s => s.id === seriesId);
            
            if (inventorySeries) {
              // Use inventory series data directly
              series = {
                id: inventorySeries.id, // Use inventory ID for now
                name: inventorySeries.name,
                slug: inventorySeries.slug,
                pricePerPack: inventorySeries.pricePerPack,
                totalPacks: inventorySeries.totalPacks,
                packsSold: inventorySeries.packsSold,
                isActive: inventorySeries.isActive,
                images: inventorySeries.images || [],
                coinInventorySeriesId: inventorySeries.id,
              };
            }
          } catch (error) {
            console.error('Error fetching series from inventory app:', error);
          }
        }
      } else {
        // Regular series - look up by local DB ID
        series = await prisma.series.findUnique({
          where: { id: seriesId },
        });
      }

      if (!series) {
        errors.push(`Series ${seriesId} not found`);
        continue;
      }

      if (!series.isActive) {
        errors.push(`Series ${series.name} is not active`);
        continue;
      }

      // Calculate packsRemaining
      const packsRemaining = series.totalPacks - series.packsSold;
      if (quantity > packsRemaining) {
        errors.push(
          `Only ${packsRemaining} packs remaining for ${series.name}`
        );
        continue;
      }

      // Check user purchase limits if logged in
      if (session?.user?.id) {
        const existingPurchase = await prisma.seriesPurchase.findUnique({
          where: {
            userId_seriesId: {
              userId: session.user.id,
              seriesId: series.id,
            },
          },
        });

        const currentQuantity = existingPurchase?.quantity || 0;
        const newTotal = currentQuantity + quantity;

        if (newTotal > 5) {
          const remaining = 5 - currentQuantity;
          errors.push(
            `You can only purchase ${remaining} more pack(s) of ${series.name} (max 5 per series)`
          );
          continue;
        }
      }
      
      validatedItems.push({
        seriesId: series.id, // Use the ID (could be inventory ID or local DB ID)
        seriesName: series.name,
        seriesSlug: series.slug,
        quantity,
        pricePerPack: series.pricePerPack,
        image: Array.isArray(series.images) ? series.images[0] : null,
        coinInventorySeriesId: series.coinInventorySeriesId || (isInventorySeriesId ? seriesId : null),
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors, validatedItems }, { status: 400 });
    }

    return NextResponse.json({ validatedItems });
  } catch (error) {
    console.error('Error validating cart:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}
