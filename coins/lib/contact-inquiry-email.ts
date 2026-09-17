/**
 * Notification email for a contact inquiry.
 *
 * Kept out of lib/email.ts on purpose. The body is built once as labelled
 * sections and rendered to both HTML and text from that one structure, so the
 * two can never disagree. BUYING answers are grouped by product line, with
 * product display names rather than catalog ids.
 *
 * In development nothing is sent: the rendered email is logged instead.
 */

import sgMail from '@sendgrid/mail';
import {
  CUSTOM_BRANDING_LABELS,
  INQUIRY_LINES,
  INQUIRY_LINE_LABELS,
  PACKS_PER_SET_LABELS,
  REASON_LABELS,
  TIMELINE_LABELS,
} from '@/lib/contact-inquiry';
import { productDisplayName, purchasableProductsByLine } from '@/lib/contact-inquiry-catalog';
import type { InquiryInput } from '@/lib/contact-inquiry-schema';
import { usStateName } from '@/lib/us-states';

export type InquiryEmailMeta = {
  /** Null when the save failed; the email is still sent. */
  inquiryId: string | null;
  submittedAt: Date;
  /** Set when the database save failed, so the inbox knows this lead exists only here. */
  saveError: string | null;
};

type Section = { heading: string; rows: [label: string, value: string][] };

const NONE = '(none)';
const orNone = (v: string | null | undefined) => (v && v.trim() ? v : NONE);

export function inquirySubject(inquiry: InquiryInput): string {
  const fullName = `${inquiry.firstName} ${inquiry.lastName}`.trim();
  if (inquiry.reason === 'BUYING') {
    const lines = inquiry.productLines.map((l) => INQUIRY_LINE_LABELS[l]).join(', ');
    return `New pack inquiry: ${inquiry.businessName || fullName} (${lines})`;
  }
  return `${inquiry.reason === 'ORDER' ? 'Order question' : 'General inquiry'}: ${fullName}`;
}

function sections(inquiry: InquiryInput, meta: InquiryEmailMeta): Section[] {
  const byLine = purchasableProductsByLine();
  const out: Section[] = [];

  const contact: Section = {
    heading: 'Contact',
    rows: [
      ['Reason', REASON_LABELS[inquiry.reason]],
      ['Name', `${inquiry.firstName} ${inquiry.lastName}`],
      ['Email', inquiry.email],
      ['Phone', orNone(inquiry.phone)],
    ],
  };

  if (inquiry.reason !== 'BUYING') {
    out.push(contact, { heading: 'Message', rows: [['Message', inquiry.message]] });
  } else {
    contact.rows.push(
      ['Business name', inquiry.businessName],
      ['Whatnot handle', orNone(inquiry.whatnotHandle)],
      ['State', `${usStateName(inquiry.state) ?? inquiry.state} (${inquiry.state})`]
    );
    out.push(contact);

    for (const line of INQUIRY_LINES) {
      const detail = inquiry.lineDetails[line];
      if (!inquiry.productLines.includes(line) || !detail) continue;
      out.push({
        heading: INQUIRY_LINE_LABELS[line],
        rows: [
          ['Products', detail.products.map((p) => productDisplayName(p, byLine)).join(', ')],
          ['Packs per set', PACKS_PER_SET_LABELS[detail.packsPerSet] ?? detail.packsPerSet],
          ['Sets per month', detail.setsPerMonth],
        ],
      });
    }

    out.push({
      heading: 'Preferences',
      rows: [
        ['Custom branding', CUSTOM_BRANDING_LABELS[inquiry.customBranding]],
        ['Target price per case', orNone(inquiry.targetPricePerCase)],
        ['Timeline', TIMELINE_LABELS[inquiry.timeline]],
        ['Additional details', orNone(inquiry.message)],
      ],
    });
  }

  const sourcePack = inquiry.reason === 'BUYING' ? inquiry.sourcePack : undefined;
  const record: Section = {
    heading: 'Record',
    rows: [
      ['Source pack', sourcePack ? `${productDisplayName(sourcePack, byLine)} (${sourcePack})` : NONE],
      ['Inquiry id', meta.inquiryId ?? 'NOT SAVED'],
      ['Submitted', meta.submittedAt.toISOString()],
    ],
  };
  if (meta.saveError) {
    record.rows.push(['SAVE FAILED', `${meta.saveError}. This email is the only record of this inquiry.`]);
  }
  out.push(record);
  return out;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderInquiryEmail(inquiry: InquiryInput, meta: InquiryEmailMeta) {
  const subject = inquirySubject(inquiry);
  const body = sections(inquiry, meta);

  const text = [
    subject,
    ...body.flatMap((s) => ['', `== ${s.heading} ==`, ...s.rows.map(([k, v]) => `${k}: ${v}`)]),
  ].join('\n');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <h2 style="color: #b8860b;">${escapeHtml(subject)}</h2>
  ${body
    .map(
      (s) => `<h3 style="margin: 20px 0 6px;">${escapeHtml(s.heading)}</h3>
  <table style="border-collapse: collapse;">${s.rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding: 2px 16px 2px 0; vertical-align: top; color: #666; white-space: nowrap;">${escapeHtml(k)}</td><td style="padding: 2px 0; white-space: pre-wrap;">${escapeHtml(v)}</td></tr>`
    )
    .join('')}</table>`
    )
    .join('\n  ')}
</body></html>`;

  return { subject, text, html };
}

export type InquiryEmailResult = { sent: boolean; note: string | null };

/**
 * Send (or, in development, log) the notification. Throws when SendGrid
 * rejects the send; the caller records the error on the saved row.
 */
export async function sendInquiryEmail(
  inquiry: InquiryInput,
  meta: InquiryEmailMeta
): Promise<InquiryEmailResult> {
  const { subject, text, html } = renderInquiryEmail(inquiry, meta);
  const replyTo = { email: inquiry.email, name: `${inquiry.firstName} ${inquiry.lastName}`.trim() };

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[contact-inquiry-email] DEV: not sent. Reply-To: ${replyTo.email}\nSubject: ${subject}\n${text}`
    );
    return { sent: false, note: 'dev: logged, not sent' };
  }

  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const to = process.env.ADMIN_EMAIL?.trim();
  const from = process.env.FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) {
    throw new Error('SendGrid configuration is missing');
  }

  // Per-request init: serverless can evaluate the module before env is bound.
  sgMail.setApiKey(apiKey);
  await sgMail.send({
    from: { email: from, name: process.env.FROM_NAME || 'Shackpack' },
    to,
    replyTo,
    subject,
    text,
    html,
  });
  return { sent: true, note: null };
}
