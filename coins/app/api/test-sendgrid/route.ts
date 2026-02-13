import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Test SendGrid configuration
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Check configuration
    const config = {
      apiKeySet: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 3) || 'N/A',
      fromEmail: fromEmail || 'NOT SET',
      adminEmail: adminEmail || 'NOT SET',
    };

    // Initialize SendGrid if API key is set
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }

    // Test API key format
    const isValidFormat = apiKey?.startsWith('SG.') && apiKey.length > 20;

    return NextResponse.json({
      success: true,
      configured: !!apiKey && !!fromEmail && !!adminEmail,
      config,
      isValidFormat,
      message: isValidFormat 
        ? 'SendGrid is configured correctly! ✅' 
        : 'SendGrid API key format may be incorrect. Expected format: SG.xxxxx',
      nextSteps: [
        'Update FROM_EMAIL to match your verified sender in SendGrid',
        'Restart your server to load environment variables',
        'Test with a test order',
      ],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
