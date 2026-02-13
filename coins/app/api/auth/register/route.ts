import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pushUserToInventory } from '@/lib/inventory-api-push';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.name || null,
        isShadowUser: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    // Sync user to inventory app (non-blocking)
    pushUserToInventory({
      userId: user.id,
      email: user.email,
      name: user.name,
      isShadowUser: false,
      createdAt: user.createdAt.toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: user.loyaltyPoints,
    }).catch((error) => {
      // Log but don't fail user registration
      console.error('Failed to sync user to inventory app (non-blocking):', error);
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
