import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  getCoinDef,
  GRADER_LABELS,
  TIER_DEFS,
  type Grader,
  type Tier,
} from '@/lib/builder/catalog';
import sgMail from '@sendgrid/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { status: 401 as const };
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true, email: true } });
  if (user?.role !== 'ADMIN') return { status: 403 as const };
  return { status: 200 as const, email: user.email };
}

/**
 * POST /api/admin/builds/email-digest
 *   body (optional): { days?: number, deliverTo?: string }
 *
 * Sends a single email summarizing every ShackPack Builder submission from the
 * last N days. Always delivered to ADMIN_EMAIL, plus optionally a second
 * address the admin specifies in deliverTo.
 */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.status !== 200) {
    return NextResponse.json(
      { error: gate.status === 401 ? 'Unauthorized' : 'Forbidden' },
      { status: gate.status }
    );
  }

  let days = 45;
  let deliverTo: string | null = null;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      days?: number;
      deliverTo?: string;
    };
    if (typeof body.days === 'number' && Number.isFinite(body.days) && body.days > 0) {
      days = Math.min(365, Math.floor(body.days));
    }
    if (typeof body.deliverTo === 'string' && body.deliverTo.trim()) {
      deliverTo = body.deliverTo.trim();
    }
  } catch {
    // ignore — defaults are fine
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const fromEmail = process.env.FROM_EMAIL?.trim();
  const fromName = process.env.FROM_NAME?.trim() || 'Shackpack';
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const siteUrl = (process.env.NEXTAUTH_URL?.trim() || 'https://shackpck.com').replace(/\/$/, '');

  if (!adminEmail || !fromEmail || !apiKey) {
    return NextResponse.json(
      { error: 'Email is not configured (ADMIN_EMAIL / FROM_EMAIL / SENDGRID_API_KEY).' },
      { status: 503 }
    );
  }
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
          </p>
          ${
            builds.length === 0
              ? '<p>No builder submissions in this window.</p>'
              : sections
          }
        </div>
      </body>
    </html>
  `;

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

  // Deliver to ADMIN_EMAIL always; if the requester asked for another delivery
  // email (e.g. their personal inbox) include it as a separate recipient.
  const recipients = Array.from(
    new Set([adminEmail, ...(deliverTo ? [deliverTo] : [])])
  );

  try {
    await sgMail.send({
      from: { email: fromEmail, name: fromName },
      to: recipients,
      subject: `[ShackPack Builder] Digest — ${builds.length} inquiries in last ${days} days`,
      html,
      text,
    });
  } catch (err: unknown) {
    const body =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { body?: string } }).response?.body;
    console.error('[email-digest] SendGrid send failed:', body || err);
    return NextResponse.json({ error: 'SendGrid send failed.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    count: builds.length,
    days,
    deliveredTo: recipients,
  });
}
