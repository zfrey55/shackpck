import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchAllSeries } from '@/lib/coin-inventory-api';

// GET /api/series/[slug] - Get a single series by slug
// Tries inventory app API first, then falls back to database
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Try fetching from inventory app first
    try {
      const allSeries = await fetchAllSeries();
      const seriesFromInventory = allSeries.find(s => s.slug === params.slug);
      
      if (seriesFromInventory) {
        return NextResponse.json({
          ...seriesFromInventory,
          packsRemaining: seriesFromInventory.packsRemaining || (seriesFromInventory.totalPacks - seriesFromInventory.packsSold),
          topHits: seriesFromInventory.topHits,
          checklist: seriesFromInventory.checklist, // Include checklist from API
        });
      }
    } catch (error) {
      console.error('Error fetching from inventory app, falling back to database:', error);
      // Fall through to database query
    }

    // Fallback to database
    const series = await prisma.series.findUnique({
      where: { slug: params.slug },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }

    // Parse topHits if it's a JSON string (also check legacy top5Coins for backward compatibility)
    let topHits = null;
    if (series.topHits) {
      topHits = typeof series.topHits === 'string' ? JSON.parse(series.topHits) : series.topHits;
    } else if (series.top5Coins) {
      // Legacy support for top5Coins
      topHits = typeof series.top5Coins === 'string' ? JSON.parse(series.top5Coins) : series.top5Coins;
    }

    return NextResponse.json({
      ...series,
      packsRemaining: series.totalPacks - series.packsSold,
      topHits,
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// PATCH /api/series/[slug] - Update a series (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { name, description, images, totalPacks, pricePerPack, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;
    if (totalPacks !== undefined) updateData.totalPacks = totalPacks;
    if (pricePerPack !== undefined) updateData.pricePerPack = Math.round(pricePerPack * 100);
    if (isActive !== undefined) updateData.isActive = isActive;

    const series = await prisma.series.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json({
      ...series,
      packsRemaining: series.totalPacks - series.packsSold,
    });
  } catch (error: any) {
    console.error('Error updating series:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 }
    );
  }
}
