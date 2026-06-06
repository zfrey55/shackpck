import sgMail from '@sendgrid/mail';
import { getCoinDef, GRADER_LABELS, TIER_DEFS, type Grader, type Tier } from './catalog';

export interface BuildInquiryEmailData {
  buildId: string;
  shortCode: string;
  name: string;
  packCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  additionalNotes?: string | null;
  artworkUrl?: string | null;
  /** Absolute URL to the admin builds detail (preferred for the email link). */
  adminUrl?: string | null;
  lines: Array<{
    coinType: string;
    quantity: number;
    grader: string;
    tier: string;
    notes?: string | null;
  }>;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function lineToText(line: BuildInquiryEmailData['lines'][number]): string {
  const coinLabel = getCoinDef(line.coinType)?.label ?? line.coinType;
  const tier = TIER_DEFS[line.tier as Tier];
  const tierLabel = tier ? `${tier.label} (${tier.range})` : line.tier;
  const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
  return `${line.quantity}x ${coinLabel} — ${graderLabel} — ${tierLabel}${line.notes ? ` — ${line.notes}` : ''}`;
}

/**
 * Send ShackPack Builder inquiry email to the admin inbox.
 *
 * Design notes:
 *  - HTML mirrors the contact-form email structure on purpose (h2 + paragraphs +
 *    one styled box for notes). The previous template used an inline-styled
 *    table + gold CTA button which Gmail was silently rendering as an empty body
 *    on some accounts. Simpler markup renders reliably.
 *  - Click + open tracking are disabled per-send. SendGrid's link rewriter has
 *    been observed mangling Gmail-bound bodies with complex inline styles.
 *  - Throws on send failure; caller decides what to do.
 */
export async function sendBuildInquiryEmail(data: BuildInquiryEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmailRaw = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME || 'Shackpack';

  if (!adminEmail?.trim()) throw new Error('ADMIN_EMAIL is not configured');
  if (!process.env.SENDGRID_API_KEY?.trim()) throw new Error('SENDGRID_API_KEY is not configured');
  if (!fromEmailRaw?.trim()) throw new Error('FROM_EMAIL is not configured');

  sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());

  const totalCoins = data.lines.reduce((sum, l) => sum + l.quantity, 0);
  const unassigned = data.packCount - totalCoins;
  const displayName = data.customerName || data.customerEmail;

  const linesListHtml = data.lines.length
    ? data.lines
        .map((line) => `<li style="margin:4px 0;">${escapeHtml(lineToText(line))}</li>`)
        .join('')
    : '<li style="margin:4px 0;color:#b45309;"><strong>No coin lines on this build.</strong></li>';

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #b8860b;">New ShackPack Builder inquiry</h2>
    <p><strong>Build:</strong> ${escapeHtml(data.name)}<br/>
    <strong>Ref:</strong> ${escapeHtml(data.shortCode)}<br/>
    <strong>Name:</strong> ${escapeHtml(displayName)}<br/>
    <strong>Email:</strong> <a href="mailto:${data.customerEmail.replace(/"/g, '')}">${escapeHtml(data.customerEmail)}</a>${data.customerPhone ? `<br/><strong>Phone:</strong> ${escapeHtml(data.customerPhone)}` : ''}</p>
    <p><strong>Pack count:</strong> ${data.packCount} &nbsp;·&nbsp; <strong>Coins listed:</strong> ${totalCoins}${unassigned !== 0 ? ` &nbsp;·&nbsp; <strong>Unassigned:</strong> ${unassigned}` : ''}</p>
    <p><strong>Coin lines</strong></p>
    <ol style="margin: 0 0 16px 0; padding-left: 20px;">
      ${linesListHtml}
    </ol>
    <p><strong>Artwork:</strong> ${data.artworkUrl ? `<a href="${escapeHtml(data.artworkUrl)}">${escapeHtml(data.artworkUrl)}</a>` : '(none uploaded)'}</p>
    ${data.adminUrl ? `<p><strong>Admin dashboard:</strong> <a href="${escapeHtml(data.adminUrl)}">${escapeHtml(data.adminUrl)}</a></p>` : ''}
    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px;">
      <strong>Additional notes</strong>
      <p style="white-space: pre-wrap; margin: 8px 0 0 0;">${escapeHtml((data.additionalNotes ?? '').trim() || '(none)')}</p>
    </div>
    <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
      Non-binding quote request. Confirm availability, configuration, and pricing with the customer before production.
    </p>
  </body>
</html>
  `.trim();

  const textParts: (string | null)[] = [
    'New ShackPack Builder inquiry',
    `Build: ${data.name}`,
    `Ref: ${data.shortCode}`,
    `Name: ${displayName}`,
    `Email: ${data.customerEmail}`,
    data.customerPhone ? `Phone: ${data.customerPhone}` : null,
    `Pack count: ${data.packCount}  Coins listed: ${totalCoins}${unassigned !== 0 ? `  Unassigned: ${unassigned}` : ''}`,
    '',
    'Coin lines:',
    ...(data.lines.length
      ? data.lines.map((l, i) => `  ${i + 1}. ${lineToText(l)}`)
      : ['  (no lines recorded)']),
    '',
    data.artworkUrl ? `Artwork: ${data.artworkUrl}` : 'Artwork: (none uploaded)',
    data.adminUrl ? `Admin dashboard: ${data.adminUrl}` : null,
    data.additionalNotes?.trim() ? `\nAdditional notes:\n${data.additionalNotes.trim()}` : null,
  ];
  const text = textParts.filter((v): v is string => v !== null).join('\n');

  try {
    await sgMail.send({
      from: { email: fromEmailRaw.trim(), name: fromName },
      to: adminEmail.trim(),
      replyTo: { email: data.customerEmail, name: data.customerName || data.customerEmail },
      subject: `[ShackPack Builder] ${data.name} — ${data.packCount} packs · ${totalCoins} coins — ${displayName}`,
      html,
      text,
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    });
  } catch (err: unknown) {
    const body =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { body?: string } }).response?.body;
    console.error('[sendBuildInquiryEmail] SendGrid send failed:', body || err);
    throw err;
  }
}
