// Email notification functions using SendGrid
import sgMail from '@sendgrid/mail';
import type { ShackpackBuilderSpec } from '@/lib/shackpack-builder-schema';
import {
  BUDGET_LABELS,
  INSPIRATION_LABELS,
  PRODUCT_LINE_LABELS,
  TIMELINE_LABELS,
} from '@/lib/shackpack-builder-schema';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface OrderConfirmationData {
  orderId: string;
  total: number;
  loyaltyPointsEarned: number;
  items: Array<{
    seriesName: string;
    quantity: number;
    pricePerPack: number;
  }>;
  trackingNumber?: string | null;
}

interface AdminOrderNotificationData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  total: number;
  shippingAddress: any;
  items: Array<{
    seriesName: string;
    quantity: number;
    pricePerPack: number;
  }>;
  fedexTrackingNumber?: string | null;
  fedexLabelUrl?: string | null;
  labelStatus: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  email: string,
  data: OrderConfirmationData
): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@shackpck.com';
  const fromName = process.env.FROM_NAME || 'Shackpack';
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not configured. Would send order confirmation:', {
      to: email,
      ...data,
    });
    return;
  }

  try {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.seriesName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.pricePerPack * item.quantity / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const trackingHtml = data.trackingNumber ? `
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
        <h3 style="margin-top: 0; color: #0c4a6e;">📦 Shipping Information</h3>
        <p style="margin: 0;">
          <strong>Tracking Number:</strong> ${data.trackingNumber}<br>
          <a href="https://www.fedex.com/apps/fedextrack/?tracknumbers=${data.trackingNumber}" 
             style="color: #0ea5e9; text-decoration: none;" 
             target="_blank">Track Your Package →</a>
        </p>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-size: 1.2em; font-weight: bold; color: #d4af37; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #1a1a1a;">Thank You for Your Order!</h1>
            </div>
            <div class="content">
              <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
              
              <div class="order-details">
                <h2 style="margin-top: 0;">Order #${data.orderId}</h2>
                
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 8px; text-align: left;">Item</th>
                      <th style="padding: 8px; text-align: center;">Quantity</th>
                      <th style="padding: 8px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div class="total" style="text-align: right; padding-top: 10px; border-top: 2px solid #e5e7eb;">
                  Total: $${data.total.toFixed(2)}
                </div>
              </div>

              ${trackingHtml}

              ${data.loyaltyPointsEarned > 0 ? `
                <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
                  <strong>🎉 Loyalty Points Earned:</strong> ${data.loyaltyPointsEarned} points
                </p>
              ` : ''}

              <p>We'll send you a shipping confirmation with tracking information once your order ships.</p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
                If you have any questions, please contact us at support@shackpack.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sgMail.send({
      from: {
        email: fromEmail,
        name: fromName,
      },
      to: email,
      subject: `Your Order Confirmation - Order #${data.orderId}`,
      html,
      // Add plain text version for better deliverability
      text: `
Thank you for your order!

Order #${data.orderId}
Total: $${data.total.toFixed(2)}

Items:
${data.items.map(item => `- ${item.seriesName} x${item.quantity}: $${(item.pricePerPack * item.quantity / 100).toFixed(2)}`).join('\n')}

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}

${data.loyaltyPointsEarned > 0 ? `Loyalty Points Earned: ${data.loyaltyPointsEarned}` : ''}

We'll send you a shipping confirmation once your order ships.

If you have any questions, please contact us at support@shackpck.com
      `.trim(),
    });

    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw - email failure shouldn't break the order
  }
}

/**
 * Send admin notification email with order details and FedEx label
 */
