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

/** Non-empty env required for contact form (Netlify: set for Production + same scope as other server secrets). */
function contactFormEnvGap(): 'SENDGRID_API_KEY' | 'ADMIN_EMAIL' | null {
  if (!process.env.SENDGRID_API_KEY?.trim()) return 'SENDGRID_API_KEY';
  if (!process.env.ADMIN_EMAIL?.trim()) return 'ADMIN_EMAIL';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const missingEnv = contactFormEnvGap();
    if (missingEnv) {
      console.error(
        `[api/contact] Contact form disabled: ${missingEnv} is missing or empty. Add it in Netlify → Site configuration → Environment variables (runtime).`
      );
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable.' },
        { status: 503 }
      );
    }

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

    // Only map our explicit config throws to 503 — not arbitrary SendGrid API error text
    if (
      message === 'ADMIN_EMAIL is not configured' ||
      message === 'SENDGRID_API_KEY is not configured'
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
