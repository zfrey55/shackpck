import { NextRequest, NextResponse } from 'next/server';
import { generateFedExLabel } from '@/lib/fedex';

// POST /api/test-fedex - Test FedEx label generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress, weight = '1.0' } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Generate test label
    // Note: weight parameter is not currently supported - uses FEDEX_DEFAULT_WEIGHT env var
    const result = await generateFedExLabel(shippingAddress);

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      message: 'FedEx label generated successfully',
    });
  } catch (error: any) {
    console.error('FedEx test error:', error);
    
    // Extract detailed error information
    let errorDetails: any = {
      message: error.message || 'Failed to generate FedEx label',
    };
    
    // Include FedEx-specific error details if available
    if (error.fedexErrorDetails) {
      errorDetails.fedex = error.fedexErrorDetails;
    }
    
    // If error message contains JSON, try to parse it
    if (error.message && error.message.includes('{')) {
      try {
        const jsonMatch = error.message.match(/\{.*\}/);
        if (jsonMatch) {
          errorDetails.parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate FedEx label',
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

// GET /api/test-fedex - Check FedEx configuration
export async function GET() {
  const hasKey = !!process.env.FEDEX_KEY || !!process.env.FEDEX_API_KEY;
  const hasPassword = !!process.env.FEDEX_PASSWORD || !!process.env.FEDEX_API_SECRET;
  const hasAccount = !!process.env.FEDEX_ACCOUNT_NUMBER;
  const hasMeter = !!process.env.FEDEX_METER_NUMBER;
  const environment = process.env.FEDEX_ENVIRONMENT || (process.env.FEDEX_PRODUCTION === 'true' ? 'production' : 'test');

  return NextResponse.json({
    configured: hasKey && hasPassword && hasAccount && hasMeter,
    environment,
    hasKey,
    hasPassword,
    hasAccount,
    hasMeter,
    message: hasKey && hasPassword && hasAccount && hasMeter
      ? 'FedEx is configured. Use POST to test label generation.'
      : 'FedEx is not fully configured. Check your environment variables.',
  });
}
