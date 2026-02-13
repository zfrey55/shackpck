import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchDailyChecklist } from '@/app/checklist/api';

// GET /api/series/[slug]/checklist - Get full checklist for a series
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get series from database
    const series = await prisma.series.findUnique({
      where: { slug: params.slug },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }

    // If series has caseType and displayDate, fetch checklist from API
    if (series.caseType && series.displayDate) {
      try {
        const checklist = await fetchDailyChecklist(series.displayDate, series.caseType);
        return NextResponse.json({
          success: true,
          checklist,
          series: {
            name: series.name,
            slug: series.slug,
            caseType: series.caseType,
            displayDate: series.displayDate,
          },
        });
      } catch (error: any) {
        console.error('Error fetching checklist from API:', error);
        return NextResponse.json(
          { error: 'Failed to fetch checklist from API', details: error.message },
          { status: 500 }
        );
      }
    }

    // If no caseType/displayDate, return empty checklist
    return NextResponse.json({
      success: true,
      checklist: {
        success: true,
        displayDate: series.displayDate || '',
        totalCases: 0,
        casesByType: {},
        cases: [],
      },
      series: {
        name: series.name,
        slug: series.slug,
      },
    });
  } catch (error: any) {
    console.error('Error fetching series checklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}
