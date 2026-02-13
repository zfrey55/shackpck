import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

// Test endpoint to send test emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'testEmail is required' },
        { status: 400 }
      );
    }

    // Send test customer confirmation email
    await sendOrderConfirmationEmail(testEmail, {
      orderId: 'TEST-ORDER-123',
      total: 124.99,
      loyaltyPointsEarned: 125,
      items: [
        {
          seriesName: 'Test Series',
          quantity: 1,
          pricePerPack: 12499,
        },
      ],
      trackingNumber: 'TEST123456789',
    });

    // Send test admin notification email
    await sendAdminOrderNotification({
      orderId: 'TEST-ORDER-123',
      customerEmail: testEmail,
      customerName: 'Test User',
      total: 124.99,
      shippingAddress: {
        fullName: 'Test User',
        line1: '123 Test St',
        city: 'Test City',
        state: 'FL',
        postalCode: '12345',
        country: 'US',
      },
      items: [
        {
          seriesName: 'Test Series',
          quantity: 1,
          pricePerPack: 12499,
        },
      ],
      fedexTrackingNumber: 'TEST123456789',
      fedexLabelUrl: 'https://example.com/label.pdf',
      labelStatus: 'GENERATED',
    });

    return NextResponse.json({
      success: true,
      message: 'Test emails sent successfully!',
      sentTo: {
        customer: testEmail,
        admin: process.env.ADMIN_EMAIL,
      },
    });
  } catch (error: any) {
    console.error('Error sending test emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test emails',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show test form
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Send a POST request with { "testEmail": "your@email.com" } to test emails',
    example: {
      method: 'POST',
      body: {
        testEmail: 'your@email.com',
      },
    },
  });
}
