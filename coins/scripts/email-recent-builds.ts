// Send a single digest email to ADMIN_EMAIL listing every ShackPack Builder
// submission from the last N days (default 45). Includes the full coin lines,
// customer info, and a deep link to each build in /admin/builds.
//
// Usage:
//   DATABASE_URL="postgres://..."  SENDGRID_API_KEY=SG.xxx \
//   FROM_EMAIL=noreply@shackpck.com  ADMIN_EMAIL=you@example.com \
//   npx tsx scripts/email-recent-builds.ts
//
// Optional knobs:
//   DAYS=45                    how many days back to include
//   SITE_URL=https://shackpck.com  base URL used for admin deep links

import sgMail from '@sendgrid/mail';
import { prisma } from '../lib/db';
import {
  getCoinDef,
  GRADER_LABELS,
  TIER_DEFS,
  type Grader,
  type Tier,
} from '../lib/builder/catalog';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  const days = parseInt(process.env.DAYS ?? '45', 10);
  if (!Number.isFinite(days) || days < 1) {
    console.error(`Invalid DAYS=${process.env.DAYS}`);
    process.exit(1);
  }
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const fromEmail = process.env.FROM_EMAIL?.trim();
  const fromName = process.env.FROM_NAME?.trim() || 'Shackpack';
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const siteUrl = (process.env.SITE_URL?.trim() || 'https://shackpck.com').replace(/\/$/, '');

  if (!adminEmail) throw new Error('ADMIN_EMAIL is required');
  if (!fromEmail) throw new Error('FROM_EMAIL is required (must be a SendGrid-verified sender)');
  if (!apiKey) throw new Error('SENDGRID_API_KEY is required');

  sgMail.setApiKey(apiKey);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const builds = await prisma.build.findMany({
    where: {
      OR: [
        { submittedAt: { gte: since } },
        { AND: [{ status: 'SUBMITTED' }, { updatedAt: { gte: since } }] },
      ],
    },
    orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
    include: {
      lines: { orderBy: { order: 'asc' } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  console.log(`Found ${builds.length} builds submitted in the last ${days} days.`);

  if (builds.length === 0) {
    console.log('Nothing to send. Exiting.');
    await prisma.$disconnect();
    return;
  }

  const sections = builds
    .map((b, i) => {
      const totalCoins = b.lines.reduce((s, l) => s + l.quantity, 0);
      const unassigned = b.packCount - totalCoins;
      const submittedStr = b.submittedAt
        ? new Date(b.submittedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })
        : new Date(b.updatedAt).toLocaleString('en-US', { timeZone: 'America/New_York' });
      const adminLink = `${siteUrl}/admin/builds?id=${b.id}`;

      const linesHtml = b.lines.length
        ? `<ol style="margin:6px 0;padding:0 0 0 20px;">${b.lines
            .map((line) => {
              const coin = getCoinDef(line.coinType);
              const tier = TIER_DEFS[line.tier as Tier];
              const tierLabel = tier ? `${tier.label} (${tier.range})` : line.tier;
              const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
              return `<li style="margin:3px 0;">${escapeHtml(
                `${line.quantity}x ${coin?.label ?? line.coinType} — ${graderLabel} — ${tierLabel}${
                  line.notes ? ` — ${line.notes}` : ''
                }`
              )}</li>`;
            })
            .join('')}</ol>`
        : `<p style="color:#b45309;margin:6px 0;"><em>No coin lines on this build.</em></p>`;

      const notesHtml = b.notes?.trim()
        ? `<p style="margin:6px 0;color:#374151;"><strong>Notes:</strong> ${escapeHtml(b.notes.trim())}</p>`
        : '';

      const artworkHtml = b.artworkUrl
        ? `<p style="margin:6px 0;"><a href="${escapeHtml(
            b.artworkUrl.startsWith('http') ? b.artworkUrl : `${siteUrl}${b.artworkUrl}`
          )}">View uploaded artwork</a></p>`
        : '';

      return `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;background:#ffffff;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#6b7280;">
            ${i + 1} of ${builds.length} · Ref ${escapeHtml(b.shortCode)} · ${escapeHtml(b.status)} · ${escapeHtml(submittedStr)}
          </p>
          <h3 style="margin:4px 0;color:#b8860b;">${escapeHtml(b.name)}</h3>
          <p style="margin:0 0 6px 0;">
            <strong>From:</strong> ${escapeHtml(b.user.name ?? '')} &lt;<a href="mailto:${b.user.email}">${escapeHtml(b.user.email)}</a>&gt;<br/>
            <strong>Pack count:</strong> ${b.packCount} · <strong>Coins listed:</strong> ${totalCoins}${
              unassigned !== 0 ? ` · <strong style="color:#b45309;">Unassigned:</strong> ${unassigned}` : ''
            }
          </p>
          ${linesHtml}
          ${notesHtml}
          ${artworkHtml}
          <p style="margin:8px 0 0 0;">
            <a href="${escapeHtml(adminLink)}" style="color:#b8860b;font-weight:bold;">Open in admin dashboard →</a>
          </p>
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family:Arial,sans-serif;line-height:1.55;color:#111;background:#f3f4f6;margin:0;padding:0;">
        <div style="max-width:760px;margin:0 auto;padding:24px;">
          <h2 style="color:#b8860b;margin:0 0 6px 0;">ShackPack Builder digest</h2>
          <p style="margin:0 0 16px 0;color:#374151;">
            ${builds.length} ${builds.length === 1 ? 'inquiry' : 'inquiries'} from the last ${days} days.
            Click any "Open in admin dashboard" link to view the live configuration on shackpck.com.
          </p>
          ${sections}
        </div>
      </body>
    </html>
  `;

  // Plain-text fallback
  const textParts: string[] = [
    `ShackPack Builder digest — ${builds.length} inquiries in the last ${days} days`,
    '',
  ];
  builds.forEach((b, i) => {
    const totalCoins = b.lines.reduce((s, l) => s + l.quantity, 0);
    textParts.push(
      `${i + 1}. ${b.name}  (Ref ${b.shortCode}, ${b.status})`,
      `   From: ${b.user.name ?? ''} <${b.user.email}>`,
      `   ${b.packCount} packs · ${totalCoins} coins listed`
    );
    if (b.lines.length === 0) {
      textParts.push('   (no coin lines on this build)');
    } else {
      b.lines.forEach((line) => {
        const coin = getCoinDef(line.coinType);
        const tier = TIER_DEFS[line.tier as Tier];
        const tierLabel = tier ? `${tier.label} (${tier.range})` : line.tier;
        const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
        textParts.push(
          `   - ${line.quantity}x ${coin?.label ?? line.coinType} — ${graderLabel} — ${tierLabel}${line.notes ? ` — ${line.notes}` : ''}`
        );
      });
    }
    if (b.notes?.trim()) textParts.push(`   Notes: ${b.notes.trim()}`);
    textParts.push(`   Admin: ${siteUrl}/admin/builds?id=${b.id}`, '');
  });
  const text = textParts.join('\n');

  await sgMail.send({
    from: { email: fromEmail, name: fromName },
    to: adminEmail,
    subject: `[ShackPack Builder] Digest — ${builds.length} inquiries in last ${days} days`,
    html,
    text,
  });

  console.log(`✅ Sent digest of ${builds.length} builds to ${adminEmail}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
