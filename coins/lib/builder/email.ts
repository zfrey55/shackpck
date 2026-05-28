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
 *  - The lines are rendered TWICE: once as a flat prose-style list (survives any
 *    HTML stripping), and once as a styled table (richer view in clients that
 *    keep tables). Gmail and iOS Mail have been observed silently collapsing
 *    the bare-table version on some accounts.
 *  - A direct link to the admin dashboard is always included so the team has a
 *    no-doubt fallback.
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

  // --- HTML: prose summary first, table second ---

  const linesProseHtml = data.lines.length
    ? `<ol style="margin:0;padding:0 0 0 20px;color:#111827;">
         ${data.lines
           .map(
             (line) =>
               `<li style="margin:6px 0;">${escapeHtml(lineToText(line))}</li>`
           )
           .join('')}
       </ol>`
    : `<p style="color:#b45309;"><strong>This build has no coin lines on it.</strong> View it in the admin dashboard for the most up-to-date state.</p>`;

  const linesTableHtml = data.lines.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
         <tr style="background:#fff7ed;">
           <td style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-weight:bold;">Qty</td>
           <td style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-weight:bold;">Coin</td>
           <td style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-weight:bold;">Grader</td>
           <td style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-weight:bold;">Target tier</td>
           <td style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-weight:bold;">Notes</td>
         </tr>
         ${data.lines
           .map((line) => {
             const coin = getCoinDef(line.coinType);
             const tier = TIER_DEFS[line.tier as Tier];
             const tierLabel = tier ? `${tier.label} (${tier.range})` : line.tier;
             const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
             return `
               <tr>
                 <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;">${line.quantity}×</td>
                 <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(coin?.label ?? line.coinType)}</td>
                 <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(graderLabel)}</td>
                 <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(tierLabel)}</td>
                 <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(line.notes ?? '')}</td>
               </tr>
             `;
           })
           .join('')}
       </table>`
    : '';

  const artworkHtml = data.artworkUrl
    ? `<p style="margin-top:16px;"><strong>Pack artwork:</strong> <a href="${escapeHtml(data.artworkUrl)}" target="_blank">${escapeHtml(data.artworkUrl)}</a></p>`
    : '<p style="margin-top:16px;color:#6b7280;">No artwork uploaded.</p>';

  const notesHtml = data.additionalNotes?.trim()
    ? `<div style="background:#f9fafb;padding:16px;border-radius:8px;margin-top:16px;">
         <strong>Additional notes</strong>
         <p style="white-space:pre-wrap;margin:8px 0 0 0;">${escapeHtml(data.additionalNotes.trim())}</p>
       </div>`
    : '';

  const adminLinkHtml = data.adminUrl
    ? `<p style="margin:16px 0;">
         <a href="${escapeHtml(data.adminUrl)}" style="display:inline-block;background:#d4af37;color:#000;font-weight:bold;padding:10px 16px;border-radius:6px;text-decoration:none;">
           Open this build in the admin dashboard →
         </a>
       </p>
       <p style="margin:0 0 16px 0;color:#6b7280;font-size:12px;">
         If the table below is missing or collapsed in your inbox, open the dashboard link above — it always shows the live configuration straight from the database.
       </p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;">
        <div style="max-width:680px;margin:0 auto;padding:24px;">
          <h2 style="color:#b8860b;margin:0 0 12px 0;">New ShackPack Builder inquiry</h2>
          <p style="margin:0 0 12px 0;">
            <strong>Build:</strong> ${escapeHtml(data.name)}<br/>
            <strong>Ref:</strong> ${escapeHtml(data.shortCode)}<br/>
            <strong>From:</strong> ${escapeHtml(data.customerName)} &lt;<a href="mailto:${data.customerEmail.replace(/"/g, '')}">${escapeHtml(data.customerEmail)}</a>&gt;
            ${data.customerPhone ? `<br/><strong>Phone:</strong> ${escapeHtml(data.customerPhone)}` : ''}
          </p>
          <p style="margin:0 0 16px 0;">
            <strong>Pack count:</strong> ${data.packCount} ·
            <strong>Coins listed:</strong> ${totalCoins}${unassigned !== 0 ? ` · <strong style="color:#b45309;">Unassigned slots:</strong> ${unassigned}` : ''}
          </p>

          ${adminLinkHtml}

          <h3 style="margin:24px 0 8px 0;color:#111827;">Coin lines</h3>
          ${linesProseHtml}

          ${linesTableHtml}

          ${artworkHtml}
          ${notesHtml}

          <p style="margin-top:24px;color:#6b7280;font-size:12px;">
            This is a non-binding quote request. Confirm availability, exact configuration, and pricing with the customer before production.
          </p>
        </div>
      </body>
    </html>
  `;

  const textParts: (string | null)[] = [
    'New ShackPack Builder inquiry',
    `Build: ${data.name}`,
    `Ref: ${data.shortCode}`,
    `From: ${data.customerName} <${data.customerEmail}>`,
    data.customerPhone ? `Phone: ${data.customerPhone}` : null,
    `Pack count: ${data.packCount}  Coins listed: ${totalCoins}${unassigned !== 0 ? `  Unassigned: ${unassigned}` : ''}`,
    data.adminUrl ? `Admin link: ${data.adminUrl}` : null,
    '',
    'Coin lines:',
    ...(data.lines.length
      ? data.lines.map((l, i) => `  ${i + 1}. ${lineToText(l)}`)
      : ['  (no lines recorded)']),
    '',
    data.artworkUrl ? `Artwork: ${data.artworkUrl}` : 'No artwork uploaded.',
    data.additionalNotes?.trim() ? `\nNotes:\n${data.additionalNotes.trim()}` : null,
  ];
  const text = textParts.filter((v): v is string => v !== null).join('\n');

  try {
    await sgMail.send({
      from: { email: fromEmailRaw.trim(), name: fromName },
      to: adminEmail.trim(),
      replyTo: { email: data.customerEmail, name: data.customerName || data.customerEmail },
      subject: `[ShackPack Builder] ${data.name} — ${data.packCount} packs · ${totalCoins} coins — ${data.customerName}`,
      html,
      text,
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