export async function sendAdminOrderNotification(
  data: AdminOrderNotificationData
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@shackpck.com';
  const fromName = 'Shackpack';

  if (!adminEmail) {
    console.log('ADMIN_EMAIL not configured. Would send admin notification:', data);
    return;
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not configured. Would send admin notification:', data);
    return;
  }

  try {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.seriesName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.pricePerPack * item.quantity / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .shipping-info { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
            .error { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; color: #991b1b; }
            table { width: 100%; border-collapse: collapse; }
            .label { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; margin: 10px 0; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Order Received</h1>
            </div>
            <div class="content">
              <div class="order-details">
                <h2 style="margin-top: 0;">Order #${data.orderId}</h2>
                
                <p><strong>Customer:</strong> ${data.customerName || 'N/A'}<br>
                <strong>Email:</strong> ${data.customerEmail}</p>
                
                <h3>Items:</h3>
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 8px; text-align: left;">Item</th>
                      <th style="padding: 8px; text-align: center;">Quantity</th>
                      <th style="padding: 8px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div style="text-align: right; padding-top: 10px; border-top: 2px solid #e5e7eb; font-size: 1.2em; font-weight: bold;">
                  Total: $${data.total.toFixed(2)}
                </div>
              </div>

              <div class="shipping-info">
                <h3 style="margin-top: 0;">Shipping Address:</h3>
                <p style="margin: 0;">
                  ${data.shippingAddress.fullName}<br>
                  ${data.shippingAddress.line1}<br>
                  ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                  ${data.shippingAddress.country || 'US'}
                  ${data.shippingAddress.phone ? `<br>Phone: ${data.shippingAddress.phone}` : ''}
                </p>
              </div>

              ${data.labelStatus === 'GENERATED' && data.fedexTrackingNumber ? `
                <div class="shipping-info">
                  <h3 style="margin-top: 0;">Shipping Label Generated</h3>
                  <p><strong>Tracking Number:</strong> ${data.fedexTrackingNumber}</p>
                  ${data.fedexLabelUrl ? `
                    <p>
                      <a href="${data.fedexLabelUrl}" class="label" target="_blank">Download Shipping Label</a>
                      <br>
                      <small style="color: #666; font-size: 0.9em;">
                        Note: Label URLs may expire. If the link doesn't work, contact support with your tracking number.
                      </small>
                    </p>
                  ` : ''}
                </div>
              ` : ''}

              ${data.labelStatus === 'FAILED' ? `
                <div class="error">
                  <h3 style="margin-top: 0;">⚠️ Label Generation Failed</h3>
                  <p>FedEx label could not be generated. Please create the label manually.</p>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    await sgMail.send({
      from: {
        email: fromEmail,
        name: fromName,
      },
      to: adminEmail,
      subject: `New Order #${data.orderId} - $${data.total.toFixed(2)}`,
      html,
      // Add plain text version
      text: `
New Order Received

Order #${data.orderId}
Customer: ${data.customerName || 'N/A'}
Email: ${data.customerEmail}
Total: $${data.total.toFixed(2)}

Items:
${data.items.map(item => `- ${item.seriesName} x${item.quantity}: $${(item.pricePerPack * item.quantity / 100).toFixed(2)}`).join('\n')}

Shipping Address:
${data.shippingAddress.fullName}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ? data.shippingAddress.line2 + '\n' : ''}${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}

${data.fedexTrackingNumber ? `Tracking Number: ${data.fedexTrackingNumber}` : ''}
${data.labelStatus === 'FAILED' ? '⚠️ Label Generation Failed' : ''}
      `.trim(),
    });

    console.log(`Admin notification email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    // Don't throw - email failure shouldn't break the order
  }
}

const CONTACT_SUBJECT_LABELS: Record<string, string> = {
  general: 'General Question',
  order: 'Order Inquiry',
  'coin-info': 'Coin Information',
  shipping: 'Shipping Question',
  other: 'Other',
  'custom-build': 'Custom ShackPack build',
};

export interface ContactInquiryData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  caseTypes: string;
  /** Present when customer used the ShackPack Builder (subject custom-build). */
  builderSpec?: ShackpackBuilderSpec;
}

function formatBuilderSpecHtml(spec: ShackpackBuilderSpec, escapeHtml: (s: string) => string): string {
  const lines: [string, string][] = [
    ['Product focus', escapeHtml(PRODUCT_LINE_LABELS[spec.productLine])],
  ];
  if (spec.inspiration) {
    lines.push(['Inspiration', escapeHtml(INSPIRATION_LABELS[spec.inspiration])]);
  }
  lines.push(['Target pack quantity', escapeHtml(spec.packCount)]);
  if (spec.caseCount?.trim()) {
    lines.push(['Target case / run quantity', escapeHtml(spec.caseCount.trim())]);
  }
  if (spec.spotlightNotes?.trim()) {
    lines.push(['Featured highlights / spotlights (request)', escapeHtml(spec.spotlightNotes.trim())]);
  }
  lines.push(['Budget range (indicative)', escapeHtml(BUDGET_LABELS[spec.budgetRange])]);
  if (spec.timeline) {
    lines.push(['Timeline', escapeHtml(TIMELINE_LABELS[spec.timeline])]);
  }
  lines.push(['Design & branding direction', escapeHtml(spec.designNotes)]);

  const rows = lines
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;width:220px;">${escapeHtml(k)}</td><td style="padding:8px;border:1px solid #e5e7eb;">${v}</td></tr>`
    )
    .join('');

  return `
    <div style="margin-top:20px;padding:16px;background:#fffbeb;border-radius:8px;border:1px solid #fbbf24;">
      <h3 style="margin:0 0 12px 0;color:#92400e;">ShackPack Builder specification</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    </div>
  `;
}

/**
 * Send website contact form inquiry to the admin inbox (SendGrid).
 * Throws if email cannot be sent — callers should handle errors.
 */
export async function sendContactInquiryEmail(data: ContactInquiryData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmailRaw = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME || 'Shackpack';

  if (!adminEmail?.trim()) {
    throw new Error('ADMIN_EMAIL is not configured');
  }
  if (!process.env.SENDGRID_API_KEY?.trim()) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }
  if (!fromEmailRaw?.trim()) {
    throw new Error('FROM_EMAIL is not configured');
  }
  const fromEmail = fromEmailRaw.trim();

  // Per-request init: serverless can evaluate the module before env is bound; always set before send
  sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const subjectLabel = CONTACT_SUBJECT_LABELS[data.subject] || data.subject;
  const caseTypesDisplay = data.caseTypes.trim() || '(none selected)';
  const builderHtml = data.builderSpec
    ? formatBuilderSpecHtml(data.builderSpec, escapeHtml)
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #b8860b;">${data.builderSpec ? 'New ShackPack Builder inquiry' : 'New contact form message'}</h2>
        <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
        <p><strong>Name:</strong> ${escapeHtml(`${data.firstName} ${data.lastName}`)}<br/>
        <strong>Email:</strong> <a href="mailto:${data.email.replace(/"/g, '')}">${escapeHtml(data.email)}</a><br/>
        <strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
        <p><strong>Case types:</strong> ${escapeHtml(caseTypesDisplay)}</p>
        ${builderHtml}
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <strong>${data.builderSpec ? 'Additional notes' : 'Message'}</strong>
          <p style="white-space: pre-wrap; margin: 8px 0 0 0;">${escapeHtml(data.message || '(none)')}</p>
        </div>
      </body>
    </html>
  `;

  const textParts = [
    data.builderSpec ? 'New ShackPack Builder inquiry' : 'New contact form message',
    `Subject: ${subjectLabel}`,
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Case types: ${caseTypesDisplay}`,
    '',
  ];
  if (data.builderSpec) {
    const s = data.builderSpec;
    textParts.push(
      '--- Builder spec ---',
      `Product: ${PRODUCT_LINE_LABELS[s.productLine]}`,
      s.inspiration ? `Inspiration: ${INSPIRATION_LABELS[s.inspiration]}` : '',
      `Packs: ${s.packCount}`,
      s.caseCount?.trim() ? `Cases: ${s.caseCount}` : '',
      s.spotlightNotes?.trim() ? `Spotlights: ${s.spotlightNotes}` : '',
      `Budget: ${BUDGET_LABELS[s.budgetRange]}`,
      s.timeline ? `Timeline: ${TIMELINE_LABELS[s.timeline]}` : '',
      `Design notes:\n${s.designNotes}`,
      ''
    );
  }
  textParts.push(data.message || '(no additional notes)');
  const text = textParts.filter(Boolean).join('\n');

  const replyName = `${data.firstName} ${data.lastName}`.trim() || data.email;

  try {
    await sgMail.send({
      from: { email: fromEmail, name: fromName },
      to: adminEmail.trim(),
      replyTo: { email: data.email, name: replyName },
      subject: data.builderSpec
        ? `[Shackpack Builder] ${data.lastName}, ${data.firstName} — custom build`
        : `[Shackpack Contact] ${subjectLabel} — ${data.lastName}, ${data.firstName}`,
      html,
      text,
    });
  } catch (err: unknown) {
    const body =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { body?: string } }).response?.body;
    console.error('[sendContactInquiryEmail] SendGrid send failed:', body || err);
    throw err;
  }
}

/**
 * Add contact to SendGrid for marketing emails
 * Use this when users register or subscribe
 */
export async function addContactToSendGrid(
  email: string,
  firstName?: string,
  lastName?: string,
  listIds?: string[]
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not configured. Would add contact:', { email, firstName, lastName });
    return;
  }

  try {
    // This requires SendGrid Marketing API
    // For now, we'll just log it - you can implement the full API call later
    // See: https://docs.sendgrid.com/api-reference/contacts/add-or-update-a-contact
    console.log('Contact would be added to SendGrid:', { email, firstName, lastName, listIds });
    
    // TODO: Implement SendGrid Marketing API call
    // const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     contacts: [{
    //       email,
    //       first_name: firstName,
    //       last_name: lastName,
    //     }],
    //     list_ids: listIds || [],
    //   }),
    // });
  } catch (error) {
    console.error('Error adding contact to SendGrid:', error);
  }
}
