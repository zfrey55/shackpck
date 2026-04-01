import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactInquiryEmail } from '@/lib/email';

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(40),
  subject: z.enum(['general', 'order', 'coin-info', 'shipping', 'other']),
  message: z.string().trim().min(1).max(10000),
  caseTypes: z.array(z.string().trim().max(64)).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const caseTypesStr = validated.caseTypes.length
      ? validated.caseTypes.join(', ')
      : '';

    await sendContactInquiryEmail({
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      subject: validated.subject,
      message: validated.message,
      caseTypes: caseTypesStr,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your entries.' },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to send message';

    if (
      message.includes('not configured') ||
      message.includes('SENDGRID') ||
      message.includes('ADMIN_EMAIL')
    ) {
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}
