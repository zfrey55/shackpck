import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactInquiryEmail } from '@/lib/email';
import { shackpackBuilderSpecSchema } from '@/lib/shackpack-builder-schema';

/** SendGrid + @sendgrid/mail require Node; avoids Edge/runtime surprises on Netlify */
export const runtime = 'nodejs';

const contactSchema = z
  .object({
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(40),
    subject: z.enum([
      'general',
      'order',
      'coin-info',
      'shipping',
      'other',
      'custom-build',
    ]),
    message: z.string().trim().max(10000),
    caseTypes: z.array(z.string().trim().max(64)).optional().default([]),
    builderSpec: shackpackBuilderSpecSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.subject === 'custom-build') {
      if (!data.builderSpec) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Builder specification is required for custom build inquiries.',
          path: ['builderSpec'],
        });
      }
    } else {
      if (data.builderSpec) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Builder specification is only valid for custom build inquiries.',
          path: ['builderSpec'],
        });
      }
      if (!data.message.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Message is required.',
          path: ['message'],
        });
      }
    }
  });

/** Non-empty env required for contact form (FROM_EMAIL must be a SendGrid-verified sender). */
function contactFormEnvGap():
  | 'SENDGRID_API_KEY'
  | 'ADMIN_EMAIL'
  | 'FROM_EMAIL'
  | null {
  if (!process.env.SENDGRID_API_KEY?.trim()) return 'SENDGRID_API_KEY';
  if (!process.env.ADMIN_EMAIL?.trim()) return 'ADMIN_EMAIL';
  if (!process.env.FROM_EMAIL?.trim()) return 'FROM_EMAIL';
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
      builderSpec: validated.builderSpec,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your entries.' },
        { status: 400 }
      );
    }

    const sgBody =
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'body' in error.response
        ? String((error.response as { body?: string }).body)
        : null;
    if (sgBody) {
      console.error('[api/contact] SendGrid API response body:', sgBody);
    }
    console.error('Contact form error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to send message';

    // Only map our explicit config throws to 503 — not arbitrary SendGrid API error text
    if (
      message === 'ADMIN_EMAIL is not configured' ||
      message === 'SENDGRID_API_KEY is not configured' ||
      message === 'FROM_EMAIL is not configured'
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
