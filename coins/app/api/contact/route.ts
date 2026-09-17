import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { INQUIRY_SUCCESS_BODY, MIN_FILL_MS } from '@/lib/contact-inquiry';
import { inquirySchema, type InquiryInput } from '@/lib/contact-inquiry-schema';
import { sendInquiryEmail } from '@/lib/contact-inquiry-email';

/** SendGrid + Prisma require Node; avoids Edge/runtime surprises on Netlify */
export const runtime = 'nodejs';

/**
 * POST /api/contact — the /contact form.
 *
 * Order of work, chosen so a lead is never lost:
 *   1. save the ContactInquiry row
 *   2. send the notification email (logged instead of sent in development)
 *   3. record emailSent / emailError on the row
 *
 * A failed save does not stop the email; the save error goes into the email
 * and the server log. Missing SendGrid config still saves, then returns 503.
 * Honeypot and too-fast submissions get the normal success body and are
 * neither saved nor emailed.
 */

/** Non-empty env required to email (FROM_EMAIL must be a SendGrid-verified sender). */
function contactFormEnvGap(): 'SENDGRID_API_KEY' | 'ADMIN_EMAIL' | 'FROM_EMAIL' | null {
  if (!process.env.SENDGRID_API_KEY?.trim()) return 'SENDGRID_API_KEY';
  if (!process.env.ADMIN_EMAIL?.trim()) return 'ADMIN_EMAIL';
  if (!process.env.FROM_EMAIL?.trim()) return 'FROM_EMAIL';
  return null;
}

/** Error class and code only: never a message that could carry connection details. */
function describeError(err: unknown): string {
  if (!err || typeof err !== 'object') return String(err);
  const code = 'code' in err ? ` ${String((err as { code?: unknown }).code)}` : '';
  return `${err.constructor?.name ?? 'Error'}${code}`;
}

function toRow(inquiry: InquiryInput): Prisma.ContactInquiryCreateInput {
  const base = {
    reason: inquiry.reason,
    firstName: inquiry.firstName,
    lastName: inquiry.lastName,
    email: inquiry.email,
    phone: inquiry.phone ?? null,
  };
  if (inquiry.reason !== 'BUYING') {
    return { ...base, productLines: [], lineDetails: {}, message: inquiry.message };
  }
  return {
    ...base,
    businessName: inquiry.businessName,
    whatnotHandle: inquiry.whatnotHandle ?? null,
    state: inquiry.state,
    productLines: inquiry.productLines,
    lineDetails: inquiry.lineDetails as Prisma.InputJsonValue,
    customBranding: inquiry.customBranding,
    targetPricePerCase: inquiry.targetPricePerCase ?? null,
    timeline: inquiry.timeline,
    message: inquiry.message ?? null,
    sourcePack: inquiry.sourcePack ?? null,
  };
}

async function recordEmailOutcome(id: string, emailSent: boolean, emailError: string | null) {
  try {
    await prisma.contactInquiry.update({ where: { id }, data: { emailSent, emailError } });
  } catch (err) {
    console.error(`[api/contact] Could not record email outcome on inquiry ${id}:`, describeError(err));
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid form data. Please check your entries.' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data. Please check your entries.' }, { status: 400 });
  }
  const inquiry = parsed.data;

  if (inquiry.honeypot || inquiry.elapsedMs < MIN_FILL_MS) {
    console.warn(`[api/contact] Dropped submission: ${inquiry.honeypot ? 'honeypot filled' : 'submitted too fast'}.`);
    return NextResponse.json(INQUIRY_SUCCESS_BODY);
  }

  const missingEnv = process.env.NODE_ENV === 'development' ? null : contactFormEnvGap();

  // 1. Save.
  let saved: { id: string; createdAt: Date } | null = null;
  let saveError: string | null = null;
  try {
    saved = await prisma.contactInquiry.create({
      data: toRow(inquiry),
      select: { id: true, createdAt: true },
    });
  } catch (err) {
    saveError = describeError(err);
    console.error('[api/contact] Failed to save inquiry; emailing it anyway:', saveError);
  }

  if (missingEnv) {
    console.error(
      `[api/contact] Contact email disabled: ${missingEnv} is missing or empty. Add it in Netlify → Site configuration → Environment variables (runtime).`
    );
    if (saved) await recordEmailOutcome(saved.id, false, `not sent: ${missingEnv} is not configured`);
    return NextResponse.json({ error: 'Contact form is temporarily unavailable.' }, { status: 503 });
  }

  // 2. Email.
  let emailSent = false;
  let emailError: string | null = null;
  try {
    const result = await sendInquiryEmail(inquiry, {
      inquiryId: saved?.id ?? null,
      submittedAt: saved?.createdAt ?? new Date(),
      saveError,
    });
    emailSent = result.sent;
    emailError = result.note;
  } catch (err) {
    const sgBody =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { body?: unknown } }).response?.body
        : undefined;
    emailError = describeError(err);
    console.error('[api/contact] Email send failed:', emailError, sgBody ?? '');
  }

  // 3. Record the outcome.
  if (saved) await recordEmailOutcome(saved.id, emailSent, emailError);

  if (!saved && !emailSent) {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    );
  }
  return NextResponse.json(INQUIRY_SUCCESS_BODY);
}
