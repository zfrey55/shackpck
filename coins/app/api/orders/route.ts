import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { pushPackSaleToInventory } from '@/lib/inventory-api-push';
import { generateFedExLabel } from '@/lib/fedex';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
import { fetchAllSeries } from '@/lib/coin-inventory-api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// POST /api/orders - Create order after successful payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      paymentIntentId,
      items,
      shippingAddress,
      email,
      name,
    } = body;

    if (!paymentIntentId || !items || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get user ID
    let userId: string | null = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (email) {
      // Find or create shadow user
      let shadowUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!shadowUser) {
        shadowUser = await prisma.user.create({
          data: {
            email,
            name: name || null,
            isShadowUser: true,
          },
        });
        
        // Sync new shadow user to inventory app (non-blocking)
        pushUserToInventory({
          userId: shadowUser.id,
          email: shadowUser.email,
          name: shadowUser.name,
          isShadowUser: true,
          createdAt: shadowUser.createdAt.toISOString(),
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
        }).catch((error) => {
          console.error('Failed to sync shadow user to inventory app (non-blocking):', error);
        });
      } else if (!shadowUser.isShadowUser) {
        // If user exists but is not a shadow user, use it
        userId = shadowUser.id;
      } else {
        userId = shadowUser.id;
      }

      if (!userId) {
        userId = shadowUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.pricePerPack * item.quantity,
      0
    );

    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    const hasAccount = !!session?.user?.id && !userRecord?.isShadowUser;
    const shippingCost = hasAccount ? 0 : 499;
    const total = subtotal + shippingCost;

    // Create order with transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx: any) => {
      // Check inventory and update series
      for (const item of items) {
        // Check if this is an inventory app series ID
        const isInventorySeriesId = item.seriesId.startsWith('specialized_') || item.seriesId.includes('_');
        
        let series: any = null;
        
        if (isInventorySeriesId) {
          // Try to find in local DB by coinInventorySeriesId first
          series = await tx.series.findFirst({
            where: { coinInventorySeriesId: item.seriesId },
          });
          
          // If not in local DB, fetch from inventory app API
          if (!series) {
            try {
              const allSeries = await fetchAllSeries();
              const inventorySeries = allSeries.find(s => s.id === item.seriesId);
              
              if (inventorySeries) {
                // For inventory-only series, we need a local DB record for the transaction
                // Try to find by slug first (more reliable)
                let existingSeries = await tx.series.findFirst({
                  where: { 
                    OR: [
                      { coinInventorySeriesId: item.seriesId },
                      { slug: inventorySeries.slug }
                    ]
                  },
                });
                
                if (existingSeries) {
                  // Update existing series
                  series = await tx.series.update({
                    where: { id: existingSeries.id },
                    data: {
                      name: inventorySeries.name,
                      totalPacks: inventorySeries.totalPacks,
                      packsSold: inventorySeries.packsSold,
                      pricePerPack: inventorySeries.pricePerPack,
                      isActive: inventorySeries.isActive,
                      coinInventorySeriesId: inventorySeries.id,
                    },
                  });
                } else {
                  // Create new series record
                  series = await tx.series.create({
                    data: {
                      name: inventorySeries.name,
                      slug: inventorySeries.slug,
                      description: inventorySeries.description || null,
                      images: inventorySeries.images || [],
                      totalPacks: inventorySeries.totalPacks,
                      packsSold: inventorySeries.packsSold,
                      packsRemaining: inventorySeries.packsRemaining || (inventorySeries.totalPacks - inventorySeries.packsSold),
                      pricePerPack: inventorySeries.pricePerPack,
                      isActive: inventorySeries.isActive,
                      coinInventorySeriesId: inventorySeries.id,
                      caseType: inventorySeries.caseType || null,
                      displayDate: inventorySeries.displayDate || null,
                    },
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching series from inventory app:', error);
            }
          }
        } else {
          // Regular series - look up by local DB ID
          series = await tx.series.findUnique({
            where: { id: item.seriesId },
          });
        }

        if (!series) {
          throw new Error(`Series ${item.seriesId} not found`);
        }

        const packsRemaining = series.totalPacks - series.packsSold;
        if (item.quantity > packsRemaining) {
          throw new Error(
            `Insufficient inventory for ${series.name}. Only ${packsRemaining} packs remaining.`
          );
        }

        // Update series inventory
        await tx.series.update({
          where: { id: series.id },
          data: {
            packsSold: {
              increment: item.quantity,
            },
          },
        });

        // Update or create series purchase record for limit tracking
        await tx.seriesPurchase.upsert({
          where: {
            userId_seriesId: {
              userId,
              seriesId: series.id,
            },
          },
          update: {
            quantity: {
              increment: item.quantity,
            },
          },
          create: {
            userId,
            seriesId: series.id,
            quantity: item.quantity,
          },
        });
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          guestEmail: !session?.user?.id ? email : null,
          guestName: !session?.user?.id ? name : null,
          subtotal,
          shippingCost,
          total,
          paymentStatus: 'PAID',
          stripePaymentIntentId: paymentIntentId,
          stripeCustomerId: paymentIntent.customer as string | null,
          shippingAddress: shippingAddress as any,
          loyaltyPointsEarned: Math.floor(
            (total / 100) * parseInt(process.env.LOYALTY_POINTS_PER_DOLLAR || '1')
          ),
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              seriesId: item.seriesId,
              quantity: item.quantity,
              pricePerPack: item.pricePerPack,
              total: item.pricePerPack * item.quantity,
            },
          })
        )
      );

      // Update user loyalty points
      if (newOrder.loyaltyPointsEarned > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: {
              increment: newOrder.loyaltyPointsEarned,
            },
          },
        });
      }

      return { order: newOrder, items: orderItems };
    });

    // Save shipping address for logged-in users (if not already saved)
    if (session?.user?.id && !userRecord?.isShadowUser) {
      try {
        // Check if address already exists
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: session.user.id,
            line1: shippingAddress.line1,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
          },
        });

        if (!existingAddress) {
          // Check if user has any addresses
          const addressCount = await prisma.address.count({
            where: { userId: session.user.id },
          });

          // Save as default if it's their first address
          await prisma.address.create({
            data: {
              userId: session.user.id,
              fullName: shippingAddress.fullName,
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || null,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || 'US',
              phone: shippingAddress.phone || null,
              isDefault: addressCount === 0, // First address is default
            },
          });
        }
      } catch (error) {
        // Non-blocking - log but don't fail order
        console.error('Failed to save shipping address:', error);
      }
    }

    // Push pack sales to inventory app (after order is successfully created)
    // Group items by series and push each series sale
    const seriesSales = new Map<string, { quantity: number; pricePerPack: number; seriesName: string; coinInventorySeriesId?: string }>();
    
    for (const item of items) {
      const series = await prisma.series.findUnique({
        where: { id: item.seriesId },
      });
      
      if (series) {
        const coinInventorySeriesId = (series as any).coinInventorySeriesId;
        const key = coinInventorySeriesId || item.seriesId;
        const existing = seriesSales.get(key);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          seriesSales.set(key, {
            quantity: item.quantity,
            pricePerPack: item.pricePerPack,
            seriesName: series.name,
            coinInventorySeriesId: coinInventorySeriesId || undefined,
          });
        }
      }
    }

    // Push each series sale to inventory app
    for (const [seriesId, saleData] of seriesSales) {
      try {
        await pushPackSaleToInventory({
          seriesId: saleData.coinInventorySeriesId || seriesId, // Use coinInventorySeriesId if available
          seriesType: saleData.seriesName,
          packsSold: saleData.quantity,
          saleAmount: saleData.pricePerPack * saleData.quantity,
          saleAmountPerPack: saleData.pricePerPack,
          orderId: order.order.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Log error but don't fail the order - sales push is non-critical
        console.error(`Failed to push pack sale to inventory for series ${seriesId}:`, error);
      }
    }

    // Generate FedEx label
    let fedexTrackingNumber: string | null = null;
    let fedexLabelUrl: string | null = null;
    let labelStatus: 'GENERATED' | 'FAILED' | 'PENDING' = 'PENDING';

    try {
      const fedexResult = await generateFedExLabel(shippingAddress);
      fedexTrackingNumber = fedexResult.trackingNumber;
      fedexLabelUrl = fedexResult.labelUrl;
      labelStatus = 'GENERATED';

      // Update order with FedEx info
      await prisma.order.update({
        where: { id: order.order.id },
        data: {
          fedexTrackingNumber,
          fedexLabelUrl,
          labelStatus: 'GENERATED',
        },
      });
    } catch (error: any) {
      console.error('FedEx label generation failed:', error);
      labelStatus = 'FAILED';

      // Update order with failed status
      await prisma.order.update({
        where: { id: order.order.id },
        data: {
          labelStatus: 'FAILED',
        },
      });
    }

    // Prepare items for email - fetch series names if not provided
    const emailItems = await Promise.all(
      items.map(async (item: any) => {
        let seriesName = item.seriesName;
        if (!seriesName) {
          const series = await prisma.series.findUnique({
            where: { id: item.seriesId },
            select: { name: true },
          });
          seriesName = series?.name || 'Unknown Series';
        }
        return {
          seriesName,
          quantity: item.quantity,
          pricePerPack: item.pricePerPack,
        };
      })
    );

    // Send customer confirmation email
    const customerEmail = session?.user?.email || email;
    if (customerEmail) {
      try {
        await sendOrderConfirmationEmail(customerEmail, {
          orderId: order.order.id,
          total: total / 100,
          loyaltyPointsEarned: order.order.loyaltyPointsEarned,
          items: emailItems,
          trackingNumber: fedexTrackingNumber,
        });
      } catch (error) {
        console.error('Failed to send customer confirmation email:', error);
      }
    }

    // Send admin notification email
    try {
      await sendAdminOrderNotification({
        orderId: order.order.id,
        customerEmail: customerEmail || '',
        customerName: session?.user?.name || name || undefined,
        total: total / 100,
        shippingAddress,
        items: emailItems,
        fedexTrackingNumber,
        fedexLabelUrl,
        labelStatus,
      });
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
    }

    return NextResponse.json({
      orderId: order.order.id,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          code: error.code,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            series: {
              select: {
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
