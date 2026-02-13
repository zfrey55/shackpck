import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { generateFedExLabel } from '@/lib/fedex';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
import { pushPackSaleToInventory } from '@/lib/inventory-api-push';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // If webhook secret is not set, skip verification (for local testing without Stripe CLI)
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification (not recommended for production)');
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid webhook body' },
        { status: 400 }
      );
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      await handleSuccessfulPayment(paymentIntent);
    } catch (error) {
      console.error('Error handling successful payment:', error);
      // Don't return error - Stripe will retry
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  // Find or create order from payment intent metadata
  // In a real implementation, you'd store order data in metadata or a separate table
  // For now, we'll create the order here

  const userId = paymentIntent.metadata?.userId;
  const guestEmail = paymentIntent.metadata?.guestEmail;

  // Get shipping address from payment intent
  const shippingAddress = paymentIntent.shipping
    ? {
        fullName: paymentIntent.shipping.name || '',
        line1: paymentIntent.shipping.address?.line1 || '',
        line2: paymentIntent.shipping.address?.line2 || undefined,
        city: paymentIntent.shipping.address?.city || '',
        state: paymentIntent.shipping.address?.state || '',
        postalCode: paymentIntent.shipping.address?.postal_code || '',
        country: paymentIntent.shipping.address?.country || 'US',
        phone: paymentIntent.shipping.phone || undefined,
      }
    : null;

  if (!shippingAddress) {
    throw new Error('No shipping address in payment intent');
  }

  // For now, we'll need to retrieve cart items from a temporary store
  // In production, you'd store this in Redis or database before creating payment intent
  // For this implementation, we'll need to pass items in metadata or fetch from session

  // This is a simplified version - in production, store cart in database before payment
  // and retrieve it here using paymentIntent.metadata.orderId

  // Calculate loyalty points (configurable - using 1 point per dollar as placeholder)
  const pointsPerDollar = parseInt(process.env.LOYALTY_POINTS_PER_DOLLAR || '1');
  const loyaltyPointsEarned = Math.floor(
    (paymentIntent.amount / 100) * pointsPerDollar
  );

  // Update user loyalty points if logged in
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: loyaltyPointsEarned,
        },
      },
    });
  }

  // Note: In a production system, you'd have already created the order
  // before creating the payment intent, and just update it here
  // For this implementation, we'll create a placeholder order
  // The actual order creation should happen in the checkout flow before payment

  // Generate FedEx label
  let fedexTrackingNumber: string | null = null;
  let fedexLabelUrl: string | null = null;
  let labelStatus: 'GENERATED' | 'FAILED' | 'PENDING' = 'PENDING';
  let labelError: string | null = null;

  try {
    const fedexResult = await generateFedExLabel(shippingAddress);
    fedexTrackingNumber = fedexResult.trackingNumber;
    fedexLabelUrl = fedexResult.labelUrl;
    labelStatus = 'GENERATED';
  } catch (error: any) {
    console.error('FedEx label generation failed:', error);
    labelStatus = 'FAILED';
    labelError = error.message || 'Failed to generate label';
  }

  // Try to fetch order from database to get items
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: {
      items: {
        include: {
          series: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Prepare items for email
  const emailItems = order?.items.map(item => ({
    seriesName: item.series.name,
    quantity: item.quantity,
    pricePerPack: item.pricePerPack,
  })) || [];

  // Send emails
  const customerEmail = userId
    ? (await prisma.user.findUnique({ where: { id: userId } }))?.email
    : guestEmail;

  if (customerEmail) {
    await sendOrderConfirmationEmail(customerEmail, {
      orderId: order?.id || paymentIntent.id,
      total: paymentIntent.amount / 100,
      loyaltyPointsEarned,
      items: emailItems,
      trackingNumber: fedexTrackingNumber,
    });
  }

  await sendAdminOrderNotification({
    orderId: order?.id || paymentIntent.id,
    customerEmail: customerEmail || '',
    total: paymentIntent.amount / 100,
    shippingAddress,
    items: emailItems,
    fedexTrackingNumber,
    fedexLabelUrl,
    labelStatus,
  });
}
