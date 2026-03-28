import { NextRequest, NextResponse } from 'next/server';
import { generateFedExLabel } from '@/lib/fedex';

// POST /api/test-fedex - Test FedEx label generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress, weight = '1.0', labelFormat = 'PDF' } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Generate test label - Support PDF or ZPLII format
    // Note: weight parameter is not currently supported - uses FEDEX_DEFAULT_WEIGHT env var
    const result = await generateFedExLabel(shippingAddress, labelFormat as 'PDF' | 'ZPLII');

    // If label data is available (downloaded), return it for immediate download
    if (result.labelData) {
      const isZPLII = result.labelFormat === 'ZPLII';
      return NextResponse.json({
        success: true,
        trackingNumber: result.trackingNumber,
        labelUrl: result.labelUrl,
        labelData: result.labelData, // Base64 encoded label (PDF or ZPLII)
        labelFormat: result.labelFormat, // PDF or ZPLII format
        message: isZPLII 
          ? 'FedEx ZPLII label generated successfully! Print directly to Zebra printer at 600 DPI.'
          : 'FedEx PDF label (4x6 inches) generated successfully. Download immediately - URL expires quickly!',
        downloadNote: isZPLII
          ? 'ZPLII label ready for direct printing. Send to Zebra printer at 600 DPI. Do NOT convert to PDF/image.'
          : 'PDF label is 4x6 inches. Print at 100% scale, 600 DPI minimum. Set printer paper size to 4x6 inches, margins to 0.',
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      message: 'FedEx label generated successfully. ⚠️ Download immediately - URL expires quickly!',
      downloadNote: 'Click the label URL immediately to download. URLs expire within minutes.',
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
  const hasMeter = !!process.env.FEDEX_METER_NUMBER; // Optional - not required for production API
  const environment = process.env.FEDEX_ENVIRONMENT || (process.env.FEDEX_PRODUCTION === 'true' ? 'production' : 'test');

  return NextResponse.json({
    configured: hasKey && hasPassword && hasAccount, // Meter number not required
    environment,
    hasKey,
    hasPassword,
    hasAccount,
    hasMeter,
    message: hasKey && hasPassword && hasAccount
      ? 'FedEx is configured. Use POST to test label generation.'
      : 'FedEx is not fully configured. Check your environment variables.',
  });
}
