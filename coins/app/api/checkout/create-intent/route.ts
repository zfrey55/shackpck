import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// POST /api/checkout/create-intent - Create Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { items, shippingAddress, email, name } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart items' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address required' },
        { status: 400 }
      );
    }

    // Validate cart items
    const validationResponse = await fetch(
      `${request.nextUrl.origin}/api/cart/validate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }
    );

    const validation = await validationResponse.json();

    if (!validationResponse.ok || validation.errors?.length > 0) {
      return NextResponse.json(validation, { status: 400 });
    }

    const validatedItems = validation.validatedItems;

    // Calculate totals
    const subtotal = validatedItems.reduce(
      (sum: number, item: any) => sum + item.pricePerPack * item.quantity,
      0
    );

    // Shipping: $4.99 if no account, free if has account
    const hasAccount = !!session?.user?.id;
    const shippingCost = hasAccount ? 0 : 499; // $4.99 in cents
    const total = subtotal + shippingCost;

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user?.stripeCustomerId) {
        stripeCustomerId = user.stripeCustomerId;
      } else {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: user?.email || email,
          name: user?.name || name,
          metadata: {
            userId: session.user.id,
          },
        });

        stripeCustomerId = customer.id;

        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customer.id },
        });
      }
    } else if (email) {
      // Guest checkout - create or find shadow user
      let shadowUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!shadowUser || !shadowUser.isShadowUser) {
        shadowUser = await prisma.user.create({
          data: {
            email,
            name: name || null,
            isShadowUser: true,
          },
        });
      }

      if (shadowUser.stripeCustomerId) {
        stripeCustomerId = shadowUser.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: name || null,
          metadata: {
            userId: shadowUser.id,
          },
        });

        stripeCustomerId = customer.id;

        await prisma.user.update({
          where: { id: shadowUser.id },
          data: { stripeCustomerId: customer.id },
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      customer: stripeCustomerId || undefined,
      setup_future_usage: session?.user?.id ? 'off_session' : undefined, // Allow saving payment methods for logged-in users
      metadata: {
        userId: session?.user?.id || '',
        guestEmail: email || '',
        itemCount: validatedItems.length.toString(),
      },
      shipping: {
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country || 'US',
        },
        name: shippingAddress.fullName,
        phone: shippingAddress.phone || undefined,
      },
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
